import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "src/schemas/User.schema";
import { Model } from "mongoose";
import { SignupUserDto } from "./dto/signupUser.dto";
import { AuthMessages } from "./auth.message";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { RefreshToken, SigninUser, SignupUser } from "./auth.interface";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { RedisCache } from "cache-manager-redis-yet";
import { SigninUserDto } from "./dto/signinUser.dot";
import { ForgotPasswordDto } from "./dto/forgotPassword.dto";
import { Token } from "src/schemas/token.schema";
import { randomBytes } from "crypto";
import { MailerService } from "@nestjs-modules/mailer";
import { ResetPasswordDto } from "./dto/resetPassword.dto";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    @Inject(CACHE_MANAGER) private redisCache: RedisCache,
    @InjectModel(Token.name) private tokenModel: Model<Token>,
    private mailerService: MailerService
  ) {}

  private hashData(data: string, salt: number) {
    return bcrypt.hashSync(data, salt);
  }

  private generateToken(
    payload: object,
    expireTime: number | string,
    secretKey: string
  ) {
    return this.jwtService.sign(payload, {
      expiresIn: expireTime,
      secret: secretKey,
    });
  }

  async signupUser(dto: SignupUserDto): Promise<SignupUser> {
    const { username, email } = dto;

    const existingUser = await this.userModel.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      throw new ConflictException(AuthMessages.AlreadyRegistered);
    }

    const isFirstUser = (await this.userModel.countDocuments()) == 0;

    const hashPassword = this.hashData(dto.password, 12);

    const user = await this.userModel.create({
      ...dto,
      isAdmin: isFirstUser,
      isSuperAdmin: isFirstUser,
      password: hashPassword,
    });

    const accessToken = this.generateToken(
      { id: user._id.toString() },
      process.env.ACCESS_TOKEN_EXPIRE_TIME,
      process.env.ACCESS_TOKEN_SECRET
    );

    const refreshToken = this.generateToken(
      { id: user._id.toString() },
      process.env.REFRESH_TOKEN_EXPIRE_TIME,
      process.env.REFRESH_TOKEN_SECRET
    );

    await this.redisCache.set(user._id.toString(), refreshToken);

    return { success: AuthMessages.SignupUserSuccess, accessToken };
  }

  async signinUser(dto: SigninUserDto): Promise<SigninUser> {
    const { identifier, password } = dto;

    const user = await this.userModel
      .findOne({
        $or: [{ email: identifier }, { username: identifier }],
      })
      .select("password");

    if (!user) {
      throw new NotFoundException(AuthMessages.NotFoundUser);
    }

    const comparePassword = bcrypt.compareSync(password, user.password);

    if (!comparePassword) {
      throw new ForbiddenException(AuthMessages.InvalidPassword);
    }
    const accessToken = this.generateToken(
      { id: user._id.toString() },
      process.env.ACCESS_TOKEN_EXPIRE_TIME,
      process.env.ACCESS_TOKEN_SECRET
    );

    const refreshToken = this.generateToken(
      { id: user._id.toString() },
      process.env.REFRESH_TOKEN_EXPIRE_TIME,
      process.env.REFRESH_TOKEN_SECRET
    );

    await this.redisCache.set(user._id.toString(), refreshToken);

    return { success: AuthMessages.SigninUserSuccess, accessToken };
  }

  async refreshToken(accessToken: string): Promise<RefreshToken> {
    const decodeToken = this.jwtService.decode<{ id: string }>(accessToken);

    if (!decodeToken) {
      throw new BadRequestException(AuthMessages.InvalidAccessToken);
    }

    const refreshToken = await this.redisCache.get<string>(decodeToken.id);

    if (!refreshToken) {
      throw new NotFoundException(AuthMessages.NotFoundRefreshToken);
    }

    try {
      this.jwtService.verify(refreshToken, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      });
    } catch (error: any) {
      throw new InternalServerErrorException(error.message);
    }

    const newAccessToken = this.generateToken(
      { id: decodeToken.id },
      process.env.ACCESS_TOKEN_EXPIRE_TIME,
      process.env.ACCESS_TOKEN_SECRET
    );

    return {
      newAccessToken,
      success: AuthMessages.RefreshTokenSuccess,
    };
  }

  async signout(accessToken: string): Promise<string> {
    const decodeToken = this.jwtService.decode<{ id: string }>(accessToken);

    if (!decodeToken) {
      throw new BadRequestException(AuthMessages.InvalidAccessToken);
    }

    await this.redisCache.del(decodeToken.id);

    return AuthMessages.SignoutSuccess;
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const existingUser = await this.userModel.findOne({ email: dto.email });

    if (!existingUser) {
      throw new NotFoundException(AuthMessages.NotFoundUser);
    }

    if (existingUser.isVerifyEmail) {
      throw new ConflictException(AuthMessages.AlreadyVerifyEmail);
    }

    const existingToken = await this.tokenModel.findOne({
      userId: existingUser._id,
    });

    if (existingToken) {
      throw new ConflictException(AuthMessages.AlreadySendMail);
    }

    const token = await this.tokenModel.create({
      userId: existingUser._id,
      token: randomBytes(32).toString("hex"),
    });

    const mailOptions = {
      from: process.env.GMAIL_USER as string,
      to: existingUser.email,
      subject: "reset your password",
      html: `<p>Link to reset your password:</p>
      <h1>Click on the link below to reset your password</h1>
      <h2>${process.env.BASE_URL}/auth/${existingUser._id}/reset-password/${token.token}</h2>
       `,
    };

    try {
      await this.mailerService.sendMail(mailOptions);
    } catch (error) {
      await token.deleteOne();
      throw error;
    }

    return AuthMessages.SendedResetPassword;
  }

  async resetPassword(dto: ResetPasswordDto, userId: string, token: string) {
    const existingToken = await this.tokenModel.findOne({ token });

    if (!existingToken) {
      throw new NotFoundException(AuthMessages.NotFoundToken);
    }

    const hashPassword = this.hashData(dto.password, 12);

    await this.userModel.findOneAndUpdate(
      { _id: userId },
      { password: hashPassword }
    );

    await existingToken.deleteOne();

    return AuthMessages.ResetPasswordSuccess;
  }
}

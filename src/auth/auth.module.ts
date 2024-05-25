import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "src/schemas/User.schema";
import { JwtModule } from "@nestjs/jwt";
import { Token, TokenSchema } from "src/schemas/token.schema";
import { MailerModule } from "@nestjs-modules/mailer";
import { ConfigService } from "@nestjs/config";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Token.name, schema: TokenSchema },
    ]),
    JwtModule.register({ global: true }),
    MailerModule.forRootAsync({
      useFactory: (config: ConfigService) => {
        return {
          transport: {
            service: "gmail",
            port: 578,
            secure: false,
            logger: true,
            debug: true,
            auth: {
              user: config.get<string>("GMAIL_USER"),
              pass: config.get<string>("GMAIL_PASS"),
            },
            tls: { rejectUnauthorized: false },
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}

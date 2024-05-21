import {
  HttpCode,
  HttpStatus,
  UseGuards,
  applyDecorators,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from "@nestjs/swagger";
import { AuthGuard } from "src/guards/Auth.guard";

//* Signup user decorator
export const SignUpUserDecorator = applyDecorators(
  ApiConflictResponse({ description: "Already registered user" }),
  ApiCreatedResponse({ description: "Sign Up user success" }),
  ApiOperation({ summary: "Sign Up new user" })
);

//* Signin user decorator
export const SignInUserDecorator = applyDecorators(
  HttpCode(HttpStatus.OK),
  ApiNotFoundResponse({ description: "Not found user" }),
  ApiForbiddenResponse({ description: "Invalid password or identifier" }),
  ApiOkResponse({ description: "Signin success" }),
  ApiOperation({ summary: "User sign In" })
);

//* Signout user decorator
export const SignoutUserDecorator = applyDecorators(
  ApiCookieAuth(),
  ApiBadRequestResponse({ description: "Invalid access token" }),
  ApiForbiddenResponse({ description: "This path is protected !!" }),
  ApiOkResponse({ description: "Sign out success" }),
  ApiOperation({ summary: "User sign out" }),
  UseGuards(AuthGuard)
);

//* Refresh token decorator
export const RefreshTokenDecorator = applyDecorators(
  HttpCode(HttpStatus.OK),
  ApiInternalServerErrorResponse({ description: "Jwt expired" }),
  ApiNotFoundResponse({ description: "Refresh token not found" }),
  ApiOkResponse({ description: "Refreshed token success" }),
  ApiOperation({ summary: "Refresh access token" })
);

//* Forgot password Decorator
export const ForgotPasswordDecorator = applyDecorators(
  ApiNotFoundResponse({ description: "User not found" }),
  ApiConflictResponse({ description: "Already send mail" }),
  ApiOkResponse({ description: "Sended reset password" }),
  ApiOperation({ summary: "User forgot password" }),
  HttpCode(HttpStatus.OK)
);

//* Reset password decorator
export const ResetPasswordDecorator = applyDecorators(
  ApiNotFoundResponse({ description: "Token not found" }),
  ApiOkResponse({ description: "Reset password success" }),
  ApiOperation({ summary: "User reset password" }),
  HttpCode(HttpStatus.OK)
);

//* Send verify email decorator
export const SendVerifyEmailDecorator = applyDecorators(
  ApiNotFoundResponse({ description: "User not found" }),
  ApiConflictResponse({ description: "Already verify email" }),
  ApiConflictResponse({ description: "Already send email" }),
  ApiOkResponse({ description: "Send verify email success" }),
  ApiOperation({ summary: "Send email for verify user" }),
  HttpCode(HttpStatus.OK)
);

//* Verify email decorator
export const VerifyEmailDecorator = applyDecorators(
  ApiNotFoundResponse({ description: "Token not found" }),
  ApiNotFoundResponse({ description: "User not found" }),
  ApiConflictResponse({ description: "Already verify email" }),
  ApiOkResponse({ description: "Verified email success" }),
  ApiOperation({ summary: "Verified user by token" })
);

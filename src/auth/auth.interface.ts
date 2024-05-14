export interface SignupUser {
  accessToken: string;
  success: string;
}

export interface SigninUser extends SignupUser {}

export interface RefreshToken extends Omit<SignupUser, "accessToken"> {
  newAccessToken: string;
}

import { Prop, SchemaFactory } from "@nestjs/mongoose";

export class User {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  username: string;

  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({
    type: String,
    default: "/public/uploads/usersAvatar/custom-avatar.jpg",
  })
  avatarURL: string;

  @Prop({ type: Boolean, default: false })
  isAdmin: string;

  @Prop({ type: Boolean, default: false })
  isSuperAdmin: boolean;

  @Prop({ type: Boolean, default: false })
  isVerifyEmail: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

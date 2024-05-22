import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { rimrafSync } from "rimraf";
import * as path from "path";
import * as bcrypt from "bcrypt";
import { ObjectId } from "mongoose";
import { ConflictException } from "@nestjs/common";
@Schema({ versionKey: false, timestamps: true })
export class User {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  username: string;

  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: String, required: true, select: false })
  password: string;

  @Prop({
    type: String,
    default: "/uploads/custom-avatar.jpg",
  })
  avatarURL: string;

  @Prop({ type: Boolean, default: false })
  isAdmin: boolean;

  @Prop({ type: Boolean, default: false })
  isSuperAdmin: boolean;

  @Prop({ type: Boolean, default: false })
  isVerifyEmail: boolean;
}

const schema = SchemaFactory.createForClass(User);

schema.pre("updateOne", async function (next) {
  const user: User & { _id: ObjectId } = await this.model.findOne(
    this.getFilter()
  );

  const updateData: any = this.getUpdate();
  const publicPath = path.join(process.cwd(), "public");

  const foundUser = await this.model.findOne({
    $or: [
      { email: updateData["$set"].email, _id: { $ne: user._id } },
      { username: updateData["$set"].username, _id: { $ne: user._id } },
    ],
  });

  if (foundUser) {
    throw new ConflictException(
      "User with this username or email already exists"
    );
  }

  if (
    updateData["$set"].avatarURL &&
    !user.avatarURL.includes("custom-avatar.jpg")
  ) {
    rimrafSync(`${publicPath}${user.avatarURL}`);
  }

  const { password } = updateData["$set"];

  if (password) {
    updateData["$set"].password = bcrypt.hashSync(password, 12);
  }

  const { email } = updateData["$set"]
  
  if (email && email !== user.email) {
    updateData["$set"].isVerifyEmail = false;
  }

  next();
});

schema.pre("deleteOne", async function (next) {
  const user: User = await this.model.findOne(this.getFilter());
  const publicPath = path.join(process.cwd(), "public");

  if (!user.avatarURL.includes("custom-avatar.jpg")) {
    rimrafSync(`${publicPath}${user.avatarURL}`);
  }

  next();
});

export const UserSchema = schema;

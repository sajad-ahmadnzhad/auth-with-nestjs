import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { rimrafSync } from "rimraf";
import * as path from "path";
import * as bcrypt from "bcrypt";
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
  const user: User = await this.model.findOne(this.getFilter());
  const updateData: any = this.getUpdate();
  const publicPath = path.join(process.cwd(), "public");

  if (
    updateData["$set"].avatarURL &&
    !user.avatarURL.includes("custom-avatar.jpg")
  ) {
    rimrafSync(`${publicPath}${user.avatarURL}`);
  }

  const {password} = updateData["$set"];

  if (password) {
    updateData["$set"].password = bcrypt.hashSync(password, 12);
  }

  if (updateData["$set"].email !== user.email) {
    updateData["$set"].isVerifyEmail = false;
  }

  next();
});

schema.pre('deleteOne', async function (next) {
  

  
  next()
})

export const UserSchema = schema;

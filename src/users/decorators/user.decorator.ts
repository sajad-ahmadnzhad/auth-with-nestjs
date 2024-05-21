import { ExecutionContext, createParamDecorator } from "@nestjs/common";
import { Request } from "express";

export const UserDecorator = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest() as Request;

    return req.user;
  }
);

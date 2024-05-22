import { CanActivate, ExecutionContext } from "@nestjs/common";
import { Request } from "express";

export class IsSuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest() as Request;

    return req.user?.isSuperAdmin;
  }
}

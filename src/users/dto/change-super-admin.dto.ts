import { PartialType } from "@nestjs/swagger";
import { DeleteAccountDto } from "./delete-account.dto";

export class ChangeSuperAdminDto extends PartialType(DeleteAccountDto) {}

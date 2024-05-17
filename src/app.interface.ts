import { User } from "./schemas/User.schema";

declare global {
  namespace Express {
    interface Request {
      user: User | undefined;
    }
  }
}

export default {};

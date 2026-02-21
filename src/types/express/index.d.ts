import { Types } from "mongoose";

declare global {
  namespace Express {
    interface Request {
      usuario?: {
        id: string;
        rol: string;
      };
    }
  }
}

export {};
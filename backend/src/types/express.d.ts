import { Usuario } from "@/models/Usuario";
import "express";

declare module "express" {
  export interface Request {
    userId?: number;
    tokenExpiresIn?: number;
    author?: Usuario;
  }
}
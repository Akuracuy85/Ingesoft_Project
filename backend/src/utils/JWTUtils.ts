import { TIME } from "@/types/Time";
import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_SECRET || "unite_secret";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "refresh_secret";

export const ACCESS_JWT_TIME = TIME.MINUTE * 15;
export const REFRESH_JWT_TIME = TIME.HOUR * 1;

export function GenerarAccessToken(userId: number) {
  return jwt.sign({ userId }, ACCESS_SECRET, { expiresIn: "15m" });
}

export function GenerarRefreshToken(userId: number) {
  return jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: "1h" });
}

export function VerificarAccessToken(token: string) {
  return jwt.verify(token, ACCESS_SECRET) as { userId: number };
}

export function VerificarRefreshToken(token: string) {
  return jwt.verify(token, REFRESH_SECRET) as { userId: number };
}
import { TIME } from "../types/Time";
import { Response } from "express";

function CrearCookie(res: Response, nombre: string, valor: string, duracion: number, config?: object) {
  res.cookie(nombre, valor, {
    httpOnly: true,
    secure: process.env.ENV == 'prod',
    sameSite:  process.env.ENV == 'prod' ? "none" : "lax",
    ...config,
    maxAge: duracion,
  })
}

export function CrearCookieDeSesion(res: Response, accessToken: string, refreshToken?: string) {
  CrearCookie(res, "access_token", accessToken, 1 * TIME.HOUR);
  if(refreshToken) CrearCookie(res, "refresh_token", refreshToken, 2 * TIME.HOUR);
}
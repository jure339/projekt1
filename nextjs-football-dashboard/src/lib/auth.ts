import jwt from "jsonwebtoken";
import { env } from "@/lib/config/env";

/**
 * Vloge v aplikaciji.
 * - trener: upravlja ekipo (treningi, tekme, igralci)
 * - igralec: ima omejen vpogled in profil
 */
export type Role = "igralec" | "trener";

/**
 * Payload, ki ga shranimo v JWT.
 * sub = userId (standard JWT claim)
 */
export type AuthPayload = {
  sub: string;
  role: Role;
  email: string;
};

const TOKEN_EXPIRES_IN = "7d";

/**
 * Podpiše JWT token za uporabnika.
 */
export function signAuthToken(payload: AuthPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });
}

/**
 * Preveri JWT token in vrne payload.
 * Če je token invalid/expired, jwt.verify vrže error (naj ga caller catch-a).
 */
export function verifyAuthToken(token: string): AuthPayload {
  return jwt.verify(token, env.JWT_SECRET) as AuthPayload;
}

import jwt from "jsonwebtoken";

export type Role = "igralec" | "trener";

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error("Missing JWT_SECRET in env.");

export type AuthPayload = {
  sub: string;
  role: Role;
  email: string;
};

export function signAuthToken(payload: AuthPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyAuthToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as AuthPayload;
}

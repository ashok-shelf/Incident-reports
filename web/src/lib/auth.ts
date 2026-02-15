import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import fs from "node:fs";
import path from "node:path";
import { COOKIE_NAME } from "./constants";

interface User {
  id: string;
  username: string;
  password: string;
  name: string;
}

interface UsersFile {
  users: User[];
}

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret"
);

function getUsers(): User[] {
  const filePath = path.join(process.cwd(), "users.json");
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8")) as UsersFile;
  return data.users;
}

export async function authenticate(
  username: string,
  password: string
): Promise<{ id: string; username: string; name: string } | null> {
  const users = getUsers();
  const user = users.find(
    (u) => u.username === username && u.password === password
  );
  if (!user) return null;
  return { id: user.id, username: user.username, name: user.name };
}

export async function signToken(payload: {
  sub: string;
  username: string;
  name: string;
}): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .setIssuedAt()
    .sign(secret);
}

export async function verifyToken(
  token: string
): Promise<{ sub: string; username: string; name: string } | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as { sub: string; username: string; name: string };
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authenticate, signToken } from "@/lib/auth";
import { COOKIE_NAME } from "@/lib/constants";

export async function loginAction(
  prevState: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "Username and password are required" };
  }

  const user = await authenticate(username, password);

  if (!user) {
    return { error: "Invalid username or password" };
  }

  const token = await signToken({
    sub: user.id,
    username: user.username,
    name: user.name,
  });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  });

  redirect("/incidents");
}

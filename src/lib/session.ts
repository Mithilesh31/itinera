import { redirect } from "next/navigation";
import { auth } from "@/auth";

/** Returns the current session user, or null. */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/** Returns the current user or redirects to /login. Use in server actions. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user?.id) redirect("/login");
  return user;
}

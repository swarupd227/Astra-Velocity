import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getActivePersona } from "@/lib/persona";
import { ROLE_HOMES } from "@/lib/roles";

export default async function Home() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const persona = (await getActivePersona()) ?? session.user.role;
  redirect(ROLE_HOMES[persona]);
}

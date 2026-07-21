import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { auditLog, users } from "@/db/schema";
import type { Role } from "@/lib/roles";

const CredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = CredentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const user = await db.query.users.findFirst({
          where: eq(users.email, email.toLowerCase()),
        });
        if (!user || !user.isActive) return null;

        const ok = await compare(password, user.passwordHash);
        if (!ok) return null;

        await db.insert(auditLog).values({
          actorType: "human",
          actorId: user.id,
          action: "auth.login",
          entityType: "user",
          entityId: user.id,
        });

        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
    // Entra ID SSO is added here behind FEATURE_ENTRA_SSO at the Azure phase.
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: Role }).role;
        token.uid = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as Role;
        session.user.id = token.uid as string;
      }
      return session;
    },
  },
});

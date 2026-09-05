import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  // La sesión efectiva se corta antes por SessionCloseGuard (se desloguea
  // solo con cerrar el navegador), esto es un respaldo por si el
  // navegador restaura sessionStorage entre reinicios: igual no queda
  // logueado más de 12 horas.
  session: { strategy: "jwt", maxAge: 12 * 60 * 60 },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase().trim() },
          include: { seller: true, clientAccount: { include: { client: true } } },
        });
        if (!user || !user.isActive) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        const now = new Date();
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: now },
        });
        if (user.clientAccount) {
          await prisma.clientAccount.update({
            where: { id: user.clientAccount.id },
            data: { lastLoginAt: now },
          });
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          sellerId: user.sellerId,
          clientId: user.clientId,
          name: user.seller?.displayName ?? user.clientAccount?.client.fullNameNormalized ?? user.email,
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = (user as { role: string }).role;
        token.sellerId = (user as { sellerId: string | null }).sellerId;
        token.clientId = (user as { clientId: string | null }).clientId;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as string;
        session.user.sellerId = token.sellerId as string | null;
        session.user.clientId = token.clientId as string | null;
      }
      return session;
    },
  },
});

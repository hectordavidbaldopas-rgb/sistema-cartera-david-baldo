import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      sellerId: string | null;
      clientId: string | null;
    } & DefaultSession["user"];
  }
}

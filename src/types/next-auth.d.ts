import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { UserRole } from "./user-role";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: UserRole;
            avatar?: string;
        } & DefaultSession["user"];
    }

    interface User extends DefaultUser {
        id: string;
        role: UserRole;
        avatar?: string | null;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: UserRole;
        avatar?: string;
    }
}

import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as any,
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                console.log("NextAuth Autorizar - Credenciais recebidas:", { email: credentials?.email });
                if (!credentials?.email || !credentials?.password) {
                    console.error("NextAuth - Credenciais ausentes");
                    throw new Error("Credenciais inválidas");
                }
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                });
                console.log("NextAuth - Usuário encontrado no banco:", user ? "Sim" : "Não");

                if (!user || !user.password) {
                    console.error("NextAuth - Usuário não encontrado ou sem senha");
                    throw new Error("Credenciais inválidas");
                }
                const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
                console.log("NextAuth - Senha válida:", isPasswordValid);

                if (!isPasswordValid) {
                    console.error("NextAuth - Senha inválida para o usuário:", credentials.email);
                    throw new Error("Credenciais inválidas");
                }
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    phone: user.phone || undefined,
                    avatar: user.avatar || undefined,
                    linkedStudentIds: user.linkedStudentIds || []
                };
            }
        })
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.role = (user as any).role;
                token.id = user.id;
                token.phone = (user as any).phone;
                token.avatar = (user as any).avatar;
                token.linkedStudentIds = (user as any).linkedStudentIds;
            }
            if (trigger === "update" && session) {
                token = { ...token, ...session }
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                (session.user as any).role = token.role as string;
                (session.user as any).id = token.id as string;
                (session.user as any).phone = token.phone as string | undefined;
                (session.user as any).avatar = token.avatar as string | undefined;
                (session.user as any).linkedStudentIds = token.linkedStudentIds as string[] | undefined;
            }
            return session;
        }
    },
    pages: {
        signIn: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

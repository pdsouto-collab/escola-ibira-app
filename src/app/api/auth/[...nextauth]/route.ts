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
                    roles: user.roles && user.roles.length > 0 ? user.roles : [user.role],
                    phone: user.phone || undefined,
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
                token.roles = (user as any).roles || ((user as any).role ? [(user as any).role] : []);
                token.id = user.id;
                token.phone = (user as any).phone;
                token.linkedStudentIds = (user as any).linkedStudentIds;
            }
            if (trigger === "update" && session) {
                token = { ...token, ...session }
                delete token.avatar;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                // Fetch fresh user data from DB instead of relying on token stuffing for heavy data like avatars
                const dbUser = await prisma.user.findUnique({ where: { id: token.id as string } });
                
                (session.user as any).role = token.role as string;
                (session.user as any).roles = (token.roles as string[]) || (token.role ? [token.role as string] : []);
                (session.user as any).id = token.id as string;
                (session.user as any).phone = token.phone as string | undefined;
                (session.user as any).linkedStudentIds = token.linkedStudentIds as string[] | undefined;
                
                if (dbUser) {
                    (session.user as any).avatar = dbUser.avatar;
                    (session.user as any).name = dbUser.name;
                    (session.user as any).email = dbUser.email;
                    (session.user as any).role = dbUser.role;
                    (session.user as any).roles = dbUser.roles && dbUser.roles.length > 0 ? dbUser.roles : [dbUser.role];
                }
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

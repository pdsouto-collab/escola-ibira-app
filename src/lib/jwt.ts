import jwt, { SignOptions } from "jsonwebtoken";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { headers } from "next/headers";

const DEFAULT_SIGN_OPTION: SignOptions = {
  expiresIn: "1d",
};

export function signJwtAccessToken(payload: any, options: SignOptions = DEFAULT_SIGN_OPTION) {
  const secret_key = process.env.NEXTAUTH_SECRET;
  if (!secret_key) {
    throw new Error("NEXTAUTH_SECRET is not defined");
  }
  const token = jwt.sign(payload, secret_key, options);
  return token;
}

export function verifyJwtAccessToken(token: string) {
  try {
    const secret_key = process.env.NEXTAUTH_SECRET;
    if (!secret_key) {
      throw new Error("NEXTAUTH_SECRET is not defined");
    }
    const decoded = jwt.verify(token, secret_key);
    return decoded as any;
  } catch (error) {
    if (error instanceof Error) {
        console.error("Erro JWT Verify:", error.message);
    }
    return null;
  }
}

/**
 * Função utilitária para rotas da API checarem se a request
 * veio via Sessão Web (NextAuth) ou App Externo (Token Bearer).
 * @returns Retorna a session inteira no formato do NextAuth ou nulo se não houver auth.
 */
export async function getServerSessionOrJwt() {
  // 1. Tenta obter a sessão padrão do NextAuth via cookies
  const session = await getServerSession(authOptions);
  
  if (session && session.user) {
    return session;
  }

  // 2. Se não encontrou, tenta buscar o Header Authorization: Bearer
  const headersList = await headers();
  const authHeader = headersList.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];
  const decodedToken = verifyJwtAccessToken(token);

  if (decodedToken) {
    // Retorna num formato semelhante ao da Session do NextAuth para compatibilidade
    return {
      user: {
        id: decodedToken.id,
        email: decodedToken.email,
        name: decodedToken.name,
        role: decodedToken.role,
        phone: decodedToken.phone,
        avatar: decodedToken.avatar,
      }
    };
  }

  return null;
}

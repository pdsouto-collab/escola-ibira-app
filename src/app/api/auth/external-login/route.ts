import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signJwtAccessToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return new NextResponse("CredenciaisAusentes", { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.password) {
      return new NextResponse("Credenciais invalidas", { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return new NextResponse("Credenciais invalidas", { status: 401 });
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone || undefined,
    };

    const clientUserPayload = {
      ...tokenPayload,
      avatar: user.avatar || undefined,
    };

    // Gera o token
    const token = signJwtAccessToken(tokenPayload);

    return NextResponse.json({
        token,
        user: clientUserPayload
    });

  } catch (error) {
    console.error("[EXTERNAL_LOGIN_POST]", error);
    return new NextResponse("Erro Interno", { status: 500 });
  }
}

// Responde ao preflight da requisição CORS para garantir que passe sem bloqueios
export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}

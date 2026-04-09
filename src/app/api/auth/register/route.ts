import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password || !role) {
      return new NextResponse("Nome, email, senha e cargo são obrigatórios", { status: 400 });
    }

    // Role safety guard for public registrations
    const allowedRoles = ["guardian", "teacher", "director"];
    if (!allowedRoles.includes(role)) {
      return new NextResponse("Cargo inválido para registro público.", { status: 403 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return new NextResponse("Email já cadastrado", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: role,
        status: "active"
      }
    });

    return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    console.error("[AUTH_REGISTER_POST]", error);
    return new NextResponse("Erro Interno no Registro", { status: 500 });
  }
}

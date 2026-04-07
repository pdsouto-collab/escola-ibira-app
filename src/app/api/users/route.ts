import { getServerSessionOrJwt } from "@/lib/jwt";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
        const session = await getServerSessionOrJwt();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

  try {
    const users = await prisma.user.findMany({
      orderBy: { name: "asc" }
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error("[USERS_GET]", error);
    return new NextResponse("Erro Interno", { status: 500 });
  }
}

export async function POST(req: Request) {
        const session = await getServerSessionOrJwt();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

  try {
    const body = await req.json();
    const {
      name, role, email, password, avatar, cpf, phone, birthDate, address,
      hiringDate, education, specialization, bio, status,
      assignedClassIds, linkedStudentIds
    } = body;

    if (!name || !email || !role) {
      return new NextResponse("Nome, email e cargo são obrigatórios", { status: 400 });
    }

    // Para persistir a senha, precisamos fazer o hash se ela for fornecida
    // Se não for fornecida, podemos gerar uma senha padrão (ex: ibira123)
    const passwordToHash = password || "ibira123";
    const hashedPassword = await bcrypt.hash(passwordToHash, 10);

    const user = await prisma.user.create({
      data: {
        name,
        role,
        email,
        password: hashedPassword,
        avatar,
        cpf,
        phone,
        birthDate,
        address,
        hiringDate,
        education,
        specialization: specialization || [],
        bio,
        status: status || "active",
        assignedClassIds: assignedClassIds || [],
        linkedStudentIds: linkedStudentIds || []
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("[USERS_POST]", error);
    return new NextResponse("Erro Interno", { status: 500 });
  }
}

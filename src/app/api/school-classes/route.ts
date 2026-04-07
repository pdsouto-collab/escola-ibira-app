import { getServerSessionOrJwt } from "@/lib/jwt";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
        const session = await getServerSessionOrJwt();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

  try {
    const classes = await prisma.schoolClass.findMany({
      orderBy: { name: "asc" }
    });
    return NextResponse.json(classes);
  } catch (error) {
    console.error("[SCHOOL_CLASSES_GET]", error);
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
    const { id, name, description, teacherId, assistantId } = body;
    
    if (!name) {
      return new NextResponse("Nome é obrigatório", { status: 400 });
    }

    const schoolClass = await prisma.schoolClass.create({
      data: {
        id,
        name,
        description,
        teacherId,
        assistantId
      }
    });

    return NextResponse.json(schoolClass);
  } catch (error) {
    console.error("[SCHOOL_CLASSES_POST]", error);
    return new NextResponse("Erro Interno", { status: 500 });
  }
}

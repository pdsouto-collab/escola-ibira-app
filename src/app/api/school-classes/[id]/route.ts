import { getServerSessionOrJwt } from "@/lib/jwt";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
        const session = await getServerSessionOrJwt();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

  try {
    const { id } = await params;

    const schoolClass = await prisma.schoolClass.findUnique({
      where: { id },
    });

    if (!schoolClass) {
      return new NextResponse("Turma não encontrada", { status: 404 });
    }

    return NextResponse.json(schoolClass);
  } catch (error) {
    console.error("[SCHOOL_CLASS_GET]", error);
    return new NextResponse("Erro Interno", { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
        const session = await getServerSessionOrJwt();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

  try {
    const { id } = await params;
    const body = await req.json();
    const { name, description, teacherId, assistantId } = body;

    const schoolClass = await prisma.schoolClass.update({
      where: {
        id,
      },
      data: {
        name,
        description,
        teacherId,
        assistantId
      }
    });

    return NextResponse.json(schoolClass);
  } catch (error) {
    console.error("[SCHOOL_CLASS_PUT]", error);
    return new NextResponse("Erro Interno", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
        const session = await getServerSessionOrJwt();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

  try {
    const { id } = await params;

    await prisma.schoolClass.delete({
      where: {
        id,
      }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[SCHOOL_CLASS_DELETE]", error);
    return new NextResponse("Erro Interno", { status: 500 });
  }
}

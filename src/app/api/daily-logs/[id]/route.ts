import { getServerSessionOrJwt } from "@/lib/jwt";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

    const dataToUpdate: any = { ...body };
    delete dataToUpdate.createdAt;
    delete dataToUpdate.updatedAt;
    delete dataToUpdate.id; // Evitar overwrite de ID

    const updatedLog = await prisma.dailyLog.update({
      where: { id },
      data: dataToUpdate
    });

    return NextResponse.json(updatedLog);
  } catch (error) {
    console.error("Erro ao atualizar diário de bordo:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
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

    const logExists = await prisma.dailyLog.findUnique({ where: { id } });
    if (!logExists) {
        return NextResponse.json({ error: "Registro não encontrado" }, { status: 404 });
    }

    await prisma.dailyLog.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Registro deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar diário de bordo:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

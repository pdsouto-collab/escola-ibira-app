import { getServerSessionOrJwt } from "@/lib/jwt";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
        const session = await getServerSessionOrJwt();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

  try {
    const { id } = await context.params;
    const body = await request.json();

    const updated = await prisma.knowledgeNode.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        libraryItemId: body.libraryItemId,
        classId: body.classId,
        period: body.period,
        level: body.level,
      }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
        const session = await getServerSessionOrJwt();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

  try {
    const { id } = await context.params;

    await prisma.knowledgeNode.delete({
      where: { id }
    });
    // O Cascade do Prisma (onDelete: Cascade) já garante que os filhos serão apagados.

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

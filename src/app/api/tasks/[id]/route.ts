import { getServerSessionOrJwt } from "@/lib/jwt";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { UpdateTaskInput } from "@/types/task";

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

    if (!id) {
      return new NextResponse("Task ID is required", { status: 400 });
    }

    // @ts-ignore
    await prisma.task.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Erro ao deletar tarefa:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
        const session = await getServerSessionOrJwt();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

  try {
    const { id } = await params;
    
    if (!id) {
      return new NextResponse("Task ID is required", { status: 400 });
    }

    const body = await req.json();
    const { title, dueDate, priority } = body as UpdateTaskInput;

    // @ts-ignore
    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(dueDate !== undefined && { dueDate }),
        ...(priority && { priority }),
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("Erro ao atualizar tarefa:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

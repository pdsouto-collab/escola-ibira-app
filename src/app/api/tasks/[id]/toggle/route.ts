import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return new NextResponse("Task ID is required", { status: 400 });
    }

    const body = await req.json();
    const { completed } = body;

    // @ts-ignore
    const task = await prisma.task.update({
      where: { id },
      data: { completed },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("Erro ao alterar o status da tarefa:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

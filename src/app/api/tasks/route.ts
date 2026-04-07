import { getServerSessionOrJwt } from "@/lib/jwt";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { CreateTaskInput } from "@/types/task";

export async function GET() {
        const session = await getServerSessionOrJwt();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

  try {
    // @ts-ignore
    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Erro ao buscar tarefas:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
        const session = await getServerSessionOrJwt();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

  try {
    const body = await req.json();
    const { title, dueDate, priority } = body as CreateTaskInput;

    if (!title) {
      return new NextResponse("Title is required", { status: 400 });
    }

    // @ts-ignore
    const task = await prisma.task.create({
      data: {
        title,
        dueDate,
        priority: priority || "medium",
        completed: false,
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("Erro ao criar tarefa:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

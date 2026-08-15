import { getServerSessionOrJwt } from "@/lib/jwt";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
        const session = await getServerSessionOrJwt();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(projects);
  } catch (error) {
    console.error("Erro ao listar projetos:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(req: Request) {
        const session = await getServerSessionOrJwt();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

  try {
    const data = await req.json();
    const newProject = await prisma.project.create({
      data: {
        id: data.id,
        title: data.title,
        description: data.description || "",
        status: data.status || "draft",
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : null,
        period: data.period,
        type: data.type,
        summary: data.summary,
        objectives: data.objectives,
        finalProduct: data.finalProduct,
        guidingQuestion: data.guidingQuestion,
        imageUrl: data.imageUrl,
        photos: data.photos || [],
        tags: data.tags || [],
        bnccSkillIds: data.bnccSkillIds || [],
        contentIds: data.contentIds || [],
        students: data.students || [],
        classes: data.classes || []
      }
    });
    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar projeto:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

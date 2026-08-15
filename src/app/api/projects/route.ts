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

function parseSafeDate(val: any, fallback: Date | null = null): Date | null {
    if (!val) return fallback;
    const d = new Date(val);
    return isNaN(d.getTime()) ? fallback : d;
}

export async function POST(req: Request) {
    const session = await getServerSessionOrJwt();
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

  try {
    const data = await req.json();
    const projectId = data.id || crypto.randomUUID();

    const projectPayload = {
      title: data.title || "Novo Projeto",
      description: data.description || "",
      status: data.status || "draft",
      startDate: parseSafeDate(data.startDate, new Date()) as Date,
      endDate: parseSafeDate(data.endDate, null),
      period: data.period || null,
      type: data.type || "Project",
      summary: data.summary || null,
      objectives: data.objectives || null,
      finalProduct: data.finalProduct || null,
      guidingQuestion: data.guidingQuestion || null,
      imageUrl: data.imageUrl || null,
      photos: Array.isArray(data.photos) ? data.photos : [],
      tags: Array.isArray(data.tags) ? data.tags : [],
      bnccSkillIds: Array.isArray(data.bnccSkillIds) ? data.bnccSkillIds : [],
      contentIds: Array.isArray(data.contentIds) ? data.contentIds : [],
      students: Array.isArray(data.students) ? data.students : [],
      classes: Array.isArray(data.classes) ? data.classes : []
    };

    const project = await prisma.project.upsert({
      where: { id: projectId },
      update: projectPayload,
      create: {
        id: projectId,
        ...projectPayload
      }
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar/atualizar projeto:", error);
    return NextResponse.json({ error: error?.message || "Erro interno do servidor ao salvar projeto" }, { status: 500 });
  }
}

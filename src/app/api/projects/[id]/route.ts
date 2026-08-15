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
    
    if (!id) {
      return NextResponse.json({ error: "ID não fornecido" }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id }
    });

    if (!project) {
      return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("Erro ao buscar projeto:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

function parseSafeDate(val: any, fallback: Date | null = null): Date | null {
    if (!val) return fallback;
    const d = new Date(val);
    return isNaN(d.getTime()) ? fallback : d;
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

    const dataToUpdate: any = { ...body };
    
    // Convert date strings to Date objects safely
    if (dataToUpdate.startDate) {
      dataToUpdate.startDate = parseSafeDate(dataToUpdate.startDate, new Date());
    }
    if (dataToUpdate.endDate !== undefined) {
      dataToUpdate.endDate = parseSafeDate(dataToUpdate.endDate, null);
    }
    
    // Remove fields generated automatically
    delete dataToUpdate.createdAt;
    delete dataToUpdate.updatedAt;

    const updatedProject = await prisma.project.upsert({
      where: { id },
      update: dataToUpdate,
      create: {
        id,
        title: dataToUpdate.title || "Novo Projeto",
        description: dataToUpdate.description || "",
        status: dataToUpdate.status || "draft",
        startDate: dataToUpdate.startDate || new Date(),
        endDate: dataToUpdate.endDate || null,
        period: dataToUpdate.period || null,
        type: dataToUpdate.type || "Project",
        summary: dataToUpdate.summary || null,
        objectives: dataToUpdate.objectives || null,
        finalProduct: dataToUpdate.finalProduct || null,
        guidingQuestion: dataToUpdate.guidingQuestion || null,
        imageUrl: dataToUpdate.imageUrl || null,
        photos: Array.isArray(dataToUpdate.photos) ? dataToUpdate.photos : [],
        tags: Array.isArray(dataToUpdate.tags) ? dataToUpdate.tags : [],
        bnccSkillIds: Array.isArray(dataToUpdate.bnccSkillIds) ? dataToUpdate.bnccSkillIds : [],
        contentIds: Array.isArray(dataToUpdate.contentIds) ? dataToUpdate.contentIds : [],
        students: Array.isArray(dataToUpdate.students) ? dataToUpdate.students : [],
        classes: Array.isArray(dataToUpdate.classes) ? dataToUpdate.classes : []
      }
    });

    return NextResponse.json(updatedProject);
  } catch (error: any) {
    console.error("Erro ao atualizar projeto:", error);
    return NextResponse.json({ error: error?.message || "Erro interno do servidor ao atualizar projeto" }, { status: 500 });
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

    const projectExists = await prisma.project.findUnique({ where: { id } });
    if (!projectExists) {
        return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 });
    }

    await prisma.project.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Projeto deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar projeto:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

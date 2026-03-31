import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const dataToUpdate: any = { ...body };
    
    // Convert date strings to Date objects if needed
    if (dataToUpdate.startDate) {
      dataToUpdate.startDate = new Date(dataToUpdate.startDate);
    }
    if (dataToUpdate.endDate) {
      dataToUpdate.endDate = new Date(dataToUpdate.endDate);
    }
    
    // Remove fields generated automatically
    delete dataToUpdate.createdAt;
    delete dataToUpdate.updatedAt;

    const updatedProject = await prisma.project.update({
      where: { id },
      data: dataToUpdate
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error("Erro ao atualizar projeto:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

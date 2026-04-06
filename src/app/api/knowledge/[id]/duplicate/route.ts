import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Função recursiva para ler o nó original e todos os seus filhos, e recriá-los com clonagem
async function duplicateNodeRecursively(nodeId: string, newParentId: string | null): Promise<any> {
  const originalNode = await prisma.knowledgeNode.findUnique({
    where: { id: nodeId },
    include: { children: true }
  });

  if (!originalNode) throw new Error("Anotação não encontrada");

  // O nome ganha um (Cópia) pra identificar na UI
  const newName = newParentId === null || newParentId === originalNode.parentId  
      ? `${originalNode.name} (Cópia)` 
      : originalNode.name;

  const clonedNode = await prisma.knowledgeNode.create({
    data: {
      name: newName,
      level: originalNode.level,
      type: originalNode.type,
      description: originalNode.description,
      libraryItemId: originalNode.libraryItemId,
      classId: originalNode.classId,
      period: originalNode.period,
      parentId: newParentId
    }
  });

  // Clona os filhos recursivamente
  for (const child of originalNode.children) {
    await duplicateNodeRecursively(child.id, clonedNode.id);
  }

  return clonedNode;
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    const originalNode = await prisma.knowledgeNode.findUnique({
      where: { id },
      select: { parentId: true }
    });

    if (!originalNode) return NextResponse.json({ error: "Nó não encontrado" }, { status: 404 });

    const newRootClone = await duplicateNodeRecursively(id, originalNode.parentId);

    return NextResponse.json(newRootClone);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { getServerSessionOrJwt } from "@/lib/jwt";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
        const session = await getServerSessionOrJwt();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

  try {
    const allNodes = await prisma.mosaicNode.findMany({
      orderBy: { createdAt: 'asc' }
    });

    const nodeMap = new Map();
    allNodes.forEach(node => nodeMap.set(node.id, { ...node, children: [] }));

    const rootNodes: any[] = [];

    allNodes.forEach(node => {
      if (node.parentId) {
        const parent = nodeMap.get(node.parentId);
        if (parent) {
          parent.children.push(nodeMap.get(node.id));
        }
      } else {
        rootNodes.push(nodeMap.get(node.id));
      }
    });

    return NextResponse.json(rootNodes);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// O método replace usado anteriormente substituia todo o dado do store, que no banco precisará deletar e recriar
export async function POST(request: Request) {
        const session = await getServerSessionOrJwt();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

  try {
    const { nodes } = await request.json();

    // Limpa a tabela e recria - comportamento do DB equivalente a replaceMosaicData
    await prisma.mosaicNode.deleteMany();

    async function seedMosaicTree(nodeList: any[], parentId: string | null = null) {
      for (const node of nodeList) {
        const created = await prisma.mosaicNode.create({
          data: {
            id: node.id,
            label: node.label,
            type: node.type,
            color: node.color,
            weight: node.weight,
            parentId: parentId,
          }
        });
        if (node.children && node.children.length > 0) {
          await seedMosaicTree(node.children, created.id);
        }
      }
    }

    await seedMosaicTree(nodes);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

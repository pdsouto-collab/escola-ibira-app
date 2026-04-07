import { getServerSessionOrJwt } from "@/lib/jwt";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
        const session = await getServerSessionOrJwt();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // 'skill' or 'content'
    
    if (!type) return NextResponse.json({ error: "Type is required" }, { status: 400 });

    const allNodes = await prisma.knowledgeNode.findMany({
      where: { type },
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

export async function POST(request: Request) {
        const session = await getServerSessionOrJwt();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

  try {
    const { parentId, node } = await request.json();

    const created = await prisma.knowledgeNode.create({
      data: {
        id: node.id || undefined, // let prisma generate if not provided, though node might have one from UI
        level: node.level,
        type: node.type,
        name: node.name,
        description: node.description,
        libraryItemId: node.libraryItemId,
        classId: node.classId,
        period: node.period,
        parentId: parentId || null
      }
    });

    return NextResponse.json({ ...created, children: [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

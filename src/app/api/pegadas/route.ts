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
        const posts = await prisma.pegadaPost.findMany({
            include: {
                interactions: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return NextResponse.json(posts);
    } catch (error) {
        console.error("GET /api/pegadas error:", error);
        return NextResponse.json({ error: "Erro ao buscar pegadas" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSessionOrJwt();
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const data = await req.json();

        const mediaList = Array.isArray(data.mediaUrls) && data.mediaUrls.length > 0
            ? data.mediaUrls
            : (data.mediaUrl && data.mediaUrl !== "null" ? [data.mediaUrl] : []);

        const post = await prisma.pegadaPost.create({
            data: {
                authorId: data.authorId || session.user.id,
                authorName: data.authorName || session.user.name || "Educador",
                type: data.type || "photo",
                title: data.title || "",
                content: data.content || "",
                mediaUrl: mediaList[0] || null,
                mediaUrls: mediaList,
                tags: data.tags || [],
            },
            include: {
                interactions: true,
            },
        });

        return NextResponse.json(post);
    } catch (error) {
        console.error("POST /api/pegadas error:", error);
        return NextResponse.json({ error: "Erro ao criar pegada" }, { status: 500 });
    }
}

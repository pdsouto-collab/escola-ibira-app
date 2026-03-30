import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
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
    try {
        const data = await req.json();

        const post = await prisma.pegadaPost.create({
            data: {
                authorId: data.authorId,
                authorName: data.authorName,
                type: data.type,
                title: data.title,
                content: data.content,
                mediaUrl: data.mediaUrl,
                mediaUrls: data.mediaUrls || [],
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

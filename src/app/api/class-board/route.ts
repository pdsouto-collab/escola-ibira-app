import { getServerSessionOrJwt } from "@/lib/jwt";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
        const session = await getServerSessionOrJwt();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

    try {
        const { searchParams } = new URL(request.url);
        const classId = searchParams.get("classId");

        const where = classId ? { classId } : {};

        const posts = await prisma.classBoardPost.findMany({
            where,
            include: {
                interactions: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(posts);
    } catch (error) {
        console.error("Error fetching class board posts:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
        const session = await getServerSessionOrJwt();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

    try {
        const body = await request.json();
        
        const {
            classId,
            authorId,
            authorName,
            authorRole,
            categoryType,
            linkedProjectId,
            title,
            content,
            extraMaterials,
            photos,
        } = body;

        const post = await prisma.classBoardPost.create({
            data: {
                classId,
                authorId,
                authorName,
                authorRole,
                categoryType,
                linkedProjectId,
                title,
                content,
                extraMaterials,
                photos: photos || [],
            },
        });

        return NextResponse.json(post, { status: 201 });
    } catch (error) {
        console.error("Error creating class board post:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

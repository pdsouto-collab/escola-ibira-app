import { getServerSessionOrJwt } from "@/lib/jwt";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
        const session = await getServerSessionOrJwt();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

    try {
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get("studentId");

        const whereClause = studentId ? { studentId } : {};

        // @ts-ignore - Ignoring TS error until Prisma is regenerated
        const entries = await prisma.portfolioEntry.findMany({
            where: whereClause,
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(entries);
    } catch (error) {
        console.error("[PORTFOLIO_GET]", error);
        return new NextResponse("Internal server error", { status: 500 });
    }
}

export async function POST(req: NextRequest) {
        const session = await getServerSessionOrJwt();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

    try {
        const body = await req.json();
        const { studentId, date, title, description, imageUrl, images, tags } = body;

        if (!studentId || !date || !title || !description) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // @ts-ignore
        const newEntry = await prisma.portfolioEntry.create({
            data: {
                studentId,
                date,
                title,
                description,
                imageUrl: imageUrl || null,
                images: images || [],
                tags: tags || [],
            },
        });

        return NextResponse.json(newEntry);
    } catch (error) {
        console.error("[PORTFOLIO_POST]", error);
        return new NextResponse("Internal server error", { status: 500 });
    }
}

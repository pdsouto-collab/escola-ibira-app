import { getServerSessionOrJwt } from "@/lib/jwt";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
        const session = await getServerSessionOrJwt();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

    try {
        const { id } = await params;
        const body = await request.json();
        const { author, text } = body;

        const newComment = await prisma.muralComment.create({
            data: {
                author,
                text,
                muralEventId: id
            }
        });
        return NextResponse.json(newComment);
    } catch (error) {
        console.error("Erro ao adicionar comentário:", error);
        return NextResponse.json({ error: "Erro ao adicionar comentário" }, { status: 500 });
    }
}

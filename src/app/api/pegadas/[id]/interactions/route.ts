import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const data = await req.json();

        const interaction = await prisma.pegadaInteraction.create({
            data: {
                ...data,
                pegadaPostId: id,
            },
        });

        return NextResponse.json(interaction);
    } catch (error) {
        console.error("POST /api/pegadas/[id]/interactions error:", error);
        return NextResponse.json({ error: "Erro ao criar interação na pegada" }, { status: 500 });
    }
}

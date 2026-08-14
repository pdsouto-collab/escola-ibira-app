import { getServerSessionOrJwt } from "@/lib/jwt";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
        const session = await getServerSessionOrJwt();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

    try {
        const { id } = await params;
        const event = await prisma.muralEvent.findUnique({
            where: { id },
            include: { comments: true }
        });
        if (!event) return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
        return NextResponse.json(event);
    } catch (error) {
        return NextResponse.json({ error: "Erro ao buscar evento" }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSessionOrJwt();
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const body = await request.json();
        const { title, description, date, type, location, image, classId, likes } = body;

        let parsedDate: Date | undefined = undefined;
        if (date) {
            const d = new Date(date);
            if (!isNaN(d.getTime())) {
                parsedDate = d;
            }
        }

        const updatedEvent = await prisma.muralEvent.update({
            where: { id },
            data: {
                title: title !== undefined ? title : undefined,
                description: description !== undefined ? description : undefined,
                date: parsedDate,
                type: type !== undefined ? type : undefined,
                location: location !== undefined ? (location || null) : undefined,
                image: image !== undefined ? (image || null) : undefined,
                classId: classId !== undefined ? (classId === "all" ? null : classId) : undefined,
                likes: likes !== undefined ? likes : undefined
            },
            include: { comments: true }
        });
        return NextResponse.json(updatedEvent);
    } catch (error: any) {
        console.error("Erro ao atualizar evento:", error);
        return NextResponse.json({ error: error?.message || "Erro ao atualizar evento" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
        const session = await getServerSessionOrJwt();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

    try {
        const { id } = await params;
        await prisma.muralEvent.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erro ao deletar evento:", error);
        return NextResponse.json({ error: "Erro ao deletar evento" }, { status: 500 });
    }
}

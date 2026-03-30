import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
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
    try {
        const { id } = await params;
        const body = await request.json();
        const { title, description, date, type, location, image, classId, likes } = body;

        const updatedEvent = await prisma.muralEvent.update({
            where: { id },
            data: {
                title,
                description,
                date: date ? new Date(date) : undefined,
                type,
                location,
                image,
                classId,
                likes
            },
            include: { comments: true }
        });
        return NextResponse.json(updatedEvent);
    } catch (error) {
        console.error("Erro ao atualizar evento:", error);
        return NextResponse.json({ error: "Erro ao atualizar evento" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

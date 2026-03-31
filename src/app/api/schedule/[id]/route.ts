import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const params = await context.params;
        const id = params.id;
        const item = await prisma.scheduleItem.findUnique({
            where: { id }
        });
        if (!item) return NextResponse.json({ error: "Item não encontrado" }, { status: 404 });
        return NextResponse.json(item);
    } catch (error) {
        console.error("Erro ao buscar item:", error);
        return NextResponse.json({ error: "Erro ao buscar item" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const params = await context.params;
        const id = params.id;
        const body = await request.json();
        const item = await prisma.scheduleItem.update({
            where: { id },
            data: body,
        });
        return NextResponse.json(item);
    } catch (error) {
        console.error("Erro ao atualizar item:", error);
        return NextResponse.json({ error: "Erro ao atualizar item" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const params = await context.params;
        const id = params.id;
        await prisma.scheduleItem.delete({
            where: { id },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erro ao deletar item:", error);
        return NextResponse.json({ error: "Erro ao deletar item" }, { status: 500 });
    }
}

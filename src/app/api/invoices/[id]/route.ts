import { getServerSessionOrJwt } from "@/lib/jwt";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
        const session = await getServerSessionOrJwt();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

    try {
        const { id } = await params;
        const updates = await request.json();

        const invoice = await prisma.invoice.update({
            where: { id },
            data: updates
        });

        return NextResponse.json(invoice);
    } catch (error) {
        console.error("Erro ao atualizar fatura:", error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
        const session = await getServerSessionOrJwt();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

    try {
        const { id } = await params;

        await prisma.invoice.delete({
            where: { id }
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("Erro ao excluir fatura:", error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}

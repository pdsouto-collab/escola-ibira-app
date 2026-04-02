import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const data = await req.json();

        if (!data) {
            return NextResponse.json({ error: "Dados para atualização ausentes" }, { status: 400 });
        }

        const updated = await prisma.finalProductType.update({
            where: { id },
            data: {
                name: data.name
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("ERRO PUT FINAL PRODUCT TYPE:", error);
        return NextResponse.json({ error: "Erro interno ao atualizar" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        await prisma.finalProductType.delete({
            where: { id }
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("ERRO DELETE FINAL PRODUCT TYPE:", error);
        return NextResponse.json({ error: "Erro interno ao deletar" }, { status: 500 });
    }
}

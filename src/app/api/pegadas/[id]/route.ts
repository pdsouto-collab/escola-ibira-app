import { getServerSessionOrJwt } from "@/lib/jwt";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSessionOrJwt();
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const data = await req.json();

        const updateData: any = { ...data };
        if (data.mediaUrls !== undefined) {
            updateData.mediaUrls = Array.isArray(data.mediaUrls) ? data.mediaUrls : [];
            updateData.mediaUrl = updateData.mediaUrls.length > 0 ? updateData.mediaUrls[0] : null;
        }

        const post = await prisma.pegadaPost.update({
            where: { id },
            data: updateData,
            include: {
                interactions: true,
            },
        });

        return NextResponse.json(post);
    } catch (error) {
        console.error("PUT /api/pegadas/[id] error:", error);
        return NextResponse.json({ error: "Erro ao atualizar pegada" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSessionOrJwt();
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;

        await prisma.pegadaPost.delete({
            where: { id },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("DELETE /api/pegadas/[id] error:", error);
        return NextResponse.json({ error: "Erro ao excluir pegada" }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSessionOrJwt } from "@/lib/jwt";
import { decodeId } from "@/lib/maskId";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSessionOrJwt();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const currentUserId = session.user.id;
        const { id: rawId } = await params;
        const groupId = decodeId(rawId);

        const group = await prisma.chatGroup.findUnique({
            where: { id: groupId },
            include: { participants: true }
        });

        if (!group) {
            return NextResponse.json({ error: "Group not found" }, { status: 404 });
        }

        // Remove o usuário da relação de participantes
        await prisma.chatGroup.update({
            where: { id: groupId },
            data: {
                participants: {
                    disconnect: { id: currentUserId }
                }
            }
        });

        // Se o grupo ficou sem participantes, exclui
        const updated = await prisma.chatGroup.findUnique({
            where: { id: groupId },
            include: { participants: true }
        });

        if (updated && updated.participants.length === 0) {
            await prisma.chatMessage.deleteMany({ where: { groupId } });
            await prisma.chatGroup.delete({ where: { id: groupId } });
        }

        return NextResponse.json({ success: true, message: "Você saiu do grupo com sucesso" });
    } catch (error) {
        console.error("Error leaving chat group:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

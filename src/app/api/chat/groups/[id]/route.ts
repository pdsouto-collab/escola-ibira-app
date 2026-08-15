import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSessionOrJwt } from "@/lib/jwt";
import { decodeId, encodeId } from "@/lib/maskId";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
            include: {
                participants: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        avatar: true
                    }
                }
            }
        });

        if (!group) {
            return NextResponse.json({ error: "Group not found" }, { status: 404 });
        }

        // Verifica se o usuário atual é participante
        const isParticipant = group.participants.some(p => p.id === currentUserId);
        if (!isParticipant) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json({
            id: encodeId(group.id),
            name: group.name,
            avatar: group.avatar,
            createdAt: group.createdAt,
            participants: group.participants.map(p => ({
                id: encodeId(p.id),
                name: p.name,
                email: p.email,
                role: p.role,
                avatar: p.avatar
            }))
        });
    } catch (error) {
        console.error("Error fetching chat group:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSessionOrJwt();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const currentUserId = session.user.id;
        const { id: rawId } = await params;
        const groupId = decodeId(rawId);

        const body = await req.json();
        const { name, participantIds } = body;

        const group = await prisma.chatGroup.findUnique({
            where: { id: groupId },
            include: { participants: true }
        });

        if (!group) {
            return NextResponse.json({ error: "Group not found" }, { status: 404 });
        }

        // Verifica se o usuário atual faz parte do grupo
        const isParticipant = group.participants.some(p => p.id === currentUserId);
        if (!isParticipant) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Se foram passados novos participantes
        let updateData: any = {};
        if (name && name.trim()) {
            updateData.name = name.trim();
        }

        if (participantIds && Array.isArray(participantIds) && participantIds.length > 0) {
            const decodedIds = participantIds.map((id: string) => decodeId(id));
            const allParticipants = Array.from(new Set([...decodedIds, currentUserId]));
            updateData.participants = {
                set: allParticipants.map(id => ({ id }))
            };
        }

        const updatedGroup = await prisma.chatGroup.update({
            where: { id: groupId },
            data: updateData,
            include: {
                participants: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        avatar: true
                    }
                }
            }
        });

        return NextResponse.json({
            id: encodeId(updatedGroup.id),
            name: updatedGroup.name,
            avatar: updatedGroup.avatar,
            createdAt: updatedGroup.createdAt,
            participants: updatedGroup.participants.map(p => ({
                id: encodeId(p.id),
                name: p.name,
                email: p.email,
                role: p.role,
                avatar: p.avatar
            }))
        });
    } catch (error) {
        console.error("Error updating chat group:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

        const isParticipant = group.participants.some(p => p.id === currentUserId);
        if (!isParticipant) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Deleta as mensagens do grupo e o grupo
        await prisma.chatMessage.deleteMany({
            where: { groupId }
        });

        await prisma.chatGroup.delete({
            where: { id: groupId }
        });

        return NextResponse.json({ success: true, message: "Grupo excluído com sucesso" });
    } catch (error) {
        console.error("Error deleting chat group:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

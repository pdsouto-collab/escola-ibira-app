import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSessionOrJwt } from "@/lib/jwt";
import { decodeId } from "@/lib/maskId";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSessionOrJwt();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const currentUserId = session.user.id;
        const body = await req.json();
        const { name, participantIds } = body;

        if (!name || !participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
            return NextResponse.json({ error: "Name and participantIds are required" }, { status: 400 });
        }

        // Decorifica os participantes recebidos do frontend
        const decodedParticipantIds = participantIds.map((id: string) => decodeId(id));

        // Inclui o usuário atual no grupo
        const allParticipants = Array.from(new Set([...decodedParticipantIds, currentUserId]));

        const group = await prisma.chatGroup.create({
            data: {
                name,
                participants: {
                    connect: allParticipants.map(id => ({ id }))
                }
            },
            include: {
                participants: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                        avatar: true
                    }
                }
            }
        });

        return NextResponse.json(group);
    } catch (error) {
        console.error("Error creating chat group:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

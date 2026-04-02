import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { encodeId, decodeId } from "@/lib/maskId";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const currentUserId = session.user.id;
        const searchParams = req.nextUrl.searchParams;
        let contactId = searchParams.get("contactId");
        let groupId = searchParams.get("groupId");
        
        contactId = contactId ? decodeId(contactId) : null;
        groupId = groupId ? decodeId(groupId) : null;

        if (!contactId && !groupId) {
            return NextResponse.json({ error: "Missing contactId or groupId parameter" }, { status: 400 });
        }

        let whereClause = {};

        if (groupId) {
            // Verifica se o usuário é participante do grupo
            const group = await prisma.chatGroup.findFirst({
                where: {
                    id: groupId,
                    participants: { some: { id: currentUserId } }
                }
            });

            if (!group) {
                return NextResponse.json({ error: "Forbidden or Group not found" }, { status: 403 });
            }

            whereClause = { groupId: groupId };
        } else if (contactId) {
            whereClause = {
                OR: [
                    { senderId: currentUserId, receiverId: contactId },
                    { senderId: contactId, receiverId: currentUserId }
                ]
            };
        }

        const messages = await prisma.chatMessage.findMany({
            where: whereClause,
            orderBy: {
                createdAt: 'asc'
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                        role: true
                    }
                }
            }
        });

        // Marca mensagens 1-a-1 como lidas
        if (contactId) {
            const unreadMessageIds = messages
                .filter((m: any) => m.receiverId === currentUserId && !m.read)
                .map((m: any) => m.id);

            if (unreadMessageIds.length > 0) {
                await prisma.chatMessage.updateMany({
                    where: {
                        id: { in: unreadMessageIds }
                    },
                    data: {
                        read: true
                    }
                });
            }
        } 
        // Marca mensagens de grupo como lidas usando readBy
        else if (groupId) {
            const unreadGroupMessageIds = messages
                .filter((m: any) => m.senderId !== currentUserId && (!m.readBy || !m.readBy.includes(currentUserId)))
                .map((m: any) => m.id);

            if (unreadGroupMessageIds.length > 0) {
                for (const msgId of unreadGroupMessageIds) {
                    await prisma.chatMessage.update({
                        where: { id: msgId },
                        data: {
                            readBy: {
                                push: currentUserId
                            }
                        }
                    });
                }
            }
        }

        // Mapeia adicionando o encode e isMe
        const maskedMessages = messages.map((m: any) => ({
            ...m,
            id: encodeId(m.id),
            senderId: encodeId(m.senderId),
            receiverId: m.receiverId ? encodeId(m.receiverId) : undefined,
            groupId: m.groupId ? encodeId(m.groupId) : undefined,
            isMe: m.senderId === currentUserId,
            sender: {
                ...m.sender,
                id: encodeId(m.sender.id)
            }
        }));

        return NextResponse.json(maskedMessages);

    } catch (error) {
        console.error("Error fetching chat messages:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const currentUserId = session.user.id;
        const body = await req.json();
        let { receiverId, groupId, content } = body;

        receiverId = receiverId ? decodeId(receiverId) : null;
        groupId = groupId ? decodeId(groupId) : null;

        if ((!receiverId && !groupId) || !content) {
            return NextResponse.json({ error: "Missing receiverId/groupId or content parameter" }, { status: 400 });
        }

        if (groupId) {
            // Verify if user is participant
            const group = await prisma.chatGroup.findFirst({
                where: {
                    id: groupId,
                    participants: { some: { id: currentUserId } }
                }
            });

            if (!group) {
                return NextResponse.json({ error: "Forbidden or Group not found" }, { status: 403 });
            }
        }

        // Podemos criar a mensagem pois verificamos o grupo ou é 1-a-1
        const message = await prisma.chatMessage.create({
            data: {
                senderId: currentUserId,
                receiverId: receiverId || null,
                groupId: groupId || null,
                content
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                        role: true
                    }
                }
            }
        });

        return NextResponse.json({
            ...message,
            id: encodeId(message.id),
            senderId: encodeId(message.senderId),
            receiverId: message.receiverId ? encodeId(message.receiverId) : undefined,
            groupId: message.groupId ? encodeId(message.groupId) : undefined,
            isMe: message.senderId === currentUserId,
            sender: {
                ...message.sender,
                id: encodeId(message.sender.id)
            }
        });

    } catch (error) {
        console.error("Error creating chat message:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSessionOrJwt } from "@/lib/jwt";
import { encodeId } from "@/lib/maskId";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSessionOrJwt();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const currentUserId = session.user.id;

        // 1. Busca contatos de usuários individuais
        const users = await prisma.user.findMany({
            where: {
                id: {
                    not: currentUserId
                }
            },
            select: {
                id: true,
                name: true,
                role: true,
                avatar: true,
                sentMessages: {
                    where: { receiverId: currentUserId },
                    orderBy: { createdAt: "desc" },
                    take: 1
                },
                receivedMessages: {
                    where: { senderId: currentUserId },
                    orderBy: { createdAt: "desc" },
                    take: 1
                },
                _count: {
                    select: {
                        sentMessages: {
                            where: { receiverId: currentUserId, read: false }
                        }
                    }
                }
            }
        });

        const userContacts = users.map((user: any) => {
            let lastMessageTime = null;
            let lastMessageSnippet = null;

            const latestSentByUser = user.sentMessages[0];
            const latestReceivedByUser = user.receivedMessages[0];

            if (latestSentByUser && latestReceivedByUser) {
                if (new Date(latestSentByUser.createdAt) > new Date(latestReceivedByUser.createdAt)) {
                    lastMessageTime = latestSentByUser.createdAt;
                    lastMessageSnippet = latestSentByUser.content;
                } else {
                    lastMessageTime = latestReceivedByUser.createdAt;
                    lastMessageSnippet = `Você: ${latestReceivedByUser.content}`;
                }
            } else if (latestSentByUser) {
                lastMessageTime = latestSentByUser.createdAt;
                lastMessageSnippet = latestSentByUser.content;
            } else if (latestReceivedByUser) {
                lastMessageTime = latestReceivedByUser.createdAt;
                lastMessageSnippet = `Você: ${latestReceivedByUser.content}`;
            }

            return {
                id: encodeId(user.id),
                name: user.name,
                role: user.role,
                avatar: user.avatar,
                isGroup: false,
                lastMessage: lastMessageSnippet || "Iniciar conversa...",
                lastMessageTime: lastMessageTime,
                unreadCount: user._count?.sentMessages || 0 
            };
        });

        // 2. Busca contatos de Grupos
        const groups = await prisma.chatGroup.findMany({
            where: {
                participants: {
                    some: { id: currentUserId }
                }
            },
            select: {
                id: true,
                name: true,
                avatar: true,
                messages: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                    include: {
                        sender: { select: { name: true } }
                    }
                },
                participants: {
                    select: { id: true }
                },
                _count: {
                    select: {
                        messages: {
                            where: {
                                senderId: { not: currentUserId },
                                NOT: { readBy: { has: currentUserId } }
                            }
                        }
                    }
                }
            }
        });

        const groupContacts = groups.map((group: any) => {
            let lastMessageTime = null;
            let lastMessageSnippet = "Grupo criado.";

            const latestMsg = group.messages[0];
            if (latestMsg) {
                lastMessageTime = latestMsg.createdAt;
                lastMessageSnippet = `${latestMsg.senderId === currentUserId ? 'Você' : latestMsg.sender.name}: ${latestMsg.content}`;
            }

            return {
                id: encodeId(group.id),
                name: group.name,
                role: "Grupo",
                avatar: group.avatar,
                isGroup: true,
                participantIds: group.participants.map((p: any) => encodeId(p.id)),
                lastMessage: lastMessageSnippet,
                lastMessageTime: lastMessageTime,
                unreadCount: group._count?.messages || 0
            };
        });

        // 3. Combina e ordena
        const contacts = [...userContacts, ...groupContacts];

        contacts.sort((a: any, b: any) => {
            if (!a.lastMessageTime) return 1;
            if (!b.lastMessageTime) return -1;
            return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
        });

        return NextResponse.json(contacts);
    } catch (error) {
        console.error("Error fetching contacts:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

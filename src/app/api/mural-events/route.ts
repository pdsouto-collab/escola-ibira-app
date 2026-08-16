import { getServerSessionOrJwt } from "@/lib/jwt";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
        const session = await getServerSessionOrJwt();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");

    try {
        const events = await prisma.muralEvent.findMany({
            where: classId ? { classId } : {},
            include: {
                comments: {
                    orderBy: {
                        date: "asc"
                    }
                }
            },
            orderBy: [
                { createdAt: "desc" },
                { date: "desc" }
            ]
        });
        return NextResponse.json(events);
    } catch (error) {
        console.error("Erro ao buscar mural:", error);
        return NextResponse.json({ error: "Erro ao buscar mural" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSessionOrJwt();
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { title, description, date, author, type, location, image, classId } = body;

        let parsedDate = date ? new Date(date) : new Date();
        if (isNaN(parsedDate.getTime())) {
            parsedDate = new Date();
        }

        const newEvent = await prisma.muralEvent.create({
            data: {
                title: (title || "").trim() || "Novo Evento",
                description: description || "",
                date: parsedDate,
                author: author || session.user.name || "Administração",
                type: type || "event",
                location: location || null,
                image: image || null,
                classId: classId && classId !== "all" ? classId : null
            },
            include: {
                comments: true
            }
        });
        return NextResponse.json(newEvent);
    } catch (error: any) {
        console.error("Erro ao criar evento:", error);
        return NextResponse.json({ error: error?.message || "Erro ao criar evento" }, { status: 500 });
    }
}

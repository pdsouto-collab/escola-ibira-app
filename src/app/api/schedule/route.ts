import { getServerSessionOrJwt } from "@/lib/jwt";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
        const session = await getServerSessionOrJwt();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

    try {
        const items = await prisma.scheduleItem.findMany({
            orderBy: { time: "asc" }
        });
        return NextResponse.json(items);
    } catch (error) {
        console.error("Erro ao buscar agenda:", error);
        return NextResponse.json({ error: "Erro ao buscar agenda" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
        const session = await getServerSessionOrJwt();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

    try {
        const body = await request.json();
        const item = await prisma.scheduleItem.create({
            data: body,
        });
        return NextResponse.json(item, { status: 201 });
    } catch (error) {
        console.error("Erro ao criar item na agenda:", error);
        return NextResponse.json({ error: "Erro ao criar item" }, { status: 500 });
    }
}

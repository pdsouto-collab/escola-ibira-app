import { getServerSessionOrJwt } from "@/lib/jwt";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
        const session = await getServerSessionOrJwt();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

    try {
        const types = await prisma.finalProductType.findMany({
            orderBy: { createdAt: 'asc' }
        });
        return NextResponse.json(types);
    } catch (error) {
        console.error("ERRO GET FINAL PRODUCT TYPES:", error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}

export async function POST(req: Request) {
        const session = await getServerSessionOrJwt();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

    try {
        const data = await req.json();

        if (!data.name) {
            return NextResponse.json({ error: "O nome é obrigatório" }, { status: 400 });
        }

        const newType = await prisma.finalProductType.create({
            data: {
                id: data.id,
                name: data.name
            }
        });

        return NextResponse.json(newType, { status: 201 });
    } catch (error) {
        console.error("ERRO POST FINAL PRODUCT TYPE:", error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}

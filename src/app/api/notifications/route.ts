import { getServerSessionOrJwt } from "@/lib/jwt";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
        const session = await getServerSessionOrJwt();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ error: "Missing userId" }, { status: 400 });
        }

        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(notifications);
    } catch (error: any) {
        console.error("GET /api/notifications error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
        const session = await getServerSessionOrJwt();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

    try {
        const body = await req.json();
        
        if (!body.userId || !body.title || !body.message || !body.type) {
             return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const notification = await prisma.notification.create({
            data: {
                userId: body.userId,
                title: body.title,
                message: body.message,
                type: body.type,
                studentId: body.studentId || null,
            },
        });

        return NextResponse.json(notification);
    } catch (error: any) {
        console.error("POST /api/notifications error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

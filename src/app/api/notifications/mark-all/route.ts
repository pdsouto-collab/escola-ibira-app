import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        
        if (!body.userId) {
            return NextResponse.json({ error: "Missing userId" }, { status: 400 });
        }

        const notifications = await prisma.notification.updateMany({
            where: { userId: body.userId, isRead: false },
            data: { isRead: true },
        });

        return NextResponse.json({ count: notifications.count });
    } catch (error: any) {
        console.error("PATCH /api/notifications/mark-all error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

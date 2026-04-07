import { getServerSessionOrJwt } from "@/lib/jwt";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
        const session = await getServerSessionOrJwt();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

    try {
        const resolvedParams = await params;
        const id = resolvedParams.id;

        if (!id) {
            return NextResponse.json({ error: "Missing id" }, { status: 400 });
        }

        const notification = await prisma.notification.update({
            where: { id },
            data: { isRead: true },
        });

        return NextResponse.json(notification);
    } catch (error: any) {
        console.error("PATCH /api/notifications/[id] error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
        const session = await getServerSessionOrJwt();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

    try {
        const resolvedParams = await params;
        const id = resolvedParams.id;

        const notification = await prisma.notification.delete({
            where: { id },
        });

        return NextResponse.json(notification);
    } catch (error: any) {
        console.error("DELETE /api/notifications/[id] error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

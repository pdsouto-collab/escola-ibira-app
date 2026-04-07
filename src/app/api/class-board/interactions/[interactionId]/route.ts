import { getServerSessionOrJwt } from "@/lib/jwt";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ interactionId: string }> }
) {
        const session = await getServerSessionOrJwt();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

    try {
        const { interactionId } = await params;

        await prisma.classBoardPostInteraction.delete({
            where: { id: interactionId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting post interaction:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

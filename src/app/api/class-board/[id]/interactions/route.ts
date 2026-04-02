import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        
        const { userId, userName, userRole, type, content } = body;

        const interaction = await prisma.classBoardPostInteraction.create({
            data: {
                postId: id,
                userId,
                userName,
                userRole,
                type,
                content,
            },
        });

        return NextResponse.json(interaction, { status: 201 });
    } catch (error) {
        console.error("Error creating post interaction:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

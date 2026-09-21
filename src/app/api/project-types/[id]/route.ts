import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const id = params.id;
        const body = await request.json();
        const { name } = body;

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const projectType = await prisma.projectType.update({
            where: { id },
            data: { name },
        });

        return NextResponse.json(projectType);
    } catch (error) {
        console.error("Error updating project type:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const id = params.id;

        await prisma.projectType.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting project type:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

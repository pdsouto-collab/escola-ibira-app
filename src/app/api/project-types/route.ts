import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const projectTypes = await prisma.projectType.findMany({
            orderBy: { name: 'asc' },
        });
        return NextResponse.json(projectTypes);
    } catch (error) {
        console.error("Error fetching project types:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id, name } = body;

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const projectType = await prisma.projectType.create({
            data: {
                id,
                name,
            },
        });

        return NextResponse.json(projectType, { status: 201 });
    } catch (error) {
        console.error("Error creating project type:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

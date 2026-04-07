import { getServerSessionOrJwt } from "@/lib/jwt";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
        const session = await getServerSessionOrJwt();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

    try {
        const { id } = await params;

        if (!id) {
            return new NextResponse("Portfolio ID Missing", { status: 400 });
        }

        // @ts-ignore
        const entry = await prisma.portfolioEntry.findUnique({
            where: {
                id,
            },
        });

        if (!entry) {
            return new NextResponse("Portfolio Entry Not Found", { status: 404 });
        }

        return NextResponse.json(entry);
    } catch (error) {
        console.error("[PORTFOLIO_ID_GET]", error);
        return new NextResponse("Internal server error", { status: 500 });
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
        const session = await getServerSessionOrJwt();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

    try {
        const { id } = await params;
        const body = await req.json();

        if (!id) {
            return new NextResponse("Student ID Missing", { status: 400 });
        }

        // @ts-ignore
        const updatedEntry = await prisma.portfolioEntry.update({
            where: {
                id,
            },
            data: {
                ...body,
            },
        });

        return NextResponse.json(updatedEntry);
    } catch (error) {
        console.error("[PORTFOLIO_ID_PUT]", error);
        return new NextResponse("Internal server error", { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
        const session = await getServerSessionOrJwt();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

    try {
        const { id } = await params;

        if (!id) {
            return new NextResponse("Portfolio ID Missing", { status: 400 });
        }

        // @ts-ignore
        const deletedEntry = await prisma.portfolioEntry.delete({
            where: {
                id,
            },
        });

        return NextResponse.json(deletedEntry);
    } catch (error) {
        console.error("[PORTFOLIO_ID_DELETE]", error);
        return new NextResponse("Internal server error", { status: 500 });
    }
}

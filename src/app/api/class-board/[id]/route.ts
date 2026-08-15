import { getServerSessionOrJwt } from "@/lib/jwt";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    const session = await getServerSessionOrJwt();
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const params = await props.params;
        const { id } = params;
        const post = await prisma.classBoardPost.findUnique({
            where: { id }
        });

        if (!post) {
            return NextResponse.json({ error: "Post não encontrado" }, { status: 404 });
        }

        const userRole = (session.user.role || "").toLowerCase();
        const isStaff = userRole === "admin" || userRole === "director" || userRole === "teacher" || userRole === "educator";

        if (post.authorId !== session.user.id && !isStaff) {
            return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
        }

        // Delete interactions first to avoid constraint issues
        await prisma.classBoardPostInteraction.deleteMany({
            where: { postId: id }
        });

        await prisma.classBoardPost.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erro ao excluir post:", error);
        return NextResponse.json(
            { error: "Erro interno ao excluir post" },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
    const session = await getServerSessionOrJwt();
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const params = await props.params;
        const { id } = params;
        const body = await request.json();
        const { title, content, extraMaterials, categoryType, photos } = body;

        const post = await prisma.classBoardPost.findUnique({
            where: { id }
        });

        if (!post) {
            return NextResponse.json({ error: "Post não encontrado" }, { status: 404 });
        }

        const userRole = (session.user.role || "").toLowerCase();
        const isStaff = userRole === "admin" || userRole === "director" || userRole === "teacher" || userRole === "educator";

        if (post.authorId !== session.user.id && !isStaff) {
            return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
        }

        const updatedPost = await prisma.classBoardPost.update({
            where: { id },
            data: {
                title: title !== undefined ? title : post.title,
                content: content !== undefined ? content : post.content,
                extraMaterials: extraMaterials !== undefined ? extraMaterials : post.extraMaterials,
                categoryType: categoryType !== undefined ? categoryType : post.categoryType,
                photos: photos !== undefined ? photos : post.photos
            }
        });

        return NextResponse.json(updatedPost);
    } catch (error) {
        console.error("Erro ao atualizar post:", error);
        return NextResponse.json(
            { error: "Erro interno ao atualizar post" },
            { status: 500 }
        );
    }
}

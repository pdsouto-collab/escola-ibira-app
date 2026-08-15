import { getServerSessionOrJwt } from "@/lib/jwt";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    const session = await getServerSessionOrJwt();
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const userRole = session.user.role || "user";
        const userId = session.user.id;

        const posts = await prisma.pegadaPost.findMany({
            include: {
                interactions: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // Administradores, Diretores e Professores podem ver TUDO sempre
        const isPrivileged = ["admin", "director", "teacher"].includes(userRole);
        if (isPrivileged) {
            return NextResponse.json(posts);
        }

        // Para pais / responsáveis / outros usuários, buscar turmas e alunos vinculados
        const dbUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { assignedClassIds: true, linkedStudentIds: true }
        });

        // Buscar alunos associados diretamente ou por ID
        const linkedStudentIds = dbUser?.linkedStudentIds || [];
        const assignedClassIds = dbUser?.assignedClassIds || [];

        let studentClassIds = [...assignedClassIds];

        if (linkedStudentIds.length > 0) {
            const students = await prisma.student.findMany({
                where: { id: { in: linkedStudentIds } },
                select: { classId: true, id: true }
            });
            students.forEach(s => {
                if (s.classId) studentClassIds.push(s.classId);
            });
        }

        const uniqueStudentClassIds = Array.from(new Set(studentClassIds.filter(Boolean)));

        // Filtrar posts: posts para "all" OU post direcionado à turma do aluno vinculado
        const visiblePosts = posts.filter(post => {
            const postClassId = post.classId || "all";
            const postClassIds = post.classIds || [];
            const postStudentIds = post.studentIds || [];

            // Se o post foi publicado para "Todas as Turmas", é visível para todos
            if (postClassId === "all" || postClassIds.includes("all") || (postClassIds.length === 0 && !post.classId)) {
                return true;
            }

            // Se o post é da turma do aluno do responsável
            if (uniqueStudentClassIds.includes(postClassId)) {
                return true;
            }

            // Se alguma turma do post coincide com as turmas dos alunos
            if (postClassIds.some(cid => uniqueStudentClassIds.includes(cid))) {
                return true;
            }

            // Se algum aluno específico do post coincide com os alunos vinculados ao responsável
            if (postStudentIds.some(sid => linkedStudentIds.includes(sid))) {
                return true;
            }

            return false;
        });

        return NextResponse.json(visiblePosts);
    } catch (error) {
        console.error("GET /api/pegadas error:", error);
        return NextResponse.json({ error: "Erro ao buscar pegadas" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSessionOrJwt();
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const data = await req.json();

        const mediaList = Array.isArray(data.mediaUrls) && data.mediaUrls.length > 0
            ? data.mediaUrls
            : (data.mediaUrl && data.mediaUrl !== "null" ? [data.mediaUrl] : []);

        const targetClassIds = Array.isArray(data.classIds) && data.classIds.length > 0
            ? data.classIds
            : (data.classId ? [data.classId] : ["all"]);

        const post = await prisma.pegadaPost.create({
            data: {
                authorId: data.authorId || session.user.id,
                authorName: data.authorName || session.user.name || "Educador",
                type: data.type || "photo",
                title: data.title || "",
                content: data.content || "",
                mediaUrl: mediaList[0] || null,
                mediaUrls: mediaList,
                tags: data.tags || [],
                classId: targetClassIds[0] || "all",
                classIds: targetClassIds,
                studentIds: Array.isArray(data.studentIds) ? data.studentIds : [],
            },
            include: {
                interactions: true,
            },
        });

        return NextResponse.json(post);
    } catch (error) {
        console.error("POST /api/pegadas error:", error);
        return NextResponse.json({ error: "Erro ao criar pegada" }, { status: 500 });
    }
}

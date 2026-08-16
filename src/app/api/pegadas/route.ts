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

        // Administradores e Diretores podem ver TUDO sempre
        const isAdminOrDirector = ["admin", "director"].includes(userRole);
        if (isAdminOrDirector) {
            return NextResponse.json(posts);
        }

        // Buscar dados do usuário no banco
        const dbUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { assignedClassIds: true, linkedStudentIds: true, email: true, document: true, name: true, role: true }
        });

        const linkedStudentIds = [...(dbUser?.linkedStudentIds || [])];
        const assignedClassIds = [...(dbUser?.assignedClassIds || [])];

        // Se for professor, busca turmas atribuídas
        if (userRole === "teacher") {
            const visiblePosts = posts.filter(post => {
                // Post do próprio professor
                if (post.authorId === userId) return true;
                const postClassId = post.classId || "all";
                const postClassIds = post.classIds || [];
                // Post geral para todas as turmas
                if (postClassId === "all" || postClassIds.includes("all") || (postClassIds.length === 0 && !post.classId)) {
                    return true;
                }
                // Post da turma atribuída ao professor
                if (assignedClassIds.includes(postClassId) || postClassIds.some(cid => assignedClassIds.includes(cid))) {
                    return true;
                }
                return false;
            });
            return NextResponse.json(visiblePosts);
        }

        // Para pais / responsáveis / familiares:
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

        // Também verificar se o responsável está cadastrado em Student.guardians por email/CPF
        const userEmail = (session.user.email || "").toLowerCase().trim();
        const userDoc = (session.user.document || "").replace(/\D/g, "");

        if (userEmail || userDoc) {
            const allStudents = await prisma.student.findMany({
                select: { id: true, classId: true, guardians: true }
            });
            allStudents.forEach((st: any) => {
                if (st.guardians && Array.isArray(st.guardians)) {
                    const match = st.guardians.some((g: any) => {
                        const gEmail = (g.email || "").toLowerCase().trim();
                        const gCpf = (g.cpf || "").replace(/\D/g, "");
                        if (userEmail && gEmail === userEmail) return true;
                        if (userDoc && gCpf === userDoc) return true;
                        return false;
                    });
                    if (match) {
                        if (!linkedStudentIds.includes(st.id)) linkedStudentIds.push(st.id);
                        if (st.classId && !studentClassIds.includes(st.classId)) studentClassIds.push(st.classId);
                    }
                }
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

            // Se alguma turma do post coincide com as turmas dos alunos do responsável
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

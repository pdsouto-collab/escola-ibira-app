import { getServerSessionOrJwt } from "@/lib/jwt";
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Assessment } from '@/types/assessment';

export async function GET(request: Request) {
        const session = await getServerSessionOrJwt();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

    try {
        const { searchParams } = new URL(request.url);
        const studentId = searchParams.get('studentId');
        const projectId = searchParams.get('projectId');
        
        let filter: any = {};
        if (studentId) filter.studentId = studentId;
        if (projectId) filter.projectId = projectId;

        // Se o usuário não for professor nem admin (ex: pai, aluno), ele só vê avaliações publicadas
        if (session.user.role !== 'teacher' && session.user.role !== 'admin' && session.user.role !== 'coordinator') {
            filter.isPublished = true;
        }

        const assessments = await prisma.assessment.findMany({
            where: filter,
            include: {
                attachments: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(assessments);
    } catch (error) {
        console.error('Error fetching assessments:', error);
        return NextResponse.json(
            { error: 'Failed to fetch assessments' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
        const session = await getServerSessionOrJwt();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

    try {
        const data = await request.json();
        
        // Separa os anexos dos outros dados
        const { attachments, ...assessmentData } = data as Assessment;

        const createdAssessment = await prisma.assessment.create({
            data: {
                ...assessmentData,
                isPublished: assessmentData.isPublished !== undefined ? assessmentData.isPublished : true,
                attachments: attachments ? {
                    create: attachments.map(att => ({
                        type: att.type,
                        url: att.url,
                        name: att.name,
                        capturedAt: att.capturedAt
                    }))
                } : undefined
            },
            include: {
                attachments: true
            }
        });

        return NextResponse.json(createdAssessment, { status: 201 });
    } catch (error) {
        console.error('Error creating assessment:', error);
        return NextResponse.json(
            { error: 'Failed to create assessment' },
            { status: 500 }
        );
    }
}

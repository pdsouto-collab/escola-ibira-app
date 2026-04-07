import { getServerSessionOrJwt } from "@/lib/jwt";
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Assessment } from '@/types/assessment';

type Params = { id: string };

export async function GET(request: Request, context: { params: Promise<Params> }) {
        const session = await getServerSessionOrJwt();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

    try {
        const { id } = await context.params;

        const assessment = await prisma.assessment.findUnique({
            where: { id },
            include: {
                attachments: true
            }
        });

        if (!assessment) {
            return NextResponse.json(
                { error: 'Assessment not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(assessment);
    } catch (error) {
        console.error(`Error fetching assessment:`, error);
        return NextResponse.json(
            { error: 'Failed to fetch assessment' },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request, context: { params: Promise<Params> }) {
        const session = await getServerSessionOrJwt();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

    try {
        const { id } = await context.params;
        const data = await request.json();
        const { attachments, ...assessmentData } = data as Partial<Assessment>;

        // Tratamento simples para atualização de anexos (apaga antigos e recria, ou mantém conforme logica, no momento recriaremos)
        const updateData: any = { ...assessmentData };
        if (attachments) {
            updateData.attachments = {
                deleteMany: {},
                create: attachments.map(att => ({
                    type: att.type,
                    url: att.url,
                    name: att.name,
                    capturedAt: att.capturedAt
                }))
            };
        }

        const updatedAssessment = await prisma.assessment.update({
            where: { id },
            data: updateData,
            include: {
                attachments: true
            }
        });

        return NextResponse.json(updatedAssessment);
    } catch (error) {
        console.error(`Error updating assessment:`, error);
        return NextResponse.json(
            { error: 'Failed to update assessment' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request, context: { params: Promise<Params> }) {
        const session = await getServerSessionOrJwt();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

    try {
        const { id } = await context.params;

        await prisma.assessment.delete({
            where: { id }
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error(`Error deleting assessment:`, error);
        return NextResponse.json(
            { error: 'Failed to delete assessment' },
            { status: 500 }
        );
    }
}

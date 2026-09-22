import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        // Find all KnowledgeNodes with period containing "semestre"
        const nodes = await prisma.knowledgeNode.findMany({
            where: { period: { contains: "semestre", mode: "insensitive" } }
        });

        let updatedNodes = 0;
        for (const node of nodes) {
            if (node.period) {
                // e.g. "2º Semestre / 2026" -> "2026"
                // or "2º SEMESTRE / 2026" -> "2026"
                const cleaned = node.period.replace(/^[12]º\s+semestre\s*\/\s*/i, "").trim();
                if (cleaned !== node.period) {
                    await prisma.knowledgeNode.update({
                        where: { id: node.id },
                        data: { period: cleaned }
                    });
                    updatedNodes++;
                }
            }
        }

        // Also clean Projects
        const projects = await prisma.project.findMany({
            where: { period: { contains: "semestre", mode: "insensitive" } }
        });
        
        let updatedProjects = 0;
        for (const project of projects) {
            if (project.period) {
                const cleaned = project.period.replace(/^[12]º\s+semestre\s*\/\s*/i, "").trim();
                if (cleaned !== project.period) {
                    await prisma.project.update({
                        where: { id: project.id },
                        data: { period: cleaned }
                    });
                    updatedProjects++;
                }
            }
        }

        // Also clean Assessments
        const assessments = await prisma.assessment.findMany({
            where: { period: { contains: "semestre", mode: "insensitive" } }
        });
        
        let updatedAssessments = 0;
        for (const assessment of assessments) {
            if (assessment.period) {
                const cleaned = assessment.period.replace(/^[12]º\s+semestre\s*\/\s*/i, "").trim();
                if (cleaned !== assessment.period) {
                    await prisma.assessment.update({
                        where: { id: assessment.id },
                        data: { period: cleaned }
                    });
                    updatedAssessments++;
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: "Limpeza concluída!",
            updated: {
                nodes: updatedNodes,
                projects: updatedProjects,
                assessments: updatedAssessments
            }
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

"use client";

import { useAppStore } from "@/lib/store";
import { ProgressChart, ProgressChartData } from "@/components/assessment/progress-chart";
import { Info } from "lucide-react";

// ────────────────────────────────────────────
// Helper: find node name recursively
// ────────────────────────────────────────────
const resolveNodeInfo = (id: string, skillsTree: any[], contentsTree: any[], libraryItems: any[]) => {
    // Collect possible matching IDs (including codes)
    const validIds = new Set<string>([id]);
    const libraryItem = libraryItems.find(item => item.id === id || item.code === id);
    if (libraryItem) {
        validIds.add(libraryItem.id);
        if (libraryItem.code) validIds.add(libraryItem.code);
    }

    // 1. Search in Knowledge Trees (Skills and Contents)
    const searchTrees = (nodes: any[], rootName?: string): any | null => {
        for (const node of nodes) {
            const currentRootName = node.level === "macro" ? node.name : rootName;
            if (validIds.has(node.id) || (node.libraryItemId && validIds.has(node.libraryItemId))) {
                return {
                    id: node.id,
                    name: node.name,
                    code: node.code || (node.libraryItemId ? node.libraryItemId : null),
                    description: node.description,
                    level: node.level,
                    subject: currentRootName || libraryItem?.subGroup || "Outros"
                };
            }
            if (node.children) {
                const found = searchTrees(node.children, currentRootName);
                if (found) return found;
            }
        }
        return null;
    };

    const treeNode = searchTrees([...skillsTree, ...contentsTree]);
    if (treeNode) return treeNode;

    // 2. Fallback to Library Item
    if (libraryItem) return {
        id: libraryItem.id,
        name: libraryItem.name,
        code: libraryItem.code || libraryItem.id,
        description: libraryItem.description,
        level: libraryItem.type === "skill" ? "micro" : "atomico",
        subject: libraryItem.subGroup || "Outros"
    };

    // 3. Fallback
    return { id, name: id, code: id, subject: "Outros" };
};

/** Finds all evaluatable nodes (L3/L4) within a given node or tree */
const getAllEvaluatableNodes = (nodes: any[], rootName?: string): any[] => {
    const results: any[] = [];
    for (const node of nodes) {
        const currentRoot = node.level === "macro" ? node.name : rootName;
        if (node.level === "micro") {
            results.push({ ...node, subject: currentRoot || "Outros" });
        }
        if (node.children) {
            results.push(...getAllEvaluatableNodes(node.children, currentRoot));
        }
    }
    return results;
};

export function SkillsChart({ studentId }: { studentId?: string }) {
    const { students, assessments, skillsTree, contentsTree } = useAppStore();

    if (!studentId) {
        return (
            <div className="bg-white p-6 rounded-xl border shadow-sm text-center text-slate-400">
                Selecione um aluno para exibir o gráfico.
            </div>
        );
    }

    const student = students.find(s => s.id === studentId);
    if (!student) return null;

    const studentAssessments = assessments.filter(a => a.studentId === studentId || (a.scope === "class" && a.classId === student.classId));

    // Logic: "Proposto" is everything in the base trees
    const allProposedNodes = getAllEvaluatableNodes([...skillsTree, ...contentsTree]);

    const chartDataMap = new Map<string, ProgressChartData>();
    allProposedNodes.forEach(node => {
        const subject = node.subject || "Outros";
        if (!chartDataMap.has(subject)) {
            chartDataMap.set(subject, {
                subject,
                proposto: 0,
                desenvolvido: 0,
                total: 0,
                propostoItems: [],
                desenvolvidoItems: []
            });
        }
        const data = chartDataMap.get(subject)!;
        data.proposto += 1;
        data.total += 1;
        data.propostoItems?.push(node.name);

        const nodeAssessment = studentAssessments.find(a => a.knowledgeNodeId === node.id);
        if (nodeAssessment && (nodeAssessment.rating ?? 0) >= 3) {
            data.desenvolvido += 1;
            data.desenvolvidoItems?.push(node.name);
        }
    });

    const chartData = Array.from(chartDataMap.values()).sort((a, b) => a.subject.localeCompare(b.subject));

    return (
        <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-xl font-bold text-slate-800">Proposto vs. Desenvolvido</h3>
            <p className="text-sm text-slate-500 mb-6 font-medium">Comparativo entre o currículo base escola e o que já foi consolidado pela criança (avaliação 3-5).</p>

            <ProgressChart data={chartData} />

            <div className="mt-6 p-4 bg-slate-50 rounded-lg text-xs text-slate-500 flex gap-2">
                <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <p className="leading-relaxed">
                    <strong>Nota:</strong> "Proposto" contempla todas as habilidades e competências da Árvore de Conhecimento.
                    "Desenvolvido" indica itens com avaliação entre 3 e 5 atribuída pelo professor.
                </p>
            </div>
        </div>
    );
}

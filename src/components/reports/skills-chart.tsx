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
    const searchTrees = (nodes: any[], parentName?: string): any | null => {
        for (const node of nodes) {
            const currentSubject = node.level === "mesclado" ? node.name : parentName;
            if (validIds.has(node.id) || (node.libraryItemId && validIds.has(node.libraryItemId))) {
                return {
                    id: node.id,
                    name: node.name,
                    code: node.code || (node.libraryItemId ? node.libraryItemId : null),
                    description: node.description,
                    level: node.level,
                    subject: currentSubject || libraryItem?.subGroup || "Outros"
                };
            }
            if (node.children) {
                const found = searchTrees(node.children, currentSubject);
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
/** Finds all evaluatable nodes (L3/L4) within a given node or tree */
const getAllEvaluatableNodes = (nodes: any[], parentName?: string): any[] => {
    const results: any[] = [];
    for (const node of nodes) {
        // If node is 'mesclado' (L2) or 'macro' (L1), it can define the 'subject'
        // We prefer 'mesclado' for grouping as per user preference (Ciência, Geografia, etc)
        const currentSubject = node.level === "mesclado" ? node.name : (node.level === "macro" ? node.name : parentName);

        if (node.level === "micro" || node.level === "atomico") {
            results.push({ ...node, subject: (node.level === "atomico" ? parentName : currentSubject) || "Outros" });
        }

        if (node.children) {
            results.push(...getAllEvaluatableNodes(node.children, currentSubject));
        }
    }
    return results;
};

export function SkillsChart({ studentId }: { studentId?: string }) {
    const { students, assessments, libraryItems, skillsTree, contentsTree } = useAppStore();

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

    // 1. Identify which Library Items belong to the "Trilha Base" for the student's class
    const studentClassBaseTreeIds = new Set<string>();
    const collectBaseIds = (nodes: any[]) => {
        nodes.forEach(node => {
            if (node.libraryItemId) studentClassBaseTreeIds.add(node.libraryItemId);
            if (node.children) collectBaseIds(node.children);
        });
    };

    const allTrees = [...skillsTree, ...contentsTree];
    const classRoots = allTrees.filter(node => node.classId === student.classId);
    collectBaseIds(classRoots);

    // 2. The "Proposto" items are ONLY the library items present in the class Trilha Base
    const proposedLibraryItems = libraryItems.filter(item =>
        studentClassBaseTreeIds.has(item.id) || (item.code && studentClassBaseTreeIds.has(item.code))
    );

    // Logic: "Proposto" is everything in the library (BNCC and Competencies) that is in the Trilha Base
    // Grouping must mirror the library's `subGroup` completely
    const chartDataMap = new Map<string, ProgressChartData>();

    proposedLibraryItems.forEach(item => {
        const subject = item.subGroup || "Outros";
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
        data.propostoItems?.push(item.name);

        // Check if there's a consolidating assessment (rating >= 3) for this library item
        // Assessments are usually bound to knowledge nodes, but the `knowledgeNodeId` often shares the ID or code of the library item.
        // We look for any assessment where knowledgeNodeId === item.id or knowledgeNodeId === item.code
        const isDeveloped = studentAssessments.some(a =>
            (a.knowledgeNodeId === item.id || (item.code && a.knowledgeNodeId === item.code)) &&
            (a.rating ?? 0) >= 3
        );

        if (isDeveloped) {
            data.desenvolvido += 1;
            data.desenvolvidoItems?.push(item.name);
        }
    });

    const chartData = Array.from(chartDataMap.values()).sort((a, b) => a.subject.localeCompare(b.subject));

    return (
        <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-xl font-bold text-slate-800">Proposto vs. Desenvolvido</h3>
            <p className="text-sm text-slate-500 mb-6 font-medium">Comparativo entre a Biblioteca da escola e o que já foi consolidado pela criança (avaliação 3-5).</p>

            <ProgressChart data={chartData} />

            <div className="mt-6 p-4 bg-slate-50 rounded-lg text-xs text-slate-500 flex gap-2">
                <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <p className="leading-relaxed">
                    <strong>Nota:</strong> "Proposto" contempla todas as habilidades e competências da Biblioteca.
                    "Desenvolvido" indica itens com avaliação entre 3 e 5 atribuída pelo professor a nós vinculados.
                </p>
            </div>
        </div>
    );
}

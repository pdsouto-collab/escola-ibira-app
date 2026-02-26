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

/** Finds all evaluatable nodes (L3/L4) within a given node or set of IDs */
const findEvaluatableNodes = (allNodes: any[], targetIds: string[]): any[] => {
    const results: any[] = [];
    const search = (nodes: any[], active = false) => {
        for (const node of nodes) {
            const nodeIsTarget = targetIds.includes(node.id) || (node.libraryItemId && targetIds.includes(node.libraryItemId));
            const isTargetOrDescendant = active || nodeIsTarget;

            // L3 (micro) and L4 (atomico) are assessment-ready
            if (isTargetOrDescendant && (node.level === "micro" || node.level === "atomico")) {
                results.push(node);
            }
            if (node.children) {
                search(node.children, isTargetOrDescendant);
            }
        }
    };
    search(allNodes);
    return results;
};

const getProjectNodes = (project: any, skillsTree: any[], contentsTree: any[], libraryItems: any[]) => {
    const directSkillIds = project.bnccSkillIds || [];
    const directContentIds = project.contentIds || [];

    // Expand search scope by including linked library codes
    const targetSet = new Set<string>();
    [...directSkillIds, ...directContentIds].forEach(id => {
        targetSet.add(id);
        const li = libraryItems.find(item => item.id === id || item.code === id);
        if (li) {
            targetSet.add(li.id);
            if (li.code) targetSet.add(li.code);
        }
    });

    const recursiveNodes = findEvaluatableNodes([...skillsTree, ...contentsTree], Array.from(targetSet));

    const displayedNodeIds = new Set<string>();
    const microNodes: any[] = [];
    const atomicoNodes: any[] = [];

    // 1. Add direct skills/contents
    [...directSkillIds, ...directContentIds].forEach(id => {
        const info = resolveNodeInfo(id, skillsTree, contentsTree, libraryItems);
        if (!displayedNodeIds.has(info.id)) {
            if (info.level === "atomico") atomicoNodes.push(info);
            else microNodes.push(info);
            displayedNodeIds.add(info.id);
        }
    });

    // 2. Add recursive evaluatable nodes (if not already displayed)
    recursiveNodes.forEach(node => {
        if (!displayedNodeIds.has(node.id)) {
            const info = {
                ...node,
                code: node.code || (node.libraryItemId ? node.libraryItemId : null)
            };
            if (info.level === "atomico") atomicoNodes.push(info);
            else microNodes.push(info);
            displayedNodeIds.add(node.id);
        }
    });

    return { microNodes, atomicoNodes };
};

export function SkillsChart({ studentId }: { studentId?: string }) {
    const { projects, students, assessments, skillsTree, contentsTree, libraryItems } = useAppStore();

    if (!studentId) {
        return (
            <div className="bg-white p-6 rounded-xl border shadow-sm text-center text-slate-400">
                Selecione um aluno para exibir o gráfico.
            </div>
        );
    }

    const student = students.find(s => s.id === studentId);
    if (!student) return null;

    // Find projects linked to this student
    const studentProjects = projects.filter(p => {
        const studentMatch = (p.students || []).some(id => String(id) === String(student.id));
        const classMatch = (p.classes || []).some(id => String(id) === String(student.classId));
        return studentMatch || classMatch;
    });

    const studentAssessments = assessments.filter(a => a.studentId === studentId || (a.scope === "class" && a.classId === student.classId));

    const allMicro: any[] = [];
    const allAtomico: any[] = [];
    studentProjects.forEach(p => {
        const { microNodes, atomicoNodes } = getProjectNodes(p, skillsTree, contentsTree, libraryItems);
        allMicro.push(...microNodes);
        allAtomico.push(...atomicoNodes);
    });

    const map = new Map();
    [...allMicro, ...allAtomico].forEach(n => map.set(n.id, n));
    const allNodes = Array.from(map.values());

    const chartDataMap = new Map<string, ProgressChartData>();
    allNodes.forEach(node => {
        const subject = node.subject || "Outros";
        if (!chartDataMap.has(subject)) {
            chartDataMap.set(subject, { subject, trabalhado: 0, desenvolvido: 0, total: 0 });
        }
        const data = chartDataMap.get(subject)!;
        data.trabalhado += 1;
        data.total += 1;
        const nodeAssessment = studentAssessments.find(a => a.knowledgeNodeId === node.id);
        if (nodeAssessment && (nodeAssessment.rating ?? 0) >= 3) {
            data.desenvolvido += 1;
        }
    });

    const chartData = Array.from(chartDataMap.values()).sort((a, b) => a.subject.localeCompare(b.subject));

    return (
        <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-lg font-bold text-slate-800">Trabalhado vs. Desenvolvido</h3>
            <p className="text-sm text-slate-500 mb-6">Comparativo entre o que foi planejado/executado em projetos e o que foi consolidado pela criança.</p>

            <ProgressChart data={chartData} />

            <div className="mt-6 p-4 bg-slate-50 rounded-lg text-xs text-slate-500 flex gap-2">
                <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <p>
                    <strong>Nota:</strong> "Trabalhado" indica habilidades incluídas em projetos ativos ou concluídos.
                    "Desenvolvido" indica habilidades marcadas como "Conquistada" na avaliação do professor.
                </p>
            </div>
        </div>
    );
}

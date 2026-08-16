"use client";
import { Student } from "@/types/student";
import { ProgressChart, ProgressChartData } from "@/components/assessment/progress-chart";
import { useEffect, useState } from "react";
import { LibraryItem } from "@/types/library-item";
import { getListBncc } from "@/services/bncc.service";
import { AssessmentService } from "@/services/assessment.service";
import { Assessment } from "@/types/assessment";
import { getKnowledgeTrees } from "@/services/knowledge.service";

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

    }
    return results;
}

import { matchesPeriod } from "@/lib/filter-utils";

export function SkillsChart({
    student,
    filter = "all",
    period = "all",
    semester = "all",
    year = "all"
}: {
    student: Student | undefined;
    filter?: "bncc" | "ibira" | "all";
    period?: string;
    semester?: string;
    year?: string;
}) {
    // Resolve effective semester & year from explicit props or legacy period string
    const effSemester = semester !== "all" ? semester : (period !== "all" && period.includes("Semestre") ? period.split(" / ")[0] : "all");
    const effYear = year !== "all" ? year : (period !== "all" && /\d{4}/.test(period) ? (period.split(" / ")[1] || period) : "all");

    const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            try {
                const [bnccData, assessmentsData] = await Promise.all([
                    getListBncc(),
                    AssessmentService.getAll()
                ]);
                setLibraryItems(bnccData);
                setAssessments(assessmentsData);
            } catch (error) {
                console.error("Erro ao carregar dados", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, []);

    if (!student) {
        return (
            <div className="bg-white p-6 rounded-xl border shadow-sm text-center text-slate-400">
                Selecione um aluno para exibir o gráfico.
            </div>
        );
    }

    const studentId = student.id;

    const [skillsTree, setSkillsTree] = useState<any[]>([]);
        const [contentsTree, setContentsTree] = useState<any[]>([]);
        useEffect(() => {
            getKnowledgeTrees('skill').then(setSkillsTree);
            getKnowledgeTrees('content').then(setContentsTree);
            }, []);

    if (isLoading) {
        return (
            <div className="bg-white p-6 rounded-xl border shadow-sm text-center text-slate-400">
                Carregando gráfico...
            </div>
        );
    }

    const studentAssessments = assessments.filter(a => 
        (a.studentId === studentId || (a.scope === "class" && a.classId === student.classId)) &&
        matchesPeriod(a.period, a.createdAt, effSemester, effYear)
    );

    // 1. Identify which Library Items belong to the "Trilha Base" for the student's class
    const studentClassBaseTreeIds = new Set<string>();
    const collectBaseIds = (nodes: any[]) => {
        nodes.forEach(node => {
            if (node.libraryItemId) studentClassBaseTreeIds.add(node.libraryItemId);
            if (node.children) collectBaseIds(node.children);
        });
    };

    const allTrees = [...skillsTree, ...contentsTree];
    const classRoots = allTrees.filter(node => 
        node.classId === student.classId && 
        matchesPeriod(node.period, null, effSemester, effYear)
    );
    collectBaseIds(classRoots);

    // 2. The "Proposto" items are ONLY the library items present in the class Trilha Base
    // Additionally filter by isBNCC flag based on the `filter` prop
    const proposedLibraryItems = libraryItems.filter(item => {
        const inBase = studentClassBaseTreeIds.has(item.id) || (item.code && studentClassBaseTreeIds.has(item.code));
        if (!inBase) return false;
        if (filter === "bncc") return item.isBNCC === true;
        if (filter === "ibira") return item.isBNCC === false;
        return true;
    });

    // Logic: "Proposto" is everything in the library (BNCC and Competencies) that is in the Trilha Base
    // Grouping must mirror the library's `subGroup` completely
    const chartDataMap = new Map<string, ProgressChartData>();

    // Pre-build a map to quickly find the libraryItemId of any tree node
    const nodeToLibraryItemMap = new Map<string, string>();
    const mapNodes = (nodes: any[]) => {
        nodes.forEach(node => {
            if (node.libraryItemId) {
                nodeToLibraryItemMap.set(node.id, node.libraryItemId);
            }
            if (node.children) mapNodes(node.children);
        });
    };
    mapNodes(allTrees);

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
        // OR if the knowledgeNodeId is a tree node that points to this library item.
        const isDeveloped = studentAssessments.some(a => {
            if ((a.rating ?? 0) < 3) return false;

            const assessedNodeId = a.knowledgeNodeId;
            if (!assessedNodeId) return false;

            // Direct match
            if (assessedNodeId === item.id || (item.code && assessedNodeId === item.code)) return true;

            // Indirect match via tree node
            const libraryItemId = nodeToLibraryItemMap.get(assessedNodeId);
            if (libraryItemId && (libraryItemId === item.id || (item.code && libraryItemId === item.code))) return true;

            return false;
        });

        if (isDeveloped) {
            data.desenvolvido += 1;
            data.desenvolvidoItems?.push(item.name);
        }
    });

    const chartData = Array.from(chartDataMap.values()).sort((a, b) => a.subject.localeCompare(b.subject));

    return (
        <div className="bg-white p-6 rounded-xl border shadow-sm w-full min-w-0 overflow-hidden">
            <h3 className="text-xl font-bold text-slate-800 break-words">Proposto vs. Desenvolvido</h3>
            <p className="text-sm text-slate-500 mb-6 font-medium break-words">Comparativo entre a Biblioteca da escola e o que já foi consolidado pela criança (avaliação 3-5).</p>

            <ProgressChart data={chartData} />

        </div>
    );
}

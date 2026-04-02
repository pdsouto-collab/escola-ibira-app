"use client";

import { useAppStore } from "@/lib/store";
import { User, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Student } from "@/types/student";
import { useEffect, useState } from "react";
import { AssessmentService } from "@/services/assessment.service";
import { Assessment } from "@/types/assessment";

const labels = ["Muda", "Broto", "Jovem", "Adulta", "Com frutos"];

// Shared TreeIcon component
export const TreeIcon = ({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) => {
    const sizeClass = size === "sm" ? "w-6 h-6" : "w-8 h-8";
    switch (rating) {
        case 1:
            return (
                <svg viewBox="0 0 60 80" className={sizeClass} fill="none">
                    <rect x="28" y="44" width="4" height="30" rx="2" fill="#92400e" />
                    <path d="M29 48 Q18 38 22 28 Q30 36 29 48Z" fill="#16a34a" />
                    <path d="M31 48 Q42 38 38 28 Q30 36 31 48Z" fill="#22c55e" />
                </svg>
            );
        case 2:
            return (
                <svg viewBox="0 0 60 80" className={sizeClass} fill="none">
                    <rect x="27.5" y="38" width="5" height="36" rx="2.5" fill="#78350f" />
                    <ellipse cx="30" cy="28" rx="10" ry="13" fill="#16a34a" />
                    <path d="M27 40 Q10 30 14 16 Q26 26 27 40Z" fill="#22c55e" />
                    <path d="M33 40 Q50 30 46 16 Q34 26 33 40Z" fill="#15803d" />
                </svg>
            );
        case 3:
            return (
                <svg viewBox="0 0 60 80" className={sizeClass} fill="none">
                    <path d="M24 74 Q26 62 27 50 L33 50 Q34 62 36 74Z" fill="#78350f" />
                    <ellipse cx="30" cy="36" rx="18" ry="20" fill="#16a34a" />
                    <ellipse cx="26" cy="28" rx="10" ry="12" fill="#22c55e" opacity="0.7" />
                </svg>
            );
        case 4:
            return (
                <svg viewBox="0 0 60 80" className={sizeClass} fill="none">
                    <path d="M22 74 Q24 56 26 46 L34 46 Q36 56 38 74Z" fill="#78350f" />
                    <ellipse cx="30" cy="30" rx="22" ry="22" fill="#15803d" />
                    <ellipse cx="25" cy="22" rx="13" ry="14" fill="#22c55e" opacity="0.7" />
                </svg>
            );
        case 5:
            return (
                <svg viewBox="0 0 60 80" className={sizeClass} fill="none">
                    <path d="M22 74 Q24 56 26 44 L34 44 Q36 56 38 74Z" fill="#78350f" />
                    <ellipse cx="30" cy="28" rx="24" ry="23" fill="#15803d" />
                    <circle cx="19" cy="34" r="4.5" fill="#dc2626" />
                    <circle cx="30" cy="12" r="4" fill="#dc2626" />
                    <circle cx="41" cy="32" r="4.5" fill="#dc2626" />
                </svg>
            );
        default:
            return <Circle className="w-5 h-5 text-slate-300" />;
    }
};

const resolveNodeInfo = (id: string, skillsTree: any[], contentsTree: any[]) => {
    const searchTrees = (nodes: any[], parentName?: string): any | null => {
        for (const node of nodes) {
            const currentSubject = node.level === "mesclado" ? node.name : parentName;
            if (node.id === id) {
                return {
                    id: node.id,
                    name: node.name,
                    subject: currentSubject || "Outros",
                };
            }
            if (node.children) {
                const found = searchTrees(node.children, currentSubject);
                if (found) return found;
            }
        }
        return null;
    };
    return searchTrees([...skillsTree, ...contentsTree]) || { name: id };
};

export function ObservationList({ student }: { student: Student }) {
    const { skillsTree, contentsTree } = useAppStore();
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadAssessments() {
            setIsLoading(true);
            try {
                const data = await AssessmentService.getAll();
                setAssessments(data);
            } catch (error) {
                console.error("Erro ao carregar avaliações", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadAssessments();
    }, []);

    if (!student) return null;
    const studentId = student.id;

    const relevantAssessments = assessments
        .filter((a: any) => (a.studentId === studentId || (a.scope === "class" && a.classId === student.classId)) && a.observations)
        .sort((a: any, b: any) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());

    if (isLoading) {
        return (
            <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed text-slate-400 text-sm">
                Carregando observações...
            </div>
        );
    }

    if (relevantAssessments.length === 0) {
        return (
            <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed text-slate-400 text-sm">
                Nenhuma observação registrada nas avaliações deste período.
            </div>
        );
    }

    return (
        <div className="space-y-4 w-full">
            {relevantAssessments.map((assessment: any) => {
                const nodeInfo = resolveNodeInfo(assessment.knowledgeNodeId || "", skillsTree, contentsTree);
                return (
                    <div key={assessment.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex gap-4 items-start hover:shadow-md transition-shadow">
                        <div className="bg-slate-50 p-3 rounded-xl flex flex-col items-center gap-1 min-w-[64px]">
                            {assessment.rating ? (
                                <>
                                    <TreeIcon rating={assessment.rating} />
                                    <span className="text-[10px] font-bold text-slate-500">{assessment.rating}/5</span>
                                </>
                            ) : (
                                <User className="w-6 h-6 text-slate-300" />
                            )}
                        </div>
                        <div className="flex-1 space-y-1">
                            <div className="flex justify-between items-start">
                                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
                                    {new Date(assessment.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                                </span>
                                <span className="text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                                    {nodeInfo?.name || "Avaliação Geral"}
                                </span>
                            </div>
                            <p className="text-slate-700 italic text-sm leading-relaxed">&quot;{assessment.observations}&quot;</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

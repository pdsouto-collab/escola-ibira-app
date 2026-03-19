import { useAppStore } from "@/lib/store";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { getListBncc } from "@/services/bncc.service";
import { LibraryItem } from "@/types/library-item";

interface MilestoneReportProps {
    studentId: string;
    filter?: "bncc" | "ibira" | "all";
}

const labels = ["Muda", "Broto", "Jovem", "Adulta", "Com frutos"];

// Simple tree icon components for the report
const TreeIcon = ({ rating, size = "sm" }: { rating: number, size?: "sm" | "md" }) => {
    const active = true;
    const sizeClass = size === "sm" ? "w-6 h-6" : "w-8 h-8";

    // Return SVG based on rating 1-5
    switch (rating) {
        case 1: return (
            <svg viewBox="0 0 60 80" className={sizeClass} fill="none">
                <rect x="28" y="44" width="4" height="30" rx="2" fill="#92400e" />
                <path d="M29 48 Q18 38 22 28 Q30 36 29 48Z" fill="#16a34a" />
                <path d="M31 48 Q42 38 38 28 Q30 36 31 48Z" fill="#22c55e" />
            </svg>
        );
        case 2: return (
            <svg viewBox="0 0 60 80" className={sizeClass} fill="none">
                <rect x="27.5" y="38" width="5" height="36" rx="2.5" fill="#78350f" />
                <ellipse cx="30" cy="28" rx="10" ry="13" fill="#16a34a" />
                <path d="M27 40 Q10 30 14 16 Q26 26 27 40Z" fill="#22c55e" />
                <path d="M33 40 Q50 30 46 16 Q34 26 33 40Z" fill="#15803d" />
            </svg>
        );
        case 3: return (
            <svg viewBox="0 0 60 80" className={sizeClass} fill="none">
                <path d="M24 74 Q26 62 27 50 L33 50 Q34 62 36 74Z" fill="#78350f" />
                <ellipse cx="30" cy="36" rx="18" ry="20" fill="#16a34a" />
                <ellipse cx="26" cy="28" rx="10" ry="12" fill="#22c55e" opacity="0.7" />
            </svg>
        );
        case 4: return (
            <svg viewBox="0 0 60 80" className={sizeClass} fill="none">
                <path d="M22 74 Q24 56 26 46 L34 46 Q36 56 38 74Z" fill="#78350f" />
                <ellipse cx="30" cy="30" rx="22" ry="22" fill="#15803d" />
                <ellipse cx="25" cy="22" rx="13" ry="14" fill="#22c55e" opacity="0.7" />
            </svg>
        );
        case 5: return (
            <svg viewBox="0 0 60 80" className={sizeClass} fill="none">
                <path d="M22 74 Q24 56 26 44 L34 44 Q36 56 38 74Z" fill="#78350f" />
                <ellipse cx="30" cy="28" rx="24" ry="23" fill="#15803d" />
                <circle cx="19" cy="34" r="4.5" fill="#dc2626" />
                <circle cx="30" cy="12" r="4" fill="#dc2626" />
                <circle cx="41" cy="32" r="4.5" fill="#dc2626" />
            </svg>
        );
        default: return <Circle className="w-5 h-5 text-slate-300" />;
    }
};

const getAllEvaluatableNodes = (nodes: any[], parentName?: string, level: string = "both"): any[] => {
    const results: any[] = [];
    for (const node of nodes) {
        const currentSubject = node.level === "mesclado" ? node.name : parentName;

        // Count both micro (skills) and atomico (evidence) by default, or specialize
        if ((level === "both" && (node.level === "micro" || node.level === "atomico")) ||
            (level === "micro" && node.level === "micro") ||
            (level === "atomico" && node.level === "atomico")) {
            results.push({ ...node, subject: currentSubject || "Outros" });
        }

        if (node.children) {
            results.push(...getAllEvaluatableNodes(node.children, currentSubject, level));
        }
    }
    return results;
};

export function MilestoneReport({ studentId, filter = "all" }: MilestoneReportProps) {

    const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);

    useEffect(() => {
        getListaBNCC();
    }, [])

    async function getListaBNCC() {
        await getListBncc().then(setLibraryItems);
    }

    const { assessments, skillsTree, contentsTree, students } = useAppStore();

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

    // 2. Fetch evaluating nodes, but only keep Micro (Level 3 - Items from Library) inside the Base Tree
    // Get ALL micro nodes from all projects/trees
    const allMicroNodes = getAllEvaluatableNodes([...skillsTree, ...contentsTree], undefined, "micro");

    // Filter against the Trilha Base set, then apply isBNCC filter
    const allNodes = allMicroNodes.filter(node => {
        if (!node.libraryItemId || !studentClassBaseTreeIds.has(node.libraryItemId)) return false;
        const libraryItem = libraryItems.find(item => item.id === node.libraryItemId);
        if (!libraryItem) return false;
        if (filter === "bncc") return libraryItem.isBNCC === true;
        if (filter === "ibira") return libraryItem.isBNCC === false;
        return true;
    });

    const groupsMap = new Map<string, any[]>();
    allNodes.forEach(node => {
        const libraryItem = libraryItems.find(item => item.id === node.libraryItemId);
        const subject = libraryItem?.subGroup || "Outros";

        if (!groupsMap.has(subject)) groupsMap.set(subject, []);

        // Ensure no duplicate L3 nodes by libraryItemId within the same subject
        const groupList = groupsMap.get(subject)!;
        if (!groupList.some(existingNode => existingNode.libraryItemId === node.libraryItemId)) {
            groupList.push(node);
        }
    });

    const groups = Array.from(groupsMap.keys()).sort().map(name => {
        const nodes = groupsMap.get(name) || [];

        // Pre-build a map to quickly find the libraryItemId of any tree node
        const nodeToLibraryItemMap = new Map<string, string>();
        const mapNodesFn = (ns: any[]) => {
            ns.forEach(node => {
                if (node.libraryItemId) nodeToLibraryItemMap.set(node.id, node.libraryItemId);
                if (node.children) mapNodesFn(node.children);
            });
        };
        mapNodesFn(allTrees);

        const getAssessmentForLibraryItemId = (libItemId: string) => {
            // Find the best or most recent assessment for a given libraryItemId
            const relatedAssessments = studentAssessments.filter(a => {
                const assessedNodeId = a.knowledgeNodeId;
                if (!assessedNodeId) return false;

                // Match directly against the library item id or code
                const libraryItem = libraryItems.find(li => li.id === libItemId);
                if (assessedNodeId === libItemId || (libraryItem?.code && assessedNodeId === libraryItem.code)) return true;

                // Indirect match via tree node
                const mappedLibId = nodeToLibraryItemMap.get(assessedNodeId);
                if (mappedLibId && (mappedLibId === libItemId || (libraryItem?.code && mappedLibId === libraryItem.code))) return true;

                return false;
            });

            // Return the highest rating assessment, or most recent if none
            if (relatedAssessments.length === 0) return undefined;
            return relatedAssessments.reduce((best, current) => {
                if ((current.rating ?? 0) > (best.rating ?? 0)) return current;
                return best;
            }, relatedAssessments[0]);
        };

        const achievedNodes = nodes.filter(n => {
            if (!n.libraryItemId) return false;
            const assessment = getAssessmentForLibraryItemId(n.libraryItemId);
            return assessment && (assessment.rating ?? 0) >= 3;
        });

        const progress = nodes.length > 0 ? Math.round((achievedNodes.length / nodes.length) * 100) : 0;

        return {
            name,
            nodes,
            achievedCount: achievedNodes.length,
            progress,
            getAssessmentForLibraryItemId // pass it down to render
        };
    });

    const getCardColor = (index: number) => {
        const colors = ["#f97316", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899", "#ef4444"];
        return colors[index % colors.length];
    };

    if (groups.length === 0) {
        return (
            <div className="empty-state w-full h-40 flex items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-dashed">
                Nenhuma habilidade atribuída a este grupo
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
                {groups.map((group, idx) => (
                    <Card key={group.name} className="overflow-hidden border-2 flex flex-col h-full shadow-sm" style={{ borderColor: getCardColor(idx) }}>
                        <CardHeader className="bg-slate-50/50 pb-3 border-b border-slate-100">
                            <CardTitle className="text-xl font-bold flex justify-between items-center text-slate-800">
                                <span className="line-clamp-1">{group.name}</span>
                                <span className="text-sm font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-full border shadow-sm">{group.progress}%</span>
                            </CardTitle>
                            <Progress
                                value={group.progress}
                                className="h-2.5 mt-2 bg-slate-200"
                                // @ts-ignore
                                indicatorColor={getCardColor(idx)}
                            />
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4 flex-1">
                            {group.nodes.map((node) => {
                                const assessment = group.getAssessmentForLibraryItemId(node.libraryItemId);
                                const rating = assessment?.rating;
                                const isAchieved = (rating ?? 0) >= 3;

                                return (
                                    <div key={node.id} className={cn(
                                        "p-3 rounded-lg border transition-all",
                                        rating ? "bg-white border-slate-200 shadow-sm" : "bg-slate-50 border-transparent text-slate-400"
                                    )}>
                                        <div className="flex items-start gap-3">
                                            <div className="shrink-0 mt-0.5">
                                                {rating ? (
                                                    <div className="flex flex-col items-center">
                                                        <TreeIcon rating={rating} />
                                                        <span className="text-[10px] font-bold text-slate-500 mt-1">{rating}/5</span>
                                                    </div>
                                                ) : (
                                                    <Circle className="w-5 h-5 text-slate-300" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className={cn(
                                                    "text-sm leading-tight mb-1",
                                                    rating ? "text-slate-800 font-bold" : "text-slate-400 font-medium"
                                                )}>
                                                    {node.name}
                                                </p>
                                                {rating && (
                                                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                                                        {labels[rating - 1]}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

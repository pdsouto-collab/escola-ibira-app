import { useAppStore } from "@/lib/store";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle } from "lucide-react";

interface MilestoneReportProps {
    studentId: string;
}

const getAllEvaluatableNodes = (nodes: any[], rootName?: string): any[] => {
    const results: any[] = [];
    for (const node of nodes) {
        const currentRoot = node.level === "macro" ? node.name : rootName;
        if (node.level === "micro" || node.level === "atomico") {
            results.push({ ...node, subject: currentRoot || "Outros" });
        }
        if (node.children) {
            results.push(...getAllEvaluatableNodes(node.children, currentRoot));
        }
    }
    return results;
};

export function MilestoneReport({ studentId }: MilestoneReportProps) {
    const { assessments, skillsTree, contentsTree, students } = useAppStore();

    const student = students.find(s => s.id === studentId);
    if (!student) return null;

    const studentAssessments = assessments.filter(a => a.studentId === studentId || (a.scope === "class" && a.classId === student.classId));

    // Group all evaluatable nodes by subject (Macro Axis)
    const allProposedNodes = getAllEvaluatableNodes([...skillsTree, ...contentsTree]);

    const groupsMap = new Map<string, any[]>();
    allProposedNodes.forEach(node => {
        const subject = node.subject || "Outros";
        if (!groupsMap.has(subject)) groupsMap.set(subject, []);
        groupsMap.get(subject)?.push(node);
    });

    const groups = Array.from(groupsMap.keys()).sort().map(name => {
        const nodes = groupsMap.get(name) || [];
        const achievedNodes = nodes.filter(n => {
            const assessment = studentAssessments.find(a => a.knowledgeNodeId === n.id);
            return assessment && (assessment.rating ?? 0) >= 3;
        });
        const progress = Math.round((achievedNodes.length / nodes.length) * 100);

        return {
            name,
            nodes,
            achievedCount: achievedNodes.length,
            progress
        };
    });

    // Helper for card colors based on status/index
    const getCardColor = (index: number) => {
        const colors = ["#f97316", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899", "#ef4444"];
        return colors[index % colors.length];
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {groups.map((group, idx) => (
                    <Card key={group.name} className="overflow-hidden border-2 flex flex-col h-full shadow-sm hover:shadow-md transition-shadow" style={{ borderColor: getCardColor(idx) }}>
                        <CardHeader className="bg-slate-50/50 pb-3 border-b border-slate-100">
                            <CardTitle className="text-lg font-bold flex justify-between items-center text-slate-800">
                                <span className="line-clamp-1">{group.name}</span>
                                <span className="text-sm font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-full border shadow-sm">{group.progress}%</span>
                            </CardTitle>
                            <Progress
                                value={group.progress}
                                className="h-2.5 mt-2 bg-slate-200"
                                // @ts-ignore - dynamic color
                                indicatorColor={getCardColor(idx)}
                            />
                        </CardHeader>
                        <CardContent className="pt-4 space-y-3 flex-1 overflow-y-auto max-h-[300px] scrollbar-thin">
                            {group.nodes.map((node) => {
                                const assessment = studentAssessments.find(a => a.knowledgeNodeId === node.id);
                                const isAchieved = assessment && (assessment.rating ?? 0) >= 3;

                                return (
                                    <div key={node.id} className="flex items-start gap-3 text-sm group">
                                        {isAchieved ? (
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" fill="#ecfdf5" />
                                        ) : (
                                            <Circle className="w-5 h-5 text-slate-300 mt-0.5 shrink-0 group-hover:text-slate-400 transition-colors" />
                                        )}
                                        <span className={isAchieved ? "text-slate-700 font-bold" : "text-slate-500 font-medium"}>
                                            {node.name}
                                        </span>
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

"use client";

import { useAppStore } from "@/lib/store";
import { mockBNCCData } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
// Removed unused Tooltip imports for now to avoid complexity if not used
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function SkillsChart() {
    const { projects, bnccProgress } = useAppStore();

    // Calculate Stats per Subject
    const stats = mockBNCCData.map(subject => {
        const totalSkills = subject.skills.length;

        // Count Worked (In Active or Completed Projects)
        // A skill is "worked" if it appears in at least one project that is NOT "planning" (unless we want to count planning too)
        // Let's count Active/Completed as "Trabalhado".
        const workedCount = subject.skills.filter(skill =>
            projects.some(p =>
                (p.status === "active" || p.status === "completed") &&
                p.bnccSkillIds?.includes(skill.code)
            )
        ).length;

        // Count Developed (Achieved)
        const developedCount = subject.skills.filter(skill =>
            bnccProgress[skill.code]?.status === "achieved"
        ).length;

        return {
            id: subject.id,
            name: subject.name,
            total: totalSkills,
            worked: workedCount,
            developed: developedCount,
            workedPct: totalSkills > 0 ? (workedCount / totalSkills) * 100 : 0,
            developedPct: totalSkills > 0 ? (developedCount / totalSkills) * 100 : 0,
            color: subject.id === "ciencias" ? "bg-green-500" :
                subject.id === "matematica" ? "bg-blue-500" :
                    subject.id === "portugues" ? "bg-purple-500" :
                        subject.id === "historia" ? "bg-orange-500" :
                            "bg-yellow-500"
        };
    });

    return (
        <div className="bg-white p-6 rounded-xl border shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Trabalhado vs. Desenvolvido</h3>
                    <p className="text-sm text-slate-500">Comparativo entre o que foi planejado/executado em projetos e o que foi consolidado pela criança.</p>
                </div>
                <div className="flex gap-4 text-xs font-medium">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-400" />
                        <span>Trabalhado (Projetos)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span>Desenvolvido (Conquistado)</span>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {stats.map(subject => (
                    <div key={subject.id} className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="font-semibold text-slate-700">{subject.name}</span>
                            <span className="text-slate-400 text-xs">{subject.total} habilidades totais</span>
                        </div>

                        {/* Bar Container */}
                        <div className="relative h-8 bg-slate-100 rounded-full overflow-hidden flex items-center">
                            {/* Worked Bar (Background layer) */}
                            <div
                                className="absolute top-0 bottom-0 left-0 bg-amber-400/80 transition-all duration-1000 ease-out"
                                style={{ width: `${subject.workedPct}%` }}
                            />
                            {/* Developed Bar (Foreground layer, usually subset of worked but represents success) */}
                            {/* We render it slightly narrower or overlapping? 
                                 Standard logic: Developed is a state of the skill. Worked is exposure.
                                 They might overlap. If Developed > Worked (e.g. external learning), bar shows it.
                             */}
                            <div
                                className="absolute top-1 bottom-1 left-0 bg-emerald-500 shadow-sm rounded-r-full transition-all duration-1000 ease-out z-10"
                                style={{ width: `${subject.developedPct}%` }}
                            />

                            {/* Labels inside bars if wide enough */}
                            {subject.workedPct > 10 && subject.worked > 0 && (
                                <span className="absolute z-0 text-[10px] font-bold text-amber-900 right-2 top-1/2 -translate-y-1/2"
                                    style={{ left: `${subject.workedPct}%`, transform: 'translateX(-110%) translateY(-50%)' }}>
                                    {subject.worked}
                                </span>
                            )}
                            {subject.developedPct > 10 && subject.developed > 0 && (
                                <span className="absolute z-20 text-[10px] font-bold text-white left-2 top-1/2 -translate-y-1/2">
                                    {subject.developed}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

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

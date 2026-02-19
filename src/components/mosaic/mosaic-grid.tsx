"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { mockBNCCData, BNCCSkill } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Clock, Circle, FileText, AlertCircle, Plus } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface MosaicGridProps {
    classId?: string;
    projectId?: string;
}

export function MosaicGrid({ classId, projectId }: MosaicGridProps) {
    const { projects, bnccProgress, updateBNCCStatus } = useAppStore();
    const [selectedSkill, setSelectedSkill] = useState<BNCCSkill | null>(null);
    const [comment, setComment] = useState("");

    // Helper to get status
    const getSkillStatus = (code: string) => {
        // 1. Check if Achieved (Blue/Green) - This is global for now, 
        // but in a real app could be per class. We'll keep it simple: 
        // if user filters by class, we technically should only show achievement for that class.
        // For this prototype, let's assume "Achieved" is a global student record, so it shows up regardless of filter.
        const progress = bnccProgress[code];
        if (progress?.status === "achieved") return "achieved";

        // 2. Check if In Progress (Blue)
        if (progress?.status === "in-progress") return "in-progress";

        // 3. Check if Planned (Yellow) - DEPENDS ON FILTERS
        // A skill is "planned" if it is in an ACTIVE project that matches the current filters.

        const inActiveProject = projects.some(p => {
            // Must be active
            if (p.status !== "active") return false;

            // Must contain the skill
            if (!p.bnccSkillIds?.includes(code)) return false;

            // Filter by Project ID if set
            if (projectId && p.id !== projectId) return false;

            // Filter by Class ID if set
            // For now, if classId is set, we strictly should only count projects from that class.
            // Since our mock project data structure is simple, we will assume if a project filter is NOT set,
            // but a CLASS filter IS set, we should ideally filter projects by class.
            // However, linking projects to classes is done via students in this mock.
            // Let's assume for this prototype that if no specific project is selected, we show all active projects 
            // (or let the user select a specific project to narrow it down).

            return true;
        });

        if (inActiveProject) return "planned";

        return "not-started";
    };

    // Helper to get projects linked to a skill
    const getLinkedProjects = (code: string) => {
        return projects.filter(p => {
            if (!p.bnccSkillIds?.includes(code)) return false;

            // Apply Filters
            if (projectId && p.id !== projectId) return false;

            // Note on Class Filter: 
            // If classId is set, we could filter here too.
            // For now, project filter is the strongest constraint.

            return true;
        });
    };

    const handleStatusUpdate = (status: "not-started" | "in-progress" | "achieved") => {
        if (!selectedSkill) return;
        updateBNCCStatus(selectedSkill.code, status);
        // Note: In a real app we'd save the comment too
        setComment("");
        setSelectedSkill(null);
    };

    // Filter BNCC Data based on used skills in projects
    const filteredBNCCData = mockBNCCData.map(subject => {
        const filteredSkills = subject.skills.filter(skill => {
            // Check if this skill is used in any relevant project
            const linkedProjects = getLinkedProjects(skill.code);
            return linkedProjects.length > 0;
        });
        return { ...subject, skills: filteredSkills };
    }).filter(subject => subject.skills.length > 0);

    const hasAnySkills = filteredBNCCData.length > 0;

    if (!hasAnySkills) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 text-slate-500 animate-in fade-in zoom-in duration-500">
                <div className="bg-slate-100 p-6 rounded-full mb-4">
                    <FileText className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">Nenhuma prática gerada ainda</h3>
                <p className="max-w-md mb-6 leading-relaxed">
                    O Mosaico de Práticas é gerado automaticamente a partir das habilidades trabalhadas nos seus projetos.
                    Crie seu primeiro projeto para começar a preencher este mural.
                </p>
                <Button asChild className="rounded-full shadow-lg hover:shadow-xl transition-all">
                    <a href="/projetos/novo">
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Primeiro Projeto
                    </a>
                </Button>
            </div>
        );
    }

    return (
        <div className="w-full h-full overflow-y-auto p-6 space-y-8">
            {filteredBNCCData.map(subject => (
                <div key={subject.id} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex items-center gap-3">
                        <div className={cn("w-2 h-8 rounded-full",
                            subject.id === "ciencias" ? "bg-green-500" :
                                subject.id === "matematica" ? "bg-blue-500" :
                                    subject.id === "portugues" ? "bg-purple-500" :
                                        subject.id === "historia" ? "bg-orange-500" :
                                            subject.id === "geografia" ? "bg-yellow-500" : "bg-slate-500"
                        )} />
                        <h3 className="text-xl font-bold text-slate-800">{subject.name}</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {subject.skills.map(skill => {
                            const status = getSkillStatus(skill.code);
                            const linkedProjects = getLinkedProjects(skill.code);

                            return (
                                <div
                                    key={skill.code}
                                    onClick={() => setSelectedSkill(skill)}
                                    className={cn(
                                        "relative p-4 rounded-xl border border-b-4 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md group",
                                        status === "achieved"
                                            ? "bg-green-50 border-green-500/30 border-b-green-500"
                                            : status === "planned"
                                                ? "bg-amber-50 border-amber-300 border-b-amber-400 ring-2 ring-amber-400/20"
                                                : status === "in-progress"
                                                    ? "bg-blue-50 border-blue-300 border-b-blue-400"
                                                    : "bg-white border-slate-200 border-b-slate-300 hover:border-slate-400"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant="outline" className={cn("text-[10px] font-mono",
                                            status === "achieved" ? "bg-green-100 text-green-700 border-green-200" :
                                                "bg-slate-100 text-slate-500"
                                        )}>
                                            {skill.code}
                                        </Badge>
                                        {status === "achieved" && <Check className="w-4 h-4 text-green-600" />}
                                        {status === "planned" && <AlertCircle className="w-4 h-4 text-amber-500" />}
                                        {status === "in-progress" && <Clock className="w-4 h-4 text-blue-500" />}
                                    </div>

                                    <p className="text-sm font-medium text-slate-700 line-clamp-3 mb-3 leading-snug">
                                        {skill.description}
                                    </p>

                                    <div className="flex items-center justify-between text-xs text-slate-400 mt-auto">
                                        <span className="font-semibold uppercase tracking-wider text-[10px]">{skill.category}</span>
                                        {linkedProjects.length > 0 && (
                                            <div className="flex items-center gap-1 text-slate-500" title={`${linkedProjects.length} projeto(s)`}>
                                                <FileText className="w-3 h-3" />
                                                {linkedProjects.length}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}

            <Dialog open={!!selectedSkill} onOpenChange={(open) => !open && setSelectedSkill(null)}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">{selectedSkill?.code}</Badge>
                            <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">{selectedSkill?.category}</span>
                        </div>
                        <DialogTitle className="text-xl leading-relaxed">
                            {selectedSkill?.description}
                        </DialogTitle>
                    </DialogHeader>

                    <ScrollArea className="max-h-[60vh] py-4">
                        <div className="space-y-6">
                            {/* Status Selection */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-slate-900">Situação Atual</label>
                                <div className="grid grid-cols-3 gap-3">
                                    <Button
                                        variant={getSkillStatus(selectedSkill?.code || "") === "not-started" ? "default" : "outline"}
                                        className={cn("h-auto py-3 flex flex-col gap-1", getSkillStatus(selectedSkill?.code || "") === "not-started" && "bg-slate-600")}
                                        onClick={() => handleStatusUpdate("not-started")}
                                    >
                                        <Circle className="w-4 h-4" />
                                        <span className="text-xs">Não Iniciado</span>
                                    </Button>
                                    <Button
                                        variant={getSkillStatus(selectedSkill?.code || "") === "in-progress" ? "default" : "outline"}
                                        className={cn("h-auto py-3 flex flex-col gap-1", getSkillStatus(selectedSkill?.code || "") === "in-progress" && "bg-blue-600 hover:bg-blue-700")}
                                        onClick={() => handleStatusUpdate("in-progress")}
                                    >
                                        <Clock className="w-4 h-4" />
                                        <span className="text-xs">Em Progresso</span>
                                    </Button>
                                    <Button
                                        variant={getSkillStatus(selectedSkill?.code || "") === "achieved" ? "default" : "outline"}
                                        className={cn("h-auto py-3 flex flex-col gap-1", getSkillStatus(selectedSkill?.code || "") === "achieved" && "bg-green-600 hover:bg-green-700")}
                                        onClick={() => handleStatusUpdate("achieved")}
                                    >
                                        <Check className="w-4 h-4" />
                                        <span className="text-xs">Conquistada!</span>
                                    </Button>
                                </div>
                            </div>

                            {/* Linked Projects */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-slate-900">Projetos Vinculados</label>
                                {selectedSkill && getLinkedProjects(selectedSkill.code).length > 0 ? (
                                    <div className="grid gap-2">
                                        {getLinkedProjects(selectedSkill.code).map(project => (
                                            <div key={project.id} className="flex items-center justify-between p-3 rounded-lg border bg-slate-50">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700">
                                                        <FileText className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-900">{project.title}</p>
                                                        <p className="text-xs text-slate-500">
                                                            {project.status === "active" ? "Em andamento" :
                                                                project.status === "completed" ? "Concluído" : "Planejamento"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button size="sm" variant="ghost" className="h-7 text-xs">Ver</Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-4 border border-dashed rounded-lg text-center text-slate-500 text-sm bg-slate-50">
                                        Nenhum projeto trabalhou esta habilidade ainda.
                                    </div>
                                )}
                            </div>

                            {/* Evidence / Comments */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-slate-900">Diário de Bordo / Evidências</label>
                                <Textarea
                                    placeholder="Adicione observações sobre o desenvolvimento desta habilidade..."
                                    className="resize-none"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                />
                                <div className="flex justify-end">
                                    <Button size="sm" variant="secondary">Adicionar Nota</Button>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </div>
    );
}

"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Pencil,
    X,
    Calendar,
    Users,
    Target,
    Layers,
    BookOpen,
    Clock,
    Sparkles,
    Maximize2,
    Images,
    FileText,
    GraduationCap,
    HelpCircle,
    ArrowLeft
} from "lucide-react";
import { Project } from "@/types/project";
import { SchoolClass } from "@/types/school-class";
import { ScheduleItem } from "@/types/schedule";
import { getSchedules } from "@/services/schedule.service";
import { getListBncc } from "@/services/bncc.service";
import { LibraryItem } from "@/types/library-item";
import { getStudents } from "@/services/student.service";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ProjectViewDialogProps {
    project: Project | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    classes: SchoolClass[];
}

export function ProjectViewDialog({
    project,
    open,
    onOpenChange,
    classes
}: ProjectViewDialogProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("overview");
    const [projectSessions, setProjectSessions] = useState<ScheduleItem[]>([]);
    const [bnccLibrary, setBnccLibrary] = useState<LibraryItem[]>([]);
    const [allStudents, setAllStudents] = useState<any[]>([]);
    const [selectedLightboxImage, setSelectedLightboxImage] = useState<string | null>(null);

    useEffect(() => {
        if (open && project) {
            getSchedules().then(items => {
                setProjectSessions(items.filter(s => s.projectId === project.id));
            }).catch(console.error);

            getListBncc().then(setBnccLibrary).catch(console.error);
            getStudents().then(setAllStudents).catch(console.error);
        }
    }, [open, project]);

    if (!project) return null;

    const classNames = !project.classes || project.classes.length === 0
        ? "Geral / Todas as Turmas"
        : project.classes.map(id => classes.find(c => c.id === id)?.name || id).join(", ");

    const studentNames = !project.students || project.students.length === 0
        ? []
        : project.students.map(id => allStudents.find(s => s.id === id)?.name || `Aluno ${id}`);

    const matchedBncc = bnccLibrary.filter(item => project.bnccSkillIds?.includes(item.id));
    const allPhotos = [
        ...(project.imageUrl ? [project.imageUrl] : []),
        ...(Array.isArray(project.photos) ? project.photos : [])
    ];

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "active": return { label: "Em Andamento", color: "bg-emerald-500 text-white" };
            case "draft": return { label: "Rascunho", color: "bg-amber-500 text-white" };
            case "completed": return { label: "Concluído", color: "bg-indigo-600 text-white" };
            case "planning": return { label: "Modelo / Planejamento", color: "bg-purple-600 text-white" };
            default: return { label: status, color: "bg-slate-500 text-white" };
        }
    };

    const statusInfo = getStatusLabel(project.status);

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden flex flex-col bg-white rounded-2xl shadow-2xl">
                    {/* Header Banner */}
                    <div className="relative bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white p-6 sm:p-8 flex-shrink-0">
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-2 max-w-2xl">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusInfo.color}`}>
                                        {statusInfo.label}
                                    </span>
                                    <Badge variant="outline" className="border-white/30 text-white bg-white/10 text-xs">
                                        {classNames}
                                    </Badge>
                                    {project.period && (
                                        <Badge variant="outline" className="border-white/30 text-white bg-white/10 text-xs">
                                            {project.period}
                                        </Badge>
                                    )}
                                </div>
                                <DialogTitle className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                                    {project.title}
                                </DialogTitle>
                            </div>
                        </div>

                        {/* Quick Stats Strip */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-white/15 text-xs text-indigo-100">
                            <div>
                                <span className="block opacity-75 font-semibold uppercase text-[10px] tracking-wider">Tipo</span>
                                <span className="font-bold text-white text-sm">{project.type || "Projeto"}</span>
                            </div>
                            <div>
                                <span className="block opacity-75 font-semibold uppercase text-[10px] tracking-wider">Produto Final</span>
                                <span className="font-bold text-white text-sm">{project.finalProduct || "Não definido"}</span>
                            </div>
                            <div>
                                <span className="block opacity-75 font-semibold uppercase text-[10px] tracking-wider">Sessões Agendadas</span>
                                <span className="font-bold text-white text-sm">{projectSessions.length} aulas</span>
                            </div>
                            <div>
                                <span className="block opacity-75 font-semibold uppercase text-[10px] tracking-wider">Fotos no Acervo</span>
                                <span className="font-bold text-white text-sm">{allPhotos.length} fotos</span>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="border-b px-6 bg-slate-50 flex-shrink-0">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="bg-transparent h-auto p-0 gap-6">
                                <TabsTrigger
                                    value="overview"
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent px-2 py-3 text-xs sm:text-sm font-bold text-slate-500 data-[state=active]:text-indigo-600 transition-all flex items-center gap-1.5"
                                >
                                    <FileText className="w-4 h-4" />
                                    Visão Geral
                                </TabsTrigger>
                                <TabsTrigger
                                    value="photos"
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent px-2 py-3 text-xs sm:text-sm font-bold text-slate-500 data-[state=active]:text-indigo-600 transition-all flex items-center gap-1.5"
                                >
                                    <Images className="w-4 h-4" />
                                    Galeria de Fotos ({allPhotos.length})
                                </TabsTrigger>
                                <TabsTrigger
                                    value="skills"
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent px-2 py-3 text-xs sm:text-sm font-bold text-slate-500 data-[state=active]:text-indigo-600 transition-all flex items-center gap-1.5"
                                >
                                    <GraduationCap className="w-4 h-4" />
                                    BNCC & Conteúdos ({matchedBncc.length + (project.contentIds?.length || 0)})
                                </TabsTrigger>
                                <TabsTrigger
                                    value="schedule"
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent px-2 py-3 text-xs sm:text-sm font-bold text-slate-500 data-[state=active]:text-indigo-600 transition-all flex items-center gap-1.5"
                                >
                                    <Calendar className="w-4 h-4" />
                                    Aulas ({projectSessions.length})
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    {/* Scrollable Content Body */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* TAB 1: VISÃO GERAL */}
                        {activeTab === "overview" && (
                            <div className="space-y-6">
                                {/* Guiding Question Box */}
                                {project.guidingQuestion && (
                                    <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3 shadow-xs">
                                        <HelpCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 mb-1">
                                                Pergunta Norteadora
                                            </h4>
                                            <p className="text-sm sm:text-base font-semibold italic text-indigo-950">
                                                &ldquo;{project.guidingQuestion}&rdquo;
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Main Banner Image Preview */}
                                {project.imageUrl && (
                                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-[16/9] max-h-[320px] bg-slate-950 group cursor-pointer"
                                         onClick={() => setSelectedLightboxImage(project.imageUrl || null)}>
                                        {/* Blurred back */}
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={project.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover blur-md opacity-35" />
                                        {/* Main image */}
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={project.imageUrl} alt={project.title} className="relative w-full h-full object-contain mx-auto" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center pointer-events-none">
                                            <span className="opacity-0 group-hover:opacity-100 bg-black/80 text-white text-xs font-bold px-3.5 py-1.5 rounded-full backdrop-blur-xs flex items-center gap-1.5 shadow-lg transition-opacity">
                                                <Maximize2 className="w-3.5 h-3.5" /> Ampliar Banner
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Description */}
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Descrição do Projeto</h4>
                                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        {project.description || "Nenhuma descrição detalhada informada."}
                                    </p>
                                </div>

                                {/* Summary & Objectives */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {project.summary && (
                                        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1.5">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                                <Target className="w-3.5 h-3.5 text-indigo-600" />
                                                Resumo Executivo
                                            </h4>
                                            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                                                {project.summary}
                                            </p>
                                        </div>
                                    )}

                                    {project.objectives && (
                                        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1.5">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                                                Objetivos de Aprendizagem
                                            </h4>
                                            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                                                {project.objectives}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Participants */}
                                <div className="space-y-2 pt-2">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                        <Users className="w-3.5 h-3.5 text-indigo-600" />
                                        Participantes e Turmas
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {studentNames.length > 0 ? (
                                            studentNames.map((name, i) => (
                                                <Badge key={i} variant="secondary" className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1">
                                                    {name}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-xs text-slate-500 italic">Todos os alunos da(s) turma(s): {classNames}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: GALERIA DE FOTOS */}
                        {activeTab === "photos" && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-bold text-slate-800">
                                        Acervo Fotográfico do Projeto ({allPhotos.length} fotos)
                                    </h4>
                                    <span className="text-xs text-slate-500">
                                        Fotos carregadas no Tronco de Recados
                                    </span>
                                </div>

                                {allPhotos.length === 0 ? (
                                    <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                                        <Images className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                        <p className="text-sm text-slate-500 font-medium">Nenhuma foto anexada a este projeto.</p>
                                        <p className="text-xs text-slate-400 mt-1">Edite o projeto para adicionar banner e fotos complementares.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {allPhotos.map((photo, index) => (
                                            <div
                                                key={index}
                                                onClick={() => setSelectedLightboxImage(photo)}
                                                className="relative aspect-video sm:aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 group cursor-pointer shadow-xs hover:shadow-md transition-all"
                                            >
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={photo} alt="" className="absolute inset-0 w-full h-full object-cover blur-sm opacity-40" />
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={photo} alt={`Foto ${index + 1}`} className="relative w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                                    <span className="opacity-0 group-hover:opacity-100 bg-black/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-xs flex items-center gap-1 shadow-lg transition-opacity">
                                                        <Maximize2 className="w-3 h-3" /> Ampliar
                                                    </span>
                                                </div>
                                                <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                                                    {index === 0 && project.imageUrl ? "Banner Principal" : `Foto ${index + (project.imageUrl ? 0 : 1)}`}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB 3: BNCC & COMPETÊNCIAS */}
                        {activeTab === "skills" && (
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                                        <GraduationCap className="w-4 h-4 text-indigo-600" />
                                        Habilidades BNCC Vinculadas ({matchedBncc.length})
                                    </h4>
                                    {matchedBncc.length === 0 ? (
                                        <p className="text-xs text-slate-500 italic">Nenhuma habilidade BNCC selecionada neste projeto.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {matchedBncc.map((item) => (
                                                <div key={item.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-start gap-3 text-xs">
                                                    <Badge className="bg-indigo-600 text-white font-mono text-[10px] shrink-0">
                                                        {item.code || "BNCC"}
                                                    </Badge>
                                                    <div>
                                                        <p className="font-bold text-slate-800">{item.name}</p>
                                                        {item.description && <p className="text-slate-600 mt-0.5">{item.description}</p>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {project.contentIds && project.contentIds.length > 0 && (
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                                            <BookOpen className="w-4 h-4 text-purple-600" />
                                            Conteúdos e Competências Ibirá ({project.contentIds.length})
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {project.contentIds.map((cid, i) => (
                                                <Badge key={i} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs px-2.5 py-1">
                                                    {cid}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB 4: CRONOGRAMA DE AULAS */}
                        {activeTab === "schedule" && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-bold text-slate-800">
                                        Sessões de Aulas Agendadas ({projectSessions.length})
                                    </h4>
                                </div>

                                {projectSessions.length === 0 ? (
                                    <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                                        <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                        <p className="text-sm text-slate-500 font-medium">Nenhuma aula agendada ainda para este projeto.</p>
                                        <p className="text-xs text-slate-400 mt-1">Edite o projeto para planejar e adicionar sessões na agenda escolar.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2.5">
                                        {projectSessions.map((session, index) => (
                                            <div key={session.id || index} className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 shadow-xs flex items-center justify-between gap-4 transition-all">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs shrink-0">
                                                        #{index + 1}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-slate-800 text-sm truncate">{session.title}</p>
                                                        {session.description && (
                                                            <p className="text-xs text-slate-500 truncate mt-0.5">{session.description}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 shrink-0 text-xs text-slate-600 font-medium">
                                                    <span className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                                                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                        {session.date ? format(new Date(session.date), "dd/MM/yyyy") : "--"}
                                                    </span>
                                                    {session.time && (
                                                        <span className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                                                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                            {session.time} {session.endTime ? `- ${session.endTime}` : ""}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <DialogFooter className="p-4 sm:p-6 bg-slate-50 border-t flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="w-full sm:w-auto text-slate-600 border-slate-300 hover:bg-slate-100"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Cancelar e Sair da Visualização
                        </Button>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Button
                                variant="default"
                                onClick={() => {
                                    onOpenChange(false);
                                    router.push(`/projetos/novo?edit=${project.id}`);
                                }}
                                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2 shadow-sm"
                            >
                                <Pencil className="w-4 h-4" />
                                Editar Projeto
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal Lightbox Foto Ampliada */}
            <Dialog open={!!selectedLightboxImage} onOpenChange={(open) => !open && setSelectedLightboxImage(null)}>
                <DialogContent className="max-w-4xl bg-black/95 p-3 border-slate-800 text-white">
                    <div className="relative aspect-video w-full flex items-center justify-center overflow-hidden rounded-xl bg-black">
                        {selectedLightboxImage && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={selectedLightboxImage}
                                alt="Foto Ampliada"
                                className="max-h-[80vh] w-auto max-w-full object-contain rounded-lg shadow-2xl"
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

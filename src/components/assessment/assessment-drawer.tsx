"use client";

import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TreeRatingPicker } from "@/components/assessment/tree-rating-picker";
import { getClasses } from "@/services/school-class.service";
import { SchoolClass } from "@/types/school-class";
import { Assessment } from "@/types/assessment";
import { AssessmentAttachment } from "@/types/assessment-attachment";
import { AssessmentService } from "@/services/assessment.service";
import { Camera, FileUp, X, Users, User, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { getProjects } from "@/services/project.service";
import { Project } from "@/types/project";
import { Student } from "@/types/student";
import { getSchedules } from "@/services/schedule.service";
import { ScheduleItem } from "@/types/schedule";

interface AssessmentDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    students: Student[];
    // Context — at least one recommended
    sessionId?: string;
    routineId?: string;
    knowledgeNodeId?: string;
    projectId?: string;
    // Pre-fill
    defaultClassId?: string;
    defaultStudentId?: string;
    // Label shown in header
    contextLabel?: string;
    contextDescription?: string;
    // Edit mode
    assessmentId?: string;
    initialRating?: 1 | 2 | 3 | 4 | 5;
    initialObservations?: string;
    initialAttachments?: AssessmentAttachment[];
    onSaved?: () => void;
}

export function AssessmentDrawer({
    open,
    onOpenChange,
    students,
    sessionId: propSessionId,
    routineId: propRoutineId,
    knowledgeNodeId: propKnowledgeNodeId,
    projectId: propProjectId,
    defaultClassId,
    defaultStudentId,
    contextLabel,
    contextDescription,
    assessmentId,
    initialRating,
    initialObservations,
    initialAttachments,
    onSaved,
}: AssessmentDrawerProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const { data: session } = useSession();
    const currentUser = session?.user as any;

    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [isLoadingClasses, setIsLoadingClasses] = useState(true);
    const [isLoadingAssessments, setIsLoadingAssessments] = useState(true);
    const [projects, setProjects] = useState<Project[]>([]);
    const [schedule, setSchedule] = useState<ScheduleItem[]>([]);

    const [activeAssessmentId, setActiveAssessmentId] = useState<string | undefined>(assessmentId);

    // Context State
    const [contextType, setContextType] = useState<"project" | "routine">(propRoutineId ? "routine" : "project");
    const [selectedProjectId, setSelectedProjectId] = useState(propProjectId || "");
    const [selectedSessionId, setSelectedSessionId] = useState(propSessionId || "");
    const [selectedRoutineId, setSelectedRoutineId] = useState(propRoutineId || "");

    // Scope & Basic Info
    const [scope, setScope] = useState<"class" | "student">(defaultStudentId ? "student" : "class");
    const [classId, setClassId] = useState(defaultClassId || "");
    const [studentId, setStudentId] = useState(defaultStudentId || "");
    const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5 | undefined>(initialRating);
    const [observations, setObservations] = useState(initialObservations || "");
    const [attachments, setAttachments] = useState<AssessmentAttachment[]>(initialAttachments || []);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const studentsInClass = students.filter(s => s.classId === classId);
    const sessionsForProject = schedule.filter(s => s.projectId === selectedProjectId);

    // Filter routines
    const routines = schedule.filter(s => !s.projectId && (s.type === "activity" || s.type === "meal" || s.type === "care"));

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (attachments.length + files.length > 3) {
            toast.error("Máximo de 3 arquivos por avaliação.");
            return;
        }

        const toastId = toast.loading("Processando arquivos...");

        try {
            for (const file of files) {
                if (file.type.startsWith("image/")) {
                    await new Promise((resolve) => {
                        const img = new Image();
                        const objUrl = URL.createObjectURL(file);
                        
                        img.onload = () => {
                            URL.revokeObjectURL(objUrl);
                            const canvas = document.createElement("canvas");
                            const MAX_WIDTH = 1200;
                            const MAX_HEIGHT = 1200;
                            let width = img.width;
                            let height = img.height;

                            if (width > height) {
                                if (width > MAX_WIDTH) {
                                    height *= MAX_WIDTH / width;
                                    width = MAX_WIDTH;
                                }
                            } else {
                                if (height > MAX_HEIGHT) {
                                    width *= MAX_HEIGHT / height;
                                    height = MAX_HEIGHT;
                                }
                            }
                            canvas.width = width;
                            canvas.height = height;
                            
                            const ctx = canvas.getContext("2d");
                            ctx?.drawImage(img, 0, 0, width, height);
                            
                            const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.6);
                            
                            const att: AssessmentAttachment = {
                                id: crypto.randomUUID(),
                                type: "photo",
                                url: compressedDataUrl,
                                name: file.name,
                                capturedAt: new Date().toISOString(),
                            };
                            setAttachments(prev => [...prev, att]);
                            resolve(true);
                        };
                        img.src = objUrl;
                    });
                } else {
                    await new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onload = ev => {
                            const url = ev.target?.result as string;
                            const att: AssessmentAttachment = {
                                id: crypto.randomUUID(),
                                type: "document",
                                url,
                                name: file.name,
                                capturedAt: new Date().toISOString(),
                            };
                            setAttachments(prev => [...prev, att]);
                            resolve(true);
                        };
                        reader.readAsDataURL(file);
                    });
                }
            }
            toast.success("Arquivos anexados", { id: toastId });
        } catch (error) {
            toast.error("Erro ao ler arquivos", { id: toastId });
        }
        
        e.target.value = "";
    };

    const handleClose = () => {
        setRating(undefined);
        setObservations("");
        setAttachments([]);
        if (!propProjectId) setSelectedProjectId("");
        if (!propSessionId) setSelectedSessionId("");
        if (!propRoutineId) setSelectedRoutineId("");
        onOpenChange(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (activeAssessmentId) {
                await AssessmentService.update(activeAssessmentId, {
                    rating,
                    observations,
                    attachments,
                });
            } else {
                const assessment: Partial<Assessment> = {
                    sessionId: contextType === "project" ? (selectedSessionId || undefined) : undefined,
                    routineId: contextType === "routine" ? (selectedRoutineId || undefined) : undefined,
                    knowledgeNodeId: propKnowledgeNodeId,
                    projectId: contextType === "project" ? (selectedProjectId || undefined) : undefined,
                    scope,
                    classId: scope === "class" ? classId : undefined,
                    studentId: scope === "student" ? studentId : undefined,
                    rating,
                    observations,
                    attachments,
                };
                await AssessmentService.create(assessment);
            }
            await fetchAssessments();
            onSaved?.();
            toast.success(activeAssessmentId ? "Avaliação atualizada com sucesso" : "Avaliação salva com sucesso");
            handleClose();
        } catch (error) {
            toast.error("Erro ao salvar avaliação");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = () => {
        if (activeAssessmentId) {
            setIsConfirmDeleteOpen(true);
        }
    };

    const confirmDeleteAction = async () => {
        if (activeAssessmentId) {
            try {
                await AssessmentService.delete(activeAssessmentId);
                await fetchAssessments();
                onSaved?.();
                toast.success("Avaliação removida com sucesso");
                handleClose();
            } catch (error) {
                toast.error("Erro ao remover avaliação");
            }
        }
    };

    async function fetchAssessments() {
        setIsLoadingAssessments(true);
        try {
            const data = await AssessmentService.getAll();
            setAssessments(data);
        } catch(error) {
            console.error("Erro ao carregar avaliações", error);
        } finally {
            setIsLoadingAssessments(false);
        }
    }

    const hasContext = !!propKnowledgeNodeId || (contextType === "project"
        ? (!!selectedProjectId && !!selectedSessionId)
        : !!selectedRoutineId);

    // If we have a knowledge node (skill/content) and a project, we can save even without a session
    const canSave = (observations.trim().length > 0 || rating !== undefined) && (hasContext || (!!propKnowledgeNodeId && !!selectedProjectId));
    const isFixedContext = !!propSessionId || !!propRoutineId || !!propKnowledgeNodeId;

    async function fetchClassesAndProjects() {
        try {
            const [classesData, projectsData, schedulesData] = await Promise.all([
                getClasses(),
                getProjects(),
                getSchedules()
            ]);
            setClasses(classesData);
            if (projectsData) {
                setProjects(projectsData);
            }
            if (schedulesData) {
                setSchedule(schedulesData);
            }
            if (!classId && !defaultClassId && classesData.length > 0) {
                setClassId(classesData[0].id);
            }
        } catch (error) {
            console.error("Erro ao carregar dados complementares", error);
        } finally {
            setIsLoadingClasses(false);
        }
    }

    useEffect(() => {
        if (open) {
            fetchClassesAndProjects();
            fetchAssessments();
        }
    }, [open, defaultClassId, classId]);

    useEffect(() => {
        if (open) {
            if (defaultStudentId) setStudentId(defaultStudentId);
            if (defaultClassId) setClassId(defaultClassId);
            if (propProjectId) setSelectedProjectId(propProjectId);
            if (propSessionId) setSelectedSessionId(propSessionId);
            if (propRoutineId) setSelectedRoutineId(propRoutineId);
            if (defaultStudentId) setScope("student");
            else setScope("class");
        }
    }, [open, defaultStudentId, defaultClassId, propProjectId, propSessionId, propRoutineId]);

    // Hydrate existing assessments based on current context
    useEffect(() => {
        if (!open) return;

        if (assessmentId) {
            setActiveAssessmentId(assessmentId);
            setRating(initialRating);
            setObservations(initialObservations || "");
            setAttachments(initialAttachments || []);
            return;
        }

        const found = assessments.find(a => {
            const matchScope = a.scope === scope;
            const matchClass = scope === "class" ? a.classId === classId && !a.studentId : a.studentId === studentId;
            const matchNode = propKnowledgeNodeId ? a.knowledgeNodeId === propKnowledgeNodeId : !a.knowledgeNodeId;

            let matchContext = true;
            if (contextType === "project") {
                matchContext = a.projectId === (selectedProjectId || undefined) &&
                    a.sessionId === (selectedSessionId || undefined);
            } else {
                matchContext = a.routineId === (selectedRoutineId || undefined);
            }

            return matchScope && matchClass && matchNode && matchContext;
        });

        if (found) {
            setActiveAssessmentId(found.id);
            setRating(found.rating);
            setObservations(found.observations || "");
            setAttachments(found.attachments || []);
        } else {
            setActiveAssessmentId(undefined);
            setRating(undefined);
            setObservations("");
            setAttachments([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, assessmentId, scope, classId, studentId, propKnowledgeNodeId, contextType, selectedProjectId, selectedSessionId, selectedRoutineId]);

    useEffect(() => {
        if (!isFixedContext && contextType === "routine" && routines.length > 0 && !selectedRoutineId) {
            // Optional: pre-select first routine
        }
    }, [contextType, routines, selectedRoutineId, isFixedContext]);

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto flex flex-col gap-0 p-0">
                <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
                    <DialogTitle className="text-green-900 flex items-center gap-2">
                        <span className="text-xl">🌱</span>
                        {activeAssessmentId ? "Editar Avaliação" : "Nova Avaliação"}
                    </DialogTitle>
                    {contextLabel && (
                        <p className="text-sm text-green-700 font-bold">{contextLabel}</p>
                    )}
                    {contextDescription && (
                        <p className="text-sm text-green-600 mt-1 leading-relaxed">{contextDescription}</p>
                    )}
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                    {isLoadingClasses || isLoadingAssessments ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3 h-full min-h-[200px]">
                            <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
                            <p className="text-sm font-medium text-slate-500">Carregando dados da avaliação...</p>
                        </div>
                    ) : (
                        <>
                            {!isFixedContext && (
                        <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <Label className="text-sm font-bold text-slate-700">Contexto da Avaliação</Label>
                            <div className="flex bg-white rounded-lg p-1 border shadow-sm">
                                <button
                                    onClick={() => setContextType("project")}
                                    className={cn(
                                        "flex-1 py-1.5 text-xs font-medium rounded-md transition-all",
                                        contextType === "project" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
                                    )}
                                >
                                    Projeto
                                </button>
                                <button
                                    onClick={() => setContextType("routine")}
                                    className={cn(
                                        "flex-1 py-1.5 text-xs font-medium rounded-md transition-all",
                                        contextType === "routine" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
                                    )}
                                >
                                    Rotina
                                </button>
                            </div>
                            {contextType === "project" ? (
                                <div className="space-y-2">
                                    <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                                        <SelectTrigger className="bg-white"><SelectValue placeholder="Selecione o Projeto" /></SelectTrigger>
                                        <SelectContent>
                                            {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <Select value={selectedSessionId} onValueChange={setSelectedSessionId} disabled={!selectedProjectId}>
                                        <SelectTrigger className="bg-white"><SelectValue placeholder="Selecione a Sessão" /></SelectTrigger>
                                        <SelectContent>
                                            {sessionsForProject.map(s => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            ) : (
                                <Select value={selectedRoutineId} onValueChange={setSelectedRoutineId}>
                                    <SelectTrigger className="bg-white"><SelectValue placeholder="Selecione a Atividade da Rotina" /></SelectTrigger>
                                    <SelectContent>
                                        {routines.map(r => <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                    )}

                    <div className="space-y-3">
                        <Label className="text-sm font-semibold text-slate-700">Para quem é esta avaliação?</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setScope("class")}
                                disabled={!!activeAssessmentId && !!assessmentId}
                                className={cn(
                                    "flex items-center gap-2 border rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                                    scope === "class"
                                        ? "border-green-500 bg-green-50 text-green-700"
                                        : "border-slate-200 text-slate-600 hover:border-slate-300",
                                    !!assessmentId && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                <Users className="w-4 h-4" />
                                Turma toda
                            </button>
                            <button
                                type="button"
                                onClick={() => setScope("student")}
                                disabled={!!activeAssessmentId && !!assessmentId}
                                className={cn(
                                    "flex items-center gap-2 border rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                                    scope === "student"
                                        ? "border-green-500 bg-green-50 text-green-700"
                                        : "border-slate-200 text-slate-600 hover:border-slate-300",
                                    !!assessmentId && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                <User className="w-4 h-4" />
                                Aluno específico
                            </button>
                        </div>

                        {scope === "class" && (
                            <Select value={classId} onValueChange={setClassId} disabled={!!assessmentId}>
                                <SelectTrigger><SelectValue placeholder="Selecione a turma" /></SelectTrigger>
                                <SelectContent>
                                    {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        )}

                        {scope === "student" && (
                            <div className="space-y-2">
                                <Select value={classId} onValueChange={v => { setClassId(v); setStudentId(""); }} disabled={!!assessmentId}>
                                    <SelectTrigger><SelectValue placeholder="Turma" /></SelectTrigger>
                                    <SelectContent>
                                        {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Select value={studentId} onValueChange={setStudentId} disabled={!!assessmentId}>
                                    <SelectTrigger><SelectValue placeholder="Selecione o aluno" /></SelectTrigger>
                                    <SelectContent>
                                        {studentsInClass.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <Label className="text-sm font-semibold text-slate-700">Nível de desenvolvimento</Label>
                        <div className="bg-green-50/60 rounded-xl p-4 flex justify-center">
                            <TreeRatingPicker value={rating} onChange={setRating} size="lg" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Observações</Label>
                        <Textarea
                            placeholder="Descreva o que você observou nesta atividade..."
                            value={observations}
                            onChange={e => setObservations(e.target.value)}
                            rows={4}
                            className="resize-none"
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold text-slate-700">Evidências</Label>
                            <span className="text-xs text-slate-400">{attachments.length}/3 arquivos</span>
                        </div>
                        {attachments.length > 0 && (
                            <div className="grid grid-cols-3 gap-2">
                                {attachments.map(att => (
                                    <div key={att.id} className="relative group rounded-lg overflow-hidden border aspect-square bg-slate-100">
                                        {att.type === "photo" ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={att.url} alt={att.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2">
                                                <FileUp className="w-6 h-6 text-slate-400" />
                                                <span className="text-[10px] text-slate-500 text-center truncate w-full">{att.name}</span>
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => setAttachments(prev => prev.filter(a => a.id !== att.id))}
                                            className="absolute top-1 right-1 p-0.5 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3 h-3 text-white" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,.pdf"
                            multiple
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        {attachments.length < 3 && (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full border-2 border-dashed border-slate-200 rounded-xl py-3 px-4 flex items-center justify-center gap-2 text-sm text-slate-500 hover:border-green-300 hover:text-green-600 hover:bg-green-50 transition-all"
                            >
                                <Camera className="w-4 h-4" />
                                Adicionar foto ou documento
                            </button>
                        )}
                    </div>
                        </>
                    )}
                </div>

                <div className="px-6 py-4 border-t bg-white flex gap-3">
                    {activeAssessmentId && (
                        <Button
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                            onClick={handleDelete}
                            title="Zerar Avaliação"
                        >
                            <Trash2 className="w-5 h-5" />
                        </Button>
                    )}
                    <Button variant="outline" className="flex-1" onClick={handleClose} disabled={isSaving}>
                        Cancelar
                    </Button>
                    <Button
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        disabled={!canSave || isSaving}
                        onClick={handleSave}
                    >
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar {activeAssessmentId ? "Alterações" : "Avaliação"}
                    </Button>
                </div>
            </DialogContent>

            <ConfirmDialog
                open={isConfirmDeleteOpen}
                onOpenChange={setIsConfirmDeleteOpen}
                title="Excluir Avaliação"
                description="Tem certeza que deseja apagar (zerar) esta avaliação? Esta ação não pode ser desfeita."
                onConfirm={confirmDeleteAction}
            />
        </Dialog>
    );
}

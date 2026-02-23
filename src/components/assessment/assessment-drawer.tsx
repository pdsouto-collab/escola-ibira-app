"use client";

import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TreeRatingPicker } from "@/components/assessment/tree-rating-picker";
import { useAppStore } from "@/lib/store";
import { Assessment, AssessmentAttachment } from "@/lib/data";
import { Camera, FileUp, X, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface AssessmentDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
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
}

export function AssessmentDrawer({
    open,
    onOpenChange,
    sessionId: propSessionId,
    routineId: propRoutineId,
    knowledgeNodeId: propKnowledgeNodeId,
    projectId: propProjectId,
    defaultClassId,
    defaultStudentId,
    contextLabel,
}: AssessmentDrawerProps) {
    const { students, classes, projects, schedule, addAssessment, currentUser } = useAppStore();

    // Context State
    const [contextType, setContextType] = useState<"project" | "routine">(propRoutineId ? "routine" : "project");
    const [selectedProjectId, setSelectedProjectId] = useState(propProjectId || "");
    const [selectedSessionId, setSelectedSessionId] = useState(propSessionId || "");
    const [selectedRoutineId, setSelectedRoutineId] = useState(propRoutineId || "");

    // Scope & Basic Info
    const [scope, setScope] = useState<"class" | "student">(defaultStudentId ? "student" : "class");
    const [classId, setClassId] = useState(defaultClassId || classes[0]?.id || "");
    const [studentId, setStudentId] = useState(defaultStudentId || "");
    const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5 | undefined>(undefined);
    const [observations, setObservations] = useState("");
    const [attachments, setAttachments] = useState<AssessmentAttachment[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const studentsInClass = students.filter(s => s.classId === classId);
    const sessionsForProject = schedule.filter(s => s.projectId === selectedProjectId);

    // Filter routines (using schedule for now or a hardcoded list if available in store)
    // For this context, we'll suggest items that follow the routine pattern (activity/meal/care)
    const routines = schedule.filter(s => !s.projectId && (s.type === "activity" || s.type === "meal" || s.type === "care"));

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // ... (existing file handling code)
        const files = Array.from(e.target.files || []);
        if (attachments.length + files.length > 3) {
            alert("Máximo de 3 arquivos por avaliação.");
            return;
        }
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = ev => {
                const url = ev.target?.result as string;
                const att: AssessmentAttachment = {
                    id: crypto.randomUUID(),
                    type: file.type.startsWith("image/") ? "photo" : "document",
                    url,
                    name: file.name,
                    capturedAt: new Date().toISOString(),
                };
                setAttachments(prev => [...prev, att]);
            };
            reader.readAsDataURL(file);
        });
        e.target.value = "";
    };

    const handleSave = () => {
        const assessment: Assessment = {
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
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
            ...(currentUser ? { teacherId: currentUser.id } : {}),
        };
        addAssessment(assessment);
        handleClose();
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

    // Validation: Require rating/obs AND a valid context (session or routine)
    const hasContext = contextType === "project"
        ? (selectedProjectId && selectedSessionId)
        : selectedRoutineId;

    const canSave = (observations.trim().length > 0 || rating !== undefined) && hasContext;

    const isFixedContext = !!propSessionId || !!propRoutineId;

    useEffect(() => {
        if (!isFixedContext && contextType === "routine" && routines.length > 0 && !selectedRoutineId) {
            // Pre-select first routine if none selected
            // setSelectedRoutineId(routines[0].id); // Optional: leave empty for explicit choice
        }
    }, [contextType, routines, selectedRoutineId, isFixedContext]);

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto flex flex-col gap-0 p-0">
                {/* Header */}
                <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
                    <DialogTitle className="text-green-900 flex items-center gap-2">
                        <span className="text-xl">🌱</span>
                        Avaliação
                    </DialogTitle>
                    {contextLabel && (
                        <p className="text-sm text-green-700 font-medium">{contextLabel}</p>
                    )}
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

                    {/* Context Selection (Only if not fixed) */}
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

                    {/* Scope selector */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold text-slate-700">Para quem é esta avaliação?</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setScope("class")}
                                className={cn(
                                    "flex items-center gap-2 border rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                                    scope === "class"
                                        ? "border-green-500 bg-green-50 text-green-700"
                                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                                )}
                            >
                                <Users className="w-4 h-4" />
                                Turma toda
                            </button>
                            <button
                                type="button"
                                onClick={() => setScope("student")}
                                className={cn(
                                    "flex items-center gap-2 border rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                                    scope === "student"
                                        ? "border-green-500 bg-green-50 text-green-700"
                                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                                )}
                            >
                                <User className="w-4 h-4" />
                                Aluno específico
                            </button>
                        </div>

                        {scope === "class" && (
                            <Select value={classId} onValueChange={setClassId}>
                                <SelectTrigger><SelectValue placeholder="Selecione a turma" /></SelectTrigger>
                                <SelectContent>
                                    {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        )}

                        {scope === "student" && (
                            <div className="space-y-2">
                                <Select value={classId} onValueChange={v => { setClassId(v); setStudentId(""); }}>
                                    <SelectTrigger><SelectValue placeholder="Turma" /></SelectTrigger>
                                    <SelectContent>
                                        {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Select value={studentId} onValueChange={setStudentId}>
                                    <SelectTrigger><SelectValue placeholder="Selecione o aluno" /></SelectTrigger>
                                    <SelectContent>
                                        {studentsInClass.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    {/* Tree rating */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold text-slate-700">Nível de desenvolvimento</Label>
                        <div className="bg-green-50/60 rounded-xl p-4 flex justify-center">
                            <TreeRatingPicker value={rating} onChange={setRating} size="lg" />
                        </div>
                    </div>

                    {/* Observations */}
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

                    {/* Attachments */}
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
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t bg-white flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={handleClose}>
                        Cancelar
                    </Button>
                    <Button
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        disabled={!canSave}
                        onClick={handleSave}
                    >
                        Salvar Avaliação
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

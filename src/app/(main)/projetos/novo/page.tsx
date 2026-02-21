"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check, ChevronLeft, Plus, Search, Calendar, Users, Target, BookOpen, Trash2, PartyPopper } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { Project, ScheduleItem } from "@/lib/data";
import { cn } from "@/lib/utils";
import Image from "next/image";

function NewProjectWizardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get("edit");

    // Store
    const {
        addProject,
        updateProject,
        projects,
        classes,
        schedule,
        updateSchedule,
        libraryItems,
        students,
        users
    } = useAppStore();

    const [isEditMode, setIsEditMode] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

    // Local form state
    const [formData, setFormData] = useState({
        isTemplate: "start_immediately",
        title: "",
        type: "Project",
        guidingQuestion: "",
        summary: "",
        objectives: "",
        finalProduct: "None",
        description: "",
        classes: [] as string[],
        students: [] as string[],
        teachers: [] as string[],
        bnccSkills: [] as string[],
        customContent: [] as string[],
        projectSchedule: [] as Partial<ScheduleItem>[]
    });

    const [newSession, setNewSession] = useState<{ date: Date, time: string, endTime: string, description: string }>({
        date: new Date(),
        time: "09:00",
        endTime: "10:00",
        description: ""
    });

    // SubGroups derived from libraryItems
    const subjects = Array.from(new Set(libraryItems.map(i => i.subGroup || "Geral")));

    useEffect(() => {
        if (editId && projects.length > 0) {
            const projectToEdit = projects.find(p => p.id === editId);
            if (projectToEdit) {
                setIsEditMode(true);
                const projectItems = schedule.filter(s => s.projectId === editId);
                setFormData({
                    isTemplate: projectToEdit.status === "planning" ? "create_template" : "start_immediately",
                    title: projectToEdit.title,
                    type: projectToEdit.type || "Project",
                    guidingQuestion: projectToEdit.guidingQuestion || "",
                    summary: projectToEdit.summary || "",
                    objectives: projectToEdit.objectives || "",
                    finalProduct: projectToEdit.finalProduct || "None",
                    description: projectToEdit.description,
                    classes: projectToEdit.classes || [],
                    students: projectToEdit.students || [],
                    teachers: [],
                    bnccSkills: projectToEdit.bnccSkillIds || [],
                    customContent: projectToEdit.contentIds || [],
                    projectSchedule: projectItems.map(item => ({ ...item }))
                });
            }
        }
    }, [editId, projects, schedule]);

    const handleSaveAndComplete = () => {
        const projectId = isEditMode ? (editId as string) : Math.random().toString(36).substr(2, 9);
        const newStatus = formData.isTemplate === "create_template" ? "planning" : "active";

        const projectData: Project = {
            id: projectId,
            title: formData.title,
            description: formData.description,
            status: newStatus,
            startDate: new Date().toISOString(),
            guidingQuestion: formData.guidingQuestion,
            type: formData.type,
            summary: formData.summary,
            objectives: formData.objectives,
            finalProduct: formData.finalProduct,
            tags: [],
            bnccSkillIds: formData.bnccSkills,
            contentIds: formData.customContent,
            students: formData.students,
            classes: formData.classes
        };

        if (isEditMode) {
            updateProject(projectId, projectData);
        } else {
            addProject(projectData);
        }

        if (formData.projectSchedule.length > 0) {
            updateSchedule(projectId, formData.projectSchedule as ScheduleItem[]);
        }

        setCurrentStep(5);
    };

    const steps = [
        { id: 1, label: "Detalhes do Projeto" },
        { id: 2, label: "Participantes" },
        { id: 3, label: "Competências" },
        { id: 4, label: "Planejamento" }
    ];

    const toggleSkill = (id: string, isSkill: boolean) => {
        if (isSkill) {
            setFormData(prev => ({
                ...prev,
                bnccSkills: prev.bnccSkills.includes(id) ? prev.bnccSkills.filter(s => s !== id) : [...prev.bnccSkills, id]
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                customContent: prev.customContent.includes(id) ? prev.customContent.filter(c => c !== id) : [...prev.customContent, id]
            }));
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50/50">
            {/* Header */}
            {currentStep < 5 && (
                <div className="bg-white border-b px-8 py-4 flex items-center justify-between flex-shrink-0 sticky top-0 z-10 shadow-sm">
                    <div className="flex items-center gap-8">
                        {steps.map((step) => {
                            const isCompleted = step.id < currentStep;
                            const isActive = step.id === currentStep;
                            return (
                                <div key={step.id} className={cn("flex items-center gap-2 text-sm font-semibold transition-colors",
                                    isActive ? "text-indigo-600 border-b-2 border-indigo-600 pb-4 mb-[-17px]" :
                                        isCompleted ? "text-slate-700" : "text-slate-400"
                                )}>
                                    {isCompleted ? <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center"><Check className="w-3 h-3" /></div> : <span className={cn("w-5 h-5 rounded-full flex items-center justify-center text-xs border", isActive ? "border-indigo-600 bg-indigo-50" : "border-slate-300")}>{step.id}</span>}
                                    {step.label}
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex gap-2">
                        <Link href="/projetos">
                            <Button variant="ghost" className="text-slate-500 hover:text-slate-800">Cancelar</Button>
                        </Link>
                    </div>
                </div>
            )}

            <div className={cn("flex-1 overflow-y-auto p-4 md:p-8", currentStep === 5 ? "flex items-center justify-center bg-white" : "")}>
                <div className={cn("mx-auto bg-white rounded-2xl border", currentStep === 3 ? "w-full max-w-7xl" : currentStep === 5 ? "border-none shadow-none max-w-xl" : "max-w-4xl p-8 shadow-sm min-h-[500px]")}>

                    {/* STEP 1 */}
                    {currentStep === 1 && (
                        <div className="animate-in fade-in duration-300">
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Detalhes do Projeto</h2>
                            <p className="text-slate-500 mb-8">Comece dando um nome ao seu projeto e definindo seus elementos principais.</p>

                            <div className="space-y-8">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Modo do Projeto</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, isTemplate: "start_immediately" })}
                                            className={cn("flex items-start gap-4 p-5 rounded-xl border-2 text-left transition-all", formData.isTemplate === "start_immediately" ? "border-indigo-600 bg-indigo-50/50 shadow-sm" : "border-slate-200 hover:border-indigo-200")}
                                        >
                                            <div className={cn("mt-1 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center", formData.isTemplate === "start_immediately" ? "border-indigo-600" : "border-slate-300")}>
                                                {formData.isTemplate === "start_immediately" && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-base mb-1">Iniciar projeto imediatamente</p>
                                                <p className="text-sm text-slate-500">Escolha esta opção para adicionar participantes e começar agora.</p>
                                            </div>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, isTemplate: "create_template" })}
                                            className={cn("flex items-start gap-4 p-5 rounded-xl border-2 text-left transition-all", formData.isTemplate === "create_template" ? "border-indigo-600 bg-indigo-50/50 shadow-sm" : "border-slate-200 hover:border-indigo-200")}
                                        >
                                            <div className={cn("mt-1 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center", formData.isTemplate === "create_template" ? "border-indigo-600" : "border-slate-300")}>
                                                {formData.isTemplate === "create_template" && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-base mb-1">Criar um modelo para depois</p>
                                                <p className="text-sm text-slate-500">Salve essa configuração para reutilizar depois.</p>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <Label className="font-semibold text-slate-700">Título do Projeto *</Label>
                                        <Input className="mt-2" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                                    </div>
                                    <div>
                                        <Label className="font-semibold text-slate-700">Tipo *</Label>
                                        <Select value={formData.type} onValueChange={v => setFormData({ ...formData, type: v })}>
                                            <SelectTrigger className="mt-2 text-slate-700"><SelectValue /></SelectTrigger>
                                            <SelectContent><SelectItem value="Project">Projeto</SelectItem><SelectItem value="Workshop">Oficina</SelectItem></SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div>
                                    <Label className="font-semibold text-slate-700">Pergunta Norteadora</Label>
                                    <Textarea className="mt-2 min-h-20" value={formData.guidingQuestion} onChange={e => setFormData({ ...formData, guidingQuestion: e.target.value })} placeholder="Qual é o tema principal deste projeto?" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <Label className="font-semibold text-slate-700">Resumo</Label>
                                        <Textarea className="mt-2 min-h-24" value={formData.summary} onChange={e => setFormData({ ...formData, summary: e.target.value })} />
                                    </div>
                                    <div>
                                        <Label className="font-semibold text-slate-700">Objetivos</Label>
                                        <Textarea className="mt-2 min-h-24" value={formData.objectives} onChange={e => setFormData({ ...formData, objectives: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <Label className="font-semibold text-slate-700">Produto Final</Label>
                                    <Select value={formData.finalProduct} onValueChange={v => setFormData({ ...formData, finalProduct: v })}>
                                        <SelectTrigger className="mt-2 text-slate-700"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="None">Nenhum</SelectItem>
                                            <SelectItem value="Arts and Crafts">Artes e Ofícios</SelectItem>
                                            <SelectItem value="Document">Documento</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex justify-end pt-8 mt-8 border-t">
                                <Button onClick={() => setCurrentStep(2)} disabled={!formData.title}>Continuar</Button>
                            </div>
                        </div>
                    )}

                    {/* STEP 2 */}
                    {currentStep === 2 && (
                        <div className="animate-in fade-in duration-300">
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Participantes</h2>
                            <p className="text-slate-500 mb-8">Selecione quais alunos farão parte deste projeto.</p>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between border-b pb-4">
                                    <h3 className="font-bold text-lg">Alunos</h3>
                                    <div className="flex gap-4">
                                        <Select><SelectTrigger className="w-32"><SelectValue placeholder="Ano" /></SelectTrigger><SelectContent><SelectItem value="2025">2025</SelectItem></SelectContent></Select>
                                        <Select><SelectTrigger className="w-40"><SelectValue placeholder="Turma" /></SelectTrigger><SelectContent><SelectItem value="all">Todas as Turmas</SelectItem></SelectContent></Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {students.slice(0, 12).map(student => (
                                        <button key={student.id} onClick={() => {
                                            const newStudents = formData.students.includes(student.id) ? formData.students.filter(id => id !== student.id) : [...formData.students, student.id];
                                            setFormData({ ...formData, students: newStudents });
                                        }} className={cn("flex items-center gap-3 p-3 border rounded-xl text-left transition-all", formData.students.includes(student.id) ? "border-indigo-600 bg-indigo-50/30" : "hover:bg-slate-50")}>
                                            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200">
                                                {student.photoUrl && <Image src={student.photoUrl} alt="" width={40} height={40} />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-sm line-clamp-1">{student.name}</p>
                                            </div>
                                            <div className={cn("w-5 h-5 rounded-full border flex flex-shrink-0 items-center justify-center", formData.students.includes(student.id) ? "bg-indigo-600 border-indigo-600" : "border-slate-300")}>
                                                {formData.students.includes(student.id) && <Check className="w-3 h-3 text-white" />}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-between pt-8 mt-8 border-t">
                                <Button variant="outline" onClick={() => setCurrentStep(1)}>Voltar</Button>
                                <Button onClick={() => setCurrentStep(3)}>Continuar</Button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3 */}
                    {currentStep === 3 && (
                        <div className="flex h-full min-h-[600px] animate-in fade-in duration-300">
                            {/* Main Selection Area */}
                            <div className="flex-1 p-8">
                                <h2 className="text-2xl font-bold text-slate-800 mb-2">Competências e Habilidades</h2>
                                <p className="text-slate-500 mb-8">Clique em uma disciplina para expandir e associar habilidades ao projeto.</p>

                                <Accordion type="multiple" className="space-y-4">
                                    {subjects.map(subject => {
                                        const subjectItems = libraryItems.filter(i => i.subGroup === subject);
                                        const selectedCount = subjectItems.filter(i => formData.bnccSkills.includes(i.id) || formData.customContent.includes(i.id)).length;
                                        return (
                                            <AccordionItem key={subject} value={subject} className="border rounded-xl bg-white px-4">
                                                <AccordionTrigger className="hover:no-underline py-4">
                                                    <div className="flex items-center justify-between w-full pr-4">
                                                        <span className="font-bold text-lg text-slate-800">{subject}</span>
                                                        {selectedCount > 0 && <Badge className="bg-indigo-100 text-indigo-700">{selectedCount} selecionados</Badge>}
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent className="pt-2 pb-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-2">
                                                        {subjectItems.map(item => {
                                                            const isSelected = formData.bnccSkills.includes(item.id) || formData.customContent.includes(item.id);
                                                            const isBncc = item.tags?.includes("BNCC");
                                                            return (
                                                                <div key={item.id} onClick={() => toggleSkill(item.id, isBncc || false)} className={cn("border-2 rounded-xl p-4 cursor-pointer transition-all relative overflow-hidden", isSelected ? "border-indigo-600 shadow-sm" : "border-slate-200 hover:border-indigo-300")}>
                                                                    <div className="flex justify-between items-start mb-2">
                                                                        <Badge variant="outline" className={cn("text-xs font-bold", isBncc ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-sky-50 text-sky-700 border-sky-200")}>{isBncc ? "BNCC" : "Personalizado"}</Badge>
                                                                        <div className={cn("w-5 h-5 rounded-full border flex items-center justify-center", isSelected ? "bg-indigo-600 border-indigo-600" : "border-slate-300")}>
                                                                            {isSelected && <Check className="w-3 h-3 text-white" />}
                                                                        </div>
                                                                    </div>
                                                                    <h4 className="font-bold text-slate-800 text-sm mb-1">{item.title}</h4>
                                                                    <p className="text-slate-500 text-xs line-clamp-3 leading-relaxed">{item.description}</p>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        );
                                    })}
                                </Accordion>
                            </div>

                            {/* Sidebar Summary */}
                            <div className="w-[320px] bg-slate-50 border-l p-6 flex flex-col h-full rounded-r-2xl">
                                <h3 className="font-bold text-lg text-slate-800 mb-6">Revisão</h3>
                                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                                    {(formData.bnccSkills.length === 0 && formData.customContent.length === 0) ? (
                                        <p className="text-sm text-slate-400 italic">Nenhuma habilidade selecionada ainda.</p>
                                    ) : (
                                        <>
                                            {formData.bnccSkills.map(id => {
                                                const skill = libraryItems.find(s => s.id === id);
                                                if (!skill) return null;
                                                return (
                                                    <div key={id} className="bg-white p-3 rounded-lg border shadow-sm relative pr-8">
                                                        <span className="text-xs font-bold text-emerald-600 block mb-1">{skill.title}</span>
                                                        <button onClick={() => toggleSkill(id, true)} className="absolute top-3 right-3 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                );
                                            })}
                                            {formData.customContent.map(id => {
                                                const content = libraryItems.find(s => s.id === id);
                                                if (!content) return null;
                                                return (
                                                    <div key={id} className="bg-white p-3 rounded-lg border shadow-sm relative pr-8">
                                                        <span className="text-xs font-bold text-sky-600 block mb-1">{content.title}</span>
                                                        <button onClick={() => toggleSkill(id, false)} className="absolute top-3 right-3 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                );
                                            })}
                                        </>
                                    )}
                                </div>
                                <div className="pt-6 border-t mt-4 flex gap-3">
                                    <Button variant="outline" className="flex-1" onClick={() => setCurrentStep(2)}>Voltar</Button>
                                    <Button className="flex-1" onClick={() => setCurrentStep(4)}>Continuar</Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 4 */}
                    {currentStep === 4 && (
                        <div className="animate-in fade-in duration-300">
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Planejamento de Aulas</h2>
                            <p className="text-slate-500 mb-8">Organize as sessões e atividades para este projeto.</p>

                            <div className="space-y-6">
                                {formData.projectSchedule.length === 0 ? (
                                    <div className="text-center p-10 border-2 border-dashed rounded-xl bg-slate-50">
                                        <p className="text-slate-500 font-medium">Nenhuma sessão agendada ainda.</p>
                                        <p className="text-sm text-slate-400 mt-1">Adicione sua primeira sessão abaixo.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4 relative before:absolute before:inset-0 before:left-6 before:w-0.5 before:-z-10 before:bg-slate-200">
                                        {formData.projectSchedule.map((item, idx) => (
                                            <div key={idx} className="flex gap-4">
                                                <div className="w-12 h-12 rounded-full border-4 border-white bg-indigo-100 flex items-center justify-center flex-shrink-0 text-indigo-600 font-bold">
                                                    {idx + 1}
                                                </div>
                                                <div className="bg-white border p-4 rounded-xl flex-1 shadow-sm relative">
                                                    <button onClick={() => setFormData({ ...formData, projectSchedule: formData.projectSchedule.filter((_, i) => i !== idx) })} className="absolute top-4 right-4 text-slate-400 hover:text-red-500">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                    <h4 className="font-bold text-slate-800 pr-8">{item.title}</h4>
                                                    <div className="flex gap-3 text-xs text-slate-500 mt-2 font-medium">
                                                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {item.date && typeof item.date === 'string' ? item.date.split('T')[0] : 'TBD'}</span>
                                                        <span className="flex items-center gap-1">⏱ {item.time} - {item.endTime}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="bg-indigo-50/50 p-6 rounded-xl border border-indigo-100 mt-8">
                                    <h4 className="font-bold text-sm text-indigo-800 mb-4 flex items-center gap-2"><Plus className="w-4 h-4" /> Adicionar Sessão</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-xs font-semibold text-slate-600">Nome da Sessão</Label>
                                            <Input className="mt-1" value={newSession.description} onChange={e => setNewSession({ ...newSession, description: e.target.value })} placeholder="Ex: Introdução & Brainstorming" />
                                        </div>
                                        <div></div>
                                    </div>
                                    <div className="mt-4 flex justify-end">
                                        <Button variant="secondary" onClick={() => {
                                            if (newSession.description) {
                                                setFormData({
                                                    ...formData,
                                                    projectSchedule: [...formData.projectSchedule, {
                                                        id: Math.random().toString(),
                                                        title: newSession.description,
                                                        date: newSession.date.toISOString(),
                                                        time: newSession.time,
                                                        endTime: newSession.endTime
                                                    }]
                                                });
                                                setNewSession({ ...newSession, description: "" });
                                            }
                                        }}>Adicionar à Linha do Tempo</Button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between pt-8 mt-8 border-t">
                                <Button variant="outline" onClick={() => setCurrentStep(3)}>Voltar</Button>
                                <Button onClick={handleSaveAndComplete} className="bg-green-600 hover:bg-green-700">Concluir Projeto</Button>
                            </div>
                        </div>
                    )}

                    {/* STEP 5 - SUCCESS */}
                    {currentStep === 5 && (
                        <div className="text-center animate-in zoom-in-95 duration-500">
                            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                                <PartyPopper className="w-12 h-12 text-green-600" />
                                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1"><Check className="w-6 h-6 text-green-600 bg-green-100 rounded-full p-1" /></div>
                            </div>
                            <h2 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">Projeto {isEditMode ? 'Atualizado' : 'Criado'}!</h2>
                            <p className="text-slate-500 mb-8 max-w-sm mx-auto text-lg leading-relaxed">Seu projeto <strong className="text-slate-800 font-semibold">{formData.title}</strong> está pronto e salvo na sua biblioteca.</p>
                            <div className="flex flex-col gap-3">
                                <Link href="/projetos" className="w-full">
                                    <Button size="lg" className="w-full font-bold shadow-sm h-12">Voltar para Lista de Projetos</Button>
                                </Link>
                                <Button variant="outline" size="lg" onClick={() => router.push('/agenda')} className="w-full font-semibold border-2 h-12">Ver Agenda</Button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

export default function NewProjectWizardPage() {
    return (
        <Suspense fallback={<div className="p-8 flex items-center justify-center h-full"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
            <NewProjectWizardContent />
        </Suspense>
    );
}

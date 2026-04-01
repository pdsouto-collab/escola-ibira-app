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
import { Check, ChevronLeft, Plus, Search, Calendar, Clock, Users, Target, BookOpen, Layers, Trash2, PartyPopper, CalendarRange, Pencil, X, Upload, ImagePlus, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import { BulkSessionDialog } from "@/components/projetos/bulk-session-dialog";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { KnowledgeNode, SEMESTERS, YEARS } from "@/lib/data";
import { ScheduleItem } from "@/types/schedule";
import { Project } from "@/types/project";
import { createProject, updateProject, getProjectById } from "@/services/project.service";
import { createSchedule as createScheduleService, deleteSchedule as deleteScheduleService, getSchedules } from "@/services/schedule.service";
import { NotificationService } from "@/services/notification.service";
import { toast } from "sonner";
import { SchoolClass } from "@/types/school-class";
import { getClasses } from "@/services/school-class.service";
import { getStudents } from "@/services/student.service";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { LibraryItem } from "@/types/library-item";
import { getListBncc } from "@/services/bncc.service";

function NewProjectWizardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get("edit");
    const { data: session } = useSession();
    const currentUser = session?.user as any;

    const {
        finalProductTypes,
        skillsTree,
        contentsTree
    } = useAppStore();
    
    const [schedule, setSchedule] = useState<ScheduleItem[]>([]);

    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [isLoadingClasses, setIsLoadingClasses] = useState(true);

    const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
    const [isLoadingProject, setIsLoadingProject] = useState(!!editId);

    async function fetchClassesAndStudents() {
        try {
            const [classesData, studentsData, schedulesData] = await Promise.all([
                getClasses(),
                getStudents(),
                getSchedules()
            ]);
            setClasses(classesData);
            setStudents(studentsData);
            setSchedule(schedulesData);
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
        } finally {
            setIsLoadingClasses(false);
        }
    }

    useEffect(() => {
        getListaBNCC();
        fetchClassesAndStudents();
    }, [])

    async function getListaBNCC() {
        await getListBncc().then(setLibraryItems);
    }

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
        period: "",
        description: "",
        classes: [] as string[],
        students: [] as string[],
        teachers: [] as string[],
        bnccSkills: [] as string[],
        customContent: [] as string[],
        projectSchedule: [] as Partial<ScheduleItem>[],
        imageUrl: ""
    });

    // Stable project ID across steps
    const [projectId] = useState(() => editId || crypto.randomUUID());

    const [newSession, setNewSession] = useState<{ date: string, time: string, endTime: string, description: string, title: string, type: "activity" | "meal" | "care" | "project" }>({
        date: format(new Date(), 'yyyy-MM-dd'),
        time: "08:00",
        endTime: "09:00",
        title: "",
        type: "project",
        description: ""
    });
    const [sessionTitleError, setSessionTitleError] = useState(false);
    const [bulkSessionOpen, setBulkSessionOpen] = useState(false);
    const [editingSessionIdx, setEditingSessionIdx] = useState<number | null>(null);
    const [editingSessionData, setEditingSessionData] = useState<Partial<typeof newSession>>({})
    const [isSaving, setIsSaving] = useState(false);
    const [gradeFilterBNCC, setGradeFilterBNCC] = useState<string>("all");
    const [gradeFilterCompetencias, setGradeFilterCompetencias] = useState<string>("all");
    const [searchTermBNCC, setSearchTermBNCC] = useState("");
    const [searchTermCompetencias, setSearchTermCompetencias] = useState("");
    const [filterTrilhaBaseBNCC, setFilterTrilhaBaseBNCC] = useState(false);
    const [filterTrilhaBaseCompetencias, setFilterTrilhaBaseCompetencias] = useState(false);

    // Immediately write sessions to store (expanded per selected classes)
    const persistSessionsToStore = async (updatedSessions: Partial<ScheduleItem>[]) => {
        const selectedClasses = formData.classes.length > 0 ? formData.classes : [undefined];
        
        try {
            // First delete existing sessions for this project
            const existingProjectSessions = schedule.filter(s => s.projectId === projectId);
            await Promise.all(existingProjectSessions.map(s => deleteScheduleService(s.id)));

            const remaining = schedule.filter(s => s.projectId !== projectId);
            const expanded: Partial<ScheduleItem>[] = [];
            for (const session of updatedSessions) {
                for (const classId of selectedClasses) {
                    expanded.push({
                        title: session.title ?? "",
                        type: (session.type ?? "project") as ScheduleItem["type"],
                        date: session.date,
                        time: session.time ?? "",
                        endTime: session.endTime,
                        description: session.description,
                        projectId,
                        classId,
                    } as Partial<ScheduleItem>);
                }
            }
            
            const newlyCreated = await Promise.all(expanded.map(item => createScheduleService(item as Omit<ScheduleItem, "id"|"createdAt"|"updatedAt">)));
            setSchedule([...remaining, ...newlyCreated]);
        } catch (error) {
            toast.error("Erro ao persistir sessões.");
            console.error(error);
        }
    };

    // Memoize the IDs of skills and contents that belong to the "Base Tree" of selected classes
    const selectedClassLibraryItemIds = React.useMemo(() => {
        const ids = new Set<string>();
        if (formData.classes.length === 0) return ids;

        const collectIds = (nodes: KnowledgeNode[]) => {
            nodes.forEach(node => {
                if (node.libraryItemId) ids.add(node.libraryItemId);
                if (node.children) collectIds(node.children);
            });
        };

        const allTrees = [...skillsTree, ...contentsTree];
        formData.classes.forEach(classId => {
            const classRoots = allTrees.filter(node => node.classId === classId);
            collectIds(classRoots);
        });

        return ids;
    }, [formData.classes, skillsTree, contentsTree]);

    // SubGroups derived from libraryItems
    const subjects = Array.from(new Set(libraryItems.map(i => i.subGroup || "Geral")));

    // Ref to access current schedule without making it a reactive useEffect dep
    const scheduleRef = React.useRef(schedule);
    scheduleRef.current = schedule;

    useEffect(() => {
        if (editId) {
            setIsLoadingProject(true);
            getProjectById(editId).then(projectToEdit => {
                if (projectToEdit) {
                    setIsEditMode(true);
                    const projectItems = scheduleRef.current.filter(s => s.projectId === editId);
                    const seen = new Set<string>();
                    const uniqueItems = projectItems.filter(item => {
                        const key = `${item.date}|${item.time}|${item.title}`;
                        if (seen.has(key)) return false;
                        seen.add(key);
                        return true;
                    });
                    setFormData({
                        isTemplate: projectToEdit.status === "planning" ? "create_template" : "start_immediately",
                        title: projectToEdit.title,
                        type: projectToEdit.type || "Project",
                        guidingQuestion: projectToEdit.guidingQuestion || "",
                        summary: projectToEdit.summary || "",
                        objectives: projectToEdit.objectives || "",
                        finalProduct: projectToEdit.finalProduct || "None",
                        period: projectToEdit.period || "",
                        description: projectToEdit.description || "",
                        classes: projectToEdit.classes || [],
                        students: projectToEdit.students || [],
                        teachers: [],
                        bnccSkills: projectToEdit.bnccSkillIds || [],
                        customContent: projectToEdit.contentIds || [],
                        projectSchedule: uniqueItems.map(item => ({ ...item })),
                        imageUrl: projectToEdit.imageUrl || ""
                    });
                }
            }).catch(err => {
                toast.error("Erro ao carregar dados do projeto.");
                console.error(err);
            }).finally(() => {
                setIsLoadingProject(false);
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editId]);

    const handleSaveAndComplete = async () => {
        setIsSaving(true);
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
            period: formData.period || undefined,
            tags: [],
            bnccSkillIds: formData.bnccSkills,
            contentIds: formData.customContent,
            students: formData.students,
            classes: formData.classes,
            imageUrl: formData.imageUrl
        };

        try {
            if (isEditMode) {
                await updateProject(projectId, projectData);
                toast.success("Projeto atualizado com sucesso!");
                if (projectData.status !== "planning" && formData.isTemplate !== "create_template") {
                    await NotificationService.addNotification({
                        userId: currentUser?.id,
                        title: "Projeto Atualizado",
                        message: `O projeto "${formData.title}" foi modificado.`,
                        type: "info"
                    });
                }
            } else {
                await createProject(projectData);
                toast.success("Projeto criado com sucesso!");
                await NotificationService.addNotification({
                    userId: currentUser?.id,
                    title: "Novo Projeto",
                    message: `O projeto "${formData.title}" foi criado e está pronto.`,
                    type: "success"
                });
            }

            if (formData.projectSchedule.length > 0) {
                // Re-sync store in case classes changed after sessions were added
                await persistSessionsToStore(formData.projectSchedule);
            }

            setCurrentStep(5);
        } catch (err) {
            toast.error("Erro ao salvar o projeto.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveDraft = async () => {
        setIsSaving(true);
        const projectData: Project = {
            id: projectId,
            title: formData.title || "(Projeto sem título)",
            description: formData.description,
            status: "draft",
            startDate: new Date().toISOString(),
            guidingQuestion: formData.guidingQuestion,
            type: formData.type,
            summary: formData.summary,
            objectives: formData.objectives,
            finalProduct: formData.finalProduct,
            period: formData.period || undefined,
            tags: [],
            bnccSkillIds: formData.bnccSkills,
            contentIds: formData.customContent,
            students: formData.students,
            classes: formData.classes,
            imageUrl: formData.imageUrl
        };

        try {
            if (isEditMode) {
                await updateProject(projectId, projectData);
            } else {
                await createProject(projectData);
            }

            if (formData.projectSchedule.length > 0) {
                await persistSessionsToStore(formData.projectSchedule);
            }
            toast.success("Rascunho salvo com sucesso!");
            router.push("/projetos");
        } catch (err) {
            toast.error("Erro ao salvar rascunho.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleLocalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const img = new window.Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const MAX_WIDTH = 1200;
                const MAX_HEIGHT = 800;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height = Math.round(height * (MAX_WIDTH / width));
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width = Math.round(width * (MAX_HEIGHT / height));
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                    const resizedBase64 = canvas.toDataURL("image/webp", 0.7);
                    setFormData(prev => ({ ...prev, imageUrl: resizedBase64 }));
                }
            };
            img.src = reader.result as string;
        };
        reader.readAsDataURL(file);
    };

    const steps = [
        { id: 1, label: "Detalhes do Projeto" },
        { id: 2, label: "Participantes" },
        { id: 3, label: "Habilidades (BNCC / IBIRÁ) e Competências" },
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

    if (isLoadingProject) {
        return (
            <div className="flex flex-col items-center justify-center p-20 min-h-[500px]">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
                <h3 className="text-xl font-medium text-slate-700">Carregando projeto...</h3>
                <p className="text-slate-500 mt-2 text-sm">Buscando os detalhes do projeto selecionado.</p>
            </div>
        );
    }

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
                        <Button
                            variant="outline"
                            className="text-slate-600 border-slate-200 hover:bg-slate-50"
                            onClick={handleSaveDraft}
                            disabled={isSaving}
                        >
                            {isSaving ? "Salvando..." : "Salvar Rascunho"}
                        </Button>
                        <Link href="/projetos">
                            <Button variant="ghost" className="text-slate-400 hover:text-slate-600">Cancelar</Button>
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
                                    <div>
                                        <Label className="font-semibold text-slate-700">Semestre/Ano</Label>
                                        <div className="flex gap-2 mt-2">
                                            <Select value={(!formData.period || formData.period === "all") ? "all" : formData.period.split(" / ")[0]} onValueChange={v => {
                                                if (v === "all") setFormData({ ...formData, period: "" });
                                                else setFormData({ ...formData, period: `${v} / ${(!formData.period || formData.period === "all") ? new Date().getFullYear() : formData.period.split(" / ")[1] || new Date().getFullYear()}` });
                                            }}>
                                                <SelectTrigger className="text-slate-700">
                                                    <SelectValue placeholder="Semestre" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Nenhum</SelectItem>
                                                    {SEMESTERS.map(sem => (
                                                        <SelectItem key={sem} value={sem}>{sem}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>

                                            <Select value={(!formData.period || formData.period === "all") ? "all" : formData.period.split(" / ")[1]} onValueChange={v => {
                                                if (v === "all") setFormData({ ...formData, period: "" });
                                                else setFormData({ ...formData, period: `${(!formData.period || formData.period === "all") ? "1º Semestre" : formData.period.split(" / ")[0] || "1º Semestre"} / ${v}` });
                                            }}>
                                                <SelectTrigger className="text-slate-700">
                                                    <SelectValue placeholder="Ano" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Nenhum</SelectItem>
                                                    {YEARS.map(y => (
                                                        <SelectItem key={y} value={y}>{y}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <Label className="font-semibold text-slate-700">Foto do Banner</Label>
                                    <div className="flex gap-4 mt-2">
                                        <div className="flex-1 space-y-4">
                                            <div>
                                                <Label htmlFor="image-url" className="text-xs text-slate-500 mb-1 block">Link da Imagem</Label>
                                                <Input
                                                    id="image-url"
                                                    value={formData.imageUrl}
                                                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                                    placeholder="https://exemplo.com/foto.jpg"
                                                />
                                            </div>

                                            <div className="relative">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-[1px] flex-1 bg-slate-200"></div>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ou</span>
                                                    <div className="h-[1px] flex-1 bg-slate-200"></div>
                                                </div>
                                            </div>

                                            <div>
                                                <Label htmlFor="image-upload" className="text-xs text-slate-500 mb-1 block">Upload Local</Label>
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        id="image-upload"
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={handleLocalImageUpload}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="w-full py-6 border-dashed border-2 hover:border-indigo-400 hover:bg-indigo-50/50 group transition-all"
                                                        onClick={() => document.getElementById('image-upload')?.click()}
                                                    >
                                                        <div className="flex flex-col items-center gap-1">
                                                            <div className="flex items-center gap-2 text-indigo-600 font-bold">
                                                                <ImagePlus className="w-4 h-4" />
                                                                <span>Selecionar Imagem do Computador</span>
                                                            </div>
                                                            <span className="text-[10px] text-slate-400 font-normal">JPG, PNG ou GIF (máx. 5MB)</span>
                                                        </div>
                                                    </Button>
                                                </div>
                                            </div>

                                            <p className="text-[10px] text-slate-400 italic">
                                                Dica: Use imagens do Unsplash ou fotos da escola para um visual personalizado.
                                            </p>
                                        </div>
                                        {formData.imageUrl && (
                                            <div className="w-24 h-16 rounded-lg border overflow-hidden bg-slate-100 flex-shrink-0 relative">
                                                <Image
                                                    src={formData.imageUrl}
                                                    alt="Preview"
                                                    fill
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                            </div>
                                        )}
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
                                            {finalProductTypes.map(type => (
                                                <SelectItem key={type.id} value={type.name}>{type.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex justify-end pt-8 mt-8 border-t">
                                <Button onClick={() => setCurrentStep(2)} disabled={!formData.title || isSaving}>{isSaving ? "Salvando..." : "Continuar"}</Button>
                            </div>
                        </div>
                    )}

                    {/* STEP 2 */}
                    {currentStep === 2 && (
                        <div className="animate-in fade-in duration-300">
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Participantes</h2>
                            <p className="text-slate-500 mb-8">Selecione quais alunos farão parte deste projeto.</p>

                            <div className="space-y-6">
                                <div className="border-b pb-6">
                                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                        <Users className="w-5 h-5 text-indigo-600" />
                                        Turmas Vinculadas
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {classes.map(cls => {
                                            const isSelected = formData.classes.includes(cls.id);
                                            return (
                                                <button
                                                    key={cls.id}
                                                    type="button"
                                                    onClick={() => {
                                                        const newClasses = isSelected
                                                            ? formData.classes.filter(id => id !== cls.id)
                                                            : [...formData.classes, cls.id];
                                                        setFormData({ ...formData, classes: newClasses });
                                                    }}
                                                    className={cn(
                                                        "flex items-center gap-2 p-3 border rounded-xl transition-all text-sm font-semibold text-left",
                                                        isSelected
                                                            ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm"
                                                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0",
                                                        isSelected ? "bg-indigo-600 border-indigo-600" : "border-slate-300"
                                                    )}>
                                                        {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                                                    </div>
                                                    {cls.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <p className="text-xs text-slate-400 mt-3 italic">
                                        Vincular uma turma garante que o projeto apareça na seção correta do Banco de Projetos.
                                    </p>
                                </div>

                                <div className="flex items-center justify-between border-b pb-4 mt-8">
                                    <h3 className="font-bold text-lg flex items-center gap-2">
                                        <Target className="w-5 h-5 text-indigo-600" />
                                        Alunos Participantes
                                    </h3>
                                    <div className="flex gap-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const displayedStudents = formData.classes.length === 0 ? students : students.filter(s => formData.classes.includes(s.classId));
                                                const newIds = displayedStudents.map(s => s.id);
                                                const mergedSet = new Set([...formData.students, ...newIds]);
                                                setFormData({ ...formData, students: Array.from(mergedSet) });
                                            }}
                                        >
                                            Selecionar todos
                                        </Button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {(formData.classes.length === 0 ? students : students.filter(s => formData.classes.includes(s.classId))).map(student => (
                                        <button key={student.id} type="button" onClick={() => {
                                            const newStudents = formData.students.includes(student.id) ? formData.students.filter(id => id !== student.id) : [...formData.students, student.id];
                                            setFormData({ ...formData, students: newStudents });
                                        }} className={cn("flex items-center gap-3 p-3 border rounded-xl text-left transition-all", formData.students.includes(student.id) ? "border-indigo-600 bg-indigo-50/30 shadow-sm" : "hover:bg-slate-50")}>
                                            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200">
                                                {student.photo && <Image src={student.photo} alt="" width={40} height={40} />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-xs line-clamp-1">{student.name}</p>
                                                <p className="text-[10px] text-slate-400">{classes.find(c => c.id === student.classId)?.name}</p>
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
                                <h2 className="text-2xl font-bold text-slate-800 mb-2">Habilidades (BNCC / IBIRÁ) e Competências (BNCC / IBIRÁ)</h2>
                                <p className="text-slate-500 mb-8">Clique em uma categoria para expandir e associar habilidades e competências ao projeto.</p>

                                <div className="space-y-12">
                                    {/* SECTION 1: BNCC SKILLS */}
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between border-b pb-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                                                    <BookOpen className="w-5 h-5 text-emerald-600" />
                                                </div>
                                                <h3 className="text-xl font-bold text-slate-800">Habilidades (BNCC / IBIRÁ)</h3>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                    <Input
                                                        placeholder="Buscar por código ou nome..."
                                                        className="pl-9 w-[280px] h-9 bg-white"
                                                        value={searchTermBNCC}
                                                        onChange={(e) => setSearchTermBNCC(e.target.value)}
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2 mr-4 border-r pr-4 border-slate-200">
                                                    <Checkbox id="trilha-base-bncc" checked={filterTrilhaBaseBNCC} onCheckedChange={(c: boolean) => setFilterTrilhaBaseBNCC(c)} />
                                                    <Label htmlFor="trilha-base-bncc" className="text-sm font-bold text-slate-700 cursor-pointer mb-0">Trilha Base</Label>
                                                </div>
                                                <span className="text-sm font-medium text-slate-500">Filtrar por Etapa:</span>
                                                <Select value={gradeFilterBNCC} onValueChange={setGradeFilterBNCC}>
                                                    <SelectTrigger className="w-[180px] bg-white h-9">
                                                        <SelectValue placeholder="Todas as Etapas" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">Todas as Etapas</SelectItem>
                                                        {Array.from(new Set(
                                                            libraryItems
                                                                .filter(i => i.type === "skill")
                                                                .map(i => i.grade)
                                                                .filter(g => g && g.trim().toLowerCase() !== "all")
                                                        )).sort((a, b) => {
                                                            if (a === "infantil") return -1;
                                                            if (b === "infantil") return 1;
                                                            const aNum = parseInt(a || "");
                                                            const bNum = parseInt(b || "");
                                                            if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
                                                            return (a || "").localeCompare(b || "");
                                                        }).map(grade => (
                                                            <SelectItem key={`bncc-grade-${grade}`} value={grade!}>
                                                                {grade === 'infantil' ? 'Educação Infantil' :
                                                                    grade?.endsWith('ano') ? `${grade.replace('ano', '')}º Ano` : grade}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <Accordion type="multiple" className="space-y-4">
                                            {Array.from(new Set(libraryItems.filter(i => i.type === "skill").map(i => i.subGroup || "Geral"))).sort((a, b) => a.localeCompare(b)).map(subject => {
                                                const subjectItems = libraryItems.filter(i =>
                                                    i.subGroup === subject &&
                                                    i.type === "skill" &&
                                                    (gradeFilterBNCC === "all" || i.grade === gradeFilterBNCC || i.grade === "all") &&
                                                    (searchTermBNCC === "" ||
                                                        i.name.toLowerCase().includes(searchTermBNCC.toLowerCase()) ||
                                                        (i.code && i.code.toLowerCase().includes(searchTermBNCC.toLowerCase())) ||
                                                        i.description.toLowerCase().includes(searchTermBNCC.toLowerCase()) ||
                                                        subject.toLowerCase().includes(searchTermBNCC.toLowerCase())
                                                    ) &&
                                                    (!filterTrilhaBaseBNCC || selectedClassLibraryItemIds.has(i.id) || (i.code && selectedClassLibraryItemIds.has(i.code)))
                                                ).sort((a, b) => a.name.localeCompare(b.name));

                                                if (subjectItems.length === 0) return null;

                                                const selectedCount = subjectItems.filter(i => formData.bnccSkills.includes(i.id)).length;
                                                return (
                                                    <AccordionItem key={subject} value={subject} className="border rounded-xl bg-white px-4">
                                                        <AccordionTrigger className="hover:no-underline py-4">
                                                            <div className="flex items-center justify-between w-full pr-4">
                                                                <span className="font-bold text-lg text-slate-800">{subject}</span>
                                                                {selectedCount > 0 && <Badge className="bg-emerald-100 text-emerald-700">{selectedCount} selecionados</Badge>}
                                                            </div>
                                                        </AccordionTrigger>
                                                        <AccordionContent className="pt-2 pb-4">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-2">
                                                                {subjectItems.map(item => {
                                                                    const isSelected = formData.bnccSkills.includes(item.id);
                                                                    const isFromBaseTree = selectedClassLibraryItemIds.has(item.id) || (item.code && selectedClassLibraryItemIds.has(item.code));

                                                                    return (
                                                                        <div key={item.id} onClick={() => toggleSkill(item.id, true)} className={cn("border-2 rounded-xl p-4 cursor-pointer transition-all relative overflow-hidden", isSelected ? "border-emerald-600 shadow-sm" : "border-slate-200 hover:border-emerald-300")}>
                                                                            <div className="flex justify-between items-start mb-2">
                                                                                <div className="flex flex-wrap gap-1">
                                                                                    {item.isBNCC ? (
                                                                                        <Badge variant="outline" className="text-[10px] font-bold h-5 px-1.5 bg-emerald-50 text-emerald-700 border-emerald-200">
                                                                                            BNCC
                                                                                        </Badge>
                                                                                    ) : (
                                                                                        <Badge variant="outline" className="text-[10px] font-bold h-5 px-1.5 bg-purple-50 text-purple-700 border-purple-200">
                                                                                            Escola
                                                                                        </Badge>
                                                                                    )}
                                                                                    {isFromBaseTree && (
                                                                                        <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px] font-bold h-5 px-1.5">
                                                                                            Trilha Base
                                                                                        </Badge>
                                                                                    )}
                                                                                </div>
                                                                                <div className={cn("w-5 h-5 rounded-full border flex items-center justify-center", isSelected ? "bg-emerald-600 border-emerald-600" : "border-slate-300")}>
                                                                                    {isSelected && <Check className="w-3 h-3 text-white" />}
                                                                                </div>
                                                                            </div>
                                                                            {item.code && <p className="text-emerald-700 font-mono text-[10px] mb-1 font-bold">{item.code}</p>}
                                                                            <h4 className="font-bold text-slate-800 text-sm mb-1">
                                                                                {item.name}
                                                                                <span className="ml-2 text-[9px] text-slate-400 font-normal uppercase">({item.type})</span>
                                                                            </h4>
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

                                    {/* SECTION 2: COMPETÊNCIAS */}
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between border-b pb-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center">
                                                    <Layers className="w-5 h-5 text-sky-600" />
                                                </div>
                                                <h3 className="text-xl font-bold text-slate-800">Competências</h3>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                    <Input
                                                        placeholder="Buscar competência..."
                                                        className="pl-9 w-[280px] h-9 bg-white"
                                                        value={searchTermCompetencias}
                                                        onChange={(e) => setSearchTermCompetencias(e.target.value)}
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2 mr-4 border-r pr-4 border-slate-200">
                                                    <Checkbox id="trilha-base-comp" checked={filterTrilhaBaseCompetencias} onCheckedChange={(c: boolean) => setFilterTrilhaBaseCompetencias(c)} />
                                                    <Label htmlFor="trilha-base-comp" className="text-sm font-bold text-slate-700 cursor-pointer mb-0">Trilha Base</Label>
                                                </div>
                                                <span className="text-sm font-medium text-slate-500">Filtrar por Etapa:</span>
                                                <Select value={gradeFilterCompetencias} onValueChange={setGradeFilterCompetencias}>
                                                    <SelectTrigger className="w-[180px] bg-white h-9">
                                                        <SelectValue placeholder="Todas as Etapas" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">Todas as Categorias</SelectItem>
                                                        {Array.from(new Set(
                                                            libraryItems
                                                                .filter(i => i.type === "content")
                                                                .map(i => i.subGroup)
                                                                .filter(g => g && g.trim().toLowerCase() !== "all")
                                                        )).sort((a, b) => {
                                                            if (a === "infantil") return -1;
                                                            if (b === "infantil") return 1;
                                                            return a.localeCompare(b);
                                                        }).map(group => (
                                                            <SelectItem key={`comp-group-${group}`} value={group}>
                                                                {group}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <Accordion type="multiple" className="space-y-4">
                                            {Array.from(new Set(libraryItems.filter(i => i.type === "content").map(i => i.subGroup || "Geral"))).sort((a, b) => a.localeCompare(b)).map(subject => {
                                                const subjectItems = libraryItems.filter(i =>
                                                    i.subGroup === subject &&
                                                    i.type === "content" &&
                                                    (gradeFilterCompetencias === "all" || i.grade === gradeFilterCompetencias || i.subGroup === gradeFilterCompetencias || i.grade === "all") &&
                                                    (searchTermCompetencias === "" ||
                                                        i.name.toLowerCase().includes(searchTermCompetencias.toLowerCase()) ||
                                                        i.description.toLowerCase().includes(searchTermCompetencias.toLowerCase()) ||
                                                        subject.toLowerCase().includes(searchTermCompetencias.toLowerCase())
                                                    ) &&
                                                    (!filterTrilhaBaseCompetencias || selectedClassLibraryItemIds.has(i.id) || (i.code && selectedClassLibraryItemIds.has(i.code)))
                                                ).sort((a, b) => a.name.localeCompare(b.name));

                                                if (subjectItems.length === 0) return null;

                                                const selectedCount = subjectItems.filter(i => formData.customContent.includes(i.id)).length;
                                                return (
                                                    <AccordionItem key={subject} value={subject} className="border rounded-xl bg-white px-4">
                                                        <AccordionTrigger className="hover:no-underline py-4">
                                                            <div className="flex items-center justify-between w-full pr-4">
                                                                <span className="font-bold text-lg text-slate-800">{subject}</span>
                                                                {selectedCount > 0 && <Badge className="bg-sky-100 text-sky-700">{selectedCount} selecionados</Badge>}
                                                            </div>
                                                        </AccordionTrigger>
                                                        <AccordionContent className="pt-2 pb-4">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-2">
                                                                {subjectItems.map(item => {
                                                                    const isSelected = formData.customContent.includes(item.id);
                                                                    const isFromBaseTree = selectedClassLibraryItemIds.has(item.id) || (item.code && selectedClassLibraryItemIds.has(item.code));

                                                                    return (
                                                                        <div key={item.id} onClick={() => toggleSkill(item.id, false)} className={cn("border-2 rounded-xl p-4 cursor-pointer transition-all relative overflow-hidden", isSelected ? "border-sky-600 shadow-sm" : "border-slate-200 hover:border-sky-300")}>
                                                                            <div className="flex justify-between items-start mb-2">
                                                                                <div className="flex flex-wrap gap-1">
                                                                                    <Badge variant="outline" className="text-[10px] font-bold h-5 px-1.5 bg-sky-50 text-sky-700 border-sky-200">
                                                                                        Escola
                                                                                    </Badge>
                                                                                    {isFromBaseTree && (
                                                                                        <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px] font-bold h-5 px-1.5">
                                                                                            Trilha Base
                                                                                        </Badge>
                                                                                    )}
                                                                                </div>
                                                                                <div className={cn("w-5 h-5 rounded-full border flex items-center justify-center", isSelected ? "bg-sky-600 border-sky-600" : "border-slate-300")}>
                                                                                    {isSelected && <Check className="w-3 h-3 text-white" />}
                                                                                </div>
                                                                            </div>
                                                                            <h4 className="font-bold text-slate-800 text-sm mb-1">
                                                                                {item.name}
                                                                                <span className="ml-2 text-[9px] text-slate-400 font-normal uppercase">({item.type})</span>
                                                                            </h4>
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
                                </div>
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
                                                    <div key={id} className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 shadow-sm relative pr-8">
                                                        <span className="text-xs font-bold text-emerald-700 block mb-1">{skill.name}</span>
                                                        <p className="text-[10px] text-emerald-600/80 line-clamp-1">{skill.description}</p>
                                                        <button onClick={() => toggleSkill(id, true)} className="absolute top-3 right-2 text-emerald-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                );
                                            })}
                                            {formData.customContent.map(id => {
                                                const content = libraryItems.find(s => s.id === id);
                                                if (!content) return null;
                                                return (
                                                    <div key={id} className="bg-sky-50 p-3 rounded-lg border border-sky-100 shadow-sm relative pr-8">
                                                        <span className="text-xs font-bold text-sky-700 block mb-1">{content.name}</span>
                                                        <p className="text-[10px] text-sky-600/80 line-clamp-1">{content.description}</p>
                                                        <button onClick={() => toggleSkill(id, false)} className="absolute top-3 right-2 text-sky-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
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
                                                <div className="bg-white border rounded-xl flex-1 shadow-sm relative overflow-hidden">
                                                    {editingSessionIdx === idx ? (
                                                        <div className="p-4 space-y-3">
                                                            <div className="flex gap-2">
                                                                <div className="flex-1">
                                                                    <Label className="text-xs font-semibold text-slate-600">Título</Label>
                                                                    <Input value={editingSessionData.title ?? ''} onChange={e => setEditingSessionData(p => ({ ...p, title: e.target.value }))} className="mt-1" />
                                                                </div>
                                                                <div>
                                                                    <Label className="text-xs font-semibold text-slate-600">Data</Label>
                                                                    <Input type="date" value={editingSessionData.date ?? ''} onChange={e => setEditingSessionData(p => ({ ...p, date: e.target.value }))} className="mt-1" />
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <div className="flex-1">
                                                                    <Label className="text-xs font-semibold text-slate-600">Início</Label>
                                                                    <Input type="time" value={editingSessionData.time ?? ''} onChange={e => setEditingSessionData(p => ({ ...p, time: e.target.value }))} className="mt-1" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <Label className="text-xs font-semibold text-slate-600">Fim</Label>
                                                                    <Input type="time" value={editingSessionData.endTime ?? ''} onChange={e => setEditingSessionData(p => ({ ...p, endTime: e.target.value }))} className="mt-1" />
                                                                </div>
                                                            </div>
                                                            <div className="flex justify-end gap-2 pt-1">
                                                                <Button type="button" size="sm" variant="ghost" onClick={() => setEditingSessionIdx(null)}>
                                                                    <X className="w-3 h-3 mr-1" /> Cancelar
                                                                </Button>
                                                                <Button type="button" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => {
                                                                    const updated = formData.projectSchedule.map((s, i) => i === idx ? { ...s, ...editingSessionData } : s);
                                                                    setFormData({ ...formData, projectSchedule: updated });
                                                                    persistSessionsToStore(updated);
                                                                    setEditingSessionIdx(null);
                                                                }}>
                                                                    Salvar
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="p-4">
                                                            <div className="absolute top-3 right-3 flex items-center gap-1">
                                                                <button type="button" onClick={() => { setEditingSessionIdx(idx); setEditingSessionData({ title: item.title, date: item.date as string, time: item.time, endTime: item.endTime || "" }); }} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                                                    <Pencil className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button type="button" onClick={() => { const updated = formData.projectSchedule.filter((_, i) => i !== idx); setFormData({ ...formData, projectSchedule: updated }); persistSessionsToStore(updated); }} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                            <h4 className="font-bold text-slate-800 pr-16">{item.title}</h4>
                                                            <div className="flex gap-3 text-xs text-slate-500 mt-2 font-medium">
                                                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {item.date && typeof item.date === 'string' ? item.date.split('-').reverse().join('/') : 'TBD'}</span>
                                                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {item.time} - {item.endTime}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <BulkSessionDialog
                                    open={bulkSessionOpen}
                                    onOpenChange={setBulkSessionOpen}
                                    classIds={formData.classes}
                                    onSave={(sessions) => {
                                        const updated = [...formData.projectSchedule, ...sessions];
                                        setFormData(prev => ({ ...prev, projectSchedule: updated }));
                                        persistSessionsToStore(updated);
                                    }}
                                />

                                <div className="bg-indigo-50/50 p-6 rounded-xl border border-indigo-100 mt-8">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-bold text-sm text-indigo-800 flex items-center gap-2"><Plus className="w-4 h-4" /> Adicionar Sessão</h4>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="gap-2 text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                                            onClick={() => setBulkSessionOpen(true)}
                                        >
                                            <CalendarRange className="w-4 h-4" />
                                            Criar em Massa
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label className={`text-xs font-semibold ${sessionTitleError ? 'text-red-500' : 'text-slate-600'}`}>Título {sessionTitleError && <span className="font-normal">— obrigatório!</span>}</Label>
                                            <Input
                                                className={`mt-1 ${sessionTitleError ? 'border-red-400 focus:ring-red-400' : ''}`}
                                                value={newSession.title}
                                                onChange={e => {
                                                    setSessionTitleError(false);
                                                    setNewSession({ ...newSession, title: e.target.value });
                                                }}
                                                placeholder="Ex: Introdução & Brainstorming"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs font-semibold text-slate-600">Data</Label>
                                            <Input type="date" className="mt-1" value={newSession.date} onChange={e => setNewSession({ ...newSession, date: e.target.value })} />
                                        </div>
                                        <div>
                                            <Label className="text-xs font-semibold text-slate-600">Horário Inicial</Label>
                                            <Input type="time" className="mt-1" value={newSession.time} onChange={e => setNewSession({ ...newSession, time: e.target.value })} />
                                        </div>
                                        <div>
                                            <Label className="text-xs font-semibold text-slate-600">Horário Final</Label>
                                            <Input type="time" className="mt-1" value={newSession.endTime} onChange={e => setNewSession({ ...newSession, endTime: e.target.value })} />
                                        </div>
                                        <div className="md:col-span-2">
                                            <Label className="text-xs font-semibold text-slate-600">Descrição</Label>
                                            <Textarea className="mt-1" value={newSession.description} onChange={e => setNewSession({ ...newSession, description: e.target.value })} placeholder="Detalhes da atividade..." />
                                        </div>
                                    </div>
                                    <div className="mt-4 flex justify-end">
                                        <Button
                                            variant="default"
                                            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                                            onClick={() => {
                                                if (!newSession.title.trim()) {
                                                    setSessionTitleError(true);
                                                    return;
                                                }
                                                setSessionTitleError(false);
                                                const session: Partial<ScheduleItem> = {
                                                    id: crypto.randomUUID(),
                                                    title: newSession.title,
                                                    type: newSession.type,
                                                    date: newSession.date,
                                                    time: newSession.time,
                                                    endTime: newSession.endTime,
                                                    description: newSession.description
                                                };
                                                const updated = [...formData.projectSchedule, session];
                                                setFormData(prev => ({ ...prev, projectSchedule: updated }));
                                                persistSessionsToStore(updated);
                                                setNewSession({
                                                    date: newSession.date,
                                                    time: "",
                                                    endTime: "",
                                                    title: "",
                                                    type: "project",
                                                    description: ""
                                                });
                                            }}
                                        >
                                            <Plus className="w-4 h-4" />
                                            Adicionar Sessão
                                        </Button>
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

"use client";

import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/lib/store";
import { PortfolioEntry, Student } from "@/lib/data";
import { SchoolClass } from "@/types/school-class";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ImagePlus, Images, Sparkles, Trash2, Users, Target, Check, ChevronRight, ChevronLeft, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";


interface BulkPortfolioDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    date: Date;
    classes: SchoolClass[];
    classId: string; // Now defaults to "all" but kept for compatibility
}

interface StudentPortfolioForm {
    id?: string;
    studentId: string;
    selected: boolean;
    individualNote: string;
}

export function BulkPortfolioDialog({ open, onOpenChange, date, classes }: BulkPortfolioDialogProps) {
    const { students, portfolioEntries, addPortfolioEntry, updatePortfolioEntry, removePortfolioEntry, addPegadaPost } = useAppStore();
    const { data: session } = useSession();
    const currentUser = session?.user as any;
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Flow State
    const [currentStep, setCurrentStep] = useState<1 | 2>(1);

    // Step 1: Selection
    const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
    const [studentSearch, setStudentSearch] = useState("");

    // Step 2: Global Context & Narrative
    const [title, setTitle] = useState("");
    const [tagsInput, setTagsInput] = useState("");
    const [images, setImages] = useState<string[]>(["https://images.unsplash.com/photo-1544717297-fa95b6ee9643?q=80&w=600&auto=format&fit=crop"]);
    const [baseNarrative, setBaseNarrative] = useState("");

    // Step 2: Individualization State
    const [forms, setForms] = useState<Record<string, StudentPortfolioForm>>({});

    const dateStr = format(date, "yyyy-MM-dd");

    // Initialize/Reset State when opening
    useEffect(() => {
        if (open) {
            setCurrentStep(1);
            // Default select all classes or a default one? Let's just keep it empty for fresh start
            setSelectedClassIds([]);
            setSelectedStudentIds([]);
            setStudentSearch("");
            setTitle("");
            setTagsInput("");
            setBaseNarrative("");
            setForms({});
        }
    }, [open]);

    // Derived list of students based on selected classes and search
    const filteredStudents = students.filter(s => {
        const matchesClass = selectedClassIds.length === 0 || selectedClassIds.includes(s.classId);
        const matchesSearch = s.name.toLowerCase().includes(studentSearch.toLowerCase());
        return matchesClass && matchesSearch;
    });

    const toggleClass = (id: string) => {
        const isSelected = selectedClassIds.includes(id);
        const newClasses = isSelected
            ? selectedClassIds.filter(c => c !== id)
            : [...selectedClassIds, id];

        setSelectedClassIds(newClasses);

        // If unselecting a class, also remove its students from selectedStudentIds
        if (isSelected) {
            const classStudents = students.filter(s => s.classId === id).map(s => s.id);
            setSelectedStudentIds(prev => prev.filter(sid => !classStudents.includes(sid)));
        }
    };

    const toggleStudentSelection = (id: string) => {
        setSelectedStudentIds(prev =>
            prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
        );
    };

    const selectAllVisibleStudents = () => {
        const visibleIds = filteredStudents.map(s => s.id);
        const mergedSet = new Set([...selectedStudentIds, ...visibleIds]);
        setSelectedStudentIds(Array.from(mergedSet));
    };

    const deselectAllVisibleStudents = () => {
        const visibleIds = filteredStudents.map(s => s.id);
        setSelectedStudentIds(prev => prev.filter(id => !visibleIds.includes(id)));
    };

    const handleNext = () => {
        if (selectedStudentIds.length === 0) {
            toast.warning("Por favor, selecione pelo menos um aluno.");
            return;
        }

        // Prepare forms for Step 2
        const initialForms: Record<string, StudentPortfolioForm> = {};
        selectedStudentIds.forEach(sid => {
            initialForms[sid] = {
                studentId: sid,
                selected: true,
                individualNote: ""
            };
        });
        setForms(initialForms);
        setCurrentStep(2);
    };

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setImages(prev => {
            if (prev.length === 1 && prev[0].includes("unsplash.com")) return [];
            return prev;
        });

        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const MAX_DIMENSION = 800; // Limit rendering size
                    if (width > height && width > MAX_DIMENSION) {
                        height *= MAX_DIMENSION / width;
                        width = MAX_DIMENSION;
                    } else if (height > MAX_DIMENSION) {
                        width *= MAX_DIMENSION / height;
                        height = MAX_DIMENSION;
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    const newBase = canvas.toDataURL('image/jpeg', 0.7);
                    setImages(prev => [...prev, newBase]);
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        });
        
        // Clear input value to allow selecting same file again
        if (e.target) e.target.value = '';
    };

    const updateForm = (studentId: string, updates: Partial<StudentPortfolioForm>) => {
        setForms(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], ...updates }
        }));
    };

    const handleAutoFill = () => {
        setForms(prev => {
            const next = { ...prev };
            Object.keys(next).forEach(studentId => {
                if (next[studentId].selected) {
                    next[studentId] = {
                        ...next[studentId],
                        individualNote: next[studentId].individualNote || baseNarrative
                    };
                }
            });
            return next;
        });
    };

    const handleSave = () => {
        if (!title.trim()) {
            toast.warning("Por favor, dê um título para a vivência.");
            return;
        }

        const tagsArray = tagsInput.split(",").map(t => t.trim()).filter(t => t.length > 0);

        selectedStudentIds.forEach((studentId: string) => {
            const form = forms[studentId];
            if (!form || !form.selected) return;

            const entryContent = form.individualNote.trim() || baseNarrative.trim();
            if (!entryContent) return;

            const entryData: PortfolioEntry = {
                id: `port-${Date.now()}-${studentId}`,
                studentId: studentId,
                date: dateStr,
                title: title.trim(),
                description: entryContent,
                imageUrl: images[0] || "",
                images: images,
                tags: tagsArray
            };
            addPortfolioEntry(entryData);
        });

        // Add a single PegadaPost to the feed as well
        addPegadaPost({
            id: `pegada-${Date.now()}`,
            authorId: currentUser?.id || "u2",
            authorName: currentUser?.name || "Professor",
            type: "photo",
            title: title.trim(),
            content: baseNarrative.trim() || "Nova vivência registrada para a turma.",
            mediaUrl: images[0] || "",
            tags: tagsArray,
            interactions: [],
            createdAt: new Date().toISOString()
        });

        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-slate-50 gap-0 border-none shadow-2xl">
                {/* Header Section */}
                <DialogHeader className="p-6 pb-4 bg-white border-b shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                                <Images className="h-6 w-6" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold text-slate-900">
                                    Registro de Vivência em Lote
                                </DialogTitle>
                                <DialogDescription className="text-indigo-600 font-medium">
                                    {format(date, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                                </DialogDescription>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest", currentStep === 1 ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500")}>
                                Passo 1: Seleção
                            </div>
                            <ChevronRight className="h-3 w-3 text-slate-300" />
                            <div className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest", currentStep === 2 ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500")}>
                                Passo 2: Registro
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                {/* Main Content Area */}
                <div className="flex-1 overflow-hidden">
                    {currentStep === 1 ? (
                        /* STEP 1: SELECTION UI */
                        <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300 p-6 gap-6">
                            {/* Classes Selection Grid */}
                            <div className="space-y-3">
                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                    <Users className="h-3.5 w-3.5" /> 1. Selecionar Turmas
                                </Label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {classes.map(cls => {
                                        const isSelected = selectedClassIds.includes(cls.id);
                                        return (
                                            <button
                                                key={cls.id}
                                                onClick={() => toggleClass(cls.id)}
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
                            </div>

                            {/* Students Selection Grid */}
                            <div className="flex-1 flex flex-col min-h-0 space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                        <Target className="h-3.5 w-3.5" /> 2. Selecionar Alunos Participantes
                                    </Label>
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                            <Input
                                                placeholder="Buscar aluno..."
                                                className="h-8 pl-8 text-xs w-48 bg-white"
                                                value={studentSearch}
                                                onChange={e => setStudentSearch(e.target.value)}
                                            />
                                        </div>
                                        <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-tight" onClick={selectAllVisibleStudents}>
                                            Marcar Todos
                                        </Button>
                                        <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-tight text-slate-400" onClick={deselectAllVisibleStudents}>
                                            Desmarcar
                                        </Button>
                                    </div>
                                </div>

                                <ScrollArea className="flex-1 bg-white rounded-2xl border border-slate-200 p-4">
                                    {filteredStudents.length > 0 ? (
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {filteredStudents.map(student => {
                                                const isSelected = selectedStudentIds.includes(student.id);
                                                return (
                                                    <button
                                                        key={student.id}
                                                        onClick={() => toggleStudentSelection(student.id)}
                                                        className={cn(
                                                            "flex items-center gap-3 p-2 rounded-xl border transition-all text-left",
                                                            isSelected ? "border-indigo-600 bg-indigo-50/50 shadow-sm" : "border-slate-100 hover:bg-slate-50"
                                                        )}
                                                    >
                                                        <Avatar className="h-8 w-8 shrink-0">
                                                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`} />
                                                            <AvatarFallback className="text-[10px] font-bold">{student.name.substring(0, 2)}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-bold text-slate-800 truncate">{student.name}</p>
                                                            <p className="text-[9px] text-slate-400 font-medium">{classes.find(c => c.id === student.classId)?.name}</p>
                                                        </div>
                                                        <div className={cn(
                                                            "w-4 h-4 rounded-full border flex flex-shrink-0 items-center justify-center",
                                                            isSelected ? "bg-indigo-600 border-indigo-600" : "border-slate-200"
                                                        )}>
                                                            {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center py-20 text-slate-400">
                                            <Target className="h-8 w-8 mb-2 opacity-20" />
                                            <p className="text-sm font-medium italic">Nenhum aluno encontrado para os critérios selecionados.</p>
                                        </div>
                                    )}
                                </ScrollArea>
                            </div>
                        </div>
                    ) : (
                        /* STEP 2: FILLING UI */
                        <div className="h-full flex overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
                            {/* Left Side: Context & Global Narrative */}
                            <div className="w-1/3 bg-white border-r flex flex-col overflow-y-auto p-6 space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Título da Vivência</Label>
                                        <Input
                                            placeholder="Ex: Explorando Texturas"
                                            value={title}
                                            onChange={e => setTitle(e.target.value)}
                                            className="mt-1 font-bold border-slate-200 focus-visible:ring-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tags / Habilidades</Label>
                                        <Input
                                            placeholder="Ex: Natureza, Sensorial, Artes"
                                            value={tagsInput}
                                            onChange={e => setTagsInput(e.target.value)}
                                            className="mt-1 border-slate-200 focus-visible:ring-indigo-500"
                                        />
                                        <p className="text-[9px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">Separe por vírgulas.</p>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Fotos da Vivência</Label>
                                        <Badge variant="secondary" className="text-[10px]">{images.length} fotos</Badge>
                                    </div>
                                    <input type="file" multiple ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                                    
                                    <ScrollArea className="w-full whitespace-nowrap pb-4">
                                        <div className="flex gap-3">
                                            {images.map((img, idx) => (
                                                <div key={idx} className="w-32 h-32 shrink-0 border border-slate-200 rounded-2xl p-1 bg-slate-50 relative group overflow-hidden">
                                                    <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover rounded-xl" />
                                                    <button 
                                                        onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                            <div
                                                onClick={handleImageClick}
                                                className="w-32 h-32 shrink-0 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all text-slate-400 hover:text-indigo-500 group shadow-sm bg-white"
                                            >
                                                <ImagePlus className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider">Add Foto</span>
                                            </div>
                                        </div>
                                    </ScrollArea>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Narrativa Base</Label>
                                        <Button variant="ghost" size="sm" className="h-6 text-[9px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 uppercase" onClick={handleAutoFill}>
                                            Replicar em Todos
                                        </Button>
                                    </div>
                                    <Textarea
                                        placeholder="Descreva o que aconteceu de forma geral para contextualizar as notas individuais..."
                                        className="h-32 resize-none text-xs border-slate-200 focus-visible:ring-indigo-500 bg-slate-50/50"
                                        value={baseNarrative}
                                        onChange={e => setBaseNarrative(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Right Side: Individual Notes */}
                            <div className="flex-1 flex flex-col bg-slate-100/30">
                                <div className="px-6 py-4 bg-white border-b flex justify-between items-center">
                                    <Label className="text-sm font-bold text-slate-700">Participantes Escolhidos</Label>
                                    <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 font-bold">
                                        {Object.values(forms).filter(f => f.selected).length} de {selectedStudentIds.length} Alunos
                                    </Badge>
                                </div>

                                <ScrollArea className="flex-1 p-6">
                                    <div className="space-y-4">
                                        {selectedStudentIds.map((sid) => {
                                            const student = students.find(s => s.id === sid);
                                            const form = forms[sid];
                                            if (!student || !form) return null;

                                            return (
                                                <div key={sid} className={cn("bg-white rounded-2xl border p-4 shadow-sm transition-all", !form.selected && "opacity-40 grayscale-[0.5]")}>
                                                    <div className="flex gap-4">
                                                        <div className="flex flex-col items-center gap-2 min-w-[100px] shrink-0">
                                                            <Avatar className="h-14 w-14 ring-2 ring-white shadow-md">
                                                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`} />
                                                                <AvatarFallback className="bg-slate-100 font-bold">{student.name.substring(0, 2)}</AvatarFallback>
                                                            </Avatar>
                                                            <span className="text-xs font-bold text-slate-900 text-center line-clamp-1">{student.name.split(' ')[0]}</span>

                                                            <button
                                                                onClick={() => updateForm(sid, { selected: !form.selected })}
                                                                className={cn(
                                                                    "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider transition-colors border",
                                                                    form.selected ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-400 border-slate-200"
                                                                )}
                                                            >
                                                                {form.selected ? "Incluído" : "Remover"}
                                                            </button>
                                                        </div>

                                                        <div className="flex-1">
                                                            <Textarea
                                                                placeholder={`Como foi a vivência de ${student.name.split(' ')[0]}?`}
                                                                className="min-h-[100px] text-xs resize-none bg-slate-50 border-slate-100 focus:bg-white transition-all rounded-xl"
                                                                value={form.individualNote}
                                                                onChange={e => updateForm(sid, { individualNote: e.target.value })}
                                                                disabled={!form.selected}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </ScrollArea>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Section */}
                <DialogFooter className="p-6 bg-white border-t shrink-0 flex items-center justify-between sm:justify-between w-full">
                    <div className="flex items-center gap-3">
                        {currentStep === 2 && (
                            <Button variant="ghost" onClick={() => setCurrentStep(1)} className="text-slate-500 font-bold gap-2">
                                <ChevronLeft className="h-4 w-4" /> Passo Anterior
                            </Button>
                        )}
                        <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl border-slate-200">
                            Cancelar
                        </Button>
                    </div>

                    <div className="flex items-center gap-4">
                        {currentStep === 1 ? (
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-xs font-bold text-slate-900">{selectedStudentIds.length} Alunos</p>
                                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">Selecionados para a vivência</p>
                                </div>
                                <Button
                                    onClick={handleNext}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 shadow-lg shadow-indigo-100 gap-2"
                                    disabled={selectedStudentIds.length === 0}
                                >
                                    Continuar <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <Button
                                onClick={handleSave}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-10 shadow-lg shadow-emerald-100 gap-2"
                                disabled={!title.trim() || Object.values(forms).filter(f => f.selected).length === 0}
                            >
                                <Check className="h-4 w-4" /> Salvar no Portfólio
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

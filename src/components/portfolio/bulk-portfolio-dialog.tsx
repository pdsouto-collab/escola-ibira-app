"use client";

import { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/lib/store";
import { PortfolioEntry, Student } from "@/lib/data";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ImagePlus, Images, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";

interface BulkPortfolioDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    date: Date;
    classId: string;
}

interface StudentPortfolioForm {
    studentId: string;
    selected: boolean;
    individualNote: string;
}

export function BulkPortfolioDialog({ open, onOpenChange, date, classId }: BulkPortfolioDialogProps) {
    const { students, addPortfolioEntry } = useAppStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 1. Contexto e Mídia Comum
    const [title, setTitle] = useState("");
    const [tagsInput, setTagsInput] = useState("");
    const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1544717297-fa95b6ee9643?q=80&w=600&auto=format&fit=crop"); // Default placeholder

    // 2. A "Narrativa Base" (Opcional)
    const [baseNarrative, setBaseNarrative] = useState("");

    // 3. Individualização
    const [forms, setForms] = useState<Record<string, StudentPortfolioForm>>({});

    const classStudents = students.filter(s => s.classId === classId);
    const dateStr = format(date, "yyyy-MM-dd");

    useEffect(() => {
        if (!open) return;

        // Reset forms when dialog opens
        const initialForms: Record<string, StudentPortfolioForm> = {};
        classStudents.forEach(student => {
            initialForms[student.id] = {
                studentId: student.id,
                selected: true,
                individualNote: ""
            };
        });

        setForms(initialForms);
        setTitle("");
        setTagsInput("");
        setBaseNarrative("");
        setImageUrl("https://images.unsplash.com/photo-1544717297-fa95b6ee9643?q=80&w=600&auto=format&fit=crop");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, classId, dateStr]);

    const updateForm = (studentId: string, updates: Partial<StudentPortfolioForm>) => {
        setForms(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], ...updates }
        }));
    };

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAutoFill = () => {
        setForms(prev => {
            const next = { ...prev };
            Object.keys(next).forEach(studentId => {
                if (next[studentId].selected) {
                    next[studentId] = {
                        ...next[studentId],
                        // Only add base narrative if the individual note doesn't already have it
                        individualNote: next[studentId].individualNote
                            ? next[studentId].individualNote
                            : baseNarrative
                    };
                }
            });
            return next;
        });
    };

    const handleSave = () => {
        if (!title.trim()) {
            alert("Por favor, dê um título para a vivência.");
            return;
        }

        const tagsArray = tagsInput.split(",").map(t => t.trim()).filter(t => t.length > 0);

        classStudents.forEach(student => {
            const form = forms[student.id];
            if (!form || !form.selected) return; // Skip if visually unchecked

            const entryContent = form.individualNote.trim() || baseNarrative.trim();

            if (!entryContent) return; // Skip if no content written at all for this student

            const entryData: PortfolioEntry = {
                id: `port-${Date.now()}-${student.id}`,
                studentId: student.id,
                date: dateStr,
                title: title.trim(),
                description: entryContent,
                imageUrl: imageUrl,
                tags: tagsArray
            };

            addPortfolioEntry(entryData);
        });

        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-slate-50 gap-0">
                <DialogHeader className="p-6 pb-4 bg-white border-b shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                <Images className="h-5 w-5 text-indigo-500" />
                                Registro de Vivência em Lote
                            </DialogTitle>
                            <DialogDescription>
                                {format(date, "EEEE, dd 'de' MMMM", { locale: require("date-fns/locale/pt-BR").default })}
                            </DialogDescription>
                        </div>
                        <Button
                            variant="outline"
                            className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200"
                            onClick={handleAutoFill}
                            disabled={!baseNarrative.trim()}
                        >
                            <Sparkles className="h-4 w-4 mr-2" />
                            Auto-Preencher com Narrativa Base
                        </Button>
                    </div>
                </DialogHeader>

                <div className="flex flex-1 overflow-hidden">
                    {/* Left Panel: Context & Global Media */}
                    <div className="w-1/3 bg-white border-r flex flex-col overflow-y-auto">
                        <div className="p-6 space-y-6">

                            {/* 1. Contexto Geral */}
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-xs font-bold text-slate-500 uppercase">Título da Vivência</Label>
                                    <Input
                                        placeholder="Ex: Explorando Texturas"
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label className="text-xs font-bold text-slate-500 uppercase">Tags / Habilidades</Label>
                                    <Input
                                        placeholder="Ex: Natureza, Sensorial, Artes"
                                        value={tagsInput}
                                        onChange={e => setTagsInput(e.target.value)}
                                        className="mt-1"
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1">Separe por vírgulas.</p>
                                </div>
                            </div>

                            {/* Foto Principal */}
                            <div>
                                <Label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Foto / Evidência Central</Label>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                                <div
                                    onClick={handleImageClick}
                                    className="border-2 border-dashed border-slate-200 rounded-lg p-1 bg-slate-50 relative group cursor-pointer hover:border-indigo-300 transition-colors"
                                >
                                    <img
                                        src={imageUrl}
                                        alt="Preview"
                                        className="w-full h-32 object-cover rounded-md opacity-80 group-hover:opacity-100 transition-opacity"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="bg-white/90 shadow-sm text-slate-600 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ImagePlus className="h-3.5 w-3.5" />
                                            Trocar Imagem
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 2. Narrativa Base */}
                            <div>
                                <Label className="text-xs font-bold text-slate-500 uppercase block mb-2">Narrativa Base (Opcional)</Label>
                                <p className="text-xs text-slate-500 mb-2 leading-relaxed">
                                    Descreva o que aconteceu de forma geral. Você poderá injetar este texto para todos os alunos e depois complementar.
                                </p>
                                <Textarea
                                    placeholder="Ex: Hoje fomos ao jardim e montamos caixas sensoriais..."
                                    className="h-32 resize-none"
                                    value={baseNarrative}
                                    onChange={e => setBaseNarrative(e.target.value)}
                                />
                            </div>

                        </div>
                    </div>

                    {/* Right Panel: Individualization */}
                    <div className="w-2/3 flex flex-col bg-slate-50/50">
                        <div className="px-6 py-4 border-b bg-white flex justify-between items-center shadow-sm z-10">
                            <Label className="text-sm font-bold text-slate-700">Preenchimento Individual</Label>
                            <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded-md">
                                {Object.values(forms).filter(f => f.selected).length} de {classStudents.length} alunos
                            </span>
                        </div>

                        <ScrollArea className="flex-1 p-6">
                            <div className="space-y-4">
                                {classStudents.map(student => {
                                    const form = forms[student.id];
                                    if (!form) return null;

                                    return (
                                        <div key={student.id} className={`bg-white rounded-xl border p-4 shadow-sm transition-opacity ${!form.selected ? 'opacity-50' : ''}`}>
                                            <div className="flex gap-4">
                                                {/* Left side: Avatar & Selection */}
                                                <div className="flex flex-col items-center gap-2 min-w-[80px]">
                                                    <Avatar className="h-12 w-12 border-2 border-slate-100">
                                                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`} />
                                                        <AvatarFallback className="bg-indigo-50 text-indigo-700 font-bold">{student.name.substring(0, 2)}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-xs font-bold text-slate-700 text-center truncate w-full">{student.name.split(' ')[0]}</span>
                                                    <div className="flex items-center space-x-1.5 mt-1 bg-slate-50 py-1 px-2 rounded-md border text-[10px]">
                                                        <Checkbox
                                                            id={`sel-${student.id}`}
                                                            checked={form.selected}
                                                            onCheckedChange={(checked) => updateForm(student.id, { selected: !!checked })}
                                                            className="h-3 w-3"
                                                        />
                                                        <label htmlFor={`sel-${student.id}`} className="font-medium cursor-pointer">
                                                            Incluir
                                                        </label>
                                                    </div>
                                                </div>

                                                {/* Right side: Individual Note */}
                                                <div className="flex-1">
                                                    <Textarea
                                                        placeholder={`Como o(a) ${student.name.split(' ')[0]} agiu/participou?`}
                                                        className="min-h-[100px] resize-y bg-slate-50/50 focus:bg-white transition-colors"
                                                        value={form.individualNote}
                                                        onChange={e => updateForm(student.id, { individualNote: e.target.value })}
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

                <DialogFooter className="p-4 bg-white border-t shrink-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        Salvar Vivência no Portfólio
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

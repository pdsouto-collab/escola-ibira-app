"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { ClassBoardPost, ClassBoardCategoryType, Project } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TreeDeciduous, Image as ImageIcon, Send, Shapes, Megaphone } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function TroncoNewPost({ selectedClassId }: { selectedClassId: string }) {
    const { currentUser, projects, addClassBoardPost } = useAppStore();
    const [isExpanded, setIsExpanded] = useState(false);

    // Form State
    const [categoryType, setCategoryType] = useState<ClassBoardCategoryType>("Novidades da Turma");
    const [linkedProjectId, setLinkedProjectId] = useState<string>("none");
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [extraMaterials, setExtraMaterials] = useState("");

    const isTeacherOrAdmin = currentUser?.role === "teacher" || currentUser?.role === "director" || currentUser?.role === "admin";

    if (!isTeacherOrAdmin) return null;

    // Acontece na Classe logic
    const isAcontece = categoryType === "Acontece na Classe";
    const availableProjects = projects.filter(p => p.status === "active"); // simple filter, can be scoped by class if needed.

    const handleProjectSelect = (pid: string) => {
        setLinkedProjectId(pid);
        if (pid !== "none") {
            const proj = availableProjects.find(x => x.id === pid);
            if (proj) {
                setTitle(`[Projeto: ${proj.title}]`);
            }
        } else {
            setTitle("");
        }
    };

    const handleSubmit = () => {
        if (!title.trim() && !isAcontece) return; // Validation
        if (isAcontece && linkedProjectId === "none") return;

        let photos = ["https://images.unsplash.com/photo-1577880216142-8549e9488dad?auto=format&fit=crop&q=80"];
        let finalTitle = title;

        if (isAcontece && linkedProjectId !== "none") {
            const proj = availableProjects.find(p => p.id === linkedProjectId);
            if (proj?.imageUrl) {
                photos = [proj.imageUrl];
            }
            if (proj) {
                finalTitle = proj.title;
            }
        }

        const newPost: ClassBoardPost = {
            id: `cbp-${Math.random().toString(36).substr(2, 9)}`,
            classId: selectedClassId,
            authorId: currentUser?.id || "u2",
            authorName: currentUser?.name || "Professor",
            authorRole: "Responsável pela Turma",
            categoryType,
            linkedProjectId: isAcontece && linkedProjectId !== "none" ? linkedProjectId : undefined,
            title: finalTitle,
            content,
            extraMaterials: isAcontece ? extraMaterials : undefined,
            photos,
            createdAt: new Date().toISOString()
        };

        addClassBoardPost(newPost);

        // Reset form
        setIsExpanded(false);
        setTitle("");
        setContent("");
        setExtraMaterials("");
        setLinkedProjectId("none");
    };

    if (!isExpanded) {
        return (
            <div className="mb-8">
                <Button
                    onClick={() => setIsExpanded(true)}
                    className="w-full justify-start h-14 bg-white border border-emerald-200 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 shadow-sm rounded-xl px-4"
                >
                    <TreeDeciduous className="mr-3 h-5 w-5 text-emerald-500" />
                    Criar Novo Post para a Turma...
                </Button>
            </div>
        );
    }

    return (
        <div className="mb-8 bg-white border border-emerald-100 rounded-xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="bg-emerald-50/50 px-4 py-3 border-b border-emerald-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <TreeDeciduous className="h-5 w-5 text-emerald-600" />
                    <span className="font-semibold text-emerald-900">Novo Recado</span>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* Category Selection */}
                <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                    <button
                        onClick={() => setCategoryType("Novidades da Turma")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${!isAcontece ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Megaphone className="h-4 w-4" />
                        Novidades da Turma
                    </button>
                    <button
                        onClick={() => setCategoryType("Acontece na Classe")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${isAcontece ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Shapes className="h-4 w-4" />
                        Acontece na Classe
                    </button>
                </div>

                {isAcontece && (
                    <div className="space-y-3 p-4 bg-emerald-50/50 rounded-lg border border-emerald-100/50">
                        <label className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                            Vincular a um Projeto
                        </label>
                        <Select value={linkedProjectId} onValueChange={handleProjectSelect}>
                            <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Selecione um Projeto" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none" className="text-slate-500 italic">Nenhum projeto selecionado</SelectItem>
                                {availableProjects.map(p => (
                                    <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Textarea
                            placeholder="Materiais e Detalhes Adicionais (Ex: Livro específico usado)"
                            value={extraMaterials}
                            onChange={(e) => setExtraMaterials(e.target.value)}
                            className="bg-white min-h-[80px]"
                        />
                    </div>
                )}

                {/* Main Content Area */}
                <div className="space-y-3">
                    {!isAcontece && (
                        <Input
                            placeholder="Título do Recado"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="font-medium bg-slate-50 border-transparent hover:border-slate-200 focus:border-emerald-300 focus:bg-white"
                        />
                    )}

                    <Textarea
                        placeholder={isAcontece ? "Relato sobre a vivência do projeto..." : "O que você quer contar para a turma?"}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="min-h-[120px] bg-slate-50 border-transparent hover:border-slate-200 focus:border-emerald-300 focus:bg-white"
                    />
                </div>
            </div>

            <div className="bg-slate-50 px-4 py-3 border-t flex items-center justify-between">
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="h-9 w-9 text-slate-500 hover:text-slate-700 rounded-full">
                        <ImageIcon className="h-4 w-4" />
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" onClick={() => setIsExpanded(false)} className="text-slate-500 hover:text-slate-900">
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6 shadow-sm"
                        disabled={!title.trim() && !isAcontece}
                    >
                        <Send className="mr-2 h-4 w-4" />
                        Postar Recado
                    </Button>
                </div>
            </div>
        </div>
    );
}

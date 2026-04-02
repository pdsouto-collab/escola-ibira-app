"use client";

import { useState, useRef, useEffect } from "react";
import { ClassBoardCategoryType } from "@/types/class-board-post";
import { createClassBoardPost } from "@/services/class-board.service";
import { Project } from "@/types/project";
import { getProjects } from "@/services/project.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TreeDeciduous, Image as ImageIcon, Send, Shapes, Megaphone } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSession } from "next-auth/react";
import { toast } from "sonner";


export function TroncoNewPost({ selectedClassId }: { selectedClassId: string }) {
    const { data: session } = useSession();
    const currentUser = session?.user as any;
    const [isExpanded, setIsExpanded] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [categoryType, setCategoryType] = useState<ClassBoardCategoryType>("Novidades da Turma");
    const [linkedProjectId, setLinkedProjectId] = useState<string>("none");
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [extraMaterials, setExtraMaterials] = useState("");
    const [customPhoto, setCustomPhoto] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [projects, setProjects] = useState<Project[]>([]);

    useEffect(() => {
        async function fetchProj() {
            const data = await getProjects();
            setProjects(data || []);
        }
        fetchProj();
    }, []);

    const isTeacherOrAdmin = currentUser?.role === "teacher" || currentUser?.role === "director" || currentUser?.role === "admin";

    if (!isTeacherOrAdmin) return null;

    // Projetos da Classe logic
    const isAcontece = categoryType === "Projetos da Classe";
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

    const handleSubmit = async () => {
        if (!title.trim() && !isAcontece) return; // Validation
        if (isAcontece && linkedProjectId === "none") return;

        setIsSubmitting(true);

        let photos: string[] = [];
        if (customPhoto) {
            photos = [customPhoto];
        } else if (!isAcontece) {
            photos = ["https://images.unsplash.com/photo-1577880216142-8549e9488dad?auto=format&fit=crop&q=80"]; // default fallback
        }

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

        const newPost = await createClassBoardPost({
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
        });

        setIsSubmitting(false);

        if (newPost) {
            toast.success("Recado postado com sucesso!");
            window.dispatchEvent(new Event("classBoardPostAdded"));

            // Reset form
            setIsExpanded(false);
            setTitle("");
            setContent("");
            setExtraMaterials("");
            setLinkedProjectId("none");
            setCustomPhoto("");
            if (fileInputRef.current) fileInputRef.current.value = "";
        } else {
            toast.error("Erro ao postar recado. Tente novamente.");
        }
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

    // Image attach logic
    const handleAttachImage = () => {
        if (isSubmitting) return;
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.info("Comprimindo imagem para otimizar envio...");
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const img = new Image();
            img.onload = () => {
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

                const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
                setCustomPhoto(dataUrl);
            };
            img.src = reader.result as string;
        };
        reader.readAsDataURL(file);
    };

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
                <div className={`flex gap-2 p-1 bg-slate-100 rounded-lg ${isSubmitting ? 'opacity-70 pointer-events-none' : ''}`}>
                    <button
                        onClick={() => setCategoryType("Novidades da Turma")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${!isAcontece ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Megaphone className="h-4 w-4" />
                        Novidades da Turma
                    </button>
                    <button
                        onClick={() => setCategoryType("Projetos da Classe")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${isAcontece ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Shapes className="h-4 w-4" />
                        Projetos da Classe
                    </button>
                </div>

                {isAcontece && (
                    <div className="space-y-3 p-4 bg-emerald-50/50 rounded-lg border border-emerald-100/50">
                        <label className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                            Vincular a um Projeto
                        </label>
                        <Select value={linkedProjectId} onValueChange={handleProjectSelect} disabled={isSubmitting}>
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
                            disabled={isSubmitting}
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
                            disabled={isSubmitting}
                            className="font-medium bg-slate-50 border-transparent hover:border-slate-200 focus:border-emerald-300 focus:bg-white"
                        />
                    )}

                    <Textarea
                        placeholder={isAcontece ? "Relato sobre a vivência do projeto..." : "O que você quer contar para a turma?"}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        disabled={isSubmitting}
                        className="min-h-[120px] bg-slate-50 border-transparent hover:border-slate-200 focus:border-emerald-300 focus:bg-white"
                    />

                    {/* Image Preview */}
                    {customPhoto && (
                        <div className="relative mt-2 rounded-lg overflow-hidden border border-slate-200 aspect-[4/3] max-w-sm">
                            <button
                                onClick={() => setCustomPhoto("")}
                                disabled={isSubmitting}
                                className="absolute top-2 right-2 bg-white/90 text-slate-700 rounded-full p-1.5 shadow-sm hover:bg-red-50 hover:text-red-600 transition-colors z-10 disabled:opacity-50"
                            >
                                <span className="sr-only">Remover foto</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </button>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={customPhoto} alt="Preview Anexo" className="w-full h-full object-cover" />
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-slate-50 px-4 py-3 border-t flex items-center justify-between">
                <div className="flex gap-2">
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleAttachImage}
                        disabled={isSubmitting}
                        className="h-9 w-9 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
                        title="Anexar imagem (arquivo)"
                    >
                        <ImageIcon className="h-4 w-4" />
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" onClick={() => setIsExpanded(false)} disabled={isSubmitting} className="text-slate-500 hover:text-slate-900">
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6 shadow-sm"
                        disabled={(!title.trim() && !isAcontece) || isSubmitting}
                    >
                        {isSubmitting ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Postando...
                            </span>
                        ) : (
                            <span className="flex items-center">
                                <Send className="mr-2 h-4 w-4" />
                                Postar Recado
                            </span>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}

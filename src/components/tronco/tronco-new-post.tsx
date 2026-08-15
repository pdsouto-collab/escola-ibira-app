"use client";

import { useState, useRef, useEffect } from "react";
import { ClassBoardCategoryType } from "@/types/class-board-post";
import { createClassBoardPost } from "@/services/class-board.service";
import { Project } from "@/types/project";
import { getProjects } from "@/services/project.service";
import { SchoolClass } from "@/types/school-class";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TreeDeciduous, Image as ImageIcon, Send, Shapes, Megaphone, GraduationCap, Crop } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { ImageFramingDialog } from "@/components/ui/image-framing-dialog";


export function TroncoNewPost({ selectedClassId, classes = [] }: { selectedClassId: string; classes?: SchoolClass[] }) {
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
    const [customPhotos, setCustomPhotos] = useState<string[]>([]);
    const [framingModalOpen, setFramingModalOpen] = useState(false);
    const [imageToFrame, setImageToFrame] = useState<{ src: string; index?: number } | null>(null);
    const [targetClassIds, setTargetClassIds] = useState<string[]>(() => {
        if (selectedClassId && selectedClassId !== "all") {
            return [selectedClassId];
        }
        return ["all"];
    });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [projects, setProjects] = useState<Project[]>([]);

    useEffect(() => {
        if (selectedClassId && selectedClassId !== "all") {
            setTargetClassIds([selectedClassId]);
        }
    }, [selectedClassId]);

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
        const trimmedTitle = title.trim();
        const trimmedContent = content.trim();

        if (isAcontece) {
            if (linkedProjectId === "none") {
                toast.warning("Selecione um projeto para vincular.");
                return;
            }
        } else {
            if (!trimmedTitle && !trimmedContent && customPhotos.length === 0) {
                toast.warning("Escreva uma mensagem ou anexe ao menos uma foto.");
                return;
            }
        }

        setIsSubmitting(true);

        let photos: string[] = [];
        if (!isAcontece && customPhotos.length > 0) {
            photos = customPhotos;
        }

        let finalTitle = trimmedTitle;

        if (isAcontece && linkedProjectId !== "none") {
            const proj = availableProjects.find(p => p.id === linkedProjectId);
            if (proj?.imageUrl) {
                photos = [proj.imageUrl];
            }
            if (proj) {
                finalTitle = proj.title;
            }
        } else if (!finalTitle) {
            finalTitle = trimmedContent
                ? (trimmedContent.slice(0, 50) + (trimmedContent.length > 50 ? "..." : ""))
                : "Novidade da Turma";
        }

        try {
            const newPost = await createClassBoardPost({
                classId: targetClassIds[0] || selectedClassId || "all",
                classIds: targetClassIds,
                authorId: currentUser?.id || "u2",
                authorName: currentUser?.name || "Professor",
                authorRole: "Responsável pela Turma",
                categoryType,
                linkedProjectId: isAcontece && linkedProjectId !== "none" ? linkedProjectId : undefined,
                title: finalTitle,
                content: trimmedContent,
                extraMaterials: isAcontece ? extraMaterials : undefined,
                photos,
            } as any);

            if (newPost) {
                toast.success("Recado postado com sucesso!");
                window.dispatchEvent(new Event("classBoardPostAdded"));

                // Reset form
                setIsExpanded(false);
                setTitle("");
                setContent("");
                setExtraMaterials("");
                setLinkedProjectId("none");
                setCustomPhotos([]);
                if (fileInputRef.current) fileInputRef.current.value = "";
            } else {
                toast.error("Erro ao postar recado. Tente novamente.");
            }
        } catch (error) {
            console.error("Erro ao postar recado:", error);
            toast.error("Falha ao postar recado. Tente novamente.");
        } finally {
            setIsSubmitting(false);
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

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const availableSlots = 5 - customPhotos.length;
        if (availableSlots <= 0) {
            toast.warning("Limite de 5 fotos atingido.");
            return;
        }

        const filesToProcess = files.slice(0, availableSlots);

        const promises = filesToProcess.map(file => {
            return new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement("canvas");
                        const MAX_DIM = 1200;
                        let width = img.width;
                        let height = img.height;

                        if (width > height) {
                            if (width > MAX_DIM) {
                                height = Math.round((height * MAX_DIM) / width);
                                width = MAX_DIM;
                            }
                        } else {
                            if (height > MAX_DIM) {
                                width = Math.round((width * MAX_DIM) / height);
                                height = MAX_DIM;
                            }
                        }

                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext("2d");
                        if (ctx) {
                            ctx.imageSmoothingEnabled = true;
                            ctx.imageSmoothingQuality = "high";
                            ctx.drawImage(img, 0, 0, width, height);
                        }

                        const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
                        resolve(dataUrl);
                    };
                    img.src = reader.result as string;
                };
                reader.readAsDataURL(file);
            });
        });

        const newPhotos = await Promise.all(promises);
        setCustomPhotos(prev => [...prev, ...newPhotos].slice(0, 5));
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleRemovePhoto = (index: number) => {
        setCustomPhotos(prev => prev.filter((_, i) => i !== index));
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

                {/* Seletor de Turma Destino */}
                <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                            <GraduationCap className="h-4 w-4 text-emerald-600" />
                            Turma Destino do Recado
                        </label>
                        <button
                            type="button"
                            onClick={() => {
                                if (targetClassIds.includes("all")) {
                                    setTargetClassIds(classes.length > 0 ? [classes[0].id] : []);
                                } else {
                                    setTargetClassIds(["all"]);
                                }
                            }}
                            className={`text-xs font-bold px-2.5 py-1 rounded-md transition-all ${targetClassIds.includes("all") ? "bg-purple-600 text-white shadow-xs" : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"}`}
                        >
                            🏫 Todas as Turmas
                        </button>
                    </div>

                    {!targetClassIds.includes("all") && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                            {classes.map(c => {
                                const isSelected = targetClassIds.includes(c.id);
                                return (
                                    <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => {
                                            if (isSelected) {
                                                const next = targetClassIds.filter(id => id !== c.id);
                                                setTargetClassIds(next.length > 0 ? next : ["all"]);
                                            } else {
                                                setTargetClassIds([...targetClassIds.filter(id => id !== "all"), c.id]);
                                            }
                                        }}
                                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all ${isSelected ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs" : "bg-white border-slate-200 text-slate-600 hover:border-emerald-300"}`}
                                    >
                                        {c.name}
                                    </button>
                                );
                            })}
                        </div>
                    )}
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
                                <SelectItem value="none">Selecione um projeto...</SelectItem>
                                {availableProjects.map((proj) => (
                                    <SelectItem key={proj.id} value={proj.id}>
                                        {proj.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Textarea
                            placeholder="Materiais e Detalhes solicitados para os pais (opcional)..."
                            value={extraMaterials}
                            onChange={(e) => setExtraMaterials(e.target.value)}
                            disabled={isSubmitting}
                            className="text-xs bg-white/80 border-emerald-200/60 focus:bg-white"
                            rows={2}
                        />
                    </div>
                )}

                {/* Title & Body */}
                <div className="space-y-3">
                    {!isAcontece && (
                        <Input
                            placeholder="Título do Recado (ex: Oficina de Música na Sexta)"
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

                    {/* Image Preview Carousel / Grid (up to 5 photos) */}
                    {!isAcontece && customPhotos.length > 0 && (
                        <div className="space-y-2 pt-1">
                            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                                <span>Fotos do Carrossel ({customPhotos.length}/5)</span>
                                {customPhotos.length < 5 && (
                                    <button
                                        type="button"
                                        onClick={handleAttachImage}
                                        className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                                    >
                                        + Adicionar foto
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                {customPhotos.map((photo, index) => (
                                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={photo} alt={`Anexo ${index + 1}`} className="w-full h-full object-cover" />
                                        
                                        {/* Ações de Foto: Enquadrar e Remover */}
                                        <div className="absolute top-1 right-1 flex items-center gap-1 z-10">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setImageToFrame({ src: photo, index });
                                                    setFramingModalOpen(true);
                                                }}
                                                className="bg-black/70 hover:bg-indigo-600 text-white rounded-full p-1 shadow-md transition-all"
                                                title="Ajustar Enquadramento / Recorte"
                                            >
                                                <Crop className="w-3 h-3" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleRemovePhoto(index)}
                                                disabled={isSubmitting}
                                                className="bg-black/70 hover:bg-red-600 text-white rounded-full p-1 shadow-md transition-all"
                                                title="Remover foto"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                            </button>
                                        </div>

                                        <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                                            {index + 1}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-slate-50 px-4 py-3 border-t flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />
                    {!isAcontece && (
                        <Button
                            variant="outline"
                            size="sm"
                            type="button"
                            onClick={handleAttachImage}
                            disabled={isSubmitting || customPhotos.length >= 5}
                            className="text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg gap-1.5 text-xs font-medium"
                            title="Anexar fotos (até 5)"
                        >
                            <ImageIcon className="h-4 w-4" />
                            {customPhotos.length > 0 ? `Adicionar Fotos (${customPhotos.length}/5)` : "Fotos (até 5)"}
                        </Button>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" onClick={() => setIsExpanded(false)} disabled={isSubmitting} className="text-slate-500 hover:text-slate-900">
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6 shadow-sm"
                        disabled={
                            isSubmitting ||
                            (isAcontece ? linkedProjectId === "none" : (!title.trim() && !content.trim() && customPhotos.length === 0))
                        }
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

            {/* Modal de Enquadramento Reutilizável */}
            <ImageFramingDialog
                open={framingModalOpen}
                onOpenChange={setFramingModalOpen}
                imageSrc={imageToFrame?.src || null}
                onApply={(framedDataUrl) => {
                    if (imageToFrame && typeof imageToFrame.index === "number") {
                        setCustomPhotos(prev => {
                            const copy = [...prev];
                            copy[imageToFrame.index!] = framedDataUrl;
                            return copy;
                        });
                    }
                }}
            />
        </div>
    );
}

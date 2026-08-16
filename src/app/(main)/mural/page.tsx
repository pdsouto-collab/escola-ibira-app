"use client";



import { Plus, Calendar, MapPin, MessageCircle, User, Edit2, Check, X, Users, MoreVertical, Trash2, Pencil, Clock, Loader2, Maximize2, Sliders, Crop, Move, Sparkles, GraduationCap, Archive, ArchiveRestore } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { getMuralEvents, createMuralEvent, updateMuralEvent, deleteMuralEvent, addMuralComment } from "@/services/mural.service";
import { MuralEvent } from "@/types/mural";
import { SchoolClass } from "@/types/school-class";
import { getClasses } from "@/services/school-class.service";
import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback, useRef } from "react";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ImageFramingDialog } from "@/components/ui/image-framing-dialog";

export default function MuralPage() {
    const { data: session } = useSession();
    const currentUser = session?.user as any;

    // State
    const [muralEvents, setMuralEvents] = useState<MuralEvent[]>([]);
    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEventsLoading, setIsEventsLoading] = useState(true);

    // UI State
    const [showNewEventForm, setShowNewEventForm] = useState(false);
    const [editingEventId, setEditingEventId] = useState<string | null>(null);
    const [confirmDeleteEventId, setConfirmDeleteEventId] = useState<string | null>(null);
    const [selectedClassId, setSelectedClassId] = useState<string>("all");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submittingCommentId, setSubmittingCommentId] = useState<string | null>(null);
    const [selectedLightboxImage, setSelectedLightboxImage] = useState<string | null>(null);

    // Framing / Crop Tool State
    const [framingModalOpen, setFramingModalOpen] = useState(false);
    const [rawImageToFrame, setRawImageToFrame] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Helper function to compress image files before storing / sending to prevent payload limits
    const compressImageFile = (file: File, maxDim = 1280, quality = 0.82): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const rawData = e.target?.result as string;
                const img = new Image();
                img.onload = () => {
                    let { width, height } = img;
                    if (width > maxDim || height > maxDim) {
                        if (width > height) {
                            height = Math.round((height * maxDim) / width);
                            width = maxDim;
                        } else {
                            width = Math.round((width * maxDim) / height);
                            height = maxDim;
                        }
                    }
                    const canvas = document.createElement("canvas");
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    if (!ctx) {
                        resolve(rawData);
                        return;
                    }
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = "high";
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL("image/jpeg", quality));
                };
                img.onerror = () => resolve(rawData);
                img.src = rawData;
            };
            reader.onerror = () => resolve("");
            reader.readAsDataURL(file);
        });
    };

    const [viewTab, setViewTab] = useState<"active" | "archived">("active");

    // Fetching Data
    const fetchMuralEvents = useCallback(async (classId?: string, isArchived: boolean = false) => {
        setIsEventsLoading(true);
        try {
            const data = await getMuralEvents(classId === "all" ? undefined : classId, isArchived);
            const now = new Date().getTime();
            const getTime = (d: any) => {
                if (!d) return 0;
                const t = new Date(d).getTime();
                return isNaN(t) ? 0 : t;
            };
            const sortedEvents = Array.isArray(data)
                ? [...data].sort((a, b) => {
                    const timeA = getTime(a.date);
                    const timeB = getTime(b.date);
                    const isUpcomingA = timeA >= now;
                    const isUpcomingB = timeB >= now;

                    // Both upcoming: closest to current date first (ascending)
                    if (isUpcomingA && isUpcomingB) return timeA - timeB;
                    // Upcoming events come first
                    if (isUpcomingA && !isUpcomingB) return -1;
                    if (!isUpcomingA && isUpcomingB) return 1;
                    // Both past: most recent past first (descending)
                    return timeB - timeA;
                })
                : [];
            setMuralEvents(sortedEvents);
        } catch (error) {
            console.error("Erro ao buscar eventos do mural:", error);
            setMuralEvents([]);
        } finally {
            setIsEventsLoading(false);
        }
    }, []);

    const fetchClasses = async () => {
        try {
            const data = await getClasses();
            setClasses(data);
        } catch (error) {
            console.error("Erro ao buscar turmas:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchClasses();
        fetchMuralEvents(selectedClassId, viewTab === "archived");
    }, [selectedClassId, viewTab, fetchMuralEvents]);

    const handleArchiveToggle = async (event: MuralEvent) => {
        const newStatus = !event.isArchived;
        try {
            await updateMuralEvent(event.id, { isArchived: newStatus });
            toast.success(newStatus ? "Evento arquivado com sucesso" : "Evento reativado no mural!");
            await fetchMuralEvents(selectedClassId, viewTab === "archived");
        } catch (error) {
            console.error("Erro ao alterar status do evento:", error);
            toast.error("Erro ao alterar status do evento");
        }
    };

    // New Event Form State
    const [newEvent, setNewEvent] = useState({
        title: "",
        description: "",
        date: format(new Date(), "yyyy-MM-dd"),
        time: "09:00",
        location: "",
        image: "",
        classId: "all"
    });

    // Comment Form State
    const [newCommentText, setNewCommentText] = useState<{ [key: string]: string }>({});

    const resetForm = () => {
        setNewEvent({
            title: "",
            description: "",
            date: format(new Date(), "yyyy-MM-dd"),
            time: "09:00",
            location: "",
            image: "",
            classId: "all"
        });
        setEditingEventId(null);
        setShowNewEventForm(false);
        setRawImageToFrame(null);
    };

    const handleSelectRawImage = (dataUrl: string) => {
        setRawImageToFrame(dataUrl);
        // Pre-set the image so it's loaded immediately
        setNewEvent(prev => ({ ...prev, image: dataUrl }));
        setFramingModalOpen(true);
    };

    const handleCreateEvent = async () => {
        if (!newEvent.title || !newEvent.title.trim()) {
            toast.error("Por favor, preencha o título do evento.");
            return;
        }

        setIsSubmitting(true);
        const finalDate = newEvent.date || format(new Date(), "yyyy-MM-dd");
        const finalTime = newEvent.time || "09:00";
        const eventDate = `${finalDate}T${finalTime}:00`;

        const authorName = currentUser?.name || session?.user?.name || "Administração";

        const eventData = {
            title: newEvent.title.trim(),
            description: newEvent.description || "",
            date: eventDate,
            location: newEvent.location || "",
            image: newEvent.image || "",
            classId: newEvent.classId === "all" ? null : newEvent.classId,
            author: authorName,
            type: "event" as const,
        };

        try {
            if (editingEventId) {
                await updateMuralEvent(editingEventId, eventData);
                toast.success("Evento atualizado com sucesso");
            } else {
                const created = await createMuralEvent(eventData);
                toast.success("Evento criado com sucesso");
                if (created) {
                    setMuralEvents(prev => [created, ...prev.filter(ev => ev.id !== created.id)]);
                }
            }
            await fetchMuralEvents(selectedClassId);
            resetForm();
        } catch (error: any) {
            console.error("Erro ao salvar evento:", error);
            toast.error(error?.message || "Erro ao salvar evento");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditClick = (event: MuralEvent) => {
        const dateObj = new Date(event.date);
        setNewEvent({
            title: event.title,
            description: event.description,
            date: format(dateObj, "yyyy-MM-dd"),
            time: format(dateObj, "HH:mm"),
            location: event.location || "",
            image: event.image || "",
            classId: event.classId || "all"
        });
        setEditingEventId(event.id);
        setShowNewEventForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteClick = (id: string) => {
        setConfirmDeleteEventId(id);
    };

    const confirmDeleteAction = async () => {
        if (confirmDeleteEventId) {
            try {
                await deleteMuralEvent(confirmDeleteEventId);
                setMuralEvents(prev => prev.filter(e => e.id !== confirmDeleteEventId));
                setConfirmDeleteEventId(null);
            } catch (error) {
                console.error("Erro ao deletar evento:", error);
                toast.error("Erro ao excluir evento");
            }
        }
    };

    const handleAddComment = async (eventId: string) => {
        const text = newCommentText[eventId];
        if (!text?.trim() || !currentUser) return;

        setSubmittingCommentId(eventId);
        try {
            await addMuralComment(eventId, {
                author: currentUser.name,
                text: text
            });
            fetchMuralEvents(selectedClassId);
            setNewCommentText({ ...newCommentText, [eventId]: "" });
            toast.success("Comentário adicionado");
        } catch (error) {
            console.error("Erro ao adicionar comentário:", error);
            toast.error("Erro ao adicionar comentário");
        } finally {
            setSubmittingCommentId(null);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        Mural de Eventos
                    </h1>
                    <p className="text-slate-500">
                        Fique por dentro das novidades e celebrações da escola.
                    </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filtrar por turma" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas as Turmas</SelectItem>
                            {classes.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                    {c.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {/* RBAC: Only allowed roles can create events */}
                    {["admin", "director", "teacher"].includes(currentUser?.role || "") && (
                        <button
                            onClick={() => {
                                if (showNewEventForm) {
                                    resetForm();
                                } else {
                                    setShowNewEventForm(true);
                                }
                            }}
                            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors whitespace-nowrap"
                        >
                            {showNewEventForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                            {showNewEventForm ? "Cancelar" : "Novo Evento"}
                        </button>
                    )}
                </div>
            </div>

            {showNewEventForm && (
                <div className="rounded-xl border bg-white p-6 shadow-sm animate-in fade-in slide-in-from-top-4">
                    <h3 className="font-semibold text-lg mb-4">{editingEventId ? "Editar Evento" : "Criar Novo Evento"}</h3>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Título</label>
                            <input
                                value={newEvent.title}
                                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                className="rounded-md border p-2 text-sm w-full focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder="Ex: Festa Junina"
                            />
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Turma</label>
                            <Select
                                value={newEvent.classId}
                                onValueChange={(value) => setNewEvent({ ...newEvent, classId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione a turma (ou Todas)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas as Turmas</SelectItem>
                                    {classes.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Descrição</label>
                            <textarea
                                value={newEvent.description}
                                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                className="rounded-md border p-2 text-sm w-full focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder="Detalhes do evento..."
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Data</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={newEvent.date}
                                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                                        className="rounded-md border p-2 pl-9 text-sm w-full focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    />
                                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Hora</label>
                                <div className="relative">
                                    <input
                                        type="time"
                                        value={newEvent.time}
                                        onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                                        className="rounded-md border p-2 pl-9 text-sm w-full focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    />
                                    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Local</label>
                            <div className="relative">
                                <input
                                    value={newEvent.location}
                                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                                    className="rounded-md border p-2 pl-9 text-sm w-full focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    placeholder="Ex: Quadra Poliesportiva"
                                />
                                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Imagem de Capa do Evento (Opcional)</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newEvent.image.startsWith("data:") ? "(Foto personalizada carregada)" : newEvent.image}
                                    onChange={(e) => {
                                        if (!e.target.value.startsWith("(Foto")) {
                                            setNewEvent({ ...newEvent, image: e.target.value });
                                        }
                                    }}
                                    className="flex-1 rounded-md border p-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    placeholder="Cole a URL ou envie uma foto..."
                                />
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            try {
                                                const compressed = await compressImageFile(file);
                                                if (compressed) {
                                                    handleSelectRawImage(compressed);
                                                }
                                            } catch (err) {
                                                console.error("Erro ao carregar imagem:", err);
                                                toast.error("Erro ao processar imagem.");
                                            }
                                            e.target.value = "";
                                        }
                                    }}
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-4 py-2 bg-slate-100 border rounded-md text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors flex items-center gap-1.5"
                                >
                                    <Crop className="h-4 w-4 text-primary" />
                                    Enviar Foto
                                </button>
                            </div>

                            {newEvent.image && (
                                <div className="mt-2 space-y-2">
                                    <div className="relative aspect-[16/9] sm:aspect-[21/9] max-h-56 w-full rounded-lg overflow-hidden bg-slate-900 border shadow-sm group/image">
                                        {/* Blurred backdrop */}
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={newEvent.image} alt="" className="absolute inset-0 w-full h-full object-cover blur-sm opacity-40" />
                                        {/* Sharp image */}
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={newEvent.image} alt="Preview" className="relative h-full w-full object-cover" />
                                        
                                        <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover/image:opacity-100 transition-opacity">
                                            <button
                                                type="button"
                                                onClick={() => handleSelectRawImage(newEvent.image)}
                                                className="p-1.5 bg-black/70 text-white rounded-md hover:bg-black/90 transition-colors backdrop-blur-sm flex items-center gap-1 text-xs px-2.5 font-medium shadow-md"
                                                title="Ajustar Enquadramento"
                                            >
                                                <Crop className="h-3.5 w-3.5" /> Reajustar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setNewEvent({ ...newEvent, image: "" })}
                                                className="p-1.5 bg-black/70 text-white rounded-md hover:bg-red-600 transition-colors backdrop-blur-sm shadow-md"
                                                title="Remover foto"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        💡 Dica: Clique em <strong>Reajustar</strong> para escolher a área visível (cima, centro, baixo, zoom) de fotos verticais ou horizontais.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button
                                onClick={handleCreateEvent}
                                disabled={isSubmitting}
                                className="flex-1 bg-primary text-white p-2.5 rounded-md font-medium hover:bg-primary/90 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        {editingEventId ? "Salvando..." : "Publicando..."}
                                    </>
                                ) : (
                                    editingEventId ? "Salvar Alterações" : "Publicar Evento"
                                )}
                            </button>
                            {editingEventId && (
                                <button
                                    onClick={resetForm}
                                    disabled={isSubmitting}
                                    className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-md font-medium hover:bg-slate-200 transition-colors disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs for Active vs Archived Events */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                <button
                    onClick={() => setViewTab("active")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        viewTab === "active"
                            ? "bg-purple-600 text-white shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                >
                    <Calendar className="w-3.5 h-3.5" />
                    Eventos Ativos
                </button>
                {["admin", "director", "teacher"].includes(currentUser?.role || "") && (
                    <button
                        onClick={() => setViewTab("archived")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            viewTab === "archived"
                                ? "bg-purple-600 text-white shadow-xs"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                    >
                        <Archive className="w-3.5 h-3.5" />
                        Eventos Arquivados
                    </button>
                )}
            </div>

            <div className="grid gap-6">
                {isEventsLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
                        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <p>Carregando mural...</p>
                    </div>
                ) : muralEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4 border rounded-xl bg-slate-50/50 border-dashed">
                        <Calendar className="h-12 w-12 opacity-20" />
                        <p>{viewTab === "archived" ? "Nenhum evento arquivado." : "Nenhum evento encontrado."}</p>
                    </div>
                ) : (
                    muralEvents.map((event) => (
                        <div key={event.id} className="rounded-xl border bg-white shadow-sm overflow-hidden relative group transition-all hover:shadow-md">
                            {/* RBAC: Only allowed roles can edit/delete/archive */}
                            {["admin", "director", "teacher"].includes(currentUser?.role || "") && (
                                <div className="absolute top-4 right-4 z-20">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md border hover:bg-white text-slate-700 transition-colors">
                                                <MoreVertical className="h-4 w-4" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleEditClick(event)}>
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Editar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleArchiveToggle(event)}>
                                                {event.isArchived ? (
                                                    <>
                                                        <ArchiveRestore className="mr-2 h-4 w-4 text-emerald-600" />
                                                        <span className="text-emerald-700 font-medium">Reativar no Mural</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Archive className="mr-2 h-4 w-4 text-amber-600" />
                                                        <span className="text-amber-700 font-medium">Arquivar Evento</span>
                                                    </>
                                                )}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onClick={() => handleDeleteClick(event.id)}>
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Excluir
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            )}

                            {event.image && (
                                <div 
                                    onClick={() => setSelectedLightboxImage(event.image)}
                                    className="relative w-full aspect-[16/9] sm:aspect-[21/9] max-h-[360px] overflow-hidden bg-slate-950 cursor-pointer group/cardimg select-none"
                                >
                                    {/* Blurred background */}
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={event.image} alt="" className="absolute inset-0 w-full h-full object-cover blur-md opacity-35 scale-105" />
                                    {/* Crisp main image */}
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={event.image} alt={event.title} className="relative w-full h-full object-cover transition-transform duration-300 group-hover/cardimg:scale-[1.02]" />
                                    
                                    <div className="absolute inset-0 bg-black/0 group-hover/cardimg:bg-black/20 transition-colors flex items-center justify-center pointer-events-none">
                                        <span className="opacity-0 group-hover/cardimg:opacity-100 bg-black/75 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-xs transition-opacity flex items-center gap-1.5 shadow-lg">
                                            <Maximize2 className="w-3.5 h-3.5" /> Ampliar foto
                                        </span>
                                    </div>
                                </div>
                            )}
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-full min-w-0">
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-2xs ${
                                                event.classId 
                                                    ? "bg-purple-100 text-purple-800 border border-purple-200" 
                                                    : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                            }`}>
                                                <GraduationCap className="w-3.5 h-3.5" />
                                                {event.classId ? (classes.find(c => c.id === event.classId)?.name || "Turma Específica") : "Todas as Turmas"}
                                            </span>
                                        </div>
                                        <h2 className="text-xl font-bold text-slate-900 break-words">{event.title}</h2>
                                        <div className="flex items-center gap-4 text-sm text-slate-500 mt-2 flex-wrap">
                                            <span className="flex items-center gap-1 font-medium">
                                                <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
                                                {format(new Date(event.date), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                                            </span>
                                            {event.location && (
                                                <span className="flex items-center gap-1 font-medium">
                                                    <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                                                    {event.location}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <p className="text-slate-600 mb-6 break-words [overflow-wrap:anywhere] whitespace-pre-wrap">{event.description}</p>

                                <div className="border-t pt-4">
                                    <div className="flex items-center gap-2 text-slate-900 font-medium mb-4">
                                        <MessageCircle className="h-5 w-5 shrink-0" />
                                        Comentários ({event.comments?.length || 0})
                                    </div>

                                    <div className="space-y-4 mb-4">
                                        {event.comments?.map((comment) => (
                                            <div key={comment.id} className="bg-slate-50 p-3 rounded-lg text-sm overflow-hidden">
                                                <div className="flex justify-between items-center mb-1 gap-2">
                                                    <span className="font-semibold text-slate-900 flex items-center gap-2 min-w-0 truncate">
                                                        <User className="h-3 w-3 shrink-0" />
                                                        <span className="truncate">{comment.author}</span>
                                                    </span>
                                                    <span className="text-slate-400 text-xs shrink-0">
                                                        {format(new Date(comment.date), "dd/MM HH:mm")}
                                                    </span>
                                                </div>
                                                <p className="text-slate-700 break-words [overflow-wrap:anywhere] whitespace-pre-wrap">{comment.text}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Escreva um comentário..."
                                            value={newCommentText[event.id] || ""}
                                            onChange={(e) => setNewCommentText({ ...newCommentText, [event.id]: e.target.value })}
                                            onKeyDown={(e) => e.key === "Enter" && handleAddComment(event.id)}
                                            className="flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                        />
                                        <button
                                            onClick={() => handleAddComment(event.id)}
                                            disabled={submittingCommentId === event.id}
                                            className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 disabled:opacity-70 flex items-center gap-2 min-w-[80px] justify-center"
                                        >
                                            {submittingCommentId === event.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                "Enviar"
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal de Enquadramento Interativo Global */}
            <ImageFramingDialog
                open={framingModalOpen}
                onOpenChange={setFramingModalOpen}
                imageSrc={rawImageToFrame}
                aspectRatio="16/9"
                title="Ajustar Capa do Evento"
                onApply={(framed) => {
                    setNewEvent(prev => ({ ...prev, image: framed }));
                    toast.success("Foto de capa enquadrada com sucesso!");
                }}
            />

            {/* Modal Lightbox Foto Ampliada */}
            <Dialog open={!!selectedLightboxImage} onOpenChange={(open) => !open && setSelectedLightboxImage(null)}>
                <DialogContent className="max-w-4xl p-2 bg-black/95 border-none shadow-2xl flex flex-col items-center justify-center">
                    <div className="relative w-full max-h-[85vh] flex items-center justify-center overflow-hidden">
                        {selectedLightboxImage && (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img 
                                src={selectedLightboxImage} 
                                alt="Evento ampliado" 
                                className="max-h-[80vh] w-auto max-w-full object-contain rounded-lg shadow-2xl" 
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={!!confirmDeleteEventId}
                onOpenChange={(open) => !open && setConfirmDeleteEventId(null)}
                title="Excluir Evento"
                description="Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita."
                onConfirm={confirmDeleteAction}
            />
        </div>
    );
}

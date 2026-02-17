"use client";



import { useState } from "react";
import { Plus, Calendar, MapPin, MessageCircle, User, Edit2, Check, X, Users } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAppStore } from "@/lib/store";
import { MuralEvent } from "@/lib/data";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function MuralPage() {
    const { muralEvents, addMuralEvent, addCommentToEvent, currentUser, classes } = useAppStore();
    const [showNewEventForm, setShowNewEventForm] = useState(false);

    // Filter State
    const [selectedClassId, setSelectedClassId] = useState<string>("all");

    // New Event Form State
    const [newEvent, setNewEvent] = useState({
        title: "",
        description: "",
        date: "",
        time: "",
        location: "",
        image: "",
        classId: "all" // Default to all classes
    });

    // Comment Form State
    const [newCommentText, setNewCommentText] = useState<{ [key: string]: string }>({});

    const filteredEvents = muralEvents.filter(event => {
        if (selectedClassId === "all") return true;
        // Show events for specific class OR global events (if applicable, but user requirement implies specific view)
        // Let's assume strict filtering for now, or show global events AND class specific events? 
        // Usually, a class view shows class specific + global.
        return event.classId === selectedClassId || !event.classId || event.classId === "all";
    });

    const handleCreateEvent = () => {
        if (!newEvent.title || !newEvent.date) return;

        const eventDate = `${newEvent.date}T${newEvent.time || "00:00"}`;

        const event: MuralEvent = {
            id: Math.random().toString(36).substr(2, 9),
            title: newEvent.title,
            description: newEvent.description,
            date: eventDate,
            author: currentUser.name,
            type: "event",
            location: newEvent.location,
            image: newEvent.image,
            classId: newEvent.classId === "all" ? undefined : newEvent.classId,
            comments: [],
            likes: 0
        };

        addMuralEvent(event);
        setShowNewEventForm(false);
        setNewEvent({ title: "", description: "", date: "", time: "", location: "", image: "", classId: "all" });
    };

    const handleAddComment = (eventId: string) => {
        const text = newCommentText[eventId];
        if (!text?.trim()) return;
        addCommentToEvent(eventId, text);
        setNewCommentText({ ...newCommentText, [eventId]: "" });
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
                    <button
                        onClick={() => setShowNewEventForm(!showNewEventForm)}
                        className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors whitespace-nowrap"
                    >
                        {showNewEventForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        {showNewEventForm ? "Cancelar" : "Novo Evento"}
                    </button>
                </div>
            </div>

            {showNewEventForm && (
                <div className="rounded-xl border bg-white p-6 shadow-sm animate-in fade-in slide-in-from-top-4">
                    <h3 className="font-semibold text-lg mb-4">Criar Novo Evento</h3>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Título</label>
                            <input
                                value={newEvent.title}
                                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                className="rounded-md border p-2 text-sm"
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
                                className="rounded-md border p-2 text-sm"
                                placeholder="Detalhes do evento..."
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Data</label>
                                <input
                                    type="date"
                                    value={newEvent.date}
                                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                                    className="rounded-md border p-2 text-sm"
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Hora</label>
                                <input
                                    type="time"
                                    value={newEvent.time}
                                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                                    className="rounded-md border p-2 text-sm"
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Local</label>
                            <input
                                value={newEvent.location}
                                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                                className="rounded-md border p-2 text-sm"
                                placeholder="Ex: Quadra Poliesportiva"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Imagem (Opcional)</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newEvent.image}
                                    onChange={(e) => setNewEvent({ ...newEvent, image: e.target.value })}
                                    className="flex-1 rounded-md border p-2 text-sm"
                                    placeholder="Cole a URL da imagem aqui..."
                                />
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setNewEvent({ ...newEvent, image: reader.result as string });
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <button className="h-full px-3 py-2 bg-slate-100 border rounded-md text-sm hover:bg-slate-200">
                                        Upload
                                    </button>
                                </div>
                            </div>
                            {newEvent.image && (
                                <div className="mt-2 relative h-32 w-full rounded-md overflow-hidden bg-slate-50 border">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={newEvent.image} alt="Preview" className="h-full w-full object-cover" />
                                    <button
                                        onClick={() => setNewEvent({ ...newEvent, image: "" })}
                                        className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={handleCreateEvent}
                            className="w-full bg-primary text-white p-2 rounded-md font-medium hover:bg-primary/90 mt-2"
                        >
                            Publicar Evento
                        </button>
                    </div>
                </div>
            )}

            <div className="grid gap-6">
                {filteredEvents.map((event) => (
                    <div key={event.id} className="rounded-xl border bg-white shadow-sm overflow-hidden">
                        {event.image && (
                            <div className="h-48 w-full overflow-hidden bg-slate-100">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={event.image} alt={event.title} className="h-full w-full object-cover" />
                            </div>
                        )}
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">{event.title}</h2>
                                    <div className="flex items-center gap-4 text-sm text-slate-500 mt-2">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            {format(new Date(event.date), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                                        </span>
                                        {event.location && (
                                            <span className="flex items-center gap-1">
                                                <MapPin className="h-4 w-4" />
                                                {event.location}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <p className="text-slate-600 mb-6">{event.description}</p>

                            <div className="border-t pt-4">
                                <div className="flex items-center gap-2 text-slate-900 font-medium mb-4">
                                    <MessageCircle className="h-5 w-5" />
                                    Comentários ({event.comments.length})
                                </div>

                                <div className="space-y-4 mb-4">
                                    {event.comments.map((comment) => (
                                        <div key={comment.id} className="bg-slate-50 p-3 rounded-lg text-sm">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-semibold text-slate-900 flex items-center gap-2">
                                                    <User className="h-3 w-3" />
                                                    {comment.author}
                                                </span>
                                                <span className="text-slate-400 text-xs">
                                                    {format(new Date(comment.date), "dd/MM HH:mm")}
                                                </span>
                                            </div>
                                            <p className="text-slate-700">{comment.text}</p>
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
                                        className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800"
                                    >
                                        Enviar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

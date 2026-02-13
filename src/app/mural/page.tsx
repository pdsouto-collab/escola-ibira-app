"use client";

import { useState } from "react";
import { Plus, Calendar, MapPin, MessageCircle, User, Edit2, Check, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Comment {
    id: string;
    author: string;
    role: "Professor" | "Responsável" | "Coordenação";
    text: string;
    date: Date;
}

interface Event {
    id: string;
    title: string;
    description: string;
    date: Date;
    location: string;
    image?: string;
    comments: Comment[];
}

export default function MuralPage() {
    const [events, setEvents] = useState<Event[]>([
        {
            id: "1",
            title: "Festa da Primavera",
            description: "Celebração da chegada da primavera com apresentações dos alunos e comidas típicas.",
            date: new Date(2024, 8, 22, 14, 0),
            location: "Pátio Central",
            image: "/escola-ibira-app/images/festa-primavera.svg",
            comments: [
                {
                    id: "c1",
                    author: "Maria S.",
                    role: "Responsável",
                    text: "Estamos ansiosos! Precisa levar algo?",
                    date: new Date(2024, 8, 20, 10, 30),
                },
                {
                    id: "c2",
                    author: "Prof. Ana",
                    role: "Professor",
                    text: "Apenas alegria e disposição, Maria!",
                    date: new Date(2024, 8, 20, 11, 15),
                },
            ],
        },
        {
            id: "2",
            title: "Reunião Pedagógica",
            description: "Encontro para discutir o desenvolvimento das crianças no semestre.",
            date: new Date(2024, 9, 10, 19, 0),
            location: "Auditório",
            comments: [],
        },
    ]);

    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [showNewEventForm, setShowNewEventForm] = useState(false);

    // New Event Form State
    const [newEvent, setNewEvent] = useState({
        title: "",
        description: "",
        date: "",
        time: "",
        location: "",
    });

    // Comment Form State
    const [newCommentText, setNewCommentText] = useState<{ [key: string]: string }>({});

    const handleCreateEvent = () => {
        if (!newEvent.title || !newEvent.date) return;

        const eventDate = new Date(`${newEvent.date}T${newEvent.time || "00:00"}`);

        const event: Event = {
            id: Math.random().toString(36).substr(2, 9),
            title: newEvent.title,
            description: newEvent.description,
            date: eventDate,
            location: newEvent.location,
            comments: [],
        };

        setEvents([event, ...events]);
        setShowNewEventForm(false);
        setNewEvent({ title: "", description: "", date: "", time: "", location: "" });
    };

    const handleAddComment = (eventId: string) => {
        const text = newCommentText[eventId];
        if (!text?.trim()) return;

        const comment: Comment = {
            id: Math.random().toString(36).substr(2, 9),
            author: "Eu (Admin)", // Mock user
            role: "Coordenação",
            text: text,
            date: new Date(),
        };

        setEvents(events.map(e => {
            if (e.id === eventId) {
                return { ...e, comments: [...e.comments, comment] };
            }
            return e;
        }));

        setNewCommentText({ ...newCommentText, [eventId]: "" });
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        Mural de Eventos
                    </h1>
                    <p className="text-slate-500">
                        Fique por dentro das novidades e celebrações da escola.
                    </p>
                </div>
                <button
                    onClick={() => setShowNewEventForm(!showNewEventForm)}
                    className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
                >
                    {showNewEventForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {showNewEventForm ? "Cancelar" : "Novo Evento"}
                </button>
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
                {events.map((event) => (
                    <div key={event.id} className="rounded-xl border bg-white shadow-sm overflow-hidden">
                        {event.image && (
                            <div className="h-48 w-full overflow-hidden bg-slate-100">
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
                                            {format(event.date, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MapPin className="h-4 w-4" />
                                            {event.location}
                                        </span>
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
                                                    <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                                                        {comment.role}
                                                    </span>
                                                </span>
                                                <span className="text-slate-400 text-xs">
                                                    {format(comment.date, "dd/MM HH:mm")}
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

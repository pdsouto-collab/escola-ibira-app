"use client";

import { useState } from "react";
import { Plus, Trash2, CheckCircle2, Circle } from "lucide-react";

interface Pendencia {
    id: string;
    text: string;
    completed: boolean;
}

export default function PendenciasPage() {
    const [pendencias, setPendencias] = useState<Pendencia[]>([
        { id: "1", text: "Enviar documentação de matrícula", completed: false },
        { id: "2", text: "Assinar autorização de passeio", completed: true },
        { id: "3", text: "Atualizar ficha médica", completed: false },
    ]);
    const [newText, setNewText] = useState("");

    const addPendencia = () => {
        if (!newText.trim()) return;
        const newPendencia: Pendencia = {
            id: Math.random().toString(36).substr(2, 9),
            text: newText,
            completed: false,
        };
        setPendencias([...pendencias, newPendencia]);
        setNewText("");
    };

    const togglePendencia = (id: string) => {
        setPendencias(
            pendencias.map((p) =>
                p.id === id ? { ...p, completed: !p.completed } : p
            )
        );
    };

    const removePendencia = (id: string) => {
        setPendencias(pendencias.filter((p) => p.id !== id));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        Pendências
                    </h1>
                    <p className="text-slate-500">
                        Gerencie suas tarefas e pendências escolares.
                    </p>
                </div>
            </div>

            <div className="rounded-xl border bg-white shadow-sm">
                <div className="p-4 border-b bg-slate-50/50">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newText}
                            onChange={(e) => setNewText(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && addPendencia()}
                            placeholder="Adicionar nova pendência..."
                            className="flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                        <button
                            onClick={addPendencia}
                            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            Adicionar
                        </button>
                    </div>
                </div>

                <div className="divide-y">
                    {pendencias.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            Nenhuma pendência encontrada.
                        </div>
                    ) : (
                        pendencias.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => togglePendencia(item.id)}
                                        className="text-slate-400 hover:text-primary transition-colors focus:outline-none"
                                    >
                                        {item.completed ? (
                                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                                        ) : (
                                            <Circle className="h-5 w-5" />
                                        )}
                                    </button>
                                    <span
                                        className={`text-sm ${item.completed
                                                ? "text-slate-400 line-through"
                                                : "text-slate-700 font-medium"
                                            }`}
                                    >
                                        {item.text}
                                    </span>
                                </div>
                                <button
                                    onClick={() => removePendencia(item.id)}
                                    className="rounded-md p-2 text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 transition-all"
                                    aria-label="Excluir"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

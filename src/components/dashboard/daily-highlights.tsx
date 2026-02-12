"use client";

import { ArrowRight, BookOpen, Calendar, Calculator, FlaskConical } from "lucide-react";
import { Button } from "../ui/button";

const highlights = [
    {
        id: 1,
        title: "SAS - O Começo",
        subject: "Ciências Naturais",
        icon: FlaskConical,
        bg: "bg-emerald-50 border-emerald-100",
        iconBg: "bg-emerald-200 text-emerald-700",
        date: "03/07",
        time: "09h00 - 10h30",
        activity: "Aplicações da física para medidas de..."
    },
    {
        id: 2,
        title: "Super matemática",
        subject: "Matemática",
        icon: Calculator,
        bg: "bg-cyan-50 border-cyan-100",
        iconBg: "bg-cyan-200 text-cyan-700",
        date: "03/07",
        time: "09h00 - 10h30",
        activity: "Calcular com medidas métricas de..."
    },
    {
        id: 3,
        title: "Grandes Inventores",
        subject: "História",
        icon: BookOpen,
        bg: "bg-amber-50 border-amber-100",
        iconBg: "bg-amber-200 text-amber-700",
        date: "03/08",
        time: "09h00 - 10h30",
        activity: "Grande Inventor Série 1 - Alan Turing..."
    }
];

export function DailyHighlights() {
    return (
        <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800">Pendências e Atividades</h2>
                <Button variant="outline" size="sm" className="gap-2">
                    Adicionar ao mural
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {highlights.map((item) => (
                    <div
                        key={item.id}
                        className={`rounded-xl border p-5 transition-shadow hover:shadow-md ${item.bg}`}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-2.5 rounded-lg ${item.iconBg}`}>
                                <item.icon className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-semibold text-slate-500 bg-white/60 px-2 py-1 rounded">
                                {item.subject}
                            </span>
                        </div>

                        <h3 className="font-bold text-slate-900 mb-1 line-clamp-1">
                            {item.title}
                        </h3>
                        <p className="text-sm text-slate-600 mb-4 line-clamp-2 min-h-[40px]">
                            {item.activity}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-slate-500 mb-4 bg-white/40 p-2 rounded-lg">
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{item.date}</span>
                            </div>
                            <div className="w-px h-3 bg-slate-300" />
                            <span>{item.time}</span>
                        </div>

                        <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-200/50">
                            <button className="text-xs font-medium text-slate-600 hover:text-primary transition-colors">
                                Detalhes &gt;
                            </button>
                            <Button size="sm" variant="secondary" className="h-7 text-xs px-3">
                                Diário
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

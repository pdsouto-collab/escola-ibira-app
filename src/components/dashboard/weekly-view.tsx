"use client";

import { CalendarDays } from "lucide-react";

const weekDays = [
    { name: "terça", date: "15", active: true },
    { name: "quarta-feira", date: "16", active: false },
    { name: "quinta-feira", date: "17", active: false },
    { name: "sexta-feira", date: "18", active: false },
];

const schedule = [
    { day: "15", time: "08h - 12h", title: "Para os EUA... e muito mais!", teacher: "Roberto Aparício", color: "bg-slate-800 text-white" },
    { day: "15", time: "12h - 13h", title: "Intervalo", teacher: "", color: "bg-emerald-100 text-emerald-800" },
    { day: "15", time: "13h - 14h", title: "Criando memórias", teacher: "Jeane Souza", color: "bg-slate-700 text-white" },

    { day: "16", time: "08h - 10h", title: "Cybergoo", teacher: "Roberta Siqueira", color: "bg-white border text-slate-800" },
    { day: "16", time: "10h - 12h", title: "Desenvolvimento da linguagem", teacher: "Alicia Pinheiro", color: "bg-white border text-slate-800" },
    { day: "16", time: "12h - 13h", title: "Intervalo", teacher: "", color: "bg-slate-100 text-slate-600" },

    { day: "17", time: "08h - 12h", title: "Turismo espacial", teacher: "Roberta Silveira", color: "bg-white border text-slate-800" },

    { day: "18", time: "08h - 10h", title: "Meu corpo e minha mente", teacher: "Jordana Cantu", color: "bg-white border text-slate-800" },
];

export function WeeklyView() {
    return (
        <section>
            <div className="flex items-center gap-2 mb-6">
                <CalendarDays className="w-5 h-5 text-slate-600" />
                <h2 className="text-xl font-bold text-slate-800">Agenda da Semana</h2>
            </div>

            <div className="grid grid-cols-4 gap-4">
                {/* Headers */}
                {weekDays.map((day) => (
                    <div key={day.date} className="text-center mb-4">
                        <div className="text-sm text-slate-500 uppercase font-medium">{day.name}</div>
                        <div className={`text-2xl font-bold mt-1 inline-flex items-center justify-center w-10 h-10 rounded-full ${day.active ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-700'}`}>
                            {day.date}
                        </div>
                    </div>
                ))}

                {/* Columns */}
                {weekDays.map((day) => (
                    <div key={`col-${day.date}`} className="space-y-4">
                        {schedule.filter(s => s.day === day.date).map((item, idx) => (
                            <div
                                key={idx}
                                className={`p-4 rounded-xl text-sm ${item.color} ${!item.color.includes('bg-slate') && !item.color.includes('emerald') ? 'shadow-sm' : ''}`}
                            >
                                <div className="font-bold mb-1 line-clamp-2 leading-tight">
                                    {item.title}
                                </div>
                                {item.teacher && (
                                    <div className="text-xs opacity-80 mb-2">
                                        {item.teacher}
                                    </div>
                                )}
                                <div className="text-xs opacity-70 font-mono">
                                    {item.time}
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </section>
    );
}

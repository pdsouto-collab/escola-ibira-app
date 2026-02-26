"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export interface ProgressChartData {
    subject: string;
    trabalhado: number;
    desenvolvido: number;
    total: number;
}

interface ProgressChartProps {
    data: ProgressChartData[];
}

export function ProgressChart({ data }: ProgressChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="w-full h-64 flex items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-dashed">
                Sem dados para exibição
            </div>
        );
    }

    return (
        <div className="w-full h-[400px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                    barGap={8}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                        dataKey="subject"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#475569', fontSize: 13, fontWeight: 600 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        allowDecimals={false}
                    />
                    <Tooltip
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ fontSize: '13px', fontWeight: 500 }}
                        labelStyle={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}
                    />
                    <Legend
                        verticalAlign="top"
                        height={40}
                        iconType="circle"
                        wrapperStyle={{ fontSize: '13px', fontWeight: 500, color: '#475569', paddingTop: '10px' }}
                    />
                    <Bar
                        dataKey="trabalhado"
                        name="Trabalhado (Projetos)"
                        fill="#F59E0B"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={48}
                    />
                    <Bar
                        dataKey="desenvolvido"
                        name="Desenvolvido (Conquistado)"
                        fill="#10B981"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={48}
                    />
                </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 px-6 flex justify-center">
                <p className="text-[11px] text-slate-400 flex items-start gap-2 max-w-2xl text-center leading-relaxed">
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 flex items-center justify-center shrink-0 mt-0.5 text-[8px] font-bold text-slate-400">i</span>
                    Nota: "Trabalhado" indica habilidades incluídas nos projetos. "Desenvolvido" indica habilidades conquistadas pelo aluno na avaliação.
                </p>
            </div>
        </div>
    );
}

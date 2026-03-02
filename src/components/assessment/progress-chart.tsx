"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export interface ProgressChartData {
    subject: string;
    proposto: number;
    desenvolvido: number;
    total: number;
    propostoItems?: string[];
    desenvolvidoItems?: string[];
}

interface ProgressChartProps {
    data: ProgressChartData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload as ProgressChartData;
        return (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xl max-w-xs md:max-w-sm">
                <p className="font-bold text-slate-800 mb-2 border-b pb-1 text-base">{label}</p>

                <div className="space-y-3">
                    <div>
                        <p className="text-amber-600 font-bold text-xs uppercase flex items-center gap-1 mb-1">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            Proposto ({data.proposto})
                        </p>
                        <ul className="text-[11px] text-slate-600 list-disc pl-3 space-y-0.5 max-h-32 overflow-y-auto">
                            {data.propostoItems?.slice(0, 10).map((item, i) => (
                                <li key={i} className="line-clamp-1">{item}</li>
                            ))}
                            {(data.propostoItems?.length ?? 0) > 10 && <li className="list-none text-slate-400">... e mais {(data.propostoItems?.length ?? 0) - 10} itens</li>}
                        </ul>
                    </div>

                    <div>
                        <p className="text-emerald-600 font-bold text-xs uppercase flex items-center gap-1 mb-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            Desenvolvido ({data.desenvolvido})
                        </p>
                        {data.desenvolvidoItems && data.desenvolvidoItems.length > 0 ? (
                            <ul className="text-[11px] text-slate-600 list-disc pl-3 space-y-0.5 max-h-32 overflow-y-auto">
                                {data.desenvolvidoItems.slice(0, 10).map((item, i) => (
                                    <li key={i} className="line-clamp-1">{item}</li>
                                ))}
                                {data.desenvolvidoItems.length > 10 && <li className="list-none text-slate-400">... e mais {data.desenvolvidoItems.length - 10} itens</li>}
                            </ul>
                        ) : (
                            <p className="text-[11px] text-slate-400 italic pl-1">Nenhum item desenvolvido ainda.</p>
                        )}
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

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
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        verticalAlign="top"
                        height={40}
                        iconType="circle"
                        wrapperStyle={{ fontSize: '14px', fontWeight: 600, color: '#475569', paddingTop: '10px' }}
                    />
                    <Bar
                        dataKey="proposto"
                        name="Proposto"
                        fill="#F59E0B"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={48}
                    />
                    <Bar
                        dataKey="desenvolvido"
                        name="Desenvolvido"
                        fill="#10B981"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={48}
                    />
                </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 px-6 flex justify-center">
                <p className="text-[11px] text-slate-400 flex items-start gap-2 max-w-2xl text-center leading-relaxed">
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 flex items-center justify-center shrink-0 mt-0.5 text-[8px] font-bold text-slate-400">i</span>
                    Nota: "Proposto" indica habilidades base da BNCC e Competências. "Desenvolvido" indica habilidades com avaliação positiva.
                </p>
            </div>
        </div>
    );
}

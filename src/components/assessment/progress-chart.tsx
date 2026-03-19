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

const CustomXAxisTick = ({ x, y, payload }: any) => {
    return (
        <g transform={`translate(${x},${y})`}>
            {/* 
              y=0 starts right on the axis line. We move down a bit using dy to give some breathing room.
              Then we rotate -45 degrees.
              Since we use textAnchor="end", the (0,0) point of the rotation is exactly where the string ends.
              Which means the END of the string will perfectly touch the x,y coordinate of the tick center.
            */}
            <text
                x={0}
                y={0}
                dx={-18} // Shift left precisely into the center of the left bar
                dy={12} // Breathing room from the axis line
                textAnchor="end"
                fill="#475569"
                fontSize={11}
                fontWeight={600}
                transform="rotate(-45)"
            >
                {payload.value}
            </text>
        </g>
    );
};

export function ProgressChart({ data }: ProgressChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="w-full h-64 flex items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-dashed">
                Sem dados para exibição
            </div>
        );
    }

    // Calcula a altura da margem inferior dinamicamente com base no tamanho da maior string no eixo X
    const maxLabelLength = data.reduce((max, item) => Math.max(max, item.subject.length), 0);
    const calculatedBottomMargin = Math.max(90, Math.ceil(maxLabelLength * 5.5));
    // A altura total acompanha a margem inferior extra mantendo a área do gráfico consistente
    const chartHeight = Math.max(400, 310 + calculatedBottomMargin);

    return (
        <div className="w-full pt-4 transition-all duration-300 print:page-break-inside-avoid print:break-inside-avoid print-limit-h" style={{ height: `${chartHeight}px` }}>
            <style>{`
                @media print {
                    .print-limit-h {
                        height: 350px !important;
                        max-height: 45vh !important;
                    }
                }
            `}</style>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{ top: 20, right: 50, left: 0, bottom: calculatedBottomMargin }}
                    barGap={8}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                        dataKey="subject"
                        axisLine={false}
                        tickLine={false}
                        tick={<CustomXAxisTick />}
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
                        content={() => (
                            <div className="flex justify-center gap-6 pb-4 text-[15px] font-bold text-slate-600">
                                <div className="flex items-center gap-2">
                                    <span className="w-3.5 h-3.5 rounded-full bg-[#F59E0B]" />
                                    <span>Proposto</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3.5 h-3.5 rounded-full bg-[#10B981]" />
                                    <span>Desenvolvido</span>
                                </div>
                            </div>
                        )}
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
        </div>
    );
}

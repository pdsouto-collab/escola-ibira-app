"use client";

import React from "react";

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

export function ProgressChart({ data }: ProgressChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="empty-state w-full h-40 flex items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-dashed">
                Sem dados para exibição
            </div>
        );
    }

    return (
        <div className="w-full pt-2 flex flex-col gap-6 print:gap-4 print:break-inside-avoid">
            {/* Header / Legend */}
            <div className="flex justify-end gap-6 pb-2 text-xs font-bold text-slate-500 border-b border-slate-100 print:pb-1">
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-slate-200" />
                    <span>Proposto (Total)</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                    <span className="text-emerald-700">Desenvolvido</span>
                </div>
            </div>

            {/* Progress Bars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 print:grid-cols-2 print:gap-y-4">
                {data.map((item, idx) => {
                    const percentage = item.proposto > 0 ? Math.round((item.desenvolvido / item.proposto) * 100) : 0;
                    
                    return (
                        <div key={idx} className="group relative flex flex-col gap-2">
                            <div className="flex justify-between items-end">
                                <h4 className="text-[13px] font-bold text-slate-700 truncate pr-4" title={item.subject}>
                                    {item.subject}
                                </h4>
                                <div className="text-[11px] font-black tracking-wide text-slate-400 shrink-0">
                                    <span className="text-emerald-600">{item.desenvolvido}</span> / {item.proposto}
                                </div>
                            </div>
                            
                            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden ring-1 ring-inset ring-slate-200/50 print:h-2 print:bg-slate-200">
                                <div 
                                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out print:bg-emerald-600 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>

                            {/* Hover Tooltip (Invisible on print) */}
                            <div className="absolute left-0 bottom-full mb-3 w-72 bg-slate-800 text-slate-200 p-4 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border border-slate-700 pointer-events-none print:hidden">
                                <div className="mb-3 border-b border-slate-700 pb-2">
                                    <p className="font-bold text-white text-sm">{item.subject}</p>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-wider">Desenvolvido ({item.desenvolvido})</p>
                                        <ul className="text-xs space-y-1 list-disc pl-3">
                                            {item.desenvolvidoItems?.slice(0, 5).map((li, i) => (
                                                <li key={i} className="line-clamp-1">{li}</li>
                                            ))}
                                            {(item.desenvolvidoItems?.length || 0) > 5 && (
                                                <li className="list-none text-[10px] text-slate-500 italic mt-1">...e mais {(item.desenvolvidoItems?.length || 0) - 5} itens</li>
                                            )}
                                            {(item.desenvolvidoItems?.length || 0) === 0 && (
                                                <li className="list-none text-slate-500 italic">Nenhum item desenvolvido</li>
                                            )}
                                        </ul>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-wider">Proposto ({item.proposto})</p>
                                        <ul className="text-xs space-y-1 list-disc pl-3">
                                            {item.propostoItems?.slice(0, 5).map((li, i) => (
                                                <li key={i} className="line-clamp-1">{li}</li>
                                            ))}
                                            {(item.propostoItems?.length || 0) > 5 && (
                                                <li className="list-none text-[10px] text-slate-500 italic mt-1">...e mais {(item.propostoItems?.length || 0) - 5} itens</li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

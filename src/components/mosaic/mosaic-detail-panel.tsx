"use client";

import { MosaicNode } from "@/lib/data";
import { ChevronRight, ExternalLink, History } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

interface MosaicDetailPanelProps {
    node: MosaicNode | null;
    editMode?: boolean;
    onSplit?: (parts: number) => void;
    onRemove?: () => void;
    onRename?: (newLabel: string) => void;
}

export function MosaicDetailPanel({ node, editMode, onSplit, onRemove, onRename }: MosaicDetailPanelProps) {
    if (!node) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-50 border-r border-slate-200">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl">✨</span>
                </div>
                <h3 className="text-lg font-bold text-slate-700 mb-2">Explore a Mandala</h3>
                <p className="text-sm text-slate-500">
                    Selecione uma fatia para ver os detalhes da área, componente ou habilidade.
                </p>
            </div>
        );
    }

    const statusMap = {
        "achieved": { text: "Desenvolvido", color: "bg-green-100 text-green-700" },
        "in-progress": { text: "Em Desenvolvimento", color: "bg-amber-100 text-amber-700" },
        "not-started": { text: "Não Iniciado", color: "bg-slate-100 text-slate-600" }
    };

    return (
        <div className="h-full flex flex-col p-6 bg-white overflow-y-auto">
            <div className="mb-6">
                <Badge className="mb-3 bg-slate-100 text-slate-700 hover:bg-slate-200">
                    {node.type.toUpperCase()}
                </Badge>

                {editMode ? (
                    <div className="mb-4">
                        <label className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1 block">Nome da Fatia</label>
                        <input
                            type="text"
                            value={node.label}
                            onChange={(e) => onRename?.(e.target.value)}
                            className="w-full text-lg font-bold text-slate-900 border-b-2 border-slate-200 focus:border-primary focus:outline-none py-1 bg-transparent"
                            autoFocus
                        />
                    </div>
                ) : (
                    <h2 className="text-xl font-bold text-slate-900 leading-tight mb-2">
                        {node.label}
                    </h2>
                )}

                <div className="text-xs text-slate-500 flex items-center gap-1 mb-4">
                    <span>Currículo Fundamental</span>
                    <ChevronRight className="w-3 h-3" />
                    <span>Detalhes</span>
                </div>

                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusMap[node.status]?.color || "bg-slate-100"}`}>
                    {statusMap[node.status]?.text || "Indefinido"}
                    {node.evidenceCount ? ` (${node.evidenceCount} ev.)` : ""}
                </div>
            </div>

            {editMode ? (
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 mb-6 space-y-3">
                    <h4 className="text-xs font-bold text-yellow-800 uppercase tracking-wide">Ações de Edição</h4>

                    <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm" onClick={() => onSplit?.(2)} className="bg-white border-yellow-300 text-yellow-900 hover:bg-yellow-100">
                            Dividir em 2
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => onSplit?.(3)} className="bg-white border-yellow-300 text-yellow-900 hover:bg-yellow-100">
                            Dividir em 3
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => onSplit?.(4)} className="bg-white border-yellow-300 text-yellow-900 hover:bg-yellow-100">
                            Dividir em 4
                        </Button>
                        <Button variant="outline" size="sm" onClick={onRemove} className="bg-white border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 hover:border-red-300">
                            Excluir Fatia
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                        <h4 className="flex items-center gap-2 font-bold text-sm text-slate-900 mb-2">
                            <span className="font-mono text-slate-500">ID: {node.id.toUpperCase()}</span>
                        </h4>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            Descrição detalhada desta competência ou área do conhecimento dentro da estrutura curricular da escola.
                        </p>
                    </div>

                    <div>
                        <Button variant="outline" className="w-full justify-between" size="sm">
                            <span className="flex items-center gap-2">
                                <History className="w-4 h-4" />
                                Histórico de alterações
                            </span>
                            <span>&gt;</span>
                        </Button>
                    </div>
                </div>
            )}

            <div className="mt-auto pt-6">
                <Button
                    className="w-full gap-2"
                    onClick={() => alert("Funcionalidade 'Expandir Árvore' será implementada na próxima atualização visual!")}
                >
                    <ExternalLink className="w-4 h-4" />
                    Expandir Árvore
                </Button>
            </div>
        </div>
    );
}

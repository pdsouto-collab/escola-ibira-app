"use client";

import { KnowledgeNode, KnowledgeLevel } from "@/lib/data";
import { ChevronRight, ExternalLink, ClipboardList, ListTree, Link as LinkIcon, Footprints } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useAppStore } from "@/lib/store";
import { ScrollArea } from "../ui/scroll-area";

interface MosaicDetailPanelProps {
    node: KnowledgeNode | null;
    treeType: "skill" | "content";
    onAvaliacao?: (node: KnowledgeNode) => void;
}

const LEVEL_LABELS = {
    skill: {
        macro: "Eixo do Saber",
        mesclado: "Componente Curricular",
        micro: "Habilidade BNCC",
        atomico: "Evidência da Habilidade"
    },
    content: {
        macro: "Eixo Comportamental/Cognitivo",
        mesclado: "Tópico",
        micro: "Competência",
        atomico: "Evidência de Competência"
    }
};

const PLURAL_LABELS = {
    skill: {
        micro: "Habilidades BNCC",
        atomico: "Evidências da Habilidade"
    },
    content: {
        micro: "Competências",
        atomico: "Evidências de Competência"
    }
};

// Helper to get nodes of a specific level under a given node
function getLeavesUnderNode(node: KnowledgeNode, targetLevel: KnowledgeLevel): KnowledgeNode[] {
    let results: KnowledgeNode[] = [];
    if (node.level === targetLevel) return [node];
    if (node.children) {
        node.children.forEach(child => {
            results = results.concat(getLeavesUnderNode(child, targetLevel));
        });
    }
    return results;
}

export function MosaicDetailPanel({ node, treeType, onAvaliacao }: MosaicDetailPanelProps) {
    const { bnccProgress } = useAppStore();

    if (!node) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-50 border-r border-slate-200">
                <div className="w-24 h-24 mb-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/escola-ibira-app/images/icone_trilha_crianca.png"
                        alt="Trilha"
                        className="w-full h-full object-contain blur-[0.5px]"
                    />
                </div>
                <h3 className="text-lg font-bold text-slate-700 mb-2">Explore a Trilha</h3>
                <p className="text-sm text-slate-500">
                    Selecione uma parte da trilha para visualizar detalhes curriculares e de desenvolvimento.
                </p>
            </div>
        );
    }

    const levelLabel = LEVEL_LABELS[treeType][node.level];
    const canAssessHeader = node.level === "micro" || node.level === "atomico";

    // Determine what to show in the list
    // If macro/mesclado, show micro children. If micro, show atomic children. If atomic, show nothing.
    let childListLabel = "";
    let childrenToShow: KnowledgeNode[] = [];

    if (node.level === "macro" || node.level === "mesclado") {
        // @ts-ignore
        childListLabel = PLURAL_LABELS[treeType]["micro"] || (LEVEL_LABELS[treeType]["micro"] + "s");
        childrenToShow = getLeavesUnderNode(node, "micro");
    } else if (node.level === "micro") {
        // @ts-ignore
        childListLabel = PLURAL_LABELS[treeType]["atomico"] || (LEVEL_LABELS[treeType]["atomico"] + "s");
        childrenToShow = getLeavesUnderNode(node, "atomico");
    }

    return (
        <div className="h-full flex flex-col p-6 bg-white overflow-y-hidden border-r border-slate-200">
            <div className="mb-6 shrink-0">
                <div className="flex justify-between items-start gap-4 mb-3">
                    <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 shadow-sm uppercase">
                        {levelLabel}
                    </Badge>

                    {canAssessHeader && onAvaliacao && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[10px] gap-1 px-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            onClick={() => onAvaliacao(node)}
                        >
                            <ClipboardList className="w-3 h-3" /> Avaliar
                        </Button>
                    )}
                </div>

                <h2 className="text-xl font-bold text-slate-900 leading-tight mb-2">
                    {node.name}
                </h2>

                <div className="flex items-center gap-2 mb-4">
                    {node.libraryItemId && (
                        <Badge variant="outline" className="font-mono text-[10px] bg-slate-50">
                            REF: {node.libraryItemId}
                        </Badge>
                    )}
                    {node.classId && node.classId !== "all" && (
                        <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">
                            Turma Específica
                        </Badge>
                    )}
                </div>
            </div>

            <ScrollArea className="flex-1 pr-4 -mr-4">
                <div className="space-y-6">
                    {node.description && (
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <h4 className="font-bold text-sm text-slate-800 mb-2">Detalhes</h4>
                            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                                {node.description}
                            </p>
                        </div>
                    )}

                    {childrenToShow.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                                <ListTree className="w-4 h-4 text-slate-500" />
                                {childListLabel} ({childrenToShow.length})
                            </h4>
                            <div className="flex flex-col gap-2">
                                {childrenToShow.map(child => {
                                    const identifier = child.libraryItemId || child.id;
                                    const progress = bnccProgress[identifier];
                                    const isAchieved = progress?.status === "achieved";

                                    return (
                                        <div key={child.id} className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm group hover:border-emerald-200 transition-colors">
                                            <div className="flex justify-between items-start gap-2">
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-slate-800 leading-snug">
                                                        {child.name.length > 80 ? child.name.slice(0, 80) + '...' : child.name}
                                                    </p>
                                                    {(child.libraryItemId || (child.linkedNodeIds && child.linkedNodeIds.length > 0)) && (
                                                        <div className="flex gap-2 mt-2">
                                                            {child.libraryItemId && (
                                                                <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1 rounded">
                                                                    {child.libraryItemId}
                                                                </span>
                                                            )}
                                                            {child.linkedNodeIds && child.linkedNodeIds.length > 0 && (
                                                                <span className="text-[10px] text-blue-600 bg-blue-50 px-1 rounded flex items-center gap-1">
                                                                    <LinkIcon className="w-3 h-3" /> Vinculado
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    {isAchieved && (
                                                        <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0" title="Desenvolvido" />
                                                    )}
                                                    {onAvaliacao && (
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-7 w-7 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                                                            onClick={() => onAvaliacao(child)}
                                                        >
                                                            <ClipboardList className="w-3.5 h-3.5" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {childrenToShow.length === 0 && node.level !== "atomico" && (
                        <div className="p-4 border border-dashed border-slate-300 rounded-lg text-center bg-slate-50">
                            <p className="text-sm text-slate-500">Nenhum detalhe cadastrado abaixo deste nível.</p>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}

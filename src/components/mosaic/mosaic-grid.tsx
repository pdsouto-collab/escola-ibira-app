"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { KnowledgeNode, Project } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Clock, Circle, FileText, AlertCircle, Plus, Link as LinkIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface MosaicGridProps {
    classId?: string;
    projectId?: string;
    treeType?: "skill" | "content";
}

// Recursively get micro nodes under any node
function getMicroNodes(node: KnowledgeNode): KnowledgeNode[] {
    if (node.level === "micro") return [node];
    let results: KnowledgeNode[] = [];
    if (node.children) {
        for (const child of node.children) {
            results = results.concat(getMicroNodes(child));
        }
    }
    return results;
}

export function MosaicGrid({ classId, projectId, treeType = "skill" }: MosaicGridProps) {
    const { projects, students, bnccProgress, updateBNCCStatus, skillsTree, contentsTree } = useAppStore();
    const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
    const [comment, setComment] = useState("");

    const currentTree = treeType === "skill" ? skillsTree : contentsTree;

    // Helper to check if project belongs to class
    const isProjectInClass = (project: Project, targetClassId: string) => {
        if (project.classes?.includes(targetClassId)) return true;
        if (project.students?.length > 0) {
            const projectStudents = students.filter(s => project.students.includes(s.id));
            return projectStudents.some(s => s.classId === targetClassId);
        }
        return false;
    };

    // Helper to get linked projects for a given node
    const getLinkedProjects = (node: KnowledgeNode) => {
        const identifier = node.libraryItemId || node.id;
        return projects.filter(p => {
            if (p.status !== "active") return false;

            // Check based on tree type
            if (treeType === "skill") {
                if (!p.bnccSkillIds?.includes(identifier)) return false;
            } else {
                if (!p.contentIds?.includes(identifier)) return false;
            }

            if (projectId && p.id !== projectId) return false;
            if (classId && !isProjectInClass(p, classId)) return false;

            return true;
        });
    };

    // Helper to get status of a node
    const getNodeStatus = (node: KnowledgeNode) => {
        const identifier = node.libraryItemId || node.id;
        const progress = bnccProgress[identifier];

        if (progress?.status === "achieved") return "achieved";
        if (progress?.status === "in-progress") return "in-progress";

        // Check if Planned
        const linkedProjects = getLinkedProjects(node);
        if (linkedProjects.length > 0) return "planned";

        return "not-started";
    };

    const handleStatusUpdate = (status: "not-started" | "in-progress" | "achieved") => {
        if (!selectedNode) return;
        const identifier = selectedNode.libraryItemId || selectedNode.id;

        // Update main node
        updateBNCCStatus(identifier, status);

        // Teacher Automation: Automatically suggest updating parent/linked nodes
        // For Content tree: if we mark content as achieved/progress, we can automatically mark linked skills
        if (treeType === "content" && selectedNode.linkedNodeIds && selectedNode.linkedNodeIds.length > 0) {
            if (confirm(`Deseja aplicar o mesmo status de "${status === 'achieved' ? 'Conquistada' : 'Em Progresso'}" para as Habilidades Vinculadas? (${selectedNode.linkedNodeIds.length} habilidades)`)) {
                selectedNode.linkedNodeIds.forEach(linkedId => {
                    updateBNCCStatus(linkedId, status); // we use linkedId directly assuming it corresponds to bnccProgress key mapping
                });
            }
        }

        setComment("");
        setSelectedNode(null);
    };

    // Build the grid data structure
    // We group by Level 1 (Macro) and list Level 3 (Micro) nodes under them
    const gridSections = currentTree.map(macroNode => {
        const microNodes = getMicroNodes(macroNode);
        const filteredMicroNodes = microNodes.filter(node => getLinkedProjects(node).length > 0);

        return {
            macro: macroNode,
            nodes: filteredMicroNodes
        };
    }).filter(section => section.nodes.length > 0);

    const hasAnyNodes = gridSections.length > 0;

    if (!hasAnyNodes) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 text-slate-500 animate-in fade-in zoom-in duration-500">
                <div className="bg-slate-100 p-6 rounded-full mb-4">
                    <FileText className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                    {treeType === "skill" ? "Nenhuma habilidade em foco" : "Nenhum conteúdo em foco"}
                </h3>
                <p className="max-w-md mb-6 leading-relaxed">
                    O Mosaico é gerado automaticamente a partir dos itens trabalhados nos seus projetos ativos.
                    Vincule projetos aos seus {treeType === "skill" ? "eixos" : "conteúdos"} para visualizá-los aqui.
                </p>
            </div>
        );
    }

    // Color logic based on Macro Node index
    const sectionColors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-yellow-500", "bg-red-500"];

    return (
        <div className="w-full h-full overflow-y-auto p-6 space-y-8">
            {gridSections.map((section, idx) => (
                <div key={section.macro.id} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex items-center gap-3">
                        <div className={cn("w-2 h-8 rounded-full", sectionColors[idx % sectionColors.length])} />
                        <h3 className="text-xl font-bold text-slate-800">{section.macro.name}</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {section.nodes.map(node => {
                            const status = getNodeStatus(node);
                            const linkedProjects = getLinkedProjects(node);
                            const identifier = node.libraryItemId || node.id;

                            return (
                                <div
                                    key={node.id}
                                    onClick={() => setSelectedNode(node)}
                                    className={cn(
                                        "relative p-4 rounded-xl border border-b-4 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md group flex flex-col",
                                        status === "achieved"
                                            ? "bg-green-50 border-green-500/30 border-b-green-500"
                                            : status === "planned"
                                                ? "bg-amber-50 border-amber-300 border-b-amber-400 ring-2 ring-amber-400/20"
                                                : status === "in-progress"
                                                    ? "bg-blue-50 border-blue-300 border-b-blue-400"
                                                    : "bg-white border-slate-200 border-b-slate-300 hover:border-slate-400"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant="outline" className={cn("text-[10px] font-mono",
                                            status === "achieved" ? "bg-green-100 text-green-700 border-green-200" :
                                                "bg-slate-100 text-slate-500"
                                        )}>
                                            {identifier.length > 8 ? identifier.substring(0, 8) + '...' : identifier}
                                        </Badge>
                                        {status === "achieved" && <Check className="w-4 h-4 text-green-600" />}
                                        {status === "planned" && <AlertCircle className="w-4 h-4 text-amber-500" />}
                                        {status === "in-progress" && <Clock className="w-4 h-4 text-blue-500" />}
                                    </div>

                                    <p className="text-sm font-medium text-slate-700 line-clamp-3 mb-3 leading-snug">
                                        {node.name}
                                    </p>

                                    {node.description && (
                                        <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                                            {node.description}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between text-xs text-slate-400 mt-auto pt-2">
                                        <span className="font-semibold uppercase tracking-wider text-[10px]">{section.macro.name}</span>
                                        <div className="flex gap-2 items-center">
                                            {node.linkedNodeIds && node.linkedNodeIds.length > 0 && (
                                                <div className="flex items-center gap-1 text-blue-500" title={`${node.linkedNodeIds.length} skill(s) vinculada(s)`}>
                                                    <LinkIcon className="w-3 h-3" />
                                                </div>
                                            )}
                                            {linkedProjects.length > 0 && (
                                                <div className="flex items-center gap-1 text-slate-500" title={`${linkedProjects.length} projeto(s)`}>
                                                    <FileText className="w-3 h-3" />
                                                    {linkedProjects.length}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}

            <Dialog open={!!selectedNode} onOpenChange={(open) => !open && setSelectedNode(null)}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">{selectedNode?.libraryItemId || selectedNode?.id}</Badge>
                            <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                                {selectedNode ? (currentTree.find(m => getMicroNodes(m).some(n => n.id === selectedNode.id))?.name) : ""}
                            </span>
                        </div>
                        <DialogTitle className="text-xl leading-relaxed">
                            {selectedNode?.name}
                        </DialogTitle>
                        {selectedNode?.description && (
                            <DialogDescription className="mt-2 text-sm text-slate-600">
                                {selectedNode.description}
                            </DialogDescription>
                        )}
                    </DialogHeader>

                    <ScrollArea className="max-h-[60vh] py-4 pr-4">
                        <div className="space-y-6">
                            {/* Status Selection */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-slate-900">Situação Atual</label>
                                <div className="grid grid-cols-3 gap-3">
                                    <Button
                                        variant={selectedNode && getNodeStatus(selectedNode) === "not-started" ? "default" : "outline"}
                                        className={cn("h-auto py-3 flex flex-col gap-1", selectedNode && getNodeStatus(selectedNode) === "not-started" && "bg-slate-600")}
                                        onClick={() => handleStatusUpdate("not-started")}
                                    >
                                        <Circle className="w-4 h-4" />
                                        <span className="text-xs">Não Iniciado</span>
                                    </Button>
                                    <Button
                                        variant={selectedNode && getNodeStatus(selectedNode) === "in-progress" ? "default" : "outline"}
                                        className={cn("h-auto py-3 flex flex-col gap-1", selectedNode && getNodeStatus(selectedNode) === "in-progress" && "bg-blue-600 hover:bg-blue-700")}
                                        onClick={() => handleStatusUpdate("in-progress")}
                                    >
                                        <Clock className="w-4 h-4" />
                                        <span className="text-xs">Em Progresso</span>
                                    </Button>
                                    <Button
                                        variant={selectedNode && getNodeStatus(selectedNode) === "achieved" ? "default" : "outline"}
                                        className={cn("h-auto py-3 flex flex-col gap-1", selectedNode && getNodeStatus(selectedNode) === "achieved" && "bg-green-600 hover:bg-green-700")}
                                        onClick={() => handleStatusUpdate("achieved")}
                                    >
                                        <Check className="w-4 h-4" />
                                        <span className="text-xs">Conquistada!</span>
                                    </Button>
                                </div>
                            </div>

                            {/* Automation Info */}
                            {selectedNode?.linkedNodeIds && selectedNode.linkedNodeIds.length > 0 && (
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3 text-blue-800">
                                    <LinkIcon className="w-5 h-5 shrink-0 mt-0.5 text-blue-500" />
                                    <div className="text-sm space-y-1">
                                        <p className="font-semibold">Automação de Diário</p>
                                        <p className="text-blue-700">Este conteúdo está vinculado a <b>{selectedNode.linkedNodeIds.length} Habilidades</b>. Ao marcar como conquistado, o sistema sugerirá atualizar o progresso nas trilhas de Habilidades simultaneamente.</p>
                                    </div>
                                </div>
                            )}

                            {/* Linked Projects */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-slate-900">Projetos Vinculados</label>
                                {selectedNode && getLinkedProjects(selectedNode).length > 0 ? (
                                    <div className="grid gap-2">
                                        {getLinkedProjects(selectedNode).map(project => (
                                            <div key={project.id} className="flex items-center justify-between p-3 rounded-lg border bg-slate-50">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700">
                                                        <FileText className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-900">{project.title}</p>
                                                        <p className="text-xs text-slate-500">
                                                            {project.status === "active" ? "Em andamento" :
                                                                project.status === "completed" ? "Concluído" : "Planejamento"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button size="sm" variant="ghost" className="h-7 text-xs">Ver</Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-4 border border-dashed rounded-lg text-center text-slate-500 text-sm bg-slate-50">
                                        Nenhum projeto trabalhou este item ainda.
                                    </div>
                                )}
                            </div>

                            {/* Evidence / Comments */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-slate-900">Diário de Bordo / Evidências</label>
                                <Textarea
                                    placeholder="Adicione observações sobre o desenvolvimento..."
                                    className="resize-none"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                />
                                <div className="flex justify-end">
                                    <Button size="sm" variant="secondary">Adicionar Nota</Button>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </div>
    );
}

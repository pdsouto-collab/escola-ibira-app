"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { KnowledgeNode, KnowledgeLevel, LibraryItem } from "@/lib/data";
import { ChevronRight, ChevronDown, Plus, Edit2, Trash2, Link as LinkIcon, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Props {
    treeType: "skill" | "content";
}

const LEVEL_LABELS = {
    skill: {
        macro: "Eixo",
        mesclado: "Competência",
        micro: "Habilidade",
        atomico: "Habilidade Específica"
    },
    content: {
        macro: "Área do Saber",
        mesclado: "Tópico",
        micro: "Conteúdo",
        atomico: "Evidência de Conteúdo"
    }
};

const NEXT_LEVEL: Record<KnowledgeLevel, KnowledgeLevel | null> = {
    macro: "mesclado",
    mesclado: "micro",
    micro: "atomico",
    atomico: null
};

// Colors based on level for visual hierarchy
const LEVEL_COLORS = {
    macro: "bg-blue-50 border-blue-200 text-blue-900",
    mesclado: "bg-indigo-50 border-indigo-200 text-indigo-900",
    micro: "bg-purple-50 border-purple-200 text-purple-900",
    atomico: "bg-slate-50 border-slate-200 text-slate-900"
};

export function KnowledgeTreeEditor({ treeType }: Props) {
    const { skillsTree, contentsTree, libraryItems, classes, addKnowledgeNode, updateKnowledgeNode, removeKnowledgeNode } = useAppStore();

    const treeData = treeType === "skill" ? skillsTree : contentsTree;
    const [selectedClassId, setSelectedClassId] = useState<string>("all");

    // Filter only the roots. Children belong to whatever root they are in.
    const filteredTreeData = treeData.filter(node => (node.classId || "all") === selectedClassId);

    // Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editMode, setEditMode] = useState<"add" | "edit" | null>(null);
    const [currentNode, setCurrentNode] = useState<Partial<KnowledgeNode> | null>(null);
    const [parentLevel, setParentLevel] = useState<KnowledgeLevel | null>(null); // To determine new node's level if adding

    const handleAddRoot = () => {
        setEditMode("add");
        setCurrentNode({
            id: `node-${Date.now()}`,
            type: treeType,
            level: "macro",
            name: "",
            description: "",
            classId: selectedClassId, // Assign to the currently selected class view
            children: []
        });
        setParentLevel(null);
        setIsDialogOpen(true);
    };

    const handleAddChild = (parentNode: KnowledgeNode) => {
        const nextLevel = NEXT_LEVEL[parentNode.level];
        if (!nextLevel) return;

        setEditMode("add");
        setCurrentNode({
            id: `node-${Date.now()}`,
            type: treeType,
            level: nextLevel,
            name: "",
            description: "",
            children: []
        });
        setParentLevel(parentNode.level); // Pass parent's level, but we also need parentId to attach it
        // We'll store parentId temporarily in the state
        // @ts-ignore
        setCurrentNode(prev => ({ ...prev, _parentId: parentNode.id }));
        setIsDialogOpen(true);
    };

    const handleEdit = (node: KnowledgeNode) => {
        setEditMode("edit");
        setCurrentNode(node);
        setIsDialogOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm("Tem certeza que deseja excluir este item e todos os seus filhos?")) {
            removeKnowledgeNode(treeType, id);
        }
    };

    const handleSave = () => {
        if (!currentNode || !currentNode.name) return;

        if (editMode === "add") {
            // @ts-ignore
            const parentId = currentNode._parentId || null;
            addKnowledgeNode(treeType, parentId, currentNode as KnowledgeNode);
        } else if (editMode === "edit") {
            updateKnowledgeNode(treeType, currentNode.id!, currentNode);
        }

        setIsDialogOpen(false);
        setCurrentNode(null);
    };

    // Derived states for Dialog
    const isLevel3 = currentNode?.level === "micro";
    const availableLibraryItems = libraryItems.filter(item => item.type === treeType);

    // Helper to get flat list of nodes from a tree by level (for cross-linking)
    const getNodesByLevel = (nodes: KnowledgeNode[], level: KnowledgeLevel): KnowledgeNode[] => {
        let result: KnowledgeNode[] = [];
        for (const n of nodes) {
            if (n.level === level) result.push(n);
            if (n.children) result = result.concat(getNodesByLevel(n.children, level));
        }
        return result;
    };

    // For content trees, L3 and L4 can be cross-linked to skill trees at the same level
    const canCrossLink = treeType === "content" && currentNode && (currentNode.level === "micro" || currentNode.level === "atomico");
    const linkableSkills = canCrossLink ? getNodesByLevel(skillsTree, currentNode.level!) : [];

    // Recursive Node Component
    const TreeNode = ({ node, isExpandedDefault = true }: { node: KnowledgeNode, isExpandedDefault?: boolean }) => {
        const [isExpanded, setIsExpanded] = useState(isExpandedDefault);
        const hasChildren = node.children && node.children.length > 0;
        const canHaveChildren = NEXT_LEVEL[node.level] !== null;

        return (
            <div className="flex flex-col gap-2 mt-2 ml-4">
                <div className={`p-3 rounded-lg border ${LEVEL_COLORS[node.level]} relative group transition-all duration-200 hover:shadow-sm`}>

                    {/* Connection Line to parent */}
                    <div className="absolute -left-4 top-6 w-4 h-px bg-slate-200" />
                    <div className="absolute -left-4 -top-2 bottom-6 w-px bg-slate-200" />

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="p-1 hover:bg-black/5 rounded-md text-slate-500 hover:text-slate-800 transition-colors"
                            disabled={!hasChildren}
                        >
                            {hasChildren ? (
                                isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                            ) : <div className="w-4 h-4" />}
                        </button>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-[10px] uppercase font-semibold tracking-wider bg-white/50 border-black/10">
                                    {LEVEL_LABELS[treeType][node.level]}
                                </Badge>
                                {isLevel3 && node.libraryItemId && (
                                    <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] flex items-center gap-1">
                                        <BookOpen className="w-3 h-3" /> Vinculado à Biblioteca
                                    </Badge>
                                )}
                            </div>
                            <h4 className="font-semibold text-sm leading-tight pr-2">
                                {isLevel3 && node.libraryItemId ? (
                                    <>
                                        <span className="text-slate-500 font-mono mr-2">{node.libraryItemId}</span>
                                        {node.name}
                                    </>
                                ) : node.name}
                            </h4>
                            {node.description && <p className="text-xs text-black/60 mt-1 line-clamp-2">{node.description}</p>}
                        </div>

                        {/* Node Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {canHaveChildren && (
                                <Button size="sm" variant="ghost" className="h-8 px-2 text-slate-500 hover:text-primary" onClick={() => handleAddChild(node)} title={`Adicionar ${LEVEL_LABELS[treeType][NEXT_LEVEL[node.level]!]}`}>
                                    <Plus className="w-4 h-4" />
                                </Button>
                            )}
                            <Button size="sm" variant="ghost" className="h-8 px-2 text-slate-500 hover:text-amber-600" onClick={() => handleEdit(node)}>
                                <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 px-2 text-slate-500 hover:text-red-600" onClick={() => handleDelete(node.id)}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {isExpanded && hasChildren && (
                    <div className="pl-4">
                        {node.children.map(child => (
                            <TreeNode key={child.id} node={child} isExpandedDefault={child.level !== "atomico"} />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200 border-dashed">
                <div className="flex items-center gap-4">
                    <div className="text-sm text-slate-600 max-w-md">
                        Construa as ramificações hierárquicas, começando pelas <strong>Áreas/Eixos</strong> até as <strong>Evidências</strong> atômicas.
                    </div>
                    <div className="h-8 w-px bg-slate-200" />
                    <div className="flex items-center gap-2">
                        <Label className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Turma:</Label>
                        <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                            <SelectTrigger className="w-[200px] h-9 bg-white">
                                <SelectValue placeholder="Selecione a Turma" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas as Turmas</SelectItem>
                                {classes.map(c => (
                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <Button onClick={handleAddRoot} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Criar Nível Macro
                </Button>
            </div>

            <div className="border border-slate-200 rounded-xl p-6 bg-white overflow-hidden relative min-h-[400px]">
                {filteredTreeData.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                        <div className="bg-slate-50 p-4 rounded-full mb-3">
                            <Plus className="w-8 h-8 opacity-50" />
                        </div>
                        <p>A árvore ainda está vazia para esta seleção.</p>
                        <p className="text-sm">Clique em "Criar Nível Macro" para iniciar.</p>
                    </div>
                ) : (
                    <div className="space-y-4 -ml-4">
                        {filteredTreeData.map(node => (
                            <TreeNode key={node.id} node={node} />
                        ))}
                    </div>
                )}
            </div>

            {/* Dialog for Add/Edit Node */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editMode === "add" ? "Adicionar " : "Editar "}
                            {currentNode ? LEVEL_LABELS[treeType][currentNode.level!] : "Nó"}
                        </DialogTitle>
                        <DialogDescription>
                            {isLevel3
                                ? "Selecione o item diretamente do seu Banco da Biblioteca."
                                : "Preencha as informações do nó e descreva o seu significado."}
                        </DialogDescription>
                    </DialogHeader>

                    {currentNode && (
                        <div className="space-y-4 py-4">

                            {/* IF LEVEL 3: Use Select from Library */}
                            {isLevel3 ? (
                                <div className="space-y-2">
                                    <Label>Item da Biblioteca</Label>
                                    <Select
                                        value={currentNode.libraryItemId || ""}
                                        onValueChange={(val) => {
                                            const item = availableLibraryItems.find(i => i.code === val || i.id === val);
                                            setCurrentNode(prev => ({
                                                ...prev,
                                                libraryItemId: item?.code || item?.id,
                                                name: item?.description || item?.name, // Use description for BNCC as it's the actual skill text
                                                description: item?.isBNCC ? `BNCC: ${item.subGroup}` : item?.description
                                            }));
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione..." />
                                        </SelectTrigger>
                                        <SelectContent className="z-[9999] max-h-64">
                                            {availableLibraryItems.map(item => (
                                                <SelectItem key={item.id} value={item.code || item.id}>
                                                    <div className="flex flex-col items-start text-left max-w-[400px]">
                                                        {item.isBNCC ? (
                                                            <>
                                                                <span className="font-semibold text-xs">{item.code} - {item.subGroup}</span>
                                                                <span className="text-xs text-slate-500 line-clamp-1">{item.description}</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span className="font-semibold text-xs">{item.name}</span>
                                                                <span className="text-xs text-slate-500 line-clamp-1">{item.subGroup}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            ) : (
                                // Normal Input for L1, L2, L4
                                <div className="space-y-2">
                                    <Label>Nome / Título</Label>
                                    <Input
                                        placeholder="Ex: Raciocínio Lógico, Identificar animais..."
                                        value={currentNode.name || ""}
                                        onChange={(e) => setCurrentNode(prev => ({ ...prev, name: e.target.value }))}
                                        autoFocus
                                    />
                                </div>
                            )}

                            {!isLevel3 && (
                                <div className="space-y-2">
                                    <Label>Descrição (Opcional)</Label>
                                    <Textarea
                                        placeholder="Detalhes ou critérios..."
                                        className="resize-none"
                                        value={currentNode.description || ""}
                                        onChange={(e) => setCurrentNode(prev => ({ ...prev, description: e.target.value }))}
                                    />
                                </div>
                            )}

                            {/* Cross-Linking UI for Content Nodes - Temporarily Removed
                            {canCrossLink && linkableSkills.length > 0 && (
                                <div className="space-y-3 pt-4 border-t mt-4">
                                    <Label className="flex items-center gap-2">
                                        <LinkIcon className="w-4 h-4 text-blue-500" />
                                        Vincular a Habilidades (Opcional)
                                    </Label>
                                    <p className="text-xs text-slate-500">
                                        Selecione as habilidades desta competência que este conteúdo ajuda a desenvolver.
                                    </p>
                                    <ScrollArea className="h-[120px] rounded-md border p-2 bg-slate-50">
                                        <div className="flex flex-col gap-1">
                                            {linkableSkills.map(skill => {
                                                const isLinked = currentNode.linkedNodeIds?.includes(skill.id);
                                                return (
                                                    <div
                                                        key={skill.id}
                                                        onClick={() => {
                                                            const currentLinks = currentNode.linkedNodeIds || [];
                                                            setCurrentNode(prev => ({
                                                                ...prev,
                                                                linkedNodeIds: isLinked
                                                                    ? currentLinks.filter(id => id !== skill.id)
                                                                    : [...currentLinks, skill.id]
                                                            }))
                                                        }}
                                                        className={`text-sm p-2 rounded cursor-pointer border ${isLinked ? 'bg-blue-100 border-blue-300' : 'hover:bg-slate-200 border-transparent'}`}
                                                    >
                                                        <div className="font-medium text-xs truncate">{skill.name}</div>
                                                        {skill.description && <div className="text-[10px] text-slate-500 truncate">{skill.description}</div>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </ScrollArea>
                                </div>
                            )}
                            */}

                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSave} disabled={!currentNode?.name}>Salvar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

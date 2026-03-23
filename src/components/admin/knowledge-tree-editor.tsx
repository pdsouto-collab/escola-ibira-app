"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { KnowledgeNode, KnowledgeLevel, SEMESTERS } from "@/lib/data";
import { ChevronRight, ChevronDown, Plus, Edit2, Trash2, Link as LinkIcon, BookOpen, Search, X, Copy, Filter, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getListBncc } from "@/services/bncc.service";
import { LibraryItem } from "@/types/library-item";
import { getClasses } from "@/services/school-class.service";
import { SchoolClass } from "@/types/school-class";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface Props {
    treeType: "skill" | "content";
}

const LEVEL_LABELS = {
    skill: {
        macro: "Eixo do Saber",
        mesclado: "Componente Curricular",
        micro: "Habilidade",
        atomico: "Evidência da Habilidade"
    },
    content: {
        macro: "Eixo Comportamental/Cognitivo",
        mesclado: "Tópico",
        micro: "Competência",
        atomico: "Evidência de Competência"
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

    const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [isLoadingClasses, setIsLoadingClasses] = useState(true);
    const { skillsTree, contentsTree, addKnowledgeNode, updateKnowledgeNode, removeKnowledgeNode, duplicateKnowledgeNode } = useAppStore();

    const treeData = treeType === "skill" ? skillsTree : contentsTree;
    const [selectedClassId, setSelectedClassId] = useState<string>("all");
    const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
    const [selectedGrade, setSelectedGrade] = useState<string>("all");

    // Filter only the roots. Children belong to whatever root they are in.
    const filteredTreeData = treeData.filter(node => {
        const classMatch = selectedClassId === "all" || node.classId === selectedClassId;
        const periodMatch = selectedPeriod === "all" || node.period === selectedPeriod;
        return classMatch && periodMatch;
    });

    // Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editMode, setEditMode] = useState<"add" | "edit" | null>(null);
    const [currentNode, setCurrentNode] = useState<Partial<KnowledgeNode> | null>(null);
    const [parentLevel, setParentLevel] = useState<KnowledgeLevel | null>(null); // To determine new node's level if adding
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [confirmDuplicateId, setConfirmDuplicateId] = useState<string | null>(null);
    const [confirmDuplicateChildrenCount, setConfirmDuplicateChildrenCount] = useState<number>(0);

    async function fetchClasses() {
        try {
            const data = await getClasses();
            setClasses(data);
        } catch (error) {
            console.error("Erro ao buscar turmas:", error);
        } finally {
            setIsLoadingClasses(false);
        }
    }

    useEffect(() => {
        getListaBNCC();
        fetchClasses();
    }, [])

    async function getListaBNCC() {
        await getListBncc().then(setLibraryItems);
    }

    const handleAddRoot = () => {
        setEditMode("add");
        setCurrentNode({
            id: `node-${Date.now()}`,
            type: treeType,
            level: "macro",
            name: "",
            description: "",
            classId: selectedClassId === "all" ? undefined : selectedClassId, // Assign to the currently selected class view
            period: selectedPeriod === "all" ? undefined : selectedPeriod,
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
        setConfirmDeleteId(id);
    };

    const confirmDeleteAction = () => {
        if (confirmDeleteId) {
            removeKnowledgeNode(treeType, confirmDeleteId);
            setConfirmDeleteId(null);
        }
    };

    const confirmDuplicateAction = () => {
        if (confirmDuplicateId) {
            duplicateKnowledgeNode(treeType, confirmDuplicateId);
            setConfirmDuplicateId(null);
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

    const [libSearchQuery, setLibSearchQuery] = useState("");
    const isLevel3 = currentNode?.level === "micro";

    // Helper to normalize strings for accent-insensitive search
    const normalizeString = (str: string) => {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    };

    // Filter library items by search query, type and grade/subgroup
    const availableLibraryItems = libraryItems
        .filter(item => item.type === treeType)
        .filter(item => {
            if (selectedGrade === "all") return true;
            if (treeType === "skill") return item.grade === selectedGrade || item.grade === "all";
            return item.subGroup === selectedGrade;
        })
        .filter(item => {
            const query = normalizeString(libSearchQuery);
            if (!query) return true;

            const nameMatch = normalizeString(item.name).includes(query);
            const descMatch = normalizeString(item.description).includes(query);
            const codeMatch = item.code ? normalizeString(item.code).includes(query) : false;
            const subGroupMatch = normalizeString(item.subGroup).includes(query);

            return nameMatch || descMatch || codeMatch || subGroupMatch;
        });

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

                    {/* Class Identification Badge */}
                    {node.level === "macro" && (
                        <div className="absolute -top-2.5 left-3 px-2 py-0.5 bg-slate-600 text-white text-[9px] font-bold rounded uppercase tracking-wider shadow-sm z-20 pointer-events-none flex gap-2">
                            <span>TURMA: {classes.find(c => c.id === node.classId)?.name || "GERAL/BASE"}</span>
                            {node.period && <span className="border-l border-white/30 pl-2">PERÍODO: {node.period}</span>}
                        </div>
                    )}

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
                                {node.level === "micro" && node.libraryItemId && (
                                    <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] flex items-center gap-1">
                                        <BookOpen className="w-3 h-3" /> Vinculado à Biblioteca
                                    </Badge>
                                )}
                            </div>
                            <h4 className="font-semibold text-sm leading-tight pr-2">
                                {node.level === "micro" && node.libraryItemId ? (
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
                            <Button size="sm" variant="ghost" className="h-8 px-2 text-slate-500 hover:text-blue-600" onClick={() => {
                                setConfirmDuplicateId(node.id);
                                setConfirmDuplicateChildrenCount(node.children?.length || 0);
                            }} title="Duplicar">
                                <Copy className="w-4 h-4" />
                            </Button>
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
                        Construa as ramificações hierárquicas para a <strong>{treeType === "skill" ? "Visão Acadêmica" : "Visão Comportamental"}</strong>.
                    </div>
                    <div className="h-8 w-px bg-slate-200" />
                    <div className="flex items-center gap-2">
                        <Label className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Turma:</Label>
                        {isLoadingClasses ? (
                            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium bg-white px-3 py-1.5 rounded-md border w-[200px]">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Carregando...
                            </div>
                        ) : (
                            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                                <SelectTrigger className="w-[180px] h-9 bg-white">
                                    <SelectValue placeholder="Selecione a Turma" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas as Turmas</SelectItem>
                                    {classes.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Label className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Período:</Label>
                        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                            <SelectTrigger className="w-[180px] h-9 bg-white">
                                <SelectValue placeholder="Selecione o Período" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos (Padrão)</SelectItem>
                                {SEMESTERS.map(sem => (
                                    <SelectItem key={sem} value={sem}>{sem}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <Button onClick={handleAddRoot} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Criar Nível 1
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
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) {
                    setLibSearchQuery(""); // Reset search on close
                    setSelectedGrade("all");
                }
            }}>
                <DialogContent className="max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editMode === "add" ? "Adicionar " : "Editar "}
                            {currentNode ? LEVEL_LABELS[treeType][currentNode.level!] : "Nó"}
                        </DialogTitle>
                        <DialogDescription>
                            {isLevel3
                                ? "Busque e selecione o item diretamente do seu Banco da Biblioteca."
                                : "Preencha as informações do nó e descreva o seu significado."}
                        </DialogDescription>
                    </DialogHeader>

                    {currentNode && (
                        <div className="space-y-4 py-4">

                            {/* IF LEVEL 3: Use Search + Select from Library */}
                            {isLevel3 ? (
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <div className="flex-1 space-y-2">
                                            <Label>Buscar na Biblioteca (Nome ou Código BNCC)</Label>
                                            <div className="relative">
                                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                                <Input
                                                    placeholder="Ex: EF01LP, Números, Natureza..."
                                                    className="pl-9"
                                                    value={libSearchQuery}
                                                    onChange={(e) => setLibSearchQuery(e.target.value)}
                                                    autoFocus
                                                />
                                            </div>
                                        </div>
                                        <div className="w-[200px] space-y-2">
                                            <Label>Filtrar por {treeType === "skill" ? "Etapa" : "Categoria"}</Label>
                                            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                                                <SelectTrigger className="bg-white">
                                                    <Filter className="w-4 h-4 mr-2 text-slate-400" />
                                                    <SelectValue placeholder="Todas" />
                                                </SelectTrigger>
                                                <SelectContent className="z-[9999]">
                                                    <SelectItem value="all">Todas</SelectItem>
                                                    {Array.from(new Set(
                                                        libraryItems
                                                            .filter(i => i.type === treeType)
                                                            .map(i => treeType === "skill" ? i.grade : i.subGroup)
                                                            .filter(g => g && g.trim().toLowerCase() !== "all")
                                                    )).sort((a, b) => {
                                                        if (a === "infantil") return -1;
                                                        if (b === "infantil") return 1;
                                                        const aNum = parseInt(a || "");
                                                        const bNum = parseInt(b || "");
                                                        if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
                                                        return (a || "").localeCompare(b || "");
                                                    }).map(grade => (
                                                        <SelectItem key={`tree-filter-${grade}`} value={grade!}>
                                                            {treeType === "skill" ? (
                                                                grade === 'infantil' ? 'Educação Infantil' :
                                                                    grade?.endsWith('ano') ? `${grade.replace('ano', '')}º Ano` : grade
                                                            ) : grade}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Selected item summary */}
                                    {currentNode.libraryItemId && (() => {
                                        const selectedItem = libraryItems.find(i => (i.code || i.id) === currentNode.libraryItemId);
                                        return selectedItem ? (
                                            <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                                                <div className="mt-0.5 w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                                        {selectedItem.code && <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">{selectedItem.code}</Badge>}
                                                        <span className="text-xs font-semibold text-primary">{selectedItem.subGroup}</span>
                                                    </div>
                                                    <p className="text-sm font-semibold text-slate-800 leading-snug">{selectedItem.name}</p>
                                                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{selectedItem.description}</p>
                                                </div>
                                                <button
                                                    onClick={() => setCurrentNode(prev => ({ ...prev, libraryItemId: undefined, name: "", description: "" }))}
                                                    className="text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                                                    title="Remover seleção"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : null;
                                    })()}

                                    {/* Results list */}
                                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                                        <div className="max-h-[260px] overflow-y-auto divide-y divide-slate-100">
                                            {availableLibraryItems.length === 0 ? (
                                                <div className="p-6 text-center text-sm text-slate-400">
                                                    {libSearchQuery ? `Nenhum resultado para "${libSearchQuery}"` : "Digite para buscar itens da biblioteca."}
                                                </div>
                                            ) : (
                                                availableLibraryItems.map(item => {
                                                    const itemKey = item.code || item.id;
                                                    const isSelected = currentNode.libraryItemId === itemKey;
                                                    return (
                                                        <button
                                                            key={item.id}
                                                            type="button"
                                                            className={`w-full text-left px-4 py-3 transition-colors ${isSelected ? "bg-primary/10 border-l-4 border-l-primary" : "hover:bg-slate-50 border-l-4 border-l-transparent"}`}
                                                            onClick={() => {
                                                                setCurrentNode(prev => ({
                                                                    ...prev,
                                                                    libraryItemId: itemKey,
                                                                    name: item.name,
                                                                    description: item.isBNCC ? `BNCC: ${item.subGroup}` : item.description
                                                                }));
                                                            }}
                                                        >
                                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                                {item.code && <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">{item.code}</span>}
                                                                <span className="text-[11px] font-semibold text-slate-500">{item.subGroup}</span>
                                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">{item.grade === 'all' ? 'Geral' : item.grade}</span>
                                                            </div>
                                                            <p className="text-sm font-medium text-slate-800 leading-snug">{item.name}</p>
                                                            {item.description && (
                                                                <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{item.description}</p>
                                                            )}
                                                        </button>
                                                    );
                                                })
                                            )}
                                        </div>
                                        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-xs text-slate-400">
                                            {availableLibraryItems.length} {availableLibraryItems.length === 1 ? "item encontrado" : "itens encontrados"}
                                        </div>
                                    </div>
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

                            {currentNode.level === "macro" && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Turma Associada</Label>
                                        <Select
                                            value={currentNode.classId || "all"}
                                            onValueChange={(val) => setCurrentNode(prev => ({ ...prev, classId: val === "all" ? undefined : val }))}
                                        >
                                            <SelectTrigger className="w-full bg-white">
                                                <SelectValue placeholder="Selecione a Turma" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todas as Turmas (Padrão)</SelectItem>
                                                {classes.map(c => (
                                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Semestre/Ano</Label>
                                        <Select
                                            value={currentNode.period || "all"}
                                            onValueChange={(val) => setCurrentNode(prev => ({ ...prev, period: val === "all" ? undefined : val }))}
                                        >
                                            <SelectTrigger className="w-full bg-white">
                                                <SelectValue placeholder="Selecione o Período" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todos (Padrão)</SelectItem>
                                                {SEMESTERS.map(sem => (
                                                    <SelectItem key={sem} value={sem}>{sem}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
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

            <ConfirmDialog
                open={!!confirmDeleteId}
                onOpenChange={(open) => !open && setConfirmDeleteId(null)}
                title="Excluir Item"
                description="Tem certeza que deseja excluir este item e todos os seus filhos? Esta ação não pode ser desfeita."
                onConfirm={confirmDeleteAction}
            />

            <ConfirmDialog
                open={!!confirmDuplicateId}
                onOpenChange={(open) => !open && setConfirmDuplicateId(null)}
                title="Duplicar Item"
                description={`Deseja duplicar este item e todos os seus ${confirmDuplicateChildrenCount} filhos?`}
                onConfirm={confirmDuplicateAction}
                variant="default"
                confirmText="Duplicar"
            />
        </div>
    );
}

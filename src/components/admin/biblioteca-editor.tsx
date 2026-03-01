"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { LibraryItem } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Filter, BookOpen, Layers, Trash2, Edit, ChevronDown, Settings2 } from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function BibliotecaEditor() {
    const { libraryItems, addLibraryItem, updateLibraryItem, removeLibraryItem, renameSubGroup, deleteSubGroup } = useAppStore();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedGrade, setSelectedGrade] = useState<string>("all");
    const [activeTab, setActiveTab] = useState<"skill" | "content">("skill");

    // Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<LibraryItem | null>(null);

    const [formData, setFormData] = useState({
        type: "skill" as "skill" | "content",
        name: "",
        description: "",
        subGroup: "",
        grade: "all" as any,
        isCustomGroup: false
    });

    const [isManageGroupsOpen, setIsManageGroupsOpen] = useState(false);
    const [manageGroupEditing, setManageGroupEditing] = useState<string | null>(null);
    const [manageGroupNewName, setManageGroupNewName] = useState("");
    const [isCreatingNewGroup, setIsCreatingNewGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState("");

    // Get unique existing groups for the active tab (to populate the combobox)
    const existingGroups = Array.from(new Set(libraryItems.filter(i => i.type === activeTab).map(i => i.subGroup))).sort();

    const handleOpenDialog = (item?: LibraryItem) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                type: item.type,
                name: item.name,
                description: item.description,
                subGroup: item.subGroup,
                grade: item.grade || "all",
                isCustomGroup: false
            });
        } else {
            setEditingItem(null);
            setFormData({
                type: activeTab,
                name: "",
                description: "",
                subGroup: existingGroups[0] || "",
                grade: selectedGrade === "all" ? "all" : selectedGrade as any,
                isCustomGroup: false
            });
        }
        setIsDialogOpen(true);
    };

    const handleSave = () => {
        if (!formData.name.trim() || !formData.description.trim() || !formData.subGroup.trim()) return;

        if (editingItem) {
            updateLibraryItem(editingItem.id, {
                type: formData.type,
                name: formData.name,
                description: formData.description,
                subGroup: formData.subGroup,
                grade: formData.grade
            });
        } else {
            addLibraryItem({
                id: `lib-custom-${Date.now()}`,
                type: formData.type,
                name: formData.name,
                description: formData.description,
                subGroup: formData.subGroup,
                grade: formData.grade,
                isBNCC: false // Custom items are never BNCC
            });
        }
        setIsDialogOpen(false);
    };

    const handleCreateGroup = () => {
        if (!newGroupName.trim()) return;
        addLibraryItem({
            id: `lib-custom-${Date.now()}`,
            type: activeTab,
            name: `Exemplo de ${newGroupName.trim()}`,
            description: `Este item foi criado automaticamente para que o grupo "${newGroupName.trim()}" apareça na lista. Você pode editá-lo para adicionar um conteúdo real ou excluí-lo após adicionar outros itens a este grupo.`,
            subGroup: newGroupName.trim(),
            grade: "all",
            isBNCC: false
        });
        setNewGroupName("");
        setIsCreatingNewGroup(false);
    };

    const handleDelete = (id: string, isBNCC: boolean) => {
        if (isBNCC) {
            alert("Itens da BNCC não podem ser excluídos.");
            return;
        }
        if (confirm("Tem certeza que deseja excluir este item? Projetos que o utilizam não serão afetados, mas ele não aparecerá mais na busca.")) {
            removeLibraryItem(id);
        }
    };

    // Filter items based on tab, search and grade
    const filteredItems = libraryItems.filter(item => {
        const matchesTab = item.type === activeTab;
        const matchesGrade = selectedGrade === "all" || item.grade === selectedGrade || item.grade === "all";

        const query = searchQuery.toLowerCase();
        const matchesSearch = item.name.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query) ||
            item.subGroup.toLowerCase().includes(query) ||
            (item.code && item.code.toLowerCase().includes(query));

        return matchesTab && matchesGrade && matchesSearch;
    });

    // Group items by subGroup
    const groupedItems = filteredItems.reduce((acc, item) => {
        if (!acc[item.subGroup]) {
            acc[item.subGroup] = [];
        }
        acc[item.subGroup].push(item);
        return acc;
    }, {} as Record<string, LibraryItem[]>);

    // Sort groups alphabetically
    const sortedGroups = Object.keys(groupedItems).sort();

    return (
        <div className="max-w-6xl mx-auto pb-12">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Biblioteca</h1>
                    <p className="text-slate-500 mt-1">Gerencie habilidades da BNCC e competências gerais da escola.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                        <SelectTrigger className="w-[180px] bg-white border-slate-200">
                            <Filter className="w-4 h-4 mr-2 text-slate-400" />
                            <SelectValue placeholder="Filtrar por Etapa" />
                        </SelectTrigger>
                        <SelectContent className="z-[9999]">
                            <SelectItem value="all">Todas as Etapas</SelectItem>
                            <SelectItem value="infantil">Educação Infantil</SelectItem>
                            <SelectItem value="1ano">1º Ano</SelectItem>
                            <SelectItem value="2ano">2º Ano</SelectItem>
                            <SelectItem value="3ano">3º Ano</SelectItem>
                            <SelectItem value="4ano">4º Ano</SelectItem>
                            <SelectItem value="5ano">5º Ano</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Buscar habilidades ou conteúdos..."
                            className="pl-9 bg-white border-slate-200"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <Button variant="outline" onClick={() => setIsManageGroupsOpen(true)} className="gap-2 rounded-lg px-4 shadow-sm hover:shadow-md transition-all">
                        <Settings2 className="w-4 h-4" />
                        Gerenciar Grupos
                    </Button>
                    <Button onClick={() => handleOpenDialog()} className="gap-2 rounded-lg px-6 shadow-sm hover:shadow-md transition-all">
                        <Plus className="w-4 h-4" />
                        Novo Item
                    </Button>
                </div>
            </div>

            {/* Main Content Area with Tabs */}
            <Tabs defaultValue="skill" value={activeTab} onValueChange={(val) => setActiveTab(val as "skill" | "content")} className="w-full">
                <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-0">
                    <TabsList className="bg-transparent h-auto p-0 gap-6">
                        <TabsTrigger
                            value="skill"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3 text-base font-medium text-slate-500 data-[state=active]:text-primary transition-all flex items-center gap-2"
                        >
                            <BookOpen className="w-4 h-4" />
                            Habilidades BNCC
                        </TabsTrigger>
                        <TabsTrigger
                            value="content"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3 text-base font-medium text-slate-500 data-[state=active]:text-primary transition-all flex items-center gap-2"
                        >
                            <Layers className="w-4 h-4" />
                            Competências Gerais
                        </TabsTrigger>
                    </TabsList>
                </div>

                <Accordion type="multiple" className="w-full space-y-4" defaultValue={sortedGroups}>
                    {sortedGroups.map(group => (
                        <AccordionItem key={group} value={group} className="border bg-white rounded-xl overflow-hidden data-[state=open]:shadow-sm">
                            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/10 text-primary p-2 rounded-lg">
                                        {activeTab === 'skill' ? <BookOpen className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <h3 className="text-lg font-bold text-slate-800">{group}</h3>
                                        <span className="text-sm font-normal text-slate-500">{groupedItems[group].length} {groupedItems[group].length === 1 ? 'item' : 'itens'}</span>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-6 pb-6 pt-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {groupedItems[group].map(item => (
                                        <div key={item.id} className="bg-slate-50 border border-slate-200 text-left p-5 rounded-xl hover:border-slate-300 transition-colors relative group flex flex-col h-full">
                                            <div className="flex justify-between items-start mb-3">
                                                {item.isBNCC ? (
                                                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200 uppercase text-[10px] tracking-wider">
                                                        Oficial BNCC
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200 uppercase text-[10px] tracking-wider">
                                                        Personalizado
                                                    </Badge>
                                                )}

                                                <div className="flex items-center gap-1 transition-opacity">
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-primary" onClick={(e) => { e.stopPropagation(); handleOpenDialog(item); }}>
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </Button>
                                                    {!item.isBNCC && (
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); handleDelete(item.id, item.isBNCC); }}>
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex-1">
                                                {item.code && (
                                                    <div className="text-xs font-mono font-bold text-slate-400 mb-1">
                                                        {item.code}
                                                    </div>
                                                )}
                                                <h3 className="text-base font-bold text-slate-800 leading-tight mb-2">
                                                    {item.name}
                                                </h3>
                                                <p className="text-sm text-slate-600 line-clamp-4">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
                {filteredItems.length === 0 && (
                    <div className="col-span-full text-center py-20 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                        <p className="text-slate-500 font-medium">Nenhum item encontrado nesta categoria.</p>
                        <Button
                            variant="link"
                            onClick={() => setSearchQuery("")}
                            className="mt-2 text-primary"
                        >
                            Limpar busca
                        </Button>
                    </div>
                )}
            </Tabs>

            {/* Custom Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? "Editar Item" : "Novo Item da Biblioteca"}</DialogTitle>
                        <DialogDescription>
                            Crie habilidades ou conteúdos personalizados para a sua escola.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Tipo</label>
                            <Select
                                value={formData.type}
                                onValueChange={(val) => setFormData({ ...formData, type: val as "skill" | "content" })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                                <SelectContent className="z-[9999]">
                                    <SelectItem value="skill">Habilidades BNCC</SelectItem>
                                    <SelectItem value="content">Competências Gerais</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Etapa / Segmento</label>
                            <Select
                                value={formData.grade}
                                onValueChange={(val) => setFormData({ ...formData, grade: val as any })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione a etapa" />
                                </SelectTrigger>
                                <SelectContent className="z-[9999]">
                                    <SelectItem value="all">Todas as Etapas (Geral)</SelectItem>
                                    <SelectItem value="infantil">Educação Infantil</SelectItem>
                                    <SelectItem value="1ano">1º Ano</SelectItem>
                                    <SelectItem value="2ano">2º Ano</SelectItem>
                                    <SelectItem value="3ano">3º Ano</SelectItem>
                                    <SelectItem value="4ano">4º Ano</SelectItem>
                                    <SelectItem value="5ano">5º Ano</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Grupo / Disciplina</label>
                            {!formData.isCustomGroup ? (
                                <Select
                                    value={formData.subGroup}
                                    onValueChange={(val) => {
                                        if (val === "new_group_trigger") {
                                            setFormData({ ...formData, isCustomGroup: true, subGroup: "" });
                                        } else {
                                            setFormData({ ...formData, subGroup: val });
                                        }
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione um grupo existente" />
                                    </SelectTrigger>
                                    <SelectContent className="z-[9999]">
                                        {existingGroups.map(g => (
                                            <SelectItem key={g} value={g}>{g}</SelectItem>
                                        ))}
                                        <SelectItem value="new_group_trigger" className="font-bold text-primary border-t mt-1">
                                            + Criar Novo Grupo
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Digite o nome do novo grupo..."
                                        value={formData.subGroup}
                                        onChange={(e) => setFormData({ ...formData, subGroup: e.target.value })}
                                        autoFocus
                                    />
                                    <Button variant="outline" onClick={() => setFormData({ ...formData, isCustomGroup: false, subGroup: existingGroups[0] || "" })}>
                                        Cancelar
                                    </Button>
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Nome / Título</label>
                            <Input
                                placeholder={formData.type === 'skill' ? 'Ex: Inteligência Emocional' : 'Ex: Ciclo da Água'}
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                disabled={editingItem?.isBNCC}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Descrição detalhada</label>
                            <Textarea
                                placeholder="Descreva o objetivo ou o que será trabalhado..."
                                className="h-32"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                disabled={editingItem?.isBNCC}
                            />
                            {editingItem?.isBNCC && (
                                <p className="text-xs text-amber-600 mt-1">Você só pode alterar o grupo de um item oficial da BNCC.</p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSave} disabled={!formData.name.trim() || !formData.description.trim() || !formData.subGroup.trim()}>
                            Gravar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Manage Groups Dialog */}
            <Dialog open={isManageGroupsOpen} onOpenChange={setIsManageGroupsOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Gerenciar Grupos</DialogTitle>
                        <DialogDescription>
                            Renomeie ou exclua os grupos existentes na aba atual ({activeTab === 'skill' ? 'Habilidades BNCC' : 'Competências Gerais'}).<br />
                            Itens da BNCC de um grupo excluído irão para a categoria "BNCC Sem Grupo".
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-2 py-4">
                        {existingGroups.length === 0 && (
                            <p className="text-sm text-slate-500 text-center py-4">Nenhum grupo encontrado.</p>
                        )}
                        {existingGroups.map(group => (
                            <div key={group} className="flex flex-col gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                                {manageGroupEditing === group ? (
                                    <div className="flex items-center gap-2">
                                        <Input
                                            value={manageGroupNewName}
                                            onChange={(e) => setManageGroupNewName(e.target.value)}
                                            className="h-8 text-sm"
                                            autoFocus
                                        />
                                        <Button
                                            size="sm"
                                            onClick={() => {
                                                if (manageGroupNewName.trim() && manageGroupNewName !== group) {
                                                    renameSubGroup(group, manageGroupNewName.trim());
                                                }
                                                setManageGroupEditing(null);
                                            }}
                                            className="h-8 px-3"
                                        >
                                            Salvar
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setManageGroupEditing(null)}
                                            className="h-8 px-3"
                                        >
                                            Cancelar
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-slate-800">{group}</span>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-slate-400 hover:text-primary"
                                                onClick={() => {
                                                    setManageGroupEditing(group);
                                                    setManageGroupNewName(group);
                                                }}
                                            >
                                                <Edit className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => {
                                                    if (confirm(`Tem certeza que deseja excluir o grupo "${group}"? Itens personalizados serão apagados.`)) {
                                                        deleteSubGroup(group);
                                                    }
                                                }}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {isCreatingNewGroup ? (
                            <div className="flex flex-col gap-2 p-3 bg-white border border-primary/20 shadow-sm rounded-lg mt-2">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Nome do Novo Grupo</label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        value={newGroupName}
                                        onChange={(e) => setNewGroupName(e.target.value)}
                                        placeholder="Ex: Projetos de Leitura"
                                        className="h-8 text-sm flex-1"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleCreateGroup();
                                            if (e.key === 'Escape') setIsCreatingNewGroup(false);
                                        }}
                                    />
                                    <Button size="sm" onClick={handleCreateGroup} className="h-8 px-3">Criar</Button>
                                    <Button size="sm" variant="ghost" onClick={() => setIsCreatingNewGroup(false)} className="h-8 px-3">Cancelar</Button>
                                </div>
                            </div>
                        ) : (
                            <Button
                                variant="outline"
                                className="w-full mt-2 border-dashed text-slate-500 hover:text-primary hover:border-primary hover:bg-primary/5"
                                onClick={() => setIsCreatingNewGroup(true)}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Criar Novo Grupo
                            </Button>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

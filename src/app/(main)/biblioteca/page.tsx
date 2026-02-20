"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { LibraryItem } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Filter, BookOpen, Layers, Trash2, Edit } from "lucide-react";
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

export default function BibliotecaPage() {
    const { libraryItems, addLibraryItem, updateLibraryItem, removeLibraryItem } = useAppStore();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<"skill" | "content">("skill");

    // Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<LibraryItem | null>(null);

    const [formData, setFormData] = useState({
        type: "skill" as "skill" | "content",
        name: "",
        description: "",
    });

    const handleOpenDialog = (item?: LibraryItem) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                type: item.type,
                name: item.name,
                description: item.description
            });
        } else {
            setEditingItem(null);
            setFormData({
                type: activeTab,
                name: "",
                description: ""
            });
        }
        setIsDialogOpen(true);
    };

    const handleSave = () => {
        if (!formData.name.trim() || !formData.description.trim()) return;

        if (editingItem) {
            updateLibraryItem(editingItem.id, {
                type: formData.type,
                name: formData.name,
                description: formData.description
            });
        } else {
            addLibraryItem({
                id: `lib-custom-${Date.now()}`,
                type: formData.type,
                name: formData.name,
                description: formData.description,
                isBNCC: false // Custom items are never BNCC
            });
        }
        setIsDialogOpen(false);
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

    // Filter items based on tab and search
    const filteredItems = libraryItems.filter(item => {
        const matchesTab = item.type === activeTab;
        const query = searchQuery.toLowerCase();
        const matchesSearch = item.name.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query) ||
            (item.code && item.code.toLowerCase().includes(query));

        return matchesTab && matchesSearch;
    });

    return (
        <div className="max-w-6xl mx-auto pb-12">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Biblioteca</h1>
                    <p className="text-slate-500 mt-1">Gerencie habilidades da BNCC e conteúdos personalizados da escola.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Buscar habilidades ou conteúdos..."
                            className="pl-9 bg-white border-slate-200"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

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
                            Habilidades (BNCC e Escola)
                        </TabsTrigger>
                        <TabsTrigger
                            value="content"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3 text-base font-medium text-slate-500 data-[state=active]:text-primary transition-all flex items-center gap-2"
                        >
                            <Layers className="w-4 h-4" />
                            Conteúdos Específicos
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredItems.map(item => (
                        <div key={item.id} className="bg-white border text-left p-5 rounded-xl hover:shadow-md transition-shadow relative group flex flex-col h-full">
                            <div className="flex justify-between items-start mb-3">
                                {item.isBNCC ? (
                                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 uppercase text-[10px] tracking-wider">
                                        Oficial BNCC
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200 uppercase text-[10px] tracking-wider">
                                        Personalizado
                                    </Badge>
                                )}

                                {!item.isBNCC && (
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-primary" onClick={(e) => { e.stopPropagation(); handleOpenDialog(item); }}>
                                            <Edit className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); handleDelete(item.id, item.isBNCC); }}>
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                )}
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
                </div>
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
                                disabled={!!editingItem} // Don't allow changing type of existing item
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="skill">Habilidade</SelectItem>
                                    <SelectItem value="content">Conteúdo Específico</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Nome / Título</label>
                            <Input
                                placeholder={formData.type === 'skill' ? 'Ex: Inteligência Emocional' : 'Ex: Ciclo da Água'}
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Descrição detalhada</label>
                            <Textarea
                                placeholder="Descreva o objetivo ou o que será trabalhado..."
                                className="h-32"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSave} disabled={!formData.name.trim() || !formData.description.trim()}>
                            Gravar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

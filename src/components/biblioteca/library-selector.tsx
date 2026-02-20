"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Search } from "lucide-react";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import { cn } from "@/lib/utils";

interface LibrarySelectorProps {
    selectedIds?: string[];
    onSelect?: (ids: string[]) => void;
    typeFilter?: "all" | "skill" | "content";
}

export function LibrarySelector({ selectedIds = [], onSelect, typeFilter = "all" }: LibrarySelectorProps) {
    const { libraryItems } = useAppStore();
    const [searchTerm, setSearchTerm] = useState("");
    const [showOnlySelected, setShowOnlySelected] = useState(false);

    // Keep internal state if not controlled
    const [itemState, setItemState] = useState<string[]>([]);
    const currentSelection = onSelect ? selectedIds : itemState;

    const handleSelect = (newSelection: string[]) => {
        if (onSelect) {
            onSelect(newSelection);
        } else {
            setItemState(newSelection);
        }
    };

    const toggleItem = (id: string) => {
        const newSelection = currentSelection.includes(id)
            ? currentSelection.filter(itemId => itemId !== id)
            : [...currentSelection, id];
        handleSelect(newSelection);
    };

    const filteredItems = libraryItems.filter(item => {
        if (typeFilter !== "all" && item.type !== typeFilter) return false;

        if (showOnlySelected && !currentSelection.includes(item.id)) return false;

        const query = searchTerm.toLowerCase();
        if (query) {
            return item.name.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query) ||
                (item.code && item.code.toLowerCase().includes(query));
        }
        return true;
    });

    const skills = filteredItems.filter(i => i.type === "skill");
    const contents = filteredItems.filter(i => i.type === "content");

    return (
        <div className="w-full space-y-6">
            {/* Header Content */}
            <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Biblioteca de Habilidades e Conteúdos</h2>
                <p className="text-slate-500">Selecione os itens da BNCC ou personalizados da escola para este projeto.</p>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50 p-4 rounded-xl border">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Buscar por código, nome ou descrição..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 bg-white"
                    />
                </div>
                <div className="flex items-center gap-2 px-2">
                    <Switch
                        id="show-selected"
                        checked={showOnlySelected}
                        onCheckedChange={setShowOnlySelected}
                    />
                    <label htmlFor="show-selected" className="text-sm font-medium text-slate-700 select-none cursor-pointer">
                        Ver selecionados ({currentSelection.length})
                    </label>
                </div>
            </div>

            {/* List */}
            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">

                {skills.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="font-semibold text-sm text-slate-500 uppercase tracking-wider sticky top-0 bg-white/90 backdrop-blur pb-2 z-10">
                            Habilidades ({skills.length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {skills.map(item => <LibraryItemCard key={item.id} item={item} isSelected={currentSelection.includes(item.id)} onClick={() => toggleItem(item.id)} />)}
                        </div>
                    </div>
                )}

                {contents.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="font-semibold text-sm text-slate-500 uppercase tracking-wider sticky top-0 bg-white/90 backdrop-blur pb-2 z-10">
                            Conteúdos Específicos ({contents.length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {contents.map(item => <LibraryItemCard key={item.id} item={item} isSelected={currentSelection.includes(item.id)} onClick={() => toggleItem(item.id)} />)}
                        </div>
                    </div>
                )}

                {filteredItems.length === 0 && (
                    <div className="text-center py-12 text-slate-400 border-2 border-dashed rounded-xl">
                        Nenhum item encontrado na biblioteca.
                    </div>
                )}
            </div>
        </div>
    );
}

function LibraryItemCard({ item, isSelected, onClick }: { item: any, isSelected: boolean, onClick: () => void }) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "cursor-pointer border text-left rounded-xl p-4 transition-all hover:shadow-sm relative overflow-hidden group select-none",
                isSelected
                    ? "bg-primary/5 border-primary/30 shadow-[0_0_0_1px_rgba(var(--primary),0.2)]"
                    : "bg-white border-slate-200 hover:border-slate-300"
            )}
        >
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    {item.isBNCC ? (
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 uppercase text-[10px] tracking-wider">BNCC</Badge>
                    ) : (
                        <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200 uppercase text-[10px] tracking-wider">Escola</Badge>
                    )}
                    {item.code && <span className="text-xs font-mono font-bold text-slate-400">{item.code}</span>}
                </div>

                {/* Checkbox circle indicator */}
                <div className={cn(
                    "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                    isSelected ? "bg-primary border-primary" : "border-slate-300 group-hover:border-primary/50"
                )}>
                    {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </div>
            </div>

            <h4 className="text-sm font-bold text-slate-800 leading-snug mb-1 pr-6">
                {item.name}
            </h4>
            <p className="text-xs text-slate-600 line-clamp-2">
                {item.description}
            </p>
        </div>
    );
}

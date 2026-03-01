"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Search } from "lucide-react";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import { cn } from "@/lib/utils";
import { BookOpen, Layers, Filter } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

interface LibrarySelectorProps {
    selectedIds?: string[];
    onSelect?: (ids: string[]) => void;
    typeFilter?: "all" | "skill" | "content";
}

export function LibrarySelector({ selectedIds = [], onSelect, typeFilter = "all" }: LibrarySelectorProps) {
    const { libraryItems } = useAppStore();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedGrade, setSelectedGrade] = useState<string>("all");
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

        const matchesGrade = selectedGrade === "all" ||
            item.grade === selectedGrade ||
            item.subGroup === selectedGrade ||
            item.grade === "all";
        if (!matchesGrade) return false;

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

    // Helper function to group items
    const groupItems = (items: any[]) => {
        const grouped = items.reduce((acc, item) => {
            if (!acc[item.subGroup]) acc[item.subGroup] = [];
            acc[item.subGroup].push(item);
            return acc;
        }, {} as Record<string, any[]>);
        return { grouped, sortedKeys: Object.keys(grouped).sort() };
    };

    const { grouped: groupedSkills, sortedKeys: sortedSkillKeys } = groupItems(skills);
    const { grouped: groupedContents, sortedKeys: sortedContentKeys } = groupItems(contents);

    return (
        <div className="w-full space-y-6">
            {/* Header Content */}
            <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Biblioteca de Habilidades BNCC e Competências Gerais</h2>
                <p className="text-slate-500">Selecione os itens da BNCC ou personalizados da escola para este projeto.</p>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50 p-4 rounded-xl border">
                <div className="flex items-center gap-3 flex-1 w-full">
                    <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                        <SelectTrigger className="w-[180px] bg-white">
                            <Filter className="w-4 h-4 mr-2 text-slate-400" />
                            <SelectValue placeholder="Filtrar por Etapa" />
                        </SelectTrigger>
                        <SelectContent className="z-[9999]">
                            <SelectItem value="all">Todas as Etapas e Categorias</SelectItem>

                            {/* Dynamic Skill grades (Stages) */}
                            <div className="px-2 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Etapas (BNCC)</div>
                            {Array.from(new Set(
                                libraryItems
                                    .filter(i => i.type === "skill")
                                    .map(i => i.grade)
                                    .filter(g => g && g.trim().toLowerCase() !== "all")
                            )).sort((a, b) => {
                                const aNum = parseInt(a || "");
                                const bNum = parseInt(b || "");
                                if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
                                return (a || "").localeCompare(b || "");
                            }).map(grade => (
                                <SelectItem key={`grade-${grade}`} value={grade!}>
                                    {grade === 'infantil' ? 'Educação Infantil' :
                                        grade?.endsWith('ano') ? `${grade.replace('ano', '')}º Ano` : grade}
                                </SelectItem>
                            ))}

                            {/* Dynamic Content subgroups (Categories) */}
                            <div className="px-2 py-1.5 mt-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Categorias (Competências)</div>
                            {Array.from(new Set(
                                libraryItems
                                    .filter(i => i.type === "content")
                                    .map(i => i.subGroup)
                                    .filter(g => g && g.trim().toLowerCase() !== "all")
                            )).sort((a, b) => a.localeCompare(b)).map(group => (
                                <SelectItem key={`group-${group}`} value={group}>
                                    {group}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Buscar habilidades ou conteúdos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 bg-white"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2 px-2 whitespace-nowrap">
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
                            Habilidades BNCC ({skills.length})
                        </h3>
                        <Accordion type="multiple" className="w-full space-y-3" defaultValue={sortedSkillKeys}>
                            {sortedSkillKeys.map(group => (
                                <AccordionItem key={`skill-${group}`} value={group} className="border bg-white rounded-xl overflow-hidden data-[state=open]:shadow-sm">
                                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="w-4 h-4 text-primary" />
                                            <span className="font-bold text-slate-800">{group}</span>
                                            <span className="text-xs font-normal text-slate-500 ml-2">({groupedSkills[group].length})</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 pb-4 pt-1">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {groupedSkills[group].map((item: any) => <LibraryItemCard key={item.id} item={item} isSelected={currentSelection.includes(item.id)} onClick={() => toggleItem(item.id)} />)}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                )}

                {contents.length > 0 && (
                    <div className="space-y-3 pt-4">
                        <h3 className="font-semibold text-sm text-slate-500 uppercase tracking-wider sticky top-0 bg-white/90 backdrop-blur pb-2 z-10">
                            Competências Gerais ({contents.length})
                        </h3>
                        <Accordion type="multiple" className="w-full space-y-3" defaultValue={sortedContentKeys}>
                            {sortedContentKeys.map(group => (
                                <AccordionItem key={`content-${group}`} value={group} className="border bg-white rounded-xl overflow-hidden data-[state=open]:shadow-sm">
                                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-2">
                                            <Layers className="w-4 h-4 text-primary" />
                                            <span className="font-bold text-slate-800">{group}</span>
                                            <span className="text-xs font-normal text-slate-500 ml-2">({groupedContents[group].length})</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 pb-4 pt-1">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {groupedContents[group].map((item: any) => <LibraryItemCard key={item.id} item={item} isSelected={currentSelection.includes(item.id)} onClick={() => toggleItem(item.id)} />)}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
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

"use client";

import { useState } from "react";
import { mockBNCCData, BNCCSkill } from "@/lib/data";
import { Search, Filter, ChevronDown, ChevronRight, Check } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";

export function BNCCSelector() {
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedSubjects, setExpandedSubjects] = useState<string[]>(["ciencias"]);
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

    const filteredData = mockBNCCData.map(subject => ({
        ...subject,
        skills: subject.skills.filter(skill =>
            skill.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            skill.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            skill.category.toLowerCase().includes(searchTerm.toLowerCase())
        )
    })).filter(subject => subject.skills.length > 0);

    const toggleSubject = (id: string) => {
        setExpandedSubjects(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const toggleSkill = (code: string) => {
        setSelectedSkills(prev =>
            prev.includes(code) ? prev.filter(s => s !== code) : [...prev, code]
        );
    };

    return (
        <div className="w-full">
            {/* Header Content */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Selecione Habilidades</h2>
                <p className="text-slate-500">Busque na base da BNCC para adicionar ao seu projeto.</p>
            </div>

            {/* Search & Filter */}
            <div className="flex gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Procurar habilidades, códigos ou categorias..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-10 pl-10 pr-4 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50"
                    />
                </div>
                <Button variant="outline" className="rounded-full px-6 gap-2">
                    <Filter className="w-4 h-4" />
                    Filtros
                </Button>
            </div>

            {/* Content List */}
            <div className="space-y-4">
                {filteredData.map(subject => (
                    <div key={subject.id} className="border-b border-slate-100 last:border-0 pb-4">
                        <button
                            onClick={() => toggleSubject(subject.id)}
                            className="flex items-center justify-between w-full py-2 hover:bg-slate-50 rounded-lg px-2 transition-colors"
                        >
                            <span className="font-bold text-lg text-slate-800">{subject.name}</span>
                            {expandedSubjects.includes(subject.id) ? (
                                <ChevronDown className="w-5 h-5 text-slate-400" />
                            ) : (
                                <ChevronRight className="w-5 h-5 text-slate-400" />
                            )}
                        </button>

                        {expandedSubjects.includes(subject.id) && (
                            <div className="mt-4 px-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {subject.skills.map(skill => {
                                    const isSelected = selectedSkills.includes(skill.code);
                                    return (
                                        <div
                                            key={skill.code}
                                            onClick={() => toggleSkill(skill.code)}
                                            className={cn(
                                                "cursor-pointer border rounded-lg p-3 text-left transition-all hover:shadow-sm relative overflow-hidden group",
                                                isSelected
                                                    ? "bg-green-50 border-green-200"
                                                    : "bg-white border-slate-200 hover:border-slate-300"
                                            )}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200 text-[10px]">
                                                    {skill.code}
                                                </Badge>
                                                {isSelected && <Check className="w-4 h-4 text-green-600" />}
                                            </div>

                                            <p className="text-xs text-slate-500 font-bold uppercase mb-1 tracking-wide">
                                                {skill.category}
                                            </p>

                                            <p className="text-sm text-slate-700 leading-snug line-clamp-3">
                                                {skill.description}
                                            </p>

                                            {/* Selection Highlight Bar */}
                                            {isSelected && (
                                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}

                {filteredData.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                        Nenhuma habilidade encontrada para "{searchTerm}".
                    </div>
                )}
            </div>
        </div>
    );
}

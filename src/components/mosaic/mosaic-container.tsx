"use client";

import { useState } from "react";
import { MosaicNode, mockRecursiveDataSkills, mockRecursiveDataContent } from "@/lib/data";
import { MosaicSunburst } from "./mosaic-sunburst";
import { MonalMosaic } from "./monal-mosaic"; // Keeping for reference/fallback
// import { TreeMosaic } from "./tree-mosaic";
import { PracticesTree } from "./practices-tree";
import { MosaicDetailPanel } from "./mosaic-detail-panel";
import { Switch } from "../ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Bell, Edit3, Search } from "lucide-react";
import { Button } from "../ui/button";

export function MosaicContainer() {
    const [selectedNode, setSelectedNode] = useState<MosaicNode | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [activeTab, setActiveTab] = useState<"skills" | "content">("skills");

    // Local state for the trees to allow editing
    const [skillsData, setSkillsData] = useState(mockRecursiveDataSkills);
    const [contentData, setContentData] = useState(mockRecursiveDataContent);

    const currentData = activeTab === "skills" ? skillsData : contentData;
    const setCurrentData = activeTab === "skills" ? setSkillsData : setContentData;

    // --- Editing Logic ---

    const handleSplitNode = (nodeId: string, parts: number) => {
        if (!editMode) return;

        const splitRecursive = (nodes: MosaicNode[]): MosaicNode[] => {
            return nodes.map(node => {
                if (node.id === nodeId) {
                    // Create 'parts' new children for this node
                    const newChildren: MosaicNode[] = Array.from({ length: parts }).map((_, i) => ({
                        id: `${node.id}-part-${Date.now()}-${i}`,
                        label: `Parte ${i + 1} de ${node.label}`,
                        type: node.type === "area" ? "component" : (node.type === "component" ? "unit" : "skill"),
                        status: "not-started",
                        children: []
                    }));
                    return { ...node, children: [...(node.children || []), ...newChildren] };
                }
                if (node.children) {
                    return { ...node, children: splitRecursive(node.children) };
                }
                return node;
            });
        };

        setCurrentData(prev => splitRecursive(prev));
    };

    const handleRemoveNode = (nodeId: string) => {
        if (!editMode) return;

        const removeRecursive = (nodes: MosaicNode[]): MosaicNode[] => {
            return nodes.filter(node => node.id !== nodeId).map(node => {
                if (node.children) {
                    return { ...node, children: removeRecursive(node.children) };
                }
                return node;
            });
        };

        setCurrentData(prev => removeRecursive(prev));
        if (selectedNode?.id === nodeId) setSelectedNode(null);
    };

    const handleRenameNode = (nodeId: string, newLabel: string) => {
        if (!editMode) return;

        const renameRecursive = (nodes: MosaicNode[]): MosaicNode[] => {
            return nodes.map(node => {
                if (node.id === nodeId) {
                    return { ...node, label: newLabel };
                }
                if (node.children) {
                    return { ...node, children: renameRecursive(node.children) };
                }
                return node;
            });
        };

        setCurrentData(prev => renameRecursive(prev));

        // Update selected node locally if it's the one being renamed
        if (selectedNode?.id === nodeId) {
            setSelectedNode(prev => prev ? { ...prev, label: newLabel } : null);
        }
    };

    // ---------------------

    return (
        <div className="flex h-[calc(100vh-2rem)] bg-white rounded-2xl shadow-sm border overflow-hidden">
            {/* Left Sidebar (Detail Panel) */}
            <div className="w-[350px] flex-shrink-0 hidden lg:block border-r border-slate-200">
                <MosaicDetailPanel
                    node={selectedNode}
                    editMode={editMode}
                    onSplit={(parts) => selectedNode && handleSplitNode(selectedNode.id, parts)}
                    onRemove={() => selectedNode && handleRemoveNode(selectedNode.id)}
                    onRename={(newLabel) => selectedNode && handleRenameNode(selectedNode.id, newLabel)}
                />
            </div>

            {/* Main Content (Chart & Filters) */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="flex items-center justify-between px-8 py-6 border-b">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback>TA</AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="font-bold text-lg text-slate-800 leading-none">Turma A</h2>
                            <span className="text-xs text-slate-500">Fundamental</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex bg-slate-100 p-1 rounded-lg">
                            <button
                                onClick={() => setActiveTab("skills")}
                                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === "skills" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                            >
                                Habilidades
                            </button>
                            <button
                                onClick={() => setActiveTab("content")}
                                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === "content" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                            >
                                Conteúdos
                            </button>
                        </div>

                        <div className="w-px h-8 bg-slate-200 mx-2" />

                        <div className="flex items-center gap-2 mr-4">
                            <span className={`text-xs font-medium ${editMode ? 'text-primary' : 'text-slate-500'}`}>
                                Modo Professor
                            </span>
                            <Switch checked={editMode} onCheckedChange={setEditMode} />
                        </div>
                        <div className="text-[10px] text-slate-300 font-mono">v6.0 Watercolor Edition</div>

                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar..."
                                className="h-9 w-64 rounded-full border border-slate-200 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                    </div>
                </header>

                {/* Controls Bar */}
                <div className="px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b bg-slate-50/50">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            className="gap-2"
                            onClick={() => setEditMode(!editMode)}
                        >
                            <Edit3 className="w-4 h-4" />
                            {editMode ? 'Parar Edição' : 'Personalizar Fatias'}
                        </Button>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Período</label>
                            <Select defaultValue="todos">
                                <SelectTrigger className="w-[100px] h-8 text-xs">
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todos">Todos</SelectItem>
                                    <SelectItem value="1sem">1º Semestre</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Chart Area */}
                <div className="flex-1 overflow-auto bg-slate-50 flex items-center justify-center p-8">
                    <PracticesTree
                        data={currentData}
                        onSelectNode={setSelectedNode}
                        editMode={editMode}
                    />
                </div>
            </div>
        </div>
    );
}

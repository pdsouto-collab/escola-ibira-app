"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { MosaicNode, mockRecursiveDataSkills, mockRecursiveDataContent } from "@/lib/data";
import { MosaicSunburst } from "./mosaic-sunburst";
import { MonalMosaic } from "./monal-mosaic"; // Keeping for reference/fallback
// import { TreeMosaic } from "./tree-mosaic";
import { PracticesTree } from "./practices-tree";
import { MosaicGrid } from "./mosaic-grid";
import { MosaicDetailPanel } from "./mosaic-detail-panel";
import { Switch } from "../ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Bell, Edit3, Search } from "lucide-react";
import { Button } from "../ui/button";

export function MosaicContainer() {
    const { mosaicData, replaceMosaicData, updateMosaicNode, classes, projects } = useAppStore();
    const [selectedNode, setSelectedNode] = useState<MosaicNode | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [activeTab, setActiveTab] = useState<"skills" | "content">("skills");

    // Filter States
    const [selectedClassId, setSelectedClassId] = useState<string>("all");
    const [selectedProjectId, setSelectedProjectId] = useState<string>("all");

    // Local state for content (still local as it's not in store yet)
    const [contentData, setContentData] = useState(mockRecursiveDataContent);

    // Derived state for display
    const currentData = activeTab === "skills" ? mosaicData : contentData;

    // Filter projects based on selected class
    const availableProjects = selectedClassId === "all"
        ? projects
        : projects.filter(p => p.students?.some(sId => true) || true); // Simplified: In real app, check if project has students from class
    // Note: The mock project structure links students by ID. 
    // For prototype simplicity, we will assume all projects are visible, 
    // or strictly filter if we had class <-> student mapping readily available here without helper.
    // Let's just show all projects for now or filter if possible.

    // Better Project Filter: Active projects
    const filteredProjects = projects.filter(p => p.status === 'active');

    // unified setter that routes to store or local state
    const setCurrentData = (updater: (prev: MosaicNode[]) => MosaicNode[]) => {
        if (activeTab === "skills") {
            // wrapper to handle functional updates for store
            const newData = updater(mosaicData);
            replaceMosaicData(newData);
        } else {
            setContentData(updater);
        }
    };

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

        setCurrentData(splitRecursive);
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

        setCurrentData(removeRecursive);
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

        setCurrentData(renameRecursive);

        // Update selected node locally if it's the one being renamed
        if (selectedNode?.id === nodeId) {
            setSelectedNode(prev => prev ? { ...prev, label: newLabel } : null);
        }
    };

    // ---------------------

    const selectedClassName = classes.find(c => c.id === selectedClassId)?.name || "Todas as Turmas";

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
                    onStatusChange={(status) => {
                        if (selectedNode) {
                            updateMosaicNode(selectedNode.id, status);
                            // Update local selection to reflect change immediately
                            setSelectedNode(prev => prev ? { ...prev, status } : null);
                        }
                    }}
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
                            {/* Class Selector Replaces Static Text */}
                            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                                <SelectTrigger className="border-none shadow-none font-bold text-lg text-slate-800 p-0 h-auto hover:bg-transparent focus:ring-0">
                                    <SelectValue>{selectedClassName}</SelectValue>
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

                    <div className="flex items-center gap-4">
                        {/* Project Filter */}
                        <div className="w-48">
                            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                                <SelectTrigger className="h-9 text-xs bg-slate-50 border-slate-200">
                                    <SelectValue placeholder="Filtrar por Projeto" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos os Projetos</SelectItem>
                                    {filteredProjects.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-px h-8 bg-slate-200 mx-2" />

                        <div className="flex items-center gap-2 mr-4">
                            <span className={`text-xs font-medium ${editMode ? 'text-primary' : 'text-slate-500'}`}>
                                Modo Professor
                            </span>
                            <Switch checked={editMode} onCheckedChange={setEditMode} />
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
                    </div>
                </div>

                {/* Chart Area */}
                <div className="flex-1 overflow-auto bg-slate-50 flex items-start justify-center p-0">
                    <MosaicGrid
                        classId={selectedClassId === "all" ? undefined : selectedClassId}
                        projectId={selectedProjectId === "all" ? undefined : selectedProjectId}
                    />
                </div>
            </div>
        </div>
    );
}

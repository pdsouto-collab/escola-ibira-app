"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { KnowledgeNode, Project } from "@/lib/data";
import { RadialMatrix } from "./radial-matrix";
import { MosaicDetailPanel } from "./mosaic-detail-panel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";

export function MosaicContainer() {
    const { skillsTree, contentsTree, classes, projects } = useAppStore();

    // Core State
    const [activeTab, setActiveTab] = useState<"skill" | "content">("skill");

    // Navigational State for Drill Down
    const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
    const [drilledNode, setDrilledNode] = useState<KnowledgeNode | null>(null);

    // Filter States
    const [selectedClassId, setSelectedClassId] = useState<string>("all");
    const [selectedProjectId, setSelectedProjectId] = useState<string>("all");

    // Derived state for display
    const currentData = activeTab === "skill" ? skillsTree : contentsTree;

    // Filter projects based on selected class
    const availableProjects = selectedClassId === "all"
        ? projects
        : projects.filter(p => p.students?.some(sId => true) || true); // Simplified

    const filteredProjects = projects.filter(p => p.status === 'active');

    const selectedClassName = classes.find(c => c.id === selectedClassId)?.name || "Todas as Turmas";

    // Filtering logic for the tree itself based on class
    const filteredTreeData = currentData.filter(node =>
        selectedClassId === "all" || (node.classId || "all") === selectedClassId
    );

    // If drilled down, we only render the drilled node as the root.
    const dataToRender = drilledNode ? [drilledNode] : filteredTreeData;

    return (
        <div className="flex h-[calc(100vh-2rem)] bg-white rounded-2xl shadow-sm border overflow-hidden">
            {/* Left Sidebar (Detail Panel) */}
            <div className="w-[350px] flex-shrink-0 hidden lg:block border-r border-slate-200">
                <MosaicDetailPanel
                    node={selectedNode}
                    treeType={activeTab}
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
                    </div>
                </header>

                {/* Controls Bar */}
                <div className="px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b bg-slate-50/50">
                    <div className="flex items-center gap-2">
                        {drilledNode ? (
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={() => setDrilledNode(null)}
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Voltar para Visão Geral
                            </Button>
                        ) : (
                            <div className="text-sm text-slate-500 font-medium">
                                Selecione um Eixo para focar
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex bg-slate-100 p-1 rounded-lg">
                            <button
                                onClick={() => { setActiveTab("skill"); setDrilledNode(null); setSelectedNode(null); }}
                                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === "skill" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                            >
                                Habilidades
                            </button>
                            <button
                                onClick={() => { setActiveTab("content"); setDrilledNode(null); setSelectedNode(null); }}
                                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === "content" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                            >
                                Conteúdos
                            </button>
                        </div>
                    </div>
                </div>

                {/* Chart Area */}
                <div className="flex-1 overflow-auto bg-slate-50 flex items-center justify-center p-0">
                    <RadialMatrix
                        data={dataToRender}
                        treeType={activeTab}
                        drilledNodeId={drilledNode?.id}
                        onNodeDoubleClick={(node: KnowledgeNode) => {
                            // Only allow drill down on Macro levels (e.g., Eixo/Área)
                            if (node && node.level === "macro") {
                                setDrilledNode(node);
                                setSelectedNode(null); // Clear selection on drill down
                            } else if (!node) {
                                setDrilledNode(null);
                            }
                        }}
                        onNodeClick={(node: KnowledgeNode) => {
                            setSelectedNode(node);
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

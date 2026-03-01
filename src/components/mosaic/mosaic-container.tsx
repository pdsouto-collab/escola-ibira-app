"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { KnowledgeNode } from "@/lib/data";
import { RadialMatrix } from "./radial-matrix";
import { MosaicDetailPanel } from "./mosaic-detail-panel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";
import { AssessmentDrawer } from "../assessment/assessment-drawer";
import { Assessment } from "@/lib/data";

export function MosaicContainer() {
    const { skillsTree, contentsTree, classes, projects, students, currentUser, assessments, libraryItems } = useAppStore();

    // Core State
    const [activeTab, setActiveTab] = useState<"skill" | "content">("skill");

    // Navigational State for Drill Down
    const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
    const [drilledNode, setDrilledNode] = useState<KnowledgeNode | null>(null);

    // Filter States
    const [selectedClassId, setSelectedClassId] = useState<string>("all");
    const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
    const [selectedStudentId, setSelectedStudentId] = useState<string>("all");

    // Assessment Drawer State
    const [drawerCtx, setDrawerCtx] = useState<Partial<Assessment> & { contextLabel: string } | null>(null);

    // Derived state for display
    const currentData = activeTab === "skill" ? skillsTree : contentsTree;

    // Active projects only
    const filteredProjects = projects.filter(p => p.status === 'active');

    // Students filtered by selected class
    const filteredStudents = selectedClassId === "all"
        ? students
        : students.filter(s => s.classId === selectedClassId);

    // Filtering logic for the tree itself based on class
    const filteredTreeData = currentData.filter(node =>
        selectedClassId === "all" || (node.classId || "all") === selectedClassId
    );

    // If drilled down, we only render the drilled node as the root.
    const dataToRender = drilledNode ? [drilledNode] : filteredTreeData;

    const handleAvaliacao = (node: KnowledgeNode) => {
        setDrawerCtx({
            knowledgeNodeId: node.id,
            projectId: selectedProjectId !== "all" ? selectedProjectId : undefined,
            classId: selectedClassId !== "all" ? selectedClassId : undefined,
            studentId: selectedStudentId !== "all" ? selectedStudentId : undefined,
            scope: selectedStudentId !== "all" ? "student" : "class",
            contextLabel: node.name,
            contextDescription: node.description
        } as any);
    };

    const selectTriggerClass = "h-9 text-xs bg-white border-slate-200 min-w-[160px]";

    return (
        <div className="flex h-[calc(100vh-2rem)] bg-white rounded-2xl shadow-sm border overflow-hidden">
            {/* Left Sidebar (Detail Panel) */}
            <div className="w-[350px] flex-shrink-0 hidden lg:block border-r border-slate-200">
                <MosaicDetailPanel
                    node={selectedNode}
                    treeType={activeTab}
                    onAvaliacao={handleAvaliacao}
                />
            </div>

            {/* Main Content (Chart & Filters) */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header (re-using current logic) */}
                <header className="flex items-center gap-3 px-6 py-4 border-b">
                    {/* Filter: Turma */}
                    <Select
                        value={selectedClassId}
                        onValueChange={(v) => {
                            setSelectedClassId(v);
                            setSelectedStudentId("all");
                        }}
                    >
                        <SelectTrigger className={selectTriggerClass}>
                            <SelectValue placeholder="Todas as Turmas" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas as Turmas</SelectItem>
                            {classes.map(c => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Filter: Projeto */}
                    <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                        <SelectTrigger className={selectTriggerClass}>
                            <SelectValue placeholder="Todos os Projetos" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os Projetos</SelectItem>
                            {filteredProjects.map(p => (
                                <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Filter: Aluno */}
                    <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                        <SelectTrigger className={selectTriggerClass}>
                            <SelectValue placeholder="Todos os Alunos" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os Alunos</SelectItem>
                            {filteredStudents.map(s => (
                                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Habilidades / Conteúdos Toggle */}
                    <div className="flex bg-slate-100 p-1 rounded-lg flex-shrink-0">
                        <button
                            onClick={() => { setActiveTab("skill"); setDrilledNode(null); setSelectedNode(null); }}
                            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === "skill" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                        >
                            BNCC
                        </button>
                        <button
                            onClick={() => { setActiveTab("content"); setDrilledNode(null); setSelectedNode(null); }}
                            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === "content" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                        >
                            Gerais
                        </button>
                    </div>

                    {/* RIGHT: Avatar (teacher) */}
                    <div className="ml-auto flex-shrink-0">
                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                            <AvatarImage src={currentUser?.avatar || "https://github.com/shadcn.png"} />
                            <AvatarFallback>
                                {currentUser?.name?.charAt(0) ?? "U"}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </header>

                {/* Drill-down back button (only when drilled in) */}
                {drilledNode && (
                    <div className="px-6 py-2 border-b bg-slate-50/50">
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => setDrilledNode(null)}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Voltar para Visão Geral
                        </Button>
                    </div>
                )}

                {/* Chart Area */}
                <div className="flex-1 overflow-auto bg-slate-50 flex flex-col items-center p-0">
                    <div className="w-full bg-white border-b py-2 px-6 flex justify-center">
                        {activeTab === "skill" ? (
                            <div className="text-blue-700 font-bold tracking-widest uppercase text-[10px] opacity-80">
                                VISÃO ACADÊMICA / CURRICULAR (habilidades bncc)
                            </div>
                        ) : (
                            <div className="text-indigo-700 font-bold tracking-widest uppercase text-[10px] opacity-80">
                                VISÃO COMPORTAMENTAL / COGNITIVA (competências gerais)
                            </div>
                        )}
                    </div>
                    <div className="flex-1 w-full flex items-center justify-center p-0">
                        <RadialMatrix
                            data={dataToRender}
                            treeType={activeTab}
                            assessments={assessments}
                            projects={projects}
                            libraryItems={libraryItems}
                            selectedStudentId={selectedStudentId}
                            selectedClassId={selectedClassId}
                            selectedProjectId={selectedProjectId}
                            drilledNodeId={drilledNode?.id}
                            onNodeDoubleClick={(node: KnowledgeNode) => {
                                if (node && node.level === "macro") {
                                    setDrilledNode(node);
                                    setSelectedNode(null);
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

            {/* Assessment Drawer */}
            {drawerCtx && (
                <AssessmentDrawer
                    open={!!drawerCtx}
                    onOpenChange={(open) => !open && setDrawerCtx(null)}
                    knowledgeNodeId={drawerCtx.knowledgeNodeId}
                    projectId={drawerCtx.projectId}
                    defaultClassId={drawerCtx.classId}
                    defaultStudentId={drawerCtx.studentId}
                    contextLabel={drawerCtx.contextLabel}
                    contextDescription={(drawerCtx as any).contextDescription}
                />
            )}
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { KnowledgeNode, SEMESTERS, YEARS } from "@/lib/data";
import { RadialMatrix } from "./radial-matrix";
import { MosaicDetailPanel } from "./mosaic-detail-panel";
import { getClasses } from "@/services/school-class.service";
import { SchoolClass } from "@/types/school-class";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";
import { AssessmentDrawer } from "../assessment/assessment-drawer";
import { Assessment } from "@/lib/data";
import { useSession } from "next-auth/react";
import { LibraryItem } from "@/types/library-item";
import { getListBncc } from "@/services/bncc.service";
import { Student } from "@/types/student";
import { getStudents } from "@/services/student.service";
import { getProjects } from "@/services/project.service";
import { Project } from "@/types/project";


export function MosaicContainer() {
    const { skillsTree, contentsTree, assessments } = useAppStore();
    const { data: session } = useSession();
    const currentUser = session?.user as any;

    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [isLoadingClasses, setIsLoadingClasses] = useState(true);
    const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
    const [loading, setLoading] = useState(false)
    const [projects, setProjects] = useState<Project[]>([]);

    // Core State
    const [activeTab, setActiveTab] = useState<"skill" | "content">("skill");

    // Navigational State for Drill Down
    const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
    const [drilledNode, setDrilledNode] = useState<KnowledgeNode | null>(null);

    // Filter States
    const [selectedClassId, setSelectedClassId] = useState<string>("all");
    const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
    const [selectedStudentId, setSelectedStudentId] = useState<string>("all");
    const [selectedPeriod, setSelectedPeriod] = useState<string>("all");

    // Assessment Drawer State
    const [drawerCtx, setDrawerCtx] = useState<Partial<Assessment> & { contextLabel: string } | null>(null);

    // Derived state for display
    const currentData = activeTab === "skill" ? skillsTree : contentsTree;

    // Active projects only
    const filteredProjects = projects.filter(p => p.status === 'active');

    const [students, setStudents] = useState<Student[]>([]);
    const [isLoadingStudents, setIsLoadingStudents] = useState(true);

    // Filter Students
    const filteredStudents = selectedClassId === "all"
        ? students
        : students.filter(s => s.classId === selectedClassId);

    // Filtering logic for the tree itself based on class
    // We prioritize the student's class if a specific student is selected
    const filteredTreeData = currentData.filter(node => {
        let activeClassId = selectedClassId;

        if (selectedStudentId !== "all") {
            const student = students.find(s => s.id === selectedStudentId);
            if (student) {
                activeClassId = student.classId;
            }
        }

        const periodMatch = selectedPeriod === "all" || node.period === selectedPeriod;
        return (activeClassId === "all" || (node.classId || "all") === activeClassId) && periodMatch;
    });

    // If drilled down, we only render the drilled node as the root.
    const dataToRender = drilledNode ? [drilledNode] : filteredTreeData;

    async function fetchStudents() {
        setIsLoadingStudents(true);
        try {
            const data = await getStudents();
            setStudents(data);
        } catch (error) {
            console.error("Erro ao carregar alunos", error);
        } finally {
            setIsLoadingStudents(false);
        }
    }

    async function fetchClasses() {
        setIsLoadingClasses(true);
        try {
            const data = await getClasses();
            setClasses(data);
        } catch (error) {
            console.error("Erro ao carregar turmas", error);
        } finally {
            setIsLoadingClasses(false);
        }
    }

    useEffect(() => {
        const loadData = async () => {
            const [, , , projectsData] = await Promise.all([
                fetchClasses(), 
                fetchStudents(), 
                getListaBNCC(),
                getProjects()
            ]);
            if (projectsData) {
                setProjects(projectsData);
            }
        };
        loadData();
    }, []);

    async function getListaBNCC() {
        setLoading(true);
        await getListBncc().then(setLibraryItems);
        setLoading(false);
    }

    const handleAvaliacao = (node: KnowledgeNode) => {
        let resolvedClassId = selectedClassId !== "all" ? selectedClassId : undefined;

        if (selectedStudentId !== "all") {
            const student = students.find(s => s.id === selectedStudentId);
            if (student) resolvedClassId = student.classId;
        }

        setDrawerCtx({
            knowledgeNodeId: node.id,
            projectId: selectedProjectId !== "all" ? selectedProjectId : undefined,
            classId: resolvedClassId,
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
                            setDrilledNode(null);
                            setSelectedNode(null);
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
                    <Select
                        value={selectedStudentId}
                        onValueChange={(v) => {
                            setSelectedStudentId(v);
                            setDrilledNode(null);
                            setSelectedNode(null);
                            // Sincroniza a turma se um aluno for selecionado
                            if (v !== "all") {
                                const student = students.find(s => s.id === v);
                                if (student && student.classId) {
                                    setSelectedClassId(student.classId);
                                }
                            }
                        }}
                    >
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

                    {/* Filter: Período */}
                    <div className="flex gap-2">
                        <Select value={selectedPeriod === "all" ? "all" : selectedPeriod.split(" / ")[0]} onValueChange={(val) => {
                            if (val === "all") setSelectedPeriod("all");
                            else setSelectedPeriod(`${val} / ${selectedPeriod === "all" ? new Date().getFullYear() : selectedPeriod.split(" / ")[1] || new Date().getFullYear()}`);
                        }}>
                            <SelectTrigger className="h-9 text-xs bg-white border-slate-200 w-32">
                                <SelectValue placeholder="Semestre" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todo Semestre</SelectItem>
                                {SEMESTERS.map(sem => (
                                    <SelectItem key={sem} value={sem}>{sem}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={selectedPeriod === "all" ? "all" : selectedPeriod.split(" / ")[1]} onValueChange={(val) => {
                            if (val === "all") setSelectedPeriod("all");
                            else setSelectedPeriod(`${selectedPeriod === "all" ? "1º Semestre" : selectedPeriod.split(" / ")[0] || "1º Semestre"} / ${val}`);
                        }}>
                            <SelectTrigger className="h-9 text-xs bg-white border-slate-200 w-28">
                                <SelectValue placeholder="Ano" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todo Ano</SelectItem>
                                {YEARS.map(y => (
                                    <SelectItem key={y} value={y}>{y}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Habilidades / Conteúdos Toggle */}
                    <div className="flex flex-col gap-1 items-end ml-auto">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mr-1">Trilhas Base</span>
                        <div className="flex bg-slate-100 p-1 rounded-lg flex-shrink-0">
                            <button
                                onClick={() => { setActiveTab("skill"); setDrilledNode(null); setSelectedNode(null); }}
                                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === "skill" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                            >
                                Habilidades (BNCC / IBIRÁ)
                            </button>
                            <button
                                onClick={() => { setActiveTab("content"); setDrilledNode(null); setSelectedNode(null); }}
                                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === "content" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                            >
                                Competências (BNCC / IBIRÁ)
                            </button>
                        </div>
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
                <div className="flex-1 overflow-hidden bg-slate-50 flex flex-col items-center p-0">
                    <div className="w-full bg-white border-b py-2 px-6 flex justify-center">
                        {activeTab === "skill" ? (
                            <div className="text-blue-700 font-bold tracking-widest uppercase text-[10px] opacity-80">
                                VISÃO ACADÊMICA / CURRICULAR (habilidades bncc / ibirá)
                            </div>
                        ) : (
                            <div className="text-indigo-700 font-bold tracking-widest uppercase text-[10px] opacity-80">
                                VISÃO COMPORTAMENTAL / COGNITIVA (competências bncc / ibirá)
                            </div>
                        )}
                    </div>
                    <div className="flex-1 w-full min-h-0 flex items-center justify-center p-0">
                        <RadialMatrix
                            data={dataToRender}
                            treeType={activeTab}
                            assessments={assessments}
                            projects={projects}
                            libraryItems={libraryItems}
                            students={students}
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
                students={students}
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

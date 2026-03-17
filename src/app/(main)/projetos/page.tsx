"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Filter, MoreVertical, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2 } from "lucide-react";
import Image from "next/image";

export default function ProjectsPage() {
    const { projects, removeProject, classes } = useAppStore();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedClassId, setSelectedClassId] = useState<string>("all");
    const [activeTab, setActiveTab] = useState("active"); // default to Ongoing

    const handleDelete = (id: string, title: string) => {
        if (confirm(`Tem certeza que deseja excluir o projeto "${title}"?`)) {
            removeProject(id);
        }
    };

    // Filter projects based on search query, class and active tab
    const filteredProjects = projects.filter(project => {
        const matchesTab = project.status === activeTab;

        // Class filter
        const matchesClass = selectedClassId === "all" || (project.classes && project.classes.includes(selectedClassId));

        const query = searchQuery.toLowerCase();
        const matchesSearch = !query ||
            project.title.toLowerCase().includes(query) ||
            (project.description && project.description.toLowerCase().includes(query)) ||
            (project.tags && project.tags.some(t => t.toLowerCase().includes(query))) ||
            (project.guidingQuestion && project.guidingQuestion.toLowerCase().includes(query));

        return matchesTab && matchesSearch && matchesClass;
    });

    // Helper to get a nicely formatted string for the classes involved
    const getClassNames = (classIds?: string[]) => {
        if (!classIds || classIds.length === 0) return "Geral";
        return classIds.map(id => classes.find(c => c.id === id)?.name || id).join(", ");
    };

    return (
        <div className="max-w-7xl mx-auto pb-12">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Projetos</h1>
                    <p className="text-slate-500 mt-1">Desenvolva e acompanhe as trilhas de aprendizado.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Buscar projetos..."
                            className="pl-9 bg-white border-slate-200"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                            <SelectTrigger className="w-[180px] bg-white border-slate-200">
                                <div className="flex items-center gap-2">
                                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                                    <SelectValue placeholder="Todas as Turmas" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas as Turmas</SelectItem>
                                {classes.map(c => (
                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Link href="/projetos/novo">
                        <Button className="gap-2 rounded-lg px-6 shadow-sm hover:shadow-md transition-all">
                            <Plus className="w-4 h-4" />
                            Novo Projeto
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Main Content Area with Tabs */}
            <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-0">
                    <TabsList className="bg-transparent h-auto p-0 gap-6">
                        <TabsTrigger
                            value="active"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3 text-base font-medium text-slate-500 data-[state=active]:text-primary transition-all"
                        >
                            Em Andamento
                        </TabsTrigger>
                        <TabsTrigger
                            value="draft"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3 text-base font-medium text-slate-500 data-[state=active]:text-primary transition-all"
                        >
                            Rascunhos
                        </TabsTrigger>
                        <TabsTrigger
                            value="completed"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3 text-base font-medium text-slate-500 data-[state=active]:text-primary transition-all"
                        >
                            Concluídos
                        </TabsTrigger>
                    </TabsList>
                </div>

                {['active', 'draft', 'completed'].map((tabValue) => (
                    <TabsContent key={tabValue} value={tabValue} className="mt-0 outline-none">
                        {filteredProjects.length === 0 ? (
                            <div className="text-center py-20 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                                <p className="text-slate-500 font-medium">Nenhum projeto encontrado nesta categoria.</p>
                                <Button
                                    variant="link"
                                    onClick={() => {
                                        setSearchQuery("");
                                        setSelectedClassId("all");
                                    }}
                                    className="mt-2 text-primary"
                                >
                                    Limpar filtros
                                </Button>
                            </div>
                        ) : tabValue === 'active' && !searchQuery && selectedClassId === 'all' ? (
                            /* GROUPED VIEW FOR ACTIVE TAB (ONLY WHEN NO FILTERS) */
                            <div className="space-y-12">
                                {/* Geral Group */}
                                {filteredProjects.filter(p => !p.classes || p.classes.length === 0).length > 0 && (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <h2 className="text-lg font-bold text-slate-700 uppercase tracking-wider">Geral / Multiturma</h2>
                                            <div className="h-px bg-slate-200 flex-1" />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {filteredProjects.filter(p => !p.classes || p.classes.length === 0).map((project) => (
                                                <ProjectCard
                                                    key={project.id}
                                                    project={project}
                                                    classNames={getClassNames(project.classes)}
                                                    onDelete={() => handleDelete(project.id, project.title)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Per Class Groups */}
                                {classes.map(cls => {
                                    const classProjects = filteredProjects.filter(p => p.classes?.includes(cls.id));
                                    if (classProjects.length === 0) return null;

                                    return (
                                        <div key={cls.id} className="space-y-6">
                                            <div className="flex items-center gap-4">
                                                <h2 className="text-lg font-bold text-slate-700 uppercase tracking-wider">{cls.name}</h2>
                                                <div className="h-px bg-slate-200 flex-1" />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {classProjects.map((project) => (
                                                    <ProjectCard
                                                        key={project.id}
                                                        project={project}
                                                        classNames={getClassNames(project.classes)}
                                                        onDelete={() => handleDelete(project.id, project.title)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Add New Placeholder Card */}
                                <div className="pt-4">
                                    <Link href="/projetos/novo" className="contents">
                                        <div className="border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 text-slate-400 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all cursor-pointer min-h-[160px] max-w-sm">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2 group-hover:bg-primary/10">
                                                <Plus className="w-5 h-5" />
                                            </div>
                                            <span className="font-semibold">Criar novo projeto</span>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            /* NORMAL GRID VIEW FOR OTHERS OR WHEN FILTERED */
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredProjects.map((project) => (
                                    <ProjectCard
                                        key={project.id}
                                        project={project}
                                        classNames={getClassNames(project.classes)}
                                        onDelete={() => handleDelete(project.id, project.title)}
                                    />
                                ))}

                                {/* Add New Placeholder Card (Only shown in Drafts or Ongoing) */}
                                {(tabValue === 'draft' || tabValue === 'active') && !searchQuery && selectedClassId === 'all' && (
                                    <Link href="/projetos/novo" className="contents">
                                        <div className="border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 text-slate-400 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all cursor-pointer min-h-[380px]">
                                            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4 group-hover:bg-primary/10">
                                                <Plus className="w-6 h-6" />
                                            </div>
                                            <span className="font-semibold text-lg">Criar novo projeto</span>
                                            <span className="text-sm mt-1 opacity-70">Comece uma nova trilha</span>
                                        </div>
                                    </Link>
                                )}
                            </div>
                        )}
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}

// Sub-component for the highly visual Project Card
function ProjectCard({
    project,
    classNames,
    onDelete
}: {
    project: any;
    classNames: string;
    onDelete: () => void;
}) {
    // Generate a default color for the banner top bar
    const colorClasses = [
        "bg-indigo-600", "bg-emerald-600", "bg-sky-600", "bg-amber-600", "bg-rose-600", "bg-violet-600"
    ];
    // Simple hash to consistently pick a color based on project ID
    const colorIdx = project.id ? project.id.charCodeAt(0) % colorClasses.length : 0;
    const bannerColor = colorClasses[colorIdx];

    return (
        <Card className="hover:shadow-lg transition-all duration-300 group border-slate-200 relative flex flex-col h-full rounded-2xl overflow-hidden bg-white">

            {/* Top Colored Banner with Grade and Title */}
            <div className={cn("p-5 flex flex-col justify-end min-h-[140px] relative", bannerColor)}>
                <div className="absolute top-3 right-3 z-10 text-white">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20">
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 border-slate-200">
                            <Link href={`/projetos/novo?edit=${project.id}`}>
                                <DropdownMenuItem className="cursor-pointer">
                                    <Edit className="w-4 h-4 mr-2" />
                                    Editar
                                </DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem
                                className="cursor-pointer text-red-600 focus:text-red-none focus:bg-red-50"
                                onClick={onDelete}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <Badge variant="outline" className="w-fit text-xs font-bold uppercase tracking-widest text-white border-white/30 bg-black/10 mb-2">
                    {classNames}
                </Badge>

                <h3 className="text-2xl font-bold text-white leading-tight line-clamp-2">
                    {project.title}
                </h3>
            </div>

            {/* Optional Banner Image directly below or just structural split */}
            {project.imageUrl && (
                <div className="h-32 w-full relative">
                    <Image src={project.imageUrl} alt={project.title} fill className="object-cover" priority />
                </div>
            )}

            <CardContent className="pt-6 pb-6 flex-1 flex flex-col gap-5">

                <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-5">
                    <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                            Tipo
                        </span>
                        <span className="text-sm font-semibold text-slate-800">
                            {project.type || "Projeto"}
                        </span>
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                            Produto Final
                        </span>
                        {project.finalProduct && project.finalProduct !== "None" ? (
                            <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 font-medium">
                                {project.finalProduct}
                            </Badge>
                        ) : (
                            <span className="text-sm text-slate-500 italic">Não definido</span>
                        )}
                    </div>
                </div>

                {/* Guiding Question */}
                <div className="mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                        Pergunta Norteadora
                    </span>
                    <p className="text-sm text-slate-700 font-medium italic leading-relaxed">
                        {project.guidingQuestion ? `"${project.guidingQuestion}"` : "Nenhuma pergunta norteadora definida."}
                    </p>
                </div>

                <div className="mt-auto pt-4 flex items-center justify-end">
                    <Link href={`/projetos/novo?edit=${project.id}`} className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-wider flex items-center gap-1">
                        Detalhes <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}

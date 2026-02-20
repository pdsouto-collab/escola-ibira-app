"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Filter, MoreVertical } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Edit, Trash2 } from "lucide-react";
import Image from "next/image";

export default function ProjectsPage() {
    const { projects, removeProject, classes } = useAppStore();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("active"); // default to Ongoing

    const handleDelete = (id: string, title: string) => {
        if (confirm(`Tem certeza que deseja excluir o projeto "${title}"?`)) {
            removeProject(id);
        }
    };

    // Filter projects based on search query and active tab
    const filteredProjects = projects.filter(project => {
        const matchesTab = project.status === activeTab;
        const query = searchQuery.toLowerCase();
        const matchesSearch = project.title.toLowerCase().includes(query) ||
            project.description.toLowerCase().includes(query) ||
            project.tags.some(t => t.toLowerCase().includes(query));

        return matchesTab && matchesSearch;
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
                    <Button variant="outline" className="gap-2 bg-white hidden sm:flex">
                        <Filter className="w-4 h-4" />
                        Filtros
                    </Button>
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
                            value="planning"
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

                {['active', 'planning', 'completed'].map((tabValue) => (
                    <TabsContent key={tabValue} value={tabValue} className="mt-0 outline-none">
                        {filteredProjects.length === 0 ? (
                            <div className="text-center py-20 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                                <p className="text-slate-500 font-medium">Nenhum projeto encontrado nesta categoria.</p>
                                <Button
                                    variant="link"
                                    onClick={() => setSearchQuery("")}
                                    className="mt-2 text-primary"
                                >
                                    Limpar busca
                                </Button>
                            </div>
                        ) : (
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
                                {(tabValue === 'planning' || tabValue === 'active') && !searchQuery && (
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
    // Determine the banner image or a fallback gradient
    const bannerStyle = project.imageUrl
        ? { backgroundImage: `url(${project.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : { background: 'linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%)' };

    return (
        <Card className="hover:shadow-lg transition-all duration-300 group border-slate-200 relative overflow-hidden flex flex-col h-full rounded-2xl">

            {/* Banner Image Area */}
            <div className="h-40 w-full relative" style={bannerStyle}>
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />

                <div className="absolute top-3 right-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="icon" className="h-8 w-8 bg-white/80 backdrop-blur-sm hover:bg-white text-slate-700 shadow-sm transition-opacity">
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
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
            </div>

            <CardContent className="pt-5 pb-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {classNames}
                    </span>
                    <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-slate-200">
                        PROJETO
                    </Badge>
                </div>

                <Link href={`/projetos/novo?edit=${project.id}`} className="block mb-4 flex-1">
                    <CardTitle className="text-xl font-bold text-slate-800 leading-snug mb-3 hover:text-primary transition-colors">
                        {project.title}
                    </CardTitle>

                    {/* Guiding Question Section - Visual Highlight */}
                    {project.guidingQuestion && (
                        <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 mb-4">
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-1">
                                Pergunta Norteadora
                            </span>
                            <p className="text-sm text-slate-700 font-medium italic">
                                "{project.guidingQuestion}"
                            </p>
                        </div>
                    )}

                    <p className="text-sm text-slate-500 line-clamp-2">
                        {project.description}
                    </p>
                </Link>

                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex flex-wrap gap-1.5">
                        {project.tags.slice(0, 2).map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="bg-slate-100 text-slate-600 font-normal hover:bg-slate-200">
                                {tag}
                            </Badge>
                        ))}
                        {project.tags.length > 2 && (
                            <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-normal hover:bg-slate-200">
                                +{project.tags.length - 2}
                            </Badge>
                        )}
                    </div>

                    <Link href={`/projetos/novo?edit=${project.id}`} className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors whitespace-nowrap ml-2">
                        Detalhes &gt;
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}

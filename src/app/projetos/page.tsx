"use client";


import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Folder, Calendar, MoreVertical } from "lucide-react";
import Link from "next/link";

const mockProjects = [
    {
        id: 1,
        title: "Explorando os Sentidos",
        description: "Projeto interdisciplinar para explorar os cinco sentidos através de atividades práticas e artísticas.",
        tags: ["Ciências", "Artes"],
        date: "12/02/2026",
        status: "Em andamento"
    },
    {
        id: 2,
        title: "Minha Comunidade",
        description: "Investigação sobre o bairro e a comunidade escolar, focando em história e geografia local.",
        tags: ["Geografia", "História"],
        date: "10/02/2026",
        status: "Planejamento"
    },
    {
        id: 3,
        title: "Matemática na Cozinha",
        description: "Aprendendo unidades de medida e quantidades através de receitas simples.",
        tags: ["Matemática", "Vida Prática"],
        date: "05/02/2026",
        status: "Concluído"
    }
];

export default function ProjectsPage() {
    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Banco de Projetos</h1>
                    <p className="text-slate-500 mt-1">Gerencie seus projetos pedagógicos e crie novas propostas.</p>
                </div>
                <Link href="/projetos/novo">
                    <Button className="gap-2 rounded-full px-6 shadow-sm hover:shadow-md transition-all">
                        <Plus className="w-4 h-4" />
                        Novo Projeto
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm border">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                    <Input
                        placeholder="Buscar projetos..."
                        className="pl-10 bg-slate-50 border-slate-200"
                    />
                </div>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockProjects.map((project) => (
                    <Card key={project.id} className="hover:shadow-md transition-shadow group cursor-pointer border-slate-200">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary mb-2">
                                    <Folder className="w-6 h-6" />
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreVertical className="w-4 h-4" />
                                </Button>
                            </div>
                            <CardTitle className="text-lg font-bold text-slate-900 leading-tight">
                                {project.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pb-4">
                            <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                                {project.description}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {project.tags.map(tag => (
                                    <Badge key={tag} variant="secondary" className="bg-slate-100 text-slate-600 font-normal">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter className="pt-0 text-xs text-slate-400 flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            Atualizado em {project.date}
                        </CardFooter>
                    </Card>
                ))}

                {/* Create New Placeholder Card */}
                <Link href="/projetos/novo" className="contents">
                    <div className="border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-6 text-slate-400 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all cursor-pointer min-h-[250px]">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4 group-hover:bg-primary/10">
                            <Plus className="w-6 h-6" />
                        </div>
                        <span className="font-medium">Criar novo projeto</span>
                    </div>
                </Link>
            </div>
        </div>

    );
}

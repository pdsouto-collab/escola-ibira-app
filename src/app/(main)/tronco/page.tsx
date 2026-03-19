"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { TreeDeciduous, Info, Filter, Loader2 } from "lucide-react";
import { TroncoNewPost } from "@/components/tronco/tronco-new-post";
import { TroncoFeed } from "@/components/tronco/tronco-feed";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSession } from "next-auth/react";
import { getClasses } from "@/services/school-class.service";
import { SchoolClass } from "@/types/school-class";


export default function TroncoPage() {
    const { classBoardPosts } = useAppStore();
    const { data: session } = useSession();
    const currentUser = session?.user as any;

    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedClassId, setSelectedClassId] = useState<string>("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");

    async function fetchClasses() {
        try {
            const data = await getClasses();
            setClasses(data);
            if (data.length > 0) {
                setSelectedClassId(data[0].id);
            }
        } catch (error) {
            console.error("Erro ao buscar turmas:", error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchClasses();
    }, []);

    const isTeacherOrAdmin = currentUser?.role === "teacher" || currentUser?.role === "director" || currentUser?.role === "admin";
    
    // Extract unique categories dynamically from existing posts
    const availableCategories = Array.from(new Set(classBoardPosts.map(p => p.categoryType)));

    return (
        <div className="flex flex-col h-full bg-slate-50/50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-6 py-8">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 rounded-xl">
                                <TreeDeciduous className="h-6 w-6 text-emerald-600" />
                            </div>
                            Tronco de Recados
                        </h1>
                        <p className="text-slate-500 mt-2 max-w-2xl">
                            O espaço exclusivo da sua turma focado em comunicação e atualizações do dia a dia.
                        </p>
                    </div>
                </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 overflow-y-auto px-6 py-8">
                <div className="max-w-2xl mx-auto">
                    {/* Welcome/Info for Parents */}
                    {!isTeacherOrAdmin && (
                        <div className="mb-6 p-4 border border-emerald-100 bg-emerald-50 text-emerald-900 rounded-xl flex gap-3">
                            <Info className="h-5 w-5 text-emerald-600 shrink-0" />
                            <div>
                                <h4 className="font-bold text-sm">Bem-vindo ao Tronco de Recados!</h4>
                                <p className="text-sm opacity-90 mt-1">
                                    Aqui você vê todas as novidades exclusivas da sua turma. Interaja curtindo os avisos ou deixando um comentário.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Unified Filters Row */}
                    {isLoading ? (
                        <div className="flex items-center justify-center p-8 bg-white border rounded-xl shadow-sm mb-8">
                            <Loader2 className="w-5 h-5 text-slate-400 animate-spin mr-2" />
                            <span className="text-slate-500 text-sm">Carregando turmas...</span>
                        </div>
                    ) : (
                        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-slate-200 rounded-xl p-3 shadow-sm gap-3">
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-slate-400" />
                                <span className="text-sm font-medium text-slate-700">Filtros:</span>
                            </div>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 sm:justify-end">
                                <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                                    <SelectTrigger className="w-full sm:w-[180px] h-9 text-xs font-medium text-slate-700 bg-slate-50 border-transparent hover:border-slate-200 focus:bg-white transition-colors">
                                        <SelectValue placeholder="Selecione a turma..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classes.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger className="w-full sm:w-[180px] h-9 text-xs font-medium text-slate-700 bg-slate-50 border-transparent hover:border-slate-200 focus:bg-white transition-colors">
                                        <SelectValue placeholder="Todas as categorias" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas as categorias</SelectItem>
                                        {availableCategories.map(cat => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    {/* New Post Creator (Teachers/Admins only) */}
                    {isTeacherOrAdmin && <TroncoNewPost selectedClassId={selectedClassId} />}

                    {/* Feed */}
                    <TroncoFeed classId={selectedClassId} categoryFilter={selectedCategory === "all" ? undefined : selectedCategory} />
                </div>
            </main>
        </div>
    );
}

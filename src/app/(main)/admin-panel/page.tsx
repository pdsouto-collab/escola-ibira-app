"use client";

import { useAppStore } from "@/lib/store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KnowledgeTreeEditor } from "@/components/admin/knowledge-tree-editor";
import { FinalProductsEditor } from "@/components/admin/final-products-editor";
import { BookOpen, Layers, PackagePlus } from "lucide-react";

export default function AdminPanelPage() {
    return (
        <div className="flex-1 p-8 overflow-auto">
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Painel Administrativo</h1>
                        <p className="text-slate-500 mt-2">
                            Gerencie a curadoria das Árvores de Conhecimento e configure as trilhas de aprendizagem.
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <Tabs defaultValue="skills" className="w-full">
                        <div className="border-b px-6 py-4 bg-slate-50/50 flex justify-between items-center">
                            <TabsList className="bg-slate-200/50 p-1">
                                <TabsTrigger value="skills" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 py-2 flex items-center gap-2 transition-all">
                                    <BookOpen className="w-4 h-4" />
                                    Árvore de Habilidades
                                </TabsTrigger>
                                <TabsTrigger value="contents" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 py-2 flex items-center gap-2 transition-all">
                                    <Layers className="w-4 h-4" />
                                    Árvore de Conteúdos
                                </TabsTrigger>
                                <TabsTrigger value="products" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 py-2 flex items-center gap-2 transition-all">
                                    <PackagePlus className="w-4 h-4" />
                                    Produtos Finais
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="p-6">
                            <TabsContent value="skills" className="m-0 border-none outline-none focus-visible:ring-0">
                                <KnowledgeTreeEditor treeType="skill" />
                            </TabsContent>

                            <TabsContent value="contents" className="m-0 border-none outline-none focus-visible:ring-0">
                                <KnowledgeTreeEditor treeType="content" />
                            </TabsContent>

                            <TabsContent value="products" className="m-0 border-none outline-none focus-visible:ring-0">
                                <FinalProductsEditor />
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}

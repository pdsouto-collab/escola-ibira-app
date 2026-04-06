"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KnowledgeTreeEditor } from "@/components/admin/knowledge-tree-editor";
import { FinalProductsEditor } from "@/components/admin/final-products-editor";
import { BibliotecaEditor } from "@/components/admin/biblioteca-editor";
import { BookOpen, Layers, PackagePlus, Library } from "lucide-react";

export default function AdminPanelPage() {
    return (
        <div className="flex-1 p-8 overflow-auto">
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Painel Administrativo</h1>
                        <p className="text-slate-500 mt-2">
                            Gerencie a curadoria das Estruturas Pedagógicas e configure as trilhas de aprendizagem.
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <Tabs defaultValue="biblioteca" className="w-full">
                        <div className="border-b px-6 py-4 bg-slate-50/50 flex flex-col gap-3">
                            <div className="flex items-center gap-4">
                                <TabsList className="bg-slate-200/50 p-1 flex-wrap h-auto">
                                    <TabsTrigger value="biblioteca" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 py-2 flex items-center gap-2 transition-all">
                                        <Library className="w-4 h-4" />
                                        Biblioteca
                                    </TabsTrigger>
                                </TabsList>

                                <div className="h-8 w-px bg-slate-200 mx-1" />

                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Trilhas Base</span>
                                    <TabsList className="bg-slate-200/50 p-1 flex-wrap h-auto">
                                        <TabsTrigger value="skills" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 py-2 flex items-center gap-2 transition-all">
                                            <BookOpen className="w-4 h-4" />
                                            Habilidades (BNCC / IBIRÁ)
                                        </TabsTrigger>
                                        <TabsTrigger value="contents" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 py-2 flex items-center gap-2 transition-all">
                                            <Layers className="w-4 h-4" />
                                            Competências (BNCC / IBIRÁ)
                                        </TabsTrigger>
                                    </TabsList>
                                </div>

                                <div className="h-8 w-px bg-slate-200 mx-1" />

                                <TabsList className="bg-slate-200/50 p-1 flex-wrap h-auto">
                                    <TabsTrigger value="products" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 py-2 flex items-center gap-2 transition-all">
                                        <PackagePlus className="w-4 h-4" />
                                        Produtos Finais
                                    </TabsTrigger>
                                </TabsList>
                            </div>
                        </div>

                        <div className="p-6">
                            <TabsContent value="biblioteca" className="m-0 border-none outline-none focus-visible:ring-0">
                                <BibliotecaEditor />
                            </TabsContent>

                            <TabsContent value="skills" className="m-0 border-none outline-none focus-visible:ring-0">
                                <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                                    <h2 className="text-blue-900 font-bold tracking-wider uppercase text-sm">VISÃO ACADÊMICA / CURRICULAR (habilidades bncc / ibirá)</h2>
                                </div>
                                <KnowledgeTreeEditor treeType="skill" />
                            </TabsContent>

                            <TabsContent value="contents" className="m-0 border-none outline-none focus-visible:ring-0">
                                <div className="mb-6 p-4 bg-indigo-50 border-l-4 border-indigo-500 rounded-r-lg">
                                    <h2 className="text-indigo-900 font-bold tracking-wider uppercase text-sm">VISÃO COMPORTAMENTAL / COGNITIVA (competências bncc / ibirá)</h2>
                                </div>
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

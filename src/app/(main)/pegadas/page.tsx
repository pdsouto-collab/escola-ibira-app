"use client";

import { useAppStore } from "@/lib/store";
import { PegadaNewPost } from "@/components/pegadas/pegada-new-post";
import { PegadasFeed } from "@/components/pegadas/pegadas-feed";
import { TreeDeciduous, Info } from "lucide-react";
import { useSession } from "next-auth/react";


export default function PegadasPage() {
    const { data: session } = useSession();
    const currentUser = session?.user as any;

    const isTeacherOrAdmin = currentUser?.role === "teacher" || currentUser?.role === "director" || currentUser?.role === "admin";

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
                            Pegadas dos Ibiritos
                        </h1>
                        <p className="text-slate-500 mt-2 max-w-2xl">
                            Acompanhe os rastros de descobertas, vivências e conquistas que nossos pequenos deixam pelo caminho.
                        </p>
                    </div>
                </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 overflow-y-auto px-6 py-8">
                <div className="max-w-2xl mx-auto">
                    {/* Welcome/Info for Parents */}
                    {!isTeacherOrAdmin && (
                        <div className="mb-8 p-4 border border-indigo-100 bg-indigo-50 text-indigo-900 rounded-xl flex gap-3">
                            <Info className="h-5 w-5 text-indigo-600 shrink-0" />
                            <div>
                                <h4 className="font-bold text-sm">Bem-vindo ao Feed de Pegadas!</h4>
                                <p className="text-sm opacity-90 mt-1">
                                    Aqui você vê todas as vivências da escola. Sinta-se à vontade para interagir com uma árvore (🌳) ou deixar uma mensagem!
                                </p>
                            </div>
                        </div>
                    )}

                    {/* New Post Creator (Teachers/Admins only) */}
                    <PegadaNewPost />

                    {/* Feed */}
                    <PegadasFeed />
                </div>
            </main>
        </div>
    );
}

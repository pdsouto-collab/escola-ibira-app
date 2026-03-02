"use client";

import { useAppStore } from "@/lib/store";
import { PegadaPostCard } from "./pegada-post-card";
import { ScrollArea } from "@/components/ui/scroll-area";

export function PegadasFeed() {
    const { pegadaPosts } = useAppStore();

    // Sort by most recent
    const sortedPosts = [...pegadaPosts].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return (
        <div className="max-w-2xl mx-auto py-4 space-y-6">
            {sortedPosts.length > 0 ? (
                sortedPosts.map(post => (
                    <PegadaPostCard key={post.id} post={post} />
                ))
            ) : (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200 p-8">
                    <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl text-slate-300">🐾</span>
                    </div>
                    <h3 className="text-slate-900 font-bold">Nenhuma pegada encontrada</h3>
                    <p className="text-sm text-slate-500 mt-1">Seja o primeiro a registrar uma vivência dos Ibiritos!</p>
                </div>
            )}
        </div>
    );
}

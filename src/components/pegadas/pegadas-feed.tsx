"use client";

import { useEffect, useState } from "react";
import { PegadaPostCard } from "./pegada-post-card";
import { getPegadas } from "@/services/pegada.service";
import { PegadaPost } from "@/types/pegada-post";
import { Loader2 } from "lucide-react";

interface PegadasFeedProps {
    refreshTrigger?: number;
}

export function PegadasFeed({ refreshTrigger = 0 }: PegadasFeedProps) {
    const [pegadaPosts, setPegadaPosts] = useState<PegadaPost[]>([]);
    const [loading, setLoading] = useState(true);

    const loadPosts = async () => {
        try {
            setLoading(true);
            const posts = await getPegadas();
            setPegadaPosts(posts);
        } catch (error) {
            console.error("Erro ao carregar pegadas:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPosts();
    }, [refreshTrigger]);

    // Sort by most recent
    const sortedPosts = [...pegadaPosts].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-4 space-y-6">
            {sortedPosts.length > 0 ? (
                sortedPosts.map(post => (
                    <PegadaPostCard key={post.id} post={post} onDeleted={loadPosts} onUpdated={loadPosts} />
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

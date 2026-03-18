"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { ClassBoardPost, PostInteraction } from "@/lib/data";
import { TreeDeciduous, MessageCircle, MoreHorizontal, Shapes, Megaphone, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useSession } from "next-auth/react";


function PostInteractionsView({ post }: { post: ClassBoardPost }) {
    const { postInteractions, addPostInteraction } = useAppStore();
    const { data: session } = useSession();
    const currentUser = session?.user as any;
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState("");

    const interactions = postInteractions.filter(i => i.postId === post.id);
    const likes = interactions.filter(i => i.type === "like");
    const comments = interactions.filter(i => i.type === "comment");

    const hasLiked = likes.some(l => l.userId === currentUser?.id);

    const handleLike = () => {
        // Note: Removing likes is complex without a remove action, assuming we just add like for now
        // A complete implementation would have a toggle
        if (hasLiked) return;

        addPostInteraction({
            id: `pi-${Math.random().toString(36).substr(2, 9)}`,
            postId: post.id,
            userId: currentUser?.id || "u2",
            userName: currentUser?.name || "Usuário",
            userRole: currentUser?.role === "guardian" ? "Pai/Responsável" : "Escola",
            type: "like",
            createdAt: new Date().toISOString()
        });
    };

    const handleComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        addPostInteraction({
            id: `pi-${Math.random().toString(36).substr(2, 9)}`,
            postId: post.id,
            userId: currentUser?.id || "u2",
            userName: currentUser?.name || "Usuário",
            userRole: currentUser?.role === "guardian" ? "Pai/Responsável" : "Escola",
            type: "comment",
            content: commentText,
            createdAt: new Date().toISOString()
        });

        setCommentText("");
    };

    return (
        <div className="mt-4 pt-4 border-t border-slate-100">
            {/* Interaction Buttons */}
            <div className="flex items-center gap-4">
                <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${hasLiked ? 'text-emerald-600' : 'text-slate-500 hover:text-emerald-600'}`}
                >
                    <div className={`p-1.5 rounded-full ${hasLiked ? 'bg-emerald-100' : 'hover:bg-emerald-50'}`}>
                        <TreeDeciduous className={`h-5 w-5 ${hasLiked ? 'fill-emerald-500 text-emerald-500' : ''}`} />
                    </div>
                    <span>{likes.length} Curtidas</span>
                </button>

                <button
                    onClick={() => setShowComments(!showComments)}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${showComments ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`}
                >
                    <div className={`p-1.5 rounded-full ${showComments ? 'bg-indigo-100' : 'hover:bg-indigo-50'}`}>
                        <MessageCircle className="h-5 w-5" />
                    </div>
                    <span>{comments.length} Comentários</span>
                </button>
            </div>

            {/* Comments Thread */}
            {showComments && (
                <div className="mt-4 space-y-4 rounded-xl bg-slate-50/50 p-4 border border-slate-100 animate-in fade-in duration-200">
                    {comments.length > 0 ? (
                        <div className="space-y-4 mb-4">
                            {comments.map((comment) => (
                                <div key={comment.id} className="flex gap-3 text-sm">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className="bg-indigo-100 text-indigo-700 font-semibold text-xs border border-indigo-200">
                                            {comment.userName.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="bg-white px-4 py-2.5 rounded-2xl rounded-tl-sm border border-slate-200 shadow-sm">
                                            <div className="font-semibold text-slate-900 flex items-center gap-2">
                                                {comment.userName}
                                                {comment.userRole && (
                                                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-sm">
                                                        {comment.userRole === "Pai/Responsável" ? "Família" : "Escola"}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-slate-600 mt-1 leading-relaxed">
                                                {comment.content}
                                            </div>
                                        </div>
                                        <div className="text-xs text-slate-400 mt-1.5 px-2">
                                            {formatDistanceToNow(parseISO(comment.createdAt), { addSuffix: true, locale: ptBR })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-4 text-sm text-slate-500">
                            Nenhum comentário ainda. Puxe assunto!
                        </div>
                    )}

                    {/* New Comment Form */}
                    <form onSubmit={handleComment} className="flex gap-3 items-end mt-4 pt-4 border-t border-slate-200">
                        <Avatar className="h-8 w-8 shrink-0">
                            <AvatarFallback className="bg-emerald-100 text-emerald-700 font-semibold border border-emerald-200">
                                {currentUser?.name.charAt(0) || "U"}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Adicione um comentário..."
                                className="w-full bg-white border border-slate-200 rounded-full px-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 pr-10"
                            />
                            <button
                                type="submit"
                                disabled={!commentText.trim()}
                                className="absolute right-1 top-1 bottom-1 px-3 bg-indigo-500 text-white rounded-full text-xs font-semibold hover:bg-indigo-600 disabled:opacity-50 transition-colors"
                            >
                                Enviar
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

export function TroncoFeed({ classId, categoryFilter }: { classId: string, categoryFilter?: string }) {
    const { classBoardPosts } = useAppStore();

    // Filter posts by classId and optionally by category, then sort from newest to oldest
    let filteredPosts = classBoardPosts.filter(p => p.classId === classId);
    if (categoryFilter) {
        filteredPosts = filteredPosts.filter(p => p.categoryType === categoryFilter);
    }
    const sortedPosts = [...filteredPosts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (sortedPosts.length === 0) {
        return (
            <div className="text-center py-16 px-4 bg-white border border-dashed border-slate-300 rounded-2xl">
                <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <TreeDeciduous className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-1">O Tronco está vazio</h3>
                <p className="text-slate-500">Ainda não há recados ou novidades para esta turma.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {sortedPosts.map(post => {
                const isAcontece = post.categoryType === "Projetos da Classe";

                return (
                    <div key={post.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        {/* Header */}
                        <div className="p-5 pb-3">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm">
                                        <AvatarImage src="/placeholder-avatar.jpg" />
                                        <AvatarFallback className="bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                                            {post.authorName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-semibold text-slate-900 line-clamp-1">{post.authorName}</div>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                            {post.authorRole && (
                                                <span className="font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-sm">
                                                    {post.authorRole}
                                                </span>
                                            )}
                                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {formatDistanceToNow(parseISO(post.createdAt), { addSuffix: true, locale: ptBR })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-50 rounded-full transition-colors">
                                    <MoreHorizontal className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Tag */}
                            <div className="mb-3">
                                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${isAcontece ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                    {isAcontece ? <Shapes className="h-3.5 w-3.5" /> : <Megaphone className="h-3.5 w-3.5" />}
                                    {post.categoryType}
                                </span>
                            </div>

                            {/* Title and Content */}
                            <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight">
                                {post.title}
                            </h3>
                            <div className="text-slate-700 leading-relaxed max-w-none text-[15px] whitespace-pre-wrap">
                                {post.content}
                            </div>

                            {/* Extra Materials (for Projetos da Classe) */}
                            {post.extraMaterials && (
                                <div className="mt-4 p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm">
                                    <div className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        Materiais e Detalhes
                                    </div>
                                    <div className="text-slate-600 pl-3.5 border-l-2 border-emerald-100 ml-0.5">
                                        {post.extraMaterials}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Photos (if any) */}
                        {post.photos && post.photos.length > 0 && (
                            <div className="px-5 pb-3">
                                <div className={`grid gap-2 ${post.photos.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                    {post.photos.map((photo, index) => (
                                        <div key={index} className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={photo}
                                                alt={`Foto ${index + 1}`}
                                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Interactions Footer */}
                        <div className="px-5 pb-4">
                            <PostInteractionsView post={post} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

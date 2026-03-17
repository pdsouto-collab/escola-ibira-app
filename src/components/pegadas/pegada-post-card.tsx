"use client";

import { useState, useRef } from "react";
import { PegadaPost, PegadaInteraction } from "@/lib/data";
import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { TreeDeciduous, MessageSquare, Mic, Send, MoreVertical, Play, Pencil, Trash, X, Save, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";import { useSession } from "next-auth/react";


interface PegadaPostCardProps {
    post: PegadaPost;
}

export function PegadaPostCard({ post }: PegadaPostCardProps) {
    const { addPegadaInteraction, updatePegadaPost, deletePegadaPost } = useAppStore();
    const { data: session } = useSession();
    const currentUser = session?.user as any;
    const [comment, setComment] = useState("");
    const [showComments, setShowComments] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(post.content);
    const scrollRef = useRef<HTMLDivElement>(null);

    const hasLiked = post.interactions.some(i => i.type === 'like' && i.userId === currentUser?.id);
    const likeCount = post.interactions.filter(i => i.type === 'like').length;
    const commentCount = post.interactions.filter(i => i.type === 'comment' || i.type === 'audio').length;
    const canManage = currentUser?.id === post.authorId || currentUser?.role === "admin" || currentUser?.role === "director";

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const amount = scrollRef.current.clientWidth;
            scrollRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
        }
    };

    const handleLike = () => {
        if (!currentUser || hasLiked) return;

        const interaction: PegadaInteraction = {
            id: `int-${Date.now()}`,
            userId: currentUser.id,
            userName: currentUser.name,
            type: 'like',
            createdAt: new Date().toISOString()
        };
        addPegadaInteraction(post.id, interaction);
    };

    const handleComment = () => {
        if (!currentUser || !comment.trim()) return;

        const interaction: PegadaInteraction = {
            id: `int-${Date.now()}`,
            userId: currentUser.id,
            userName: currentUser.name,
            type: 'comment',
            content: comment.trim(),
            createdAt: new Date().toISOString()
        };
        addPegadaInteraction(post.id, interaction);
        setComment("");
    };

    return (
        <Card className="overflow-hidden border-slate-200 hover:shadow-md transition-shadow">
            <CardHeader className="p-4 flex flex-row items-center gap-3">
                <Avatar className="h-10 w-10 border border-slate-100">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorName}`} />
                    <AvatarFallback>{post.authorName.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-900">{post.authorName}</h4>
                    <p className="text-[10px] text-slate-500">
                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ptBR })}
                    </p>
                </div>
                {canManage && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-slate-400">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setIsEditing(true)}>
                                <Pencil className="h-4 w-4 mr-2" /> Editar Post
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => deletePegadaPost(post.id)} className="text-red-600 focus:bg-red-50 focus:text-red-600">
                                <Trash className="h-4 w-4 mr-2" /> Excluir Post
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </CardHeader>

            <CardContent className="p-0">
                {post.type === "photo" && (
                    post.mediaUrls && post.mediaUrls.length > 0 ? (
                        <div className="relative aspect-video bg-slate-100 overflow-hidden group">
                            <div ref={scrollRef} className="flex w-full h-full overflow-x-auto snap-x snap-mandatory hide-scrollbar">
                                {post.mediaUrls.map((url, i) => (
                                    <img key={i} src={url} alt={`${post.title} - foto ${i + 1}`} className="w-full h-full object-cover shrink-0 snap-center" />
                                ))}
                            </div>
                            {post.mediaUrls.length > 1 && (
                                <>
                                    <Button
                                        variant="default"
                                        size="icon"
                                        className="absolute top-1/2 left-2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/30 hover:bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                        onClick={() => scroll('left')}
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </Button>
                                    <Button
                                        variant="default"
                                        size="icon"
                                        className="absolute top-1/2 right-2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/30 hover:bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                        onClick={() => scroll('right')}
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </Button>
                                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 bg-black/20 px-2 py-1 rounded-full backdrop-blur-sm">
                                        {post.mediaUrls.map((_, i) => (
                                            <div key={i} className="h-1.5 w-1.5 rounded-full bg-white shadow-sm opacity-50 first:opacity-100" />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    ) : post.mediaUrl ? (
                        <div className="relative aspect-video bg-slate-100">
                            <img src={post.mediaUrl} alt={post.title} className="w-full h-full object-cover" />
                        </div>
                    ) : null
                )}

                {post.type === "video" && post.mediaUrl && (
                    <div className="relative aspect-video bg-black flex items-center justify-center group cursor-pointer">
                        <video src={post.mediaUrl} className="w-full h-full object-contain opacity-80" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                            <div className="h-16 w-16 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                                <Play className="h-8 w-8 text-white fill-white" />
                            </div>
                        </div>
                    </div>
                )}

                <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-800 leading-tight">{post.title}</h3>
                        {post.tags && post.tags.length > 0 && (
                            <div className="flex gap-1">
                                {post.tags.map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-[9px] bg-emerald-50 text-emerald-700 border-emerald-100 uppercase tracking-tighter">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                    {isEditing ? (
                        <div className="space-y-3 mt-2">
                            <textarea
                                className="w-full min-h-[100px] p-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                            />
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" size="sm" onClick={() => { setIsEditing(false); setEditContent(post.content); }}>
                                    <X className="h-4 w-4 mr-2" /> Cancelar
                                </Button>
                                <Button size="sm" onClick={() => { updatePegadaPost(post.id, { content: editContent }); setIsEditing(false); }} className="bg-indigo-600 hover:bg-indigo-700">
                                    <Save className="h-4 w-4 mr-2" /> Salvar
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                            {post.content}
                        </p>
                    )}
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0 flex flex-col gap-4 border-t border-slate-50 mt-2">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleLike}
                            className={`flex items-center gap-1.5 transition-all active:scale-125 ${hasLiked ? 'text-emerald-600' : 'text-slate-500 hover:text-emerald-500'}`}
                        >
                            <TreeDeciduous className={`h-5 w-5 ${hasLiked ? 'fill-emerald-100' : ''}`} />
                            <span className="text-xs font-bold">{likeCount}</span>
                        </button>

                        <button
                            onClick={() => setShowComments(!showComments)}
                            className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-500 transition-colors"
                        >
                            <MessageSquare className="h-4 w-4" />
                            <span className="text-xs font-bold">{commentCount}</span>
                        </button>
                    </div>

                    {currentUser?.role !== "guardian" && (
                        <div className="text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 uppercase tracking-widest">
                            Visível para Todos
                        </div>
                    )}
                </div>

                {showComments && (
                    <div className="w-full space-y-4 pt-2">
                        <div className="space-y-3">
                            {post.interactions.filter(i => i.type === 'comment' || i.type === 'audio').map((int) => (
                                <div key={int.id} className="flex gap-3 animate-in slide-in-from-bottom-2">
                                    <Avatar className="h-8 w-8 shrink-0">
                                        <AvatarFallback className="text-[10px] bg-slate-100 text-slate-600">{int.userName.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 bg-slate-50 rounded-2xl p-3 text-xs">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold text-slate-900">{int.userName}</span>
                                            <span className="text-[9px] text-slate-400">
                                                {formatDistanceToNow(new Date(int.createdAt), { locale: ptBR })}
                                            </span>
                                        </div>
                                        {int.type === 'comment' ? (
                                            <p className="text-slate-600 leading-normal">{int.content}</p>
                                        ) : (
                                            <div className="flex items-center gap-2 bg-white/50 p-2 rounded-lg border border-slate-100 mt-1">
                                                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                                    <Play className="h-4 w-4 text-indigo-600 fill-indigo-600" />
                                                </div>
                                                <div className="flex-1 h-1.5 bg-slate-200 rounded-full relative overflow-hidden">
                                                    <div className="absolute inset-0 bg-indigo-400 w-1/3" />
                                                </div>
                                                <span className="text-[10px] text-slate-400">0:12</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2 items-center">
                            <Input
                                placeholder="Escreva um comentário..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="h-9 text-xs bg-slate-50 border-slate-200 focus-visible:ring-indigo-500"
                                onKeyDown={(e) => e.key === 'Enter' && handleComment()}
                            />
                            <div className="flex gap-1 shrink-0">
                                <Button size="icon" variant="ghost" className="h-9 w-9 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                                    <Mic className="h-4 w-4" />
                                </Button>
                                <Button size="icon" onClick={handleComment} disabled={!comment.trim()} className="h-9 w-9 bg-indigo-600 hover:bg-indigo-700 shadow-sm shrink-0">
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </CardFooter>
        </Card>
    );
}

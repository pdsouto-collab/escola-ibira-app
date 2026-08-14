"use client";

import { useState, useEffect } from "react";
import { ClassBoardPost } from "@/types/class-board-post";
import { PostInteraction } from "@/types/post-interaction";
import { getClassBoardPosts, createPostInteraction, deletePostInteraction, updateClassBoardPost, deleteClassBoardPost } from "@/services/class-board.service";
import { TreeDeciduous, MessageCircle, MoreHorizontal, Shapes, Megaphone, Clock, Pencil, Trash } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useSession } from "next-auth/react";
import { toast } from "sonner";


type LoadedPost = ClassBoardPost & { interactions: PostInteraction[] };

function PostInteractionsView({ post, onInteractionAdded, onInteractionRemoved }: { post: LoadedPost, onInteractionAdded: (interaction: PostInteraction) => void, onInteractionRemoved: (interactionId: string) => void }) {
    const { data: session } = useSession();
    const currentUser = session?.user as any;
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const interactions = post.interactions || [];
    const likes = interactions.filter(i => i.type === "like");
    const comments = interactions.filter(i => i.type === "comment");

    const hasLiked = likes.some(l => l.userId === currentUser?.id);

    const handleLike = async () => {
        if (isSubmitting) return;

        setIsSubmitting(true);

        if (hasLiked) {
            // Find the user's like interaction
            const likeInteraction = likes.find(l => l.userId === currentUser?.id);
            if (likeInteraction) {
                const success = await deletePostInteraction(likeInteraction.id);
                if (success) {
                    onInteractionRemoved(likeInteraction.id);
                } else {
                    toast.error("Erro ao remover curtida");
                }
            }
        } else {
            const newInteraction = await createPostInteraction(post.id, {
                postId: post.id,
                userId: currentUser?.id,
                userName: currentUser?.name || "Usuário",
                userRole: currentUser?.role === "guardian" ? "Pai/Responsável" : "Escola",
                type: "like",
            });

            if (newInteraction) {
                onInteractionAdded(newInteraction);
            } else {
                toast.error("Erro ao curtir postagem");
            }
        }

        setIsSubmitting(false);
    };

    const handleComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim() || isSubmitting) return;

        setIsSubmitting(true);
        const newInteraction = await createPostInteraction(post.id, {
            postId: post.id,
            userId: currentUser?.id,
            userName: currentUser?.name || "Usuário",
            userRole: currentUser?.role === "guardian" ? "Pai/Responsável" : "Escola",
            type: "comment",
            content: commentText
        });

        setIsSubmitting(false);

        if (newInteraction) {
            onInteractionAdded(newInteraction);
            setCommentText("");
            toast.success("Comentário adicionado!");
        } else {
            toast.error("Erro ao adicionar comentário");
        }
    };

    return (
        <div className="mt-4 pt-4 border-t border-slate-100">
            {/* Interaction Buttons */}
            <div className="flex items-center gap-4">
                <button
                    onClick={handleLike}
                    disabled={isSubmitting}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${hasLiked ? 'text-emerald-600' : 'text-slate-500 hover:text-emerald-600'} ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                                    <div className="flex-1 min-w-0">
                                        <div className="bg-white px-4 py-2.5 rounded-2xl rounded-tl-sm border border-slate-200 shadow-sm overflow-hidden">
                                            <div className="font-semibold text-slate-900 flex items-center gap-2">
                                                {comment.userName}
                                                {comment.userRole && (
                                                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-sm">
                                                        {comment.userRole === "Pai/Responsável" ? "Família" : "Escola"}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-slate-600 mt-1 leading-relaxed break-words [overflow-wrap:anywhere] whitespace-pre-wrap">
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
                                disabled={isSubmitting}
                                className="w-full bg-white border border-slate-200 rounded-full px-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 pr-10 disabled:opacity-70"
                            />
                            <button
                                type="submit"
                                disabled={!commentText.trim() || isSubmitting}
                                className="absolute right-1 top-1 bottom-1 px-3 bg-indigo-500 text-white rounded-full text-xs font-semibold hover:bg-indigo-600 disabled:opacity-50 transition-colors"
                            >
                                {isSubmitting ? "Enviando..." : "Enviar"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

export function TroncoFeed({ classId, categoryFilter }: { classId: string, categoryFilter?: string }) {
    const { data: session } = useSession();
    const currentUser = session?.user as any;
    const [posts, setPosts] = useState<LoadedPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchPosts() {
            setIsLoading(true);
            const data = await getClassBoardPosts(classId);
            setPosts(data || []);
            setIsLoading(false);
        }
        fetchPosts();

        // Check for newly added posts periodically or set up an event listener
        const handleNewPost = () => fetchPosts();
        window.addEventListener('classBoardPostAdded', handleNewPost);
        return () => window.removeEventListener('classBoardPostAdded', handleNewPost);
    }, [classId]);

    const handleInteractionAdded = (postId: string, interaction: PostInteraction) => {
        setPosts(prev => prev.map(p => {
            if (p.id === postId) {
                return { ...p, interactions: [...(p.interactions || []), interaction] };
            }
            return p;
        }));
    };

    const handleInteractionRemoved = (postId: string, interactionId: string) => {
        setPosts(prev => prev.map(p => {
            if (p.id === postId) {
                return { ...p, interactions: (p.interactions || []).filter(i => i.id !== interactionId) };
            }
            return p;
        }));
    };

    const handleEditPost = async (post: LoadedPost) => {
        const newTitle = window.prompt("Editar Título:", post.title);
        if (newTitle === null) return;
        const newContent = window.prompt("Editar Conteúdo:", post.content);
        if (newContent === null) return;

        const updated = await updateClassBoardPost(post.id, { title: newTitle, content: newContent });
        if (updated) {
            setPosts(prev => prev.map(p => p.id === post.id ? { ...p, title: newTitle, content: newContent } : p));
            toast.success("Post editado com sucesso!");
        } else {
            toast.error("Erro ao editar post.");
        }
    };

    const handleDeletePost = async (postId: string) => {
        if (!window.confirm("Certeza que deseja excluir este post?")) return;
        const success = await deleteClassBoardPost(postId);
        if (success) {
            setPosts(prev => prev.filter(p => p.id !== postId));
            toast.success("Post excluído!");
        } else {
            toast.error("Erro ao excluir post.");
        }
    };

    let filteredPosts = posts;
    if (categoryFilter) {
        filteredPosts = filteredPosts.filter(p => p.categoryType === categoryFilter);
    }

    if (isLoading) {
        return (
            <div className="text-center py-16 px-4 bg-white border border-slate-200 rounded-2xl animate-pulse">
                <div className="mx-auto w-12 h-12 bg-slate-200 rounded-full mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/3 mx-auto mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-1/4 mx-auto"></div>
            </div>
        );
    }

    if (filteredPosts.length === 0) {
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
            {filteredPosts.map(post => {
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
                                {currentUser && (post.authorId === currentUser.id || currentUser.role === "admin") && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-50 rounded-full transition-colors outline-none focus:ring-0">
                                                <MoreHorizontal className="h-5 w-5" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-40 bg-white border border-slate-200">
                                            <DropdownMenuItem onClick={() => handleEditPost(post)} className="text-slate-700 hover:bg-slate-50 hover:text-slate-900 cursor-pointer">
                                                <Pencil className="h-4 w-4 mr-2" />
                                                Editar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDeletePost(post.id)} className="text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer focus:bg-red-50 focus:text-red-700">
                                                <Trash className="h-4 w-4 mr-2" />
                                                Excluir
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>

                            {/* Tag */}
                            <div className="mb-3">
                                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${isAcontece ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                    {isAcontece ? <Shapes className="h-3.5 w-3.5" /> : <Megaphone className="h-3.5 w-3.5" />}
                                    {post.categoryType}
                                </span>
                            </div>

                            {/* Title and Content */}
                            <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight break-words">
                                {post.title}
                            </h3>
                            <div className="text-slate-700 leading-relaxed max-w-none text-[15px] whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
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
                            <PostInteractionsView post={post} onInteractionAdded={(int) => handleInteractionAdded(post.id, int)} onInteractionRemoved={(intId) => handleInteractionRemoved(post.id, intId)} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

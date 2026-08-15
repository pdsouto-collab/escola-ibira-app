"use client";

import { useState, useEffect, useRef } from "react";
import { ClassBoardPost } from "@/types/class-board-post";
import { PostInteraction } from "@/types/post-interaction";
import { getClassBoardPosts, createPostInteraction, deletePostInteraction, updateClassBoardPost, deleteClassBoardPost } from "@/services/class-board.service";
import { TreeDeciduous, MessageCircle, MoreHorizontal, Shapes, Megaphone, Clock, Pencil, Trash, Maximize2, ChevronLeft, ChevronRight, Image as ImageIcon, Plus, X, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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

function TroncoPhotoCarousel({ photos, onOpenLightbox }: { photos: string[], onOpenLightbox: (photos: string[], initialIndex: number) => void }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!photos || photos.length === 0) return null;

    if (photos.length === 1) {
        return (
            <div 
                onClick={() => onOpenLightbox(photos, 0)}
                className="relative rounded-2xl overflow-hidden bg-slate-900/5 border border-slate-200 group cursor-pointer max-h-[520px] aspect-[4/3] sm:aspect-[16/10]"
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={photos[0]}
                    alt="Foto do recado"
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center pointer-events-none">
                    <span className="opacity-0 group-hover:opacity-100 bg-black/70 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-xs transition-opacity flex items-center gap-1.5 shadow-md">
                        <Maximize2 className="w-3.5 h-3.5" /> Ampliar foto
                    </span>
                </div>
            </div>
        );
    }

    const prevSlide = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex(prev => (prev === 0 ? photos.length - 1 : prev - 1));
    };

    const nextSlide = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex(prev => (prev === photos.length - 1 ? 0 : prev + 1));
    };

    return (
        <div className="relative rounded-2xl overflow-hidden bg-slate-950/5 border border-slate-200 group aspect-[4/3] sm:aspect-[16/10] max-h-[520px] select-none">
            <div 
                onClick={() => onOpenLightbox(photos, currentIndex)}
                className="w-full h-full cursor-pointer relative"
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={photos[currentIndex]}
                    alt={`Foto ${currentIndex + 1}`}
                    className="w-full h-full object-cover object-center transition-all duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center pointer-events-none">
                    <span className="opacity-0 group-hover:opacity-100 bg-black/70 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-xs transition-opacity flex items-center gap-1.5 shadow-md">
                        <Maximize2 className="w-3.5 h-3.5" /> Ampliar foto
                    </span>
                </div>
            </div>

            {/* Counter Badge */}
            <div className="absolute top-3 right-3 bg-black/65 text-white text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-xs shadow-sm pointer-events-none">
                {currentIndex + 1}/{photos.length}
            </div>

            {/* Navigation Arrows */}
            <button
                type="button"
                onClick={prevSlide}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-xs transition-all opacity-0 group-hover:opacity-100 shadow-md"
                title="Foto anterior"
            >
                <ChevronLeft className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={nextSlide}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-xs transition-all opacity-0 group-hover:opacity-100 shadow-md"
                title="Próxima foto"
            >
                <ChevronRight className="w-4 h-4" />
            </button>

            {/* Indicator Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-xs">
                {photos.map((_, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setCurrentIndex(i);
                        }}
                        className={`h-2 rounded-full transition-all ${i === currentIndex ? 'w-5 bg-white' : 'w-2 bg-white/50 hover:bg-white/75'}`}
                    />
                ))}
            </div>
        </div>
    );
}

export function TroncoFeed({ classId, categoryFilter }: { classId: string, categoryFilter?: string }) {
    const { data: session } = useSession();
    const currentUser = session?.user as any;
    const [posts, setPosts] = useState<LoadedPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Edit Post Modal State
    const [editingPost, setEditingPost] = useState<LoadedPost | null>(null);
    const [lightboxData, setLightboxData] = useState<{ photos: string[], index: number } | null>(null);
    const [editForm, setEditForm] = useState<{
        title: string;
        content: string;
        categoryType: string;
        extraMaterials: string;
        photos: string[];
    }>({
        title: "",
        content: "",
        categoryType: "Novidades da Turma",
        extraMaterials: "",
        photos: []
    });
    const editFileInputRef = useRef<HTMLInputElement>(null);
    const [isSavingEdit, setIsSavingEdit] = useState(false);

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

    const handleOpenEdit = (post: LoadedPost) => {
        setEditingPost(post);
        setEditForm({
            title: post.title || "",
            content: post.content || "",
            categoryType: post.categoryType || "Novidades da Turma",
            extraMaterials: post.extraMaterials || "",
            photos: Array.isArray(post.photos) ? [...post.photos] : []
        });
    };

    const handleEditFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const availableSlots = 5 - editForm.photos.length;
        if (availableSlots <= 0) {
            toast.warning("Limite de 5 fotos atingido.");
            return;
        }

        const filesToProcess = files.slice(0, availableSlots);

        const promises = filesToProcess.map(file => {
            return new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement("canvas");
                        const MAX_DIM = 1200;
                        let width = img.width;
                        let height = img.height;

                        if (width > height) {
                            if (width > MAX_DIM) {
                                height = Math.round((height * MAX_DIM) / width);
                                width = MAX_DIM;
                            }
                        } else {
                            if (height > MAX_DIM) {
                                width = Math.round((width * MAX_DIM) / height);
                                height = MAX_DIM;
                            }
                        }

                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext("2d");
                        if (ctx) {
                            ctx.imageSmoothingEnabled = true;
                            ctx.imageSmoothingQuality = "high";
                            ctx.drawImage(img, 0, 0, width, height);
                        }

                        const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
                        resolve(dataUrl);
                    };
                    img.src = reader.result as string;
                };
                reader.readAsDataURL(file);
            });
        });

        const newPhotos = await Promise.all(promises);
        setEditForm(prev => ({
            ...prev,
            photos: [...prev.photos, ...newPhotos].slice(0, 5)
        }));
        if (editFileInputRef.current) editFileInputRef.current.value = "";
    };

    const handleRemoveEditPhoto = (index: number) => {
        setEditForm(prev => ({
            ...prev,
            photos: prev.photos.filter((_, i) => i !== index)
        }));
    };

    const handleSaveEdit = async () => {
        if (!editingPost) return;

        const trimmedTitle = editForm.title.trim();
        const trimmedContent = editForm.content.trim();

        if (!trimmedTitle && !trimmedContent && editForm.photos.length === 0) {
            toast.error("Preencha ao menos o texto ou mantenha uma foto.");
            return;
        }

        const finalTitle = trimmedTitle || (trimmedContent ? (trimmedContent.slice(0, 50) + (trimmedContent.length > 50 ? "..." : "")) : "Novidade da Turma");
        const photosToSave = editForm.categoryType === "Projetos da Classe" ? editingPost.photos : editForm.photos;

        setIsSavingEdit(true);
        try {
            const updated = await updateClassBoardPost(editingPost.id, {
                title: finalTitle,
                content: trimmedContent,
                categoryType: editForm.categoryType,
                extraMaterials: editForm.extraMaterials ? editForm.extraMaterials.trim() : null,
                photos: photosToSave
            });

            if (updated) {
                setPosts(prev => prev.map(p => p.id === editingPost.id ? {
                    ...p,
                    title: finalTitle,
                    content: trimmedContent,
                    categoryType: editForm.categoryType,
                    extraMaterials: editForm.extraMaterials ? editForm.extraMaterials.trim() : null,
                    photos: photosToSave
                } : p));
                toast.success("Post editado com sucesso!");
                setEditingPost(null);
            } else {
                toast.error("Erro ao editar post.");
            }
        } catch (error) {
            console.error("Erro ao atualizar post:", error);
            toast.error("Erro ao editar post.");
        } finally {
            setIsSavingEdit(false);
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

    const userRole = (currentUser?.role || "").toLowerCase();
    const isStaff = userRole === "admin" || userRole === "director" || userRole === "teacher" || userRole === "educator";

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
                const canManagePost = Boolean(currentUser && (post.authorId === currentUser.id || isStaff));

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
                                {canManagePost && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-50 rounded-full transition-colors outline-none focus:ring-0">
                                                <MoreHorizontal className="h-5 w-5" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-40 bg-white border border-slate-200">
                                            <DropdownMenuItem onClick={() => handleOpenEdit(post)} className="text-slate-700 hover:bg-slate-50 hover:text-slate-900 cursor-pointer">
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

                        {/* Photos Carousel (up to 5 photos) */}
                        {post.photos && post.photos.length > 0 && (
                            <div className="px-5 pb-3">
                                <TroncoPhotoCarousel
                                    photos={post.photos}
                                    onOpenLightbox={(photos, index) => setLightboxData({ photos, index })}
                                />
                            </div>
                        )}

                        {/* Interactions Footer */}
                        <div className="px-5 pb-4">
                            <PostInteractionsView post={post} onInteractionAdded={(int) => handleInteractionAdded(post.id, int)} onInteractionRemoved={(intId) => handleInteractionRemoved(post.id, intId)} />
                        </div>
                    </div>
                );
            })}

            {/* Edit Post Dialog */}
            <Dialog open={!!editingPost} onOpenChange={(open) => !open && setEditingPost(null)}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Pencil className="h-5 w-5 text-emerald-600" />
                            Editar Recado do Tronco
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        {/* Category selection */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-slate-600">Categoria</Label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setEditForm(prev => ({ ...prev, categoryType: "Novidades da Turma" }))}
                                    className={`flex-1 py-2 px-3 text-xs font-medium rounded-lg border transition-all ${editForm.categoryType === "Novidades da Turma" ? "bg-blue-50 border-blue-200 text-blue-700 font-semibold" : "bg-slate-50 border-slate-200 text-slate-600"}`}
                                >
                                    Novidades da Turma
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditForm(prev => ({ ...prev, categoryType: "Projetos da Classe" }))}
                                    className={`flex-1 py-2 px-3 text-xs font-medium rounded-lg border transition-all ${editForm.categoryType === "Projetos da Classe" ? "bg-amber-50 border-amber-200 text-amber-700 font-semibold" : "bg-slate-50 border-slate-200 text-slate-600"}`}
                                >
                                    Projetos da Classe
                                </button>
                            </div>
                        </div>

                        {/* Title */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-slate-600">Título</Label>
                            <Input
                                value={editForm.title}
                                onChange={e => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Título do recado..."
                            />
                        </div>

                        {/* Content */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-slate-600">Conteúdo</Label>
                            <Textarea
                                value={editForm.content}
                                onChange={e => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                                placeholder="Escreva o recado aqui..."
                                className="min-h-[120px] resize-none"
                            />
                        </div>

                        {/* Extra materials */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-semibold text-slate-600">Materiais e Detalhes Vinculados (Opcional)</Label>
                                {editForm.categoryType === "Projetos da Classe" && (
                                    <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">Projeto</span>
                                )}
                            </div>
                            <Textarea
                                value={editForm.extraMaterials}
                                onChange={e => setEditForm(prev => ({ ...prev, extraMaterials: e.target.value }))}
                                placeholder="Ex: Trazer tesoura sem ponta, garrafa pet, avental..."
                                className="min-h-[75px] resize-none"
                            />
                        </div>

                        {/* Photos editing section for Novidades da Turma */}
                        {editForm.categoryType === "Novidades da Turma" && (
                            <div className="space-y-2 pt-2 border-t border-slate-100">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-semibold text-slate-600">Fotos do Recado ({editForm.photos.length}/5)</Label>
                                    {editForm.photos.length < 5 && (
                                        <button
                                            type="button"
                                            onClick={() => editFileInputRef.current?.click()}
                                            className="text-emerald-600 hover:text-emerald-700 font-semibold text-xs flex items-center gap-1"
                                        >
                                            <Plus className="w-3.5 h-3.5" /> Adicionar foto
                                        </button>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    ref={editFileInputRef}
                                    onChange={handleEditFileChange}
                                />
                                {editForm.photos.length > 0 ? (
                                    <div className="grid grid-cols-5 gap-2">
                                        {editForm.photos.map((photo, index) => (
                                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-100 group">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={photo} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveEditPhoto(index)}
                                                    className="absolute top-1 right-1 bg-black/70 hover:bg-black/90 text-white rounded-full p-0.5 shadow transition-all"
                                                    title="Remover foto"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                                <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] font-bold px-1 rounded">
                                                    {index + 1}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => editFileInputRef.current?.click()}
                                        className="w-full py-3 border border-dashed border-slate-200 hover:border-emerald-300 rounded-lg text-xs font-medium text-slate-500 hover:text-emerald-600 flex items-center justify-center gap-2 bg-slate-50 hover:bg-emerald-50/50 transition-colors"
                                    >
                                        <ImageIcon className="w-4 h-4 text-slate-400" />
                                        Anexar Fotos (até 5 fotos)
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setEditingPost(null)} disabled={isSavingEdit}>
                            Cancelar
                        </Button>
                        <Button 
                            onClick={handleSaveEdit} 
                            disabled={isSavingEdit}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
                        >
                            {isSavingEdit && <Loader2 className="h-4 w-4 animate-spin" />}
                            Salvar Alterações
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Photo Lightbox Modal */}
            <Dialog open={!!lightboxData} onOpenChange={(open) => !open && setLightboxData(null)}>
                <DialogContent className="max-w-4xl p-2 bg-slate-950 border-slate-800 text-white overflow-hidden">
                    <div className="relative max-h-[85vh] min-h-[300px] flex items-center justify-center p-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={lightboxData?.photos[lightboxData.index] || ""}
                            alt="Foto ampliada"
                            className="max-h-[80vh] w-auto max-w-full object-contain rounded-lg shadow-2xl"
                        />

                        {lightboxData && lightboxData.photos.length > 1 && (
                            <>
                                <div className="absolute top-4 left-4 bg-black/70 text-white text-xs font-bold px-3 py-1 rounded-full">
                                    {lightboxData.index + 1} de {lightboxData.photos.length}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setLightboxData(prev => prev ? {
                                        ...prev,
                                        index: prev.index === 0 ? prev.photos.length - 1 : prev.index - 1
                                    } : null)}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/85 text-white p-2.5 rounded-full backdrop-blur-xs transition-all shadow-lg"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setLightboxData(prev => prev ? {
                                        ...prev,
                                        index: prev.index === prev.photos.length - 1 ? 0 : prev.index + 1
                                    } : null)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/85 text-white p-2.5 rounded-full backdrop-blur-xs transition-all shadow-lg"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

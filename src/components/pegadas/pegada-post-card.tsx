"use client";

import { useState, useRef, useEffect } from "react";
import { PegadaPost } from "@/types/pegada-post";
import { PegadaInteraction } from "@/types/pegada-interaction";
import { updatePegada, deletePegada, addPegadaInteraction, deletePegadaInteraction } from "@/services/pegada.service";
import { getClasses } from "@/services/school-class.service";
import { SchoolClass } from "@/types/school-class";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { TreeDeciduous, MessageSquare, Mic, Send, MoreVertical, Play, Pencil, Trash, X, Save, ChevronLeft, ChevronRight, Loader2, Maximize2, Crop, School } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useSession } from "next-auth/react";
import { ImageFramingDialog } from "@/components/ui/image-framing-dialog";


interface PegadaPostCardProps {
    post: PegadaPost;
    onUpdated?: () => void;
    onDeleted?: () => void;
}

export function PegadaPostCard({ post, onUpdated, onDeleted }: PegadaPostCardProps) {
    const { data: session } = useSession();
    const currentUser = session?.user as any;
    const [comment, setComment] = useState("");
    const [showComments, setShowComments] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(post.title || "");
    const [editContent, setEditContent] = useState(post.content || "");
    const [editPhotos, setEditPhotos] = useState<string[]>([]);
    const [framingModalOpen, setFramingModalOpen] = useState(false);
    const [imageToFrame, setImageToFrame] = useState<{ src: string; index: number } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLiking, setIsLiking] = useState(false);
    const [isCommenting, setIsCommenting] = useState(false);
    const [lightboxData, setLightboxData] = useState<{ photos: string[], index: number } | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const editFileInputRef = useRef<HTMLInputElement>(null);

    const [classes, setClasses] = useState<SchoolClass[]>([]);

    useEffect(() => {
        getClasses().then(setClasses).catch(() => {});
    }, []);

    const hasLiked = post.interactions.some(i => i.type === 'like' && i.userId === currentUser?.id);
    const likeCount = post.interactions.filter(i => i.type === 'like').length;
    const commentCount = post.interactions.filter(i => i.type === 'comment' || i.type === 'audio').length;
    const canManage = currentUser?.id === post.authorId || currentUser?.role === "admin" || currentUser?.role === "director";

    const getVisibilityInfo = () => {
        const rawClassIds = post.classIds && post.classIds.length > 0
            ? post.classIds
            : (post.classId ? [post.classId] : ["all"]);

        if (rawClassIds.includes("all") || rawClassIds.length === 0) {
            return { label: "Visível para Todos", isSpecific: false };
        }

        const classNames = rawClassIds
            .map(cid => classes.find(c => c.id === cid)?.name)
            .filter(Boolean);

        if (classNames.length > 0) {
            return { label: `Turma: ${classNames.join(", ")}`, isSpecific: true };
        }

        return { label: "Turma Específica", isSpecific: true };
    };

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const amount = scrollRef.current.clientWidth;
            scrollRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
        }
    };

    const startEdit = () => {
        setEditTitle(post.title || "");
        setEditContent(post.content || "");
        const initialPhotos = post.mediaUrls && post.mediaUrls.length > 0
            ? [...post.mediaUrls]
            : (post.mediaUrl && post.mediaUrl.trim() !== "" && post.mediaUrl !== "null" && !post.mediaUrl.includes("photo-1502086223501") ? [post.mediaUrl] : []);
        setEditPhotos(initialPhotos);
        setIsEditing(true);
    };

    const handleEditFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const availableSlots = 5 - editPhotos.length;
        if (availableSlots <= 0) return;

        const filesToProcess = files.slice(0, availableSlots);

        const promises = filesToProcess.map(file => {
            return new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        let width = img.width;
                        let height = img.height;
                        const MAX_DIMENSION = 1600;
                        if (width > height && width > MAX_DIMENSION) {
                            height = Math.round((height * MAX_DIMENSION) / width);
                            width = MAX_DIMENSION;
                        } else if (height > MAX_DIMENSION) {
                            width = Math.round((width * MAX_DIMENSION) / height);
                            height = MAX_DIMENSION;
                        }
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        if (ctx) {
                            ctx.imageSmoothingEnabled = true;
                            ctx.imageSmoothingQuality = "high";
                            ctx.drawImage(img, 0, 0, width, height);
                        }
                        resolve(canvas.toDataURL('image/jpeg', 0.85));
                    };
                    img.src = reader.result as string;
                };
                reader.readAsDataURL(file);
            });
        });

        const newPhotos = await Promise.all(promises);
        setEditPhotos(prev => [...prev, ...newPhotos].slice(0, 5));
        if (editFileInputRef.current) editFileInputRef.current.value = "";
    };

    const handleRemoveEditPhoto = (index: number) => {
        setEditPhotos(prev => prev.filter((_, i) => i !== index));
    };

    const handleLike = async () => {
        if (!currentUser || isLiking) return;

        setIsLiking(true);
        try {
            if (hasLiked) {
                const likeInteraction = post.interactions.find(i => i.type === 'like' && i.userId === currentUser.id);
                if (likeInteraction) {
                    await deletePegadaInteraction(likeInteraction.id);
                    if (onUpdated) onUpdated();
                }
            } else {
                const interaction = {
                    userId: currentUser.id,
                    userName: currentUser.name,
                    type: 'like'
                };
                await addPegadaInteraction(post.id, interaction as Omit<PegadaInteraction, 'id' | 'createdAt' | 'pegadaPostId'>);
                if (onUpdated) onUpdated();
            }
        } catch (error) {
            console.error("Erro ao curtir:", error);
        } finally {
            setIsLiking(false);
        }
    };

    const handleComment = async () => {
        if (!currentUser || !comment.trim() || isCommenting) return;

        setIsCommenting(true);
        try {
            const interaction = {
                userId: currentUser.id,
                userName: currentUser.name,
                type: 'comment',
                content: comment.trim()
            };
            await addPegadaInteraction(post.id, interaction as Omit<PegadaInteraction, 'id' | 'createdAt' | 'pegadaPostId'>);
            setComment("");
            if (onUpdated) onUpdated();
        } catch (error) {
            console.error("Erro ao comentar:", error);
        } finally {
            setIsCommenting(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Tem certeza que deseja excluir esta pegada?")) return;
        setIsLoading(true);
        try {
            await deletePegada(post.id);
            if (onDeleted) onDeleted();
        } catch (error) {
            console.error("Erro ao excluir pegada:", error);
            setIsLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!editContent.trim()) return;
        setIsLoading(true);
        try {
            await updatePegada(post.id, {
                title: editTitle.trim(),
                content: editContent.trim(),
                mediaUrls: editPhotos,
                mediaUrl: editPhotos.length > 0 ? editPhotos[0] : null,
            });
            setIsEditing(false);
            if (onUpdated) onUpdated();
        } catch (error) {
            console.error("Erro ao atualizar pegada:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="overflow-hidden border-slate-200 hover:shadow-md transition-shadow">
            <CardHeader className="p-4 flex flex-row items-center gap-3">
                <Avatar className="h-10 w-10 border border-slate-100">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorName || 'user'}`} />
                    <AvatarFallback>{(post.authorName || "US").substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-900">{post.authorName || "Usuário"}</h4>
                    <p className="text-[10px] text-slate-500">
                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ptBR })}
                    </p>
                </div>
                {canManage && !isEditing && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-slate-400">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={startEdit} disabled={isLoading}>
                                <Pencil className="h-4 w-4 mr-2" /> Editar Post
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleDelete} disabled={isLoading} className="text-red-600 focus:bg-red-50 focus:text-red-600">
                                <Trash className="h-4 w-4 mr-2" /> Excluir Post
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </CardHeader>

            <CardContent className="p-0">
                {isEditing ? (
                    <div className="p-4 space-y-4 bg-slate-50/50 border-y border-slate-100">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-600 uppercase">Título da Pegada</label>
                            <Input
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                placeholder="Título / Assunto da postagem"
                                className="font-bold bg-white border-slate-200 focus-visible:ring-indigo-500"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-600 uppercase">Mensagem</label>
                            <textarea
                                className="w-full min-h-[110px] p-3 text-slate-700 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none transition-all leading-relaxed text-sm"
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                placeholder="Conteúdo da postagem..."
                            />
                        </div>

                        {post.type !== "video" && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-semibold text-slate-600 uppercase">
                                        Fotos Anexadas ({editPhotos.length}/5)
                                    </label>
                                    {editPhotos.length < 5 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => editFileInputRef.current?.click()}
                                            className="text-xs text-indigo-600 hover:text-indigo-700 h-8 gap-1.5"
                                        >
                                            <Pencil className="h-3.5 w-3.5" /> Adicionar foto
                                        </Button>
                                    )}
                                </div>

                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    ref={editFileInputRef}
                                    onChange={handleEditFileChange}
                                    className="hidden"
                                />

                                {editPhotos.length > 0 && (
                                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 pt-1">
                                        {editPhotos.map((photo, index) => (
                                            <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={photo} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                                                <div className="absolute top-1 right-1 flex items-center gap-1 z-10">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setImageToFrame({ src: photo, index });
                                                            setFramingModalOpen(true);
                                                        }}
                                                        className="bg-black/70 hover:bg-indigo-600 text-white rounded-full p-1 shadow-md transition-all"
                                                        title="Ajustar Enquadramento / Recorte"
                                                    >
                                                        <Crop className="w-3 h-3" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveEditPhoto(index)}
                                                        className="absolute top-1 right-1 bg-black/70 hover:bg-black/90 text-white rounded-full p-1 shadow-md transition-all"
                                                        title="Remover foto"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                                <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                                                    {index + 1}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => { setIsEditing(false); }}
                                disabled={isLoading}
                            >
                                <X className="h-4 w-4 mr-1.5" /> Cancelar
                            </Button>
                            <Button 
                                size="sm" 
                                onClick={handleUpdate} 
                                disabled={isLoading || !editContent.trim()} 
                                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                                {isLoading ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" />}
                                Salvar Alterações
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        {post.type === "photo" && (
                            post.mediaUrls && post.mediaUrls.length > 0 ? (
                                <div className="relative aspect-[4/3] sm:aspect-[16/10] bg-slate-100 overflow-hidden group select-none">
                                    <div ref={scrollRef} className="flex w-full h-full overflow-x-auto snap-x snap-mandatory hide-scrollbar">
                                        {post.mediaUrls.map((url, i) => (
                                            <div 
                                                key={i} 
                                                onClick={() => setLightboxData({ photos: post.mediaUrls || [], index: i })}
                                                className="w-full h-full shrink-0 snap-center relative cursor-pointer"
                                            >
                                                <img src={url} alt={`${post.title} - foto ${i + 1}`} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
                                                    <span className="opacity-0 group-hover:opacity-100 bg-black/70 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-xs transition-opacity flex items-center gap-1.5 shadow-md">
                                                        <Maximize2 className="w-3.5 h-3.5" /> Ampliar foto
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {post.mediaUrls.length > 1 && (
                                        <>
                                            <Button
                                                variant="default"
                                                size="icon"
                                                className="absolute top-1/2 left-2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 hover:bg-black/75 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                                onClick={() => scroll('left')}
                                            >
                                                <ChevronLeft className="h-5 w-5" />
                                            </Button>
                                            <Button
                                                variant="default"
                                                size="icon"
                                                className="absolute top-1/2 right-2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 hover:bg-black/75 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                                onClick={() => scroll('right')}
                                            >
                                                <ChevronRight className="h-5 w-5" />
                                            </Button>
                                            <div className="absolute top-3 right-3 z-10 bg-black/60 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                                {post.mediaUrls.length} fotos
                                            </div>
                                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 bg-black/30 px-2.5 py-1 rounded-full backdrop-blur-sm">
                                                {post.mediaUrls.map((_, i) => (
                                                    <div key={i} className="h-2 w-2 rounded-full bg-white shadow-sm opacity-60" />
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : post.mediaUrl && post.mediaUrl.trim() !== "" && post.mediaUrl !== "null" && !post.mediaUrl.includes("photo-1502086223501") ? (
                                <div 
                                    onClick={() => setLightboxData({ photos: [post.mediaUrl!], index: 0 })}
                                    className="relative aspect-[4/3] sm:aspect-[16/10] bg-slate-100 cursor-pointer group"
                                >
                                    <img src={post.mediaUrl} alt={post.title} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
                                        <span className="opacity-0 group-hover:opacity-100 bg-black/70 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-xs transition-opacity flex items-center gap-1.5 shadow-md">
                                            <Maximize2 className="w-3.5 h-3.5" /> Ampliar foto
                                        </span>
                                    </div>
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
                            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                                {post.content}
                            </p>
                        </div>
                    </>
                )}
            </CardContent>

            <CardFooter className="p-4 pt-0 flex flex-col gap-4 border-t border-slate-50 mt-2">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleLike}
                            disabled={isLiking}
                            className={`flex items-center gap-1.5 transition-all ${!isLiking && !hasLiked ? 'active:scale-125' : ''} ${hasLiked ? 'text-emerald-600' : 'text-slate-500 hover:text-emerald-500'} ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isLiking ? <Loader2 className="h-5 w-5 animate-spin" /> : <TreeDeciduous className={`h-5 w-5 ${hasLiked ? 'fill-emerald-100' : ''}`} />}
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

                    {(() => {
                        const vis = getVisibilityInfo();
                        return (
                            <div className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                                !vis.isSpecific
                                    ? "bg-slate-100 text-slate-600 border-slate-200"
                                    : "bg-purple-100 text-purple-800 border-purple-200"
                            }`}>
                                {vis.label}
                            </div>
                        );
                    })()}
                </div>

                {showComments && (
                    <div className="w-full space-y-4 pt-2">
                        <div className="space-y-3">
                            {post.interactions.filter(i => i.type === 'comment' || i.type === 'audio').map((int) => (
                                <div key={int.id} className="flex gap-3 animate-in slide-in-from-bottom-2">
                                    <Avatar className="h-8 w-8 shrink-0">
                                        <AvatarFallback className="text-[10px] bg-slate-100 text-slate-600">{(int.userName || "U").substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 bg-slate-50 rounded-2xl p-3 text-xs overflow-hidden min-w-0">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold text-slate-900 truncate">{int.userName || "Usuário"}</span>
                                            <span className="text-[9px] text-slate-400 shrink-0">
                                                {formatDistanceToNow(new Date(int.createdAt), { locale: ptBR })}
                                            </span>
                                        </div>
                                        {int.type === 'comment' ? (
                                            <p className="text-slate-600 leading-normal break-words [overflow-wrap:anywhere] whitespace-pre-wrap">{int.content}</p>
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
                                value={comment || ""}
                                onChange={(e) => setComment(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleComment()}
                                className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 rounded-xl h-10 text-sm"
                            />
                            <div className="flex gap-1 shrink-0">
                                <Button size="icon" variant="ghost" className="h-9 w-9 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                                    <Mic className="h-4 w-4" />
                                </Button>
                                <Button size="icon" onClick={handleComment} disabled={!comment.trim() || isCommenting} className="h-9 w-9 bg-indigo-600 hover:bg-indigo-700 shadow-sm shrink-0">
                                    {isCommenting ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <Send className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </CardFooter>

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

            {/* Modal de Enquadramento Reutilizável na Edição */}
            <ImageFramingDialog
                open={framingModalOpen}
                onOpenChange={setFramingModalOpen}
                imageSrc={imageToFrame?.src || null}
                aspectRatio="4/3"
                title="Ajustar Enquadramento da Foto"
                onApply={(framedDataUrl) => {
                    if (imageToFrame && typeof imageToFrame.index === "number") {
                        setEditPhotos(prev => {
                            const copy = [...prev];
                            copy[imageToFrame.index] = framedDataUrl;
                            return copy;
                        });
                    }
                }}
            />
        </Card>
    );
}

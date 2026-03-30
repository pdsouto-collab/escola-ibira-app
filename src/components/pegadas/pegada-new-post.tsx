"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";
import { PegadaPost } from "@/types/pegada-post";
import { createPegada } from "@/services/pegada.service";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
    Image as ImageIcon,
    Video as VideoIcon,
    FileText as NoteIcon,
    X,
    Plus,
    Footprints,
    Upload
} from "lucide-react";
import { useRef } from "react";
import { BulkPortfolioDialog } from "@/components/portfolio/bulk-portfolio-dialog";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { getClasses } from "@/services/school-class.service";
import { getStudents } from "@/services/student.service";
import { SchoolClass } from "@/types/school-class";
import { Student } from "@/types/student";

interface PegadaNewPostProps {
    onSuccess?: () => void;
}

export function PegadaNewPost({ onSuccess }: PegadaNewPostProps = {}) {
    const { data: session } = useSession();
    const currentUser = session?.user as any;
    const [isExpanded, setIsExpanded] = useState(false);
    const [type, setType] = useState<'photo' | 'video' | 'note'>('photo');
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isBulkOpen, setIsBulkOpen] = useState(false);
     const [mediaUrls, setMediaUrls] = useState<string[]>([]);
    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        getClasses().then(setClasses).catch(console.error);
        getStudents().then(setStudents).catch(console.error);
    }, []);

    const canPost = currentUser?.role === "teacher" || currentUser?.role === "director" || currentUser?.role === "admin";

    if (!canPost) return null;

    const handlePost = async () => {
        if (!title.trim() || !content.trim()) return;

        if ((type === 'photo' || type === 'video') && mediaUrls.length === 0) {
            toast.warning(`É obrigatório anexar pelo menos um arquivo para o tipo ${type === 'photo' ? 'Experiência' : 'Vídeo'}.`);
            return;
        }

        setIsSubmitting(true);
        try {
            const newPost = {
                authorId: currentUser.id,
                authorName: currentUser.name,
                type,
                title: title.trim(),
                content: content.trim(),
                mediaUrl: mediaUrls.length > 0 ? mediaUrls[0] : undefined,
                mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
                tags: []
            };

            await createPegada(newPost as Partial<PegadaPost>);
            
            setTitle("");
            setContent("");
            setMediaUrls([]);
            setIsExpanded(false);
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Erro ao postar pegada:", error);
            toast.error("Ocorreu um erro ao postar. Tente novamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, fileType: 'photo' | 'video') => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        if (fileType === 'video') {
            const file = files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setMediaUrls([reader.result as string]);
                setType(fileType);
            };
            reader.readAsDataURL(file);
        } else {
            const promises = files.map(file => {
                return new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const img = new Image();
                        img.onload = () => {
                            const canvas = document.createElement('canvas');
                            let width = img.width;
                            let height = img.height;
                            const MAX_DIMENSION = 800; // Limit rendering size
                            if (width > height && width > MAX_DIMENSION) {
                                height *= MAX_DIMENSION / width;
                                width = MAX_DIMENSION;
                            } else if (height > MAX_DIMENSION) {
                                width *= MAX_DIMENSION / height;
                                height = MAX_DIMENSION;
                            }
                            canvas.width = width;
                            canvas.height = height;
                            const ctx = canvas.getContext('2d');
                            ctx?.drawImage(img, 0, 0, width, height);
                            // Quality 0.7 to significantly reduce Base64 string length
                            resolve(canvas.toDataURL('image/jpeg', 0.7));
                        };
                        img.src = event.target?.result as string;
                    };
                    reader.readAsDataURL(file);
                });
            });
            const results = await Promise.all(promises);
            setMediaUrls(prev => {
                const newUrls = type === 'photo' ? [...prev, ...results] : results;
                return newUrls.slice(0, 5); // Limita a 5 fotos no total
            });
            setType(fileType);
        }

        e.target.value = '';
    };

    return (
        <Card className="mb-8 border-indigo-100 bg-indigo-50/30 overflow-hidden">
            <CardContent className="p-4">
                {!isExpanded ? (
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                            {(currentUser?.name || "US").substring(0, 2).toUpperCase()}
                        </div>
                        <button
                            onClick={() => setIsExpanded(true)}
                            className="flex-1 text-left h-10 px-4 rounded-full bg-white border border-indigo-100 text-slate-400 text-sm hover:border-indigo-300 transition-colors flex items-center justify-between"
                        >
                            <span>O que os Ibiritos descobriram hoje?</span>
                            <Footprints className="h-4 w-4 text-indigo-400" />
                        </button>
                        <Button
                            onClick={() => setIsBulkOpen(true)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm gap-1.5"
                        >
                            <Plus className="h-4 w-4" /> Registrar Vivência
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                                <Footprints className="h-4 w-4" /> Nova Pegada
                            </h3>
                            <Button variant="ghost" size="icon" onClick={() => setIsExpanded(false)} className="h-8 w-8 text-slate-400 hover:text-red-500">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <Input
                            placeholder="Título da Descoberta"
                            value={title || ""}
                            onChange={(e) => setTitle(e.target.value)}
                            className="bg-white border-indigo-100 focus-visible:ring-indigo-500 font-bold"
                        />

                        <Textarea
                            placeholder="Compartilhe um momento, uma fala ou uma conquista..."
                            value={content || ""}
                            onChange={(e) => setContent(e.target.value)}
                            className="bg-white border-indigo-100 focus-visible:ring-indigo-500 min-h-[100px] resize-none"
                        />

                        {mediaUrls.length > 0 && (
                            <div className="space-y-2">
                                <div className={`relative w-full aspect-video rounded-xl overflow-hidden border border-indigo-100 bg-slate-50 flex ${type === 'photo' ? 'gap-2 overflow-x-auto snap-x snap-mandatory hide-scrollbar p-2' : ''}`}>
                                    {type === 'video' ? (
                                        <>
                                            <video src={mediaUrls[0]} className="w-full h-full object-cover shrink-0 snap-center" controls />
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-md"
                                                onClick={() => setMediaUrls([])}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            {mediaUrls.map((url, i) => (
                                                <div key={i} className="relative shrink-0 snap-center w-[85%] sm:w-[60%] h-full rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                                                    <img src={url} alt={`Preview ${i}`} className="w-full h-full object-cover bg-slate-100" />
                                                    <Button
                                                        variant="destructive"
                                                        size="icon"
                                                        className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-md opacity-90 transition-opacity hover:opacity-100"
                                                        onClick={() => setMediaUrls(prev => prev.filter((_, index) => index !== i))}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                            {mediaUrls.length < 5 && (
                                                <button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="shrink-0 snap-center w-[85%] sm:w-[60%] h-full flex flex-col items-center justify-center border-2 border-dashed border-indigo-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-400 transition-colors text-indigo-400 hover:text-indigo-500 bg-white shadow-sm"
                                                >
                                                    <Plus className="h-8 w-8 mb-2" />
                                                    <span className="text-sm font-medium">Adicionar foto</span>
                                                    <span className="text-xs opacity-70">({5 - mediaUrls.length} restantes)</span>
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                                {type === 'photo' && (
                                    <p className="text-[10px] text-slate-500 text-center font-medium animate-pulse">{mediaUrls.length} de 5 fotos prontas.{mediaUrls.length > 1 || mediaUrls.length < 5 ? ' Deslize para ver.' : ''}</p>
                                )}
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-2">
                            <div className="flex gap-2">
                                <input
                                    type="file"
                                    multiple
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'photo')}
                                />
                                <input
                                    type="file"
                                    ref={videoInputRef}
                                    className="hidden"
                                    accept="video/*"
                                    onChange={(e) => handleFileChange(e, 'video')}
                                />
                                <Button
                                    variant={type === 'photo' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`gap-1.5 rounded-full ${type === 'photo' ? 'bg-indigo-600' : 'bg-white border-indigo-100 text-indigo-600'}`}
                                >
                                    <ImageIcon className="h-3.5 w-3.5" /> Fotos
                                </Button>
                                <Button
                                    variant={type === 'video' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => videoInputRef.current?.click()}
                                    className={`gap-1.5 rounded-full ${type === 'video' ? 'bg-indigo-600' : 'bg-white border-indigo-100 text-indigo-600'}`}
                                >
                                    <VideoIcon className="h-3.5 w-3.5" /> Vídeo
                                </Button>
                                <Button
                                    variant={type === 'note' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => {
                                        setType('note');
                                        setMediaUrls([]);
                                    }}
                                    className={`gap-1.5 rounded-full ${type === 'note' ? 'bg-indigo-600' : 'bg-white border-indigo-100 text-indigo-600'}`}
                                >
                                    <NoteIcon className="h-3.5 w-3.5" /> Nota
                                </Button>
                            </div>

                            <Button onClick={handlePost} disabled={!title.trim() || !content.trim() || isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 shadow-md px-6">
                                {isSubmitting ? "Postando..." : "Postar"}
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>

            <BulkPortfolioDialog
                open={isBulkOpen}
                onOpenChange={setIsBulkOpen}
                date={new Date()}
                classId="all"
                classes={classes}
                students={students}
            />
        </Card>
    );
}

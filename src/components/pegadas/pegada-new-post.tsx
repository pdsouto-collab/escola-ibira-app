"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { PegadaPost } from "@/lib/data";
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

export function PegadaNewPost() {
    const { currentUser, addPegadaPost } = useAppStore();
    const [isExpanded, setIsExpanded] = useState(false);
    const [type, setType] = useState<'photo' | 'video' | 'note'>('photo');
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isBulkOpen, setIsBulkOpen] = useState(false);
    const [mediaUrls, setMediaUrls] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);

    const canPost = currentUser?.role === "teacher" || currentUser?.role === "director" || currentUser?.role === "admin";

    if (!canPost) return null;

    const handlePost = () => {
        if (!title.trim() || !content.trim()) return;

        const newPost: PegadaPost = {
            id: `p-${Date.now()}`,
            authorId: currentUser.id,
            authorName: currentUser.name,
            type,
            title: title.trim(),
            content: content.trim(),
            mediaUrl: mediaUrls.length > 0 ? mediaUrls[0] : (type === 'photo' ? "https://images.unsplash.com/photo-1502086223501-7ea244b05ffb?q=80&w=800&auto=format&fit=crop" : undefined),
            mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
            createdAt: new Date().toISOString(),
            interactions: []
        };

        addPegadaPost(newPost);
        setTitle("");
        setContent("");
        setMediaUrls([]);
        setIsExpanded(false);
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
            const newFiles = files.slice(0, 5); // Limita a 5 fotos
            const promises = newFiles.map(file => {
                return new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(file);
                });
            });
            const results = await Promise.all(promises);
            setMediaUrls(results);
            setType(fileType);
        }
    };

    return (
        <Card className="mb-8 border-indigo-100 bg-indigo-50/30 overflow-hidden">
            <CardContent className="p-4">
                {!isExpanded ? (
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                            {currentUser.name.substring(0, 2).toUpperCase()}
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
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="bg-white border-indigo-100 focus-visible:ring-indigo-500 font-bold"
                        />

                        <Textarea
                            placeholder="Compartilhe um momento, uma fala ou uma conquista..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="bg-white border-indigo-100 focus-visible:ring-indigo-500 min-h-[100px] resize-none"
                        />

                        {mediaUrls.length > 0 && (
                            <div className="space-y-2">
                                <div className={`relative w-full aspect-video rounded-xl overflow-hidden border border-indigo-100 bg-slate-50 flex ${mediaUrls.length > 1 ? 'gap-1 overflow-x-auto snap-x snap-mandatory hide-scrollbar' : ''}`}>
                                    {type === 'video' ? (
                                        <video src={mediaUrls[0]} className="w-full h-full object-cover shrink-0 snap-center" controls />
                                    ) : (
                                        mediaUrls.map((url, i) => (
                                            <img key={i} src={url} alt={`Preview ${i}`} className={`h-full object-cover shrink-0 snap-center ${mediaUrls.length > 1 ? 'w-[85%]' : 'w-full'}`} />
                                        ))
                                    )}
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2 h-8 w-8 rounded-full"
                                        onClick={() => setMediaUrls([])}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                {mediaUrls.length > 1 && type === 'photo' && (
                                    <p className="text-[10px] text-slate-500 text-center font-medium animate-pulse">{mediaUrls.length} fotos prontas. Deslize para ver.</p>
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

                            <Button onClick={handlePost} disabled={!title.trim() || !content.trim()} className="bg-indigo-600 hover:bg-indigo-700 shadow-md px-6">
                                Postar
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
            />
        </Card>
    );
}

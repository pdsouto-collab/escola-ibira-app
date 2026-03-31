"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { PortfolioEntry } from "@/types/portfolio-entry";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PortfolioEntryViewerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entry: PortfolioEntry | null;
}

export function PortfolioEntryViewer({ open, onOpenChange, entry }: PortfolioEntryViewerProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    if (!entry) return null;

    const images = entry.images && entry.images.length > 0
        ? entry.images
        : (entry.imageUrl ? [entry.imageUrl] : []);

    const handlePrevious = () => {
        setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    };

    const handleNext = () => {
        setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-slate-50 gap-0 border-none shadow-2xl">
                {/* Header Section */}
                <DialogHeader className="p-6 pb-4 bg-white border-b shrink-0 flex flex-row items-center justify-between">
                    <div>
                        <DialogTitle className="text-xl font-bold text-slate-900">
                            {entry.title}
                        </DialogTitle>
                        <div className="flex items-center gap-2 mt-2 text-indigo-600 font-medium">
                            <Calendar className="w-4 h-4" />
                            {entry.date.split("-").reverse().join("/")}
                        </div>
                    </div>
                </DialogHeader>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto flex flex-col md:flex-row">
                    {/* Left Side: Images */}
                    <div className="md:w-3/5 bg-black relative flex items-center justify-center min-h-[300px] group">
                        {images.length > 0 ? (
                            <>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={images[currentImageIndex]}
                                    alt={`Foto ${currentImageIndex + 1} de ${images.length}`}
                                    className="max-w-full max-h-full object-contain"
                                />
                                {images.length > 1 && (
                                    <>
                                        <button
                                            onClick={handlePrevious}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <ChevronLeft className="w-6 h-6" />
                                        </button>
                                        <button
                                            onClick={handleNext}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <ChevronRight className="w-6 h-6" />
                                        </button>
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-xs font-medium">
                                            {currentImageIndex + 1} / {images.length}
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <div className="text-white/50 flex flex-col items-center">
                                <span className="text-sm">Sem imagens registradas</span>
                            </div>
                        )}
                    </div>

                    {/* Right Side: Details */}
                    <div className="md:w-2/5 bg-white p-6 md:border-l border-slate-100 flex flex-col">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">
                            Observações do Aluno
                        </h3>
                        
                        <div className="flex-1 text-slate-700 text-base leading-relaxed whitespace-pre-wrap rounded-2xl bg-slate-50 p-6 border border-slate-100">
                            {entry.description || "Nenhuma observação registrada."}
                        </div>

                        {entry.tags && entry.tags.length > 0 && (
                            <div className="mt-8">
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                                    Tags / Áreas
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {entry.tags.map((tag, idx) => (
                                        <Badge key={idx} variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-100 font-semibold px-3 py-1">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

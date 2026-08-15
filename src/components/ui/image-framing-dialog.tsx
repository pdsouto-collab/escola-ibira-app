"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crop, Sparkles, Check, X, Move } from "lucide-react";

export interface ImageFramingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    imageSrc: string | null;
    onApply: (framedDataUrl: string) => void;
    aspectRatio?: "16/9" | "4/3" | "1/1";
    title?: string;
}

export function generateFramedImage(
    dataUrl: string,
    posX: number,
    posY: number,
    zoom: number,
    mode: "cover" | "contain",
    aspectRatio: "16/9" | "4/3" | "1/1" = "16/9"
): Promise<string> {
    return new Promise((resolve) => {
        const img = new window.Image();
        img.onload = () => {
            const canvas = document.createElement("canvas");
            let targetW = 1280;
            let targetH = 720;

            if (aspectRatio === "4/3") {
                targetW = 1200;
                targetH = 900;
            } else if (aspectRatio === "1/1") {
                targetW = 1000;
                targetH = 1000;
            }

            canvas.width = targetW;
            canvas.height = targetH;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
                resolve(dataUrl);
                return;
            }

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";

            if (mode === "contain") {
                // Background blur adaptativo
                ctx.filter = "blur(18px) brightness(0.7)";
                ctx.drawImage(img, 0, 0, targetW, targetH);
                ctx.filter = "none";

                // Centraliza a imagem sem cortes
                const scale = Math.min(targetW / img.width, targetH / img.height);
                const drawW = img.width * scale;
                const drawH = img.height * scale;
                const drawX = (targetW - drawW) / 2;
                const drawY = (targetH - drawH) / 2;
                ctx.drawImage(img, drawX, drawY, drawW, drawH);
            } else {
                // Modo Cover com recorte e enquadramento personalizado
                const targetRatio = targetW / targetH;
                let baseCropW = img.width;
                let baseCropH = img.height;

                if (img.width / img.height > targetRatio) {
                    baseCropH = img.height / zoom;
                    baseCropW = baseCropH * targetRatio;
                } else {
                    baseCropW = img.width / zoom;
                    baseCropH = baseCropW * targetRatio;
                }

                const maxOffsetX = Math.max(0, img.width - baseCropW);
                const maxOffsetY = Math.max(0, img.height - baseCropH);
                const cropX = maxOffsetX * (posX / 100);
                const cropY = maxOffsetY * (posY / 100);

                ctx.drawImage(img, cropX, cropY, baseCropW, baseCropH, 0, 0, targetW, targetH);
            }

            resolve(canvas.toDataURL("image/jpeg", 0.88));
        };
        img.onerror = () => resolve(dataUrl);
        img.src = dataUrl;
    });
}

export function ImageFramingDialog({
    open,
    onOpenChange,
    imageSrc,
    onApply,
    aspectRatio = "16/9",
    title = "Ajustar Enquadramento da Foto"
}: ImageFramingDialogProps) {
    const [framingMode, setFramingMode] = useState<"cover" | "contain">("cover");
    const [framingPosY, setFramingPosY] = useState<number>(50); // 0 (topo) a 100 (baixo)
    const [framingPosX, setFramingPosX] = useState<number>(50); // 0 (esq) a 100 (dir)
    const [framingZoom, setFramingZoom] = useState<number>(1.0); // 1.0 a 2.5
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (open) {
            setFramingMode("cover");
            setFramingPosY(50);
            setFramingPosX(50);
            setFramingZoom(1.0);
            setIsProcessing(false);
        }
    }, [open]);

    const handleConfirm = async () => {
        if (!imageSrc) return;
        setIsProcessing(true);
        try {
            const framed = await generateFramedImage(
                imageSrc,
                framingPosX,
                framingPosY,
                framingZoom,
                framingMode,
                aspectRatio
            );
            onApply(framed);
            onOpenChange(false);
        } catch (error) {
            console.error("Erro ao enquadrar foto:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    if (!imageSrc) return null;

    const aspectClass =
        aspectRatio === "4/3"
            ? "aspect-[4/3]"
            : aspectRatio === "1/1"
            ? "aspect-square"
            : "aspect-[16/9]";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl bg-white p-6 rounded-2xl shadow-xl z-[9999]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-slate-900 text-lg">
                        <Crop className="h-5 w-5 text-indigo-600" />
                        {title}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 pt-2">
                    {/* Container de Preview Interativo */}
                    <div className={`relative ${aspectClass} w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-200 shadow-inner select-none`}>
                        {framingMode === "contain" ? (
                            <>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={imageSrc} alt="" className="absolute inset-0 w-full h-full object-cover blur-md opacity-40" />
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={imageSrc} alt="Preview" className="relative w-full h-full object-contain" />
                            </>
                        ) : (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                                src={imageSrc}
                                alt="Preview"
                                style={{
                                    objectPosition: `${framingPosX}% ${framingPosY}%`,
                                    transform: `scale(${framingZoom})`,
                                    transformOrigin: `${framingPosX}% ${framingPosY}%`,
                                }}
                                className="w-full h-full object-cover transition-all duration-75"
                            />
                        )}
                    </div>

                    {/* Modos de Enquadramento */}
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setFramingMode("cover")}
                            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                                framingMode === "cover"
                                    ? "bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs"
                                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                            }`}
                        >
                            Enquadramento Personalizado
                        </button>
                        <button
                            type="button"
                            onClick={() => setFramingMode("contain")}
                            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                                framingMode === "contain"
                                    ? "bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs"
                                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                            }`}
                        >
                            Foto Completa (Sem Cortes)
                        </button>
                    </div>

                    {framingMode === "cover" && (
                        <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                            {/* Posição Vertical */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                                    <span>Posição Vertical (Cima / Baixo)</span>
                                    <div className="flex gap-1">
                                        <button
                                            type="button"
                                            onClick={() => setFramingPosY(15)}
                                            className="px-2 py-0.5 text-[10px] bg-white border border-slate-200 rounded hover:bg-slate-100 font-medium"
                                        >
                                            Topo (Rosto)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFramingPosY(50)}
                                            className="px-2 py-0.5 text-[10px] bg-white border border-slate-200 rounded hover:bg-slate-100 font-medium"
                                        >
                                            Centro
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFramingPosY(85)}
                                            className="px-2 py-0.5 text-[10px] bg-white border border-slate-200 rounded hover:bg-slate-100 font-medium"
                                        >
                                            Base
                                        </button>
                                    </div>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={framingPosY}
                                    onChange={(e) => setFramingPosY(Number(e.target.value))}
                                    className="w-full accent-indigo-600 cursor-pointer"
                                />
                            </div>

                            {/* Posição Horizontal */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                                    <span>Posição Horizontal (Esquerda / Direita)</span>
                                    <span className="text-[10px] text-slate-500 font-bold">{framingPosX}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={framingPosX}
                                    onChange={(e) => setFramingPosX(Number(e.target.value))}
                                    className="w-full accent-indigo-600 cursor-pointer"
                                />
                            </div>

                            {/* Zoom / Escala */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                                    <span>Zoom / Escala</span>
                                    <span className="text-[10px] text-slate-500 font-bold">{framingZoom.toFixed(1)}x</span>
                                </div>
                                <input
                                    type="range"
                                    min="1.0"
                                    max="2.5"
                                    step="0.05"
                                    value={framingZoom}
                                    onChange={(e) => setFramingZoom(Number(e.target.value))}
                                    className="w-full accent-indigo-600 cursor-pointer"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isProcessing}
                    >
                        <X className="h-4 w-4 mr-1.5" /> Cancelar
                    </Button>
                    <Button
                        type="button"
                        onClick={handleConfirm}
                        disabled={isProcessing}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 shadow-sm"
                    >
                        <Check className="h-4 w-4" /> Aplicar Enquadramento
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

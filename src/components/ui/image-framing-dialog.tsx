"use client";

import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crop, Sparkles, Check, X, Move, Info, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

export interface ImageFramingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    imageSrc: string | null;
    onApply: (framedDataUrl: string) => void;
    aspectRatio?: "16/9" | "4/3" | "1/1";
    title?: string;
}

export type FramingPreset = "cover" | "contain-blur" | "contain-clean";

export function generateFramedImage(
    dataUrl: string,
    posX: number,
    posY: number,
    zoom: number,
    mode: FramingPreset,
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

            if (mode === "contain-blur" || mode === "contain-clean") {
                if (mode === "contain-blur") {
                    // Fundo desfocado profissional da própria foto
                    ctx.filter = "blur(22px) brightness(0.65)";
                    ctx.drawImage(img, 0, 0, targetW, targetH);
                    ctx.filter = "none";
                } else {
                    // Fundo limpo e suave
                    ctx.fillStyle = "#0f172a";
                    ctx.fillRect(0, 0, targetW, targetH);
                }

                // Centraliza 100% da imagem sem corte
                const scale = Math.min(targetW / img.width, targetH / img.height) * Math.min(zoom, 1.0);
                const drawW = img.width * scale;
                const drawH = img.height * scale;
                const drawX = (targetW - drawW) / 2;
                const drawY = (targetH - drawH) / 2;

                // Sombra suave para destacar a foto sobre o fundo
                ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
                ctx.shadowBlur = 20;
                ctx.drawImage(img, drawX, drawY, drawW, drawH);
                ctx.shadowColor = "transparent";
            } else {
                // Modo Cover com recorte customizado ou fundo estendido se zoom < 1
                if (zoom < 1.0) {
                    ctx.filter = "blur(18px) brightness(0.6)";
                    ctx.drawImage(img, 0, 0, targetW, targetH);
                    ctx.filter = "none";

                    const scale = Math.min(targetW / img.width, targetH / img.height) * zoom;
                    const drawW = img.width * scale;
                    const drawH = img.height * scale;
                    const drawX = (targetW - drawW) * (posX / 100);
                    const drawY = (targetH - drawH) * (posY / 100);

                    ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
                    ctx.shadowBlur = 15;
                    ctx.drawImage(img, drawX, drawY, drawW, drawH);
                    ctx.shadowColor = "transparent";
                } else {
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
            }

            resolve(canvas.toDataURL("image/jpeg", 0.90));
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
    const [framingMode, setFramingMode] = useState<FramingPreset>("cover");
    const [framingPosY, setFramingPosY] = useState<number>(50); // 0 (topo) a 100 (baixo)
    const [framingPosX, setFramingPosX] = useState<number>(50); // 0 (esq) a 100 (dir)
    const [framingZoom, setFramingZoom] = useState<number>(1.0); // 0.5 a 3.0
    const [isVerticalImage, setIsVerticalImage] = useState<boolean>(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef<{ x: number; y: number; posX: number; posY: number } | null>(null);

    useEffect(() => {
        if (open && imageSrc) {
            const img = new window.Image();
            img.onload = () => {
                const isVertical = img.height > img.width * 1.05;
                setIsVerticalImage(isVertical);
                if (isVertical) {
                    setFramingMode("contain-blur");
                } else {
                    setFramingMode("cover");
                }
            };
            img.src = imageSrc;

            setFramingPosY(50);
            setFramingPosX(50);
            setFramingZoom(1.0);
            setIsProcessing(false);
        }
    }, [open, imageSrc]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (framingMode !== "cover") return;
        setIsDragging(true);
        dragStartRef.current = {
            x: e.clientX,
            y: e.clientY,
            posX: framingPosX,
            posY: framingPosY
        };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !dragStartRef.current) return;
        const deltaX = (e.clientX - dragStartRef.current.x) * 0.2;
        const deltaY = (e.clientY - dragStartRef.current.y) * 0.2;

        setFramingPosX(Math.min(100, Math.max(0, dragStartRef.current.posX - deltaX)));
        setFramingPosY(Math.min(100, Math.max(0, dragStartRef.current.posY - deltaY)));
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        dragStartRef.current = null;
    };

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
                    <DialogTitle className="flex items-center justify-between text-slate-900 text-lg">
                        <div className="flex items-center gap-2">
                            <Crop className="h-5 w-5 text-indigo-600" />
                            {title}
                        </div>
                        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full">
                            Proporção {aspectRatio}
                        </span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 pt-2">
                    {/* Alerta de foto vertical */}
                    {isVerticalImage && (
                        <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
                            <Sparkles className="h-4 w-4 text-amber-600 shrink-0" />
                            <span>
                                <strong>Foto vertical detectada!</strong> O modo <strong>"Sem Cortes (Fundo Desfocado)"</strong> preserva 100% das pessoas e rostos sem cortar cabeças.
                            </span>
                        </div>
                    )}

                    {/* Container de Preview Interativo */}
                    <div
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        className={`relative ${aspectClass} w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-200 shadow-inner select-none ${framingMode === "cover" ? "cursor-grab active:cursor-grabbing" : ""}`}
                    >
                        {framingMode === "contain-blur" ? (
                            <>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={imageSrc} alt="" className="absolute inset-0 w-full h-full object-cover blur-xl opacity-60 scale-110" />
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={imageSrc} alt="Preview" className="relative w-full h-full object-contain drop-shadow-2xl" />
                            </>
                        ) : framingMode === "contain-clean" ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={imageSrc} alt="Preview" className="relative w-full h-full object-contain bg-slate-900 drop-shadow-md" />
                        ) : (
                            <>
                                {framingZoom < 1.0 && (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img src={imageSrc} alt="" className="absolute inset-0 w-full h-full object-cover blur-lg opacity-50" />
                                )}
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={imageSrc}
                                    alt="Preview"
                                    style={{
                                        objectPosition: `${framingPosX}% ${framingPosY}%`,
                                        transform: `scale(${framingZoom})`,
                                        transformOrigin: `${framingPosX}% ${framingPosY}%`,
                                    }}
                                    className={`w-full h-full ${framingZoom < 1.0 ? 'object-contain' : 'object-cover'} transition-all duration-75`}
                                />
                            </>
                        )}
                        {framingMode === "cover" && (
                            <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-1 rounded-md pointer-events-none flex items-center gap-1">
                                <Move className="w-3 h-3" /> Arraste para mover
                            </div>
                        )}
                    </div>

                    {/* Modos de Enquadramento */}
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            type="button"
                            onClick={() => setFramingMode("cover")}
                            className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all text-center flex flex-col items-center justify-center gap-0.5 ${
                                framingMode === "cover"
                                    ? "bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs"
                                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                            }`}
                        >
                            <span>Preenchimento Total</span>
                            <span className="text-[10px] font-normal text-slate-500">Pan & Zoom</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setFramingMode("contain-blur")}
                            className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all text-center flex flex-col items-center justify-center gap-0.5 ${
                                framingMode === "contain-blur"
                                    ? "bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs"
                                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                            }`}
                        >
                            <span>Sem Cortes (Desfoque)</span>
                            <span className="text-[10px] font-normal text-emerald-600 font-semibold">100% Visível</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setFramingMode("contain-clean")}
                            className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all text-center flex flex-col items-center justify-center gap-0.5 ${
                                framingMode === "contain-clean"
                                    ? "bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs"
                                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                            }`}
                        >
                            <span>Sem Cortes (Neutro)</span>
                            <span className="text-[10px] font-normal text-slate-500">Fundo Escuro</span>
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
                                            onClick={() => setFramingPosY(10)}
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
                                            onClick={() => setFramingPosY(90)}
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

                            {/* Zoom / Escala Estendido de 0.5x a 3.0x */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                                    <span>Zoom / Escala (Zoom Out para evitar cortes)</span>
                                    <span className="text-[10px] text-slate-500 font-bold">{framingZoom.toFixed(2)}x</span>
                                </div>
                                <input
                                    type="range"
                                    min="0.5"
                                    max="3.0"
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

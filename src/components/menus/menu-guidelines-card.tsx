"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Apple, Info, Edit, CheckCircle2, Sprout, AlertCircle, Cake } from "lucide-react";
import { MenuGuidelinesData, DEFAULT_GUIDELINES } from "./menu-print-dialog";
import { toast } from "sonner";

interface MenuGuidelinesCardProps {
    guidelines: MenuGuidelinesData;
    onUpdateGuidelines?: (newGuidelines: MenuGuidelinesData) => void;
    canEdit?: boolean;
}

export function MenuGuidelinesCard({
    guidelines = DEFAULT_GUIDELINES,
    onUpdateGuidelines,
    canEdit = false
}: MenuGuidelinesCardProps) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [formData, setFormData] = useState<MenuGuidelinesData>({ ...guidelines });

    const handleOpenEdit = () => {
        setFormData({ ...guidelines });
        setIsEditOpen(true);
    };

    const handleSave = () => {
        if (onUpdateGuidelines) {
            onUpdateGuidelines(formData);
            toast.success("Diretrizes nutricionais atualizadas com sucesso!");
        }
        setIsEditOpen(false);
    };

    return (
        <>
            <Card className="border-emerald-100 bg-linear-to-br from-emerald-50/60 via-white to-amber-50/30 shadow-xs overflow-hidden">
                <CardHeader className="p-4 sm:p-5 pb-3 border-b border-emerald-100/70 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
                            <Apple className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-base sm:text-lg font-bold text-emerald-950 flex items-center gap-2">
                                Pontos Importantes do Nosso Cardápio
                                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                    Compromisso Nutricional
                                </span>
                            </CardTitle>
                            <p className="text-xs text-slate-500 font-medium">
                                Diretrizes e princípios de alimentação saudável e equilibrada da Escola Trilha Ibirá.
                            </p>
                        </div>
                    </div>

                    {canEdit && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleOpenEdit}
                            className="text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50 gap-1.5"
                        >
                            <Edit className="h-3.5 w-3.5" />
                            Editar Diretrizes
                        </Button>
                    )}
                </CardHeader>

                <CardContent className="p-4 sm:p-5 space-y-4 text-sm">
                    {/* Intro */}
                    <div className="bg-white/80 border border-emerald-100/60 rounded-xl p-3.5 text-slate-700 leading-relaxed font-medium whitespace-pre-line break-words">
                        {guidelines.intro}
                    </div>

                    {/* Bullet Points Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-2 bg-white/70 border border-emerald-100/50 rounded-xl p-3.5">
                            <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                Pilares de Preparo
                            </h4>
                            <ul className="space-y-2 text-xs text-slate-700">
                                {guidelines.points.map((point, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                        <span className="whitespace-pre-line break-words">{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Special Notes */}
                        <div className="space-y-2.5 bg-white/70 border border-emerald-100/50 rounded-xl p-3.5 flex flex-col justify-between">
                            <div className="space-y-2 text-xs text-slate-700">
                                <div className="flex items-start gap-2 bg-amber-50/70 border border-amber-200/50 rounded-lg p-2.5 text-amber-900">
                                    <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                                    <span className="whitespace-pre-line break-words">{guidelines.glutenNote}</span>
                                </div>

                                <div className="flex items-start gap-2 bg-emerald-50/70 border border-emerald-200/50 rounded-lg p-2.5 text-emerald-900">
                                    <Sprout className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <span className="whitespace-pre-line break-words">{guidelines.farmNote}</span>
                                </div>

                                {guidelines.birthdayNote && (
                                    <div className="flex items-start gap-2 bg-rose-50/70 border border-rose-200/60 rounded-lg p-2.5 text-rose-900">
                                        <Cake className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                                        <div>
                                            <span className="font-bold text-rose-900 block text-[11px] uppercase mb-0.5">Aniversariantes do Mês</span>
                                            <span className="whitespace-pre-line break-words text-rose-800 text-xs">{guidelines.birthdayNote}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <p className="text-[11px] italic text-slate-500 border-t border-slate-100 pt-2 whitespace-pre-line break-words">
                                {guidelines.footerNote}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-lg max-h-[90vh] flex flex-col p-0 overflow-hidden">
                    <DialogHeader className="p-5 border-b">
                        <DialogTitle className="flex items-center gap-2">
                            <Apple className="h-5 w-5 text-emerald-600" />
                            Editar Diretrizes do Cardápio
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-5 space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-600">Texto Introdutório</Label>
                            <Textarea
                                value={formData.intro}
                                onChange={e => setFormData({ ...formData, intro: e.target.value })}
                                rows={3}
                                className="text-xs"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-600">Pontos Importantes (um por linha)</Label>
                            <Textarea
                                value={formData.points.join("\n")}
                                onChange={e => setFormData({ ...formData, points: e.target.value.split("\n").filter(Boolean) })}
                                rows={4}
                                className="text-xs font-mono"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-600">Observação sobre Glúten</Label>
                            <Textarea
                                value={formData.glutenNote}
                                onChange={e => setFormData({ ...formData, glutenNote: e.target.value })}
                                rows={2}
                                className="text-xs"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-600">Nota sobre Cultivo na Escola (•)</Label>
                            <Textarea
                                value={formData.farmNote}
                                onChange={e => setFormData({ ...formData, farmNote: e.target.value })}
                                rows={2}
                                className="text-xs"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                                <Cake className="h-3.5 w-3.5" /> Aniversariantes do Mês (Comemorações / Bolo)
                            </Label>
                            <Textarea
                                value={formData.birthdayNote || ""}
                                onChange={e => setFormData({ ...formData, birthdayNote: e.target.value })}
                                rows={3}
                                placeholder="Descreva os aniversariantes do mês e comemorações com bolo..."
                                className="text-xs border-rose-200 focus:border-rose-400"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-600">Aviso sobre Alterações de Cardápio</Label>
                            <Textarea
                                value={formData.footerNote}
                                onChange={e => setFormData({ ...formData, footerNote: e.target.value })}
                                rows={2}
                                className="text-xs"
                            />
                        </div>
                    </div>

                    <DialogFooter className="p-4 border-t bg-slate-50 flex items-center justify-between">
                        <Button variant="ghost" onClick={() => setFormData({ ...DEFAULT_GUIDELINES })}>
                            Restaurar Padrão
                        </Button>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                                Cancelar
                            </Button>
                            <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                Salvar Diretrizes
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

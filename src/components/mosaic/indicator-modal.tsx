"use client";

import { Indicator, Status } from "@/lib/data";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Clock, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface IndicatorModalProps {
    indicator: Indicator | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdateStatus: (indicatorId: string, newStatus: Status) => void;
}

const statusOptions: { value: Status; label: string; icon: React.ElementType; color: string }[] = [
    { value: "not-started", label: "Não Iniciado", icon: Circle, color: "text-slate-400" },
    { value: "in-progress", label: "Em Progresso", icon: Clock, color: "text-amber-600" },
    { value: "achieved", label: "Alcançado", icon: CheckCircle2, color: "text-green-600" },
];

export function IndicatorModal({ indicator, open, onOpenChange, onUpdateStatus }: IndicatorModalProps) {
    if (!indicator) return null;

    const [selectedStatus, setSelectedStatus] = useState<Status>(indicator.status);

    // Reset status when modal opens/changes indicator
    if (open && selectedStatus !== indicator.status) {
        // This is a simple implementation, ideally use useEffect or key to reset
    }

    const handleSave = () => {
        onUpdateStatus(indicator.id, selectedStatus);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{indicator.label}</DialogTitle>
                    <DialogDescription>
                        Atualize o status e adicione evidências do desenvolvimento.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Status Atual</label>
                        <div className="grid grid-cols-3 gap-2">
                            {statusOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setSelectedStatus(option.value)}
                                    className={cn(
                                        "flex flex-col items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all hover:bg-slate-50",
                                        selectedStatus === option.value
                                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                                            : "border-slate-200"
                                    )}
                                >
                                    <option.icon className={cn("h-6 w-6", option.color)} />
                                    <span className="text-xs font-medium">{option.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Evidências</label>
                        <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer">
                            <Upload className="h-8 w-8 mb-2 text-slate-300" />
                            <span className="text-sm">Clique para adicionar fotos ou vídeos</span>
                        </div>
                        {indicator.evidenceCount && indicator.evidenceCount > 0 && (
                            <p className="text-xs text-slate-500 mt-1">
                                {indicator.evidenceCount} evidências já registradas.
                            </p>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSave}>Salvar Alterações</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

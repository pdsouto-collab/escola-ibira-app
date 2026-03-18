"use client";

import { useEffect, useState } from "react";
import { ScheduleItem, Project } from "@/lib/data";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface ScheduleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item?: ScheduleItem | null;
    onSave: (item: ScheduleItem) => void;
}

const emptyItem: Omit<ScheduleItem, "id"> = {
    time: "08:00",
    title: "",
    type: "activity",
    description: "",
    projectId: undefined
};

export function ScheduleDialog({ open, onOpenChange, item, onSave }: ScheduleDialogProps) {
    const { projects } = useAppStore();
    const [formData, setFormData] = useState<Partial<ScheduleItem>>(item ? { ...item } : emptyItem);

    // Ensure we reset form when item changes and dialog opens
    useEffect(() => {
        if (open) {
            setFormData(item ? { ...item } : emptyItem);
        }
    }, [open, item]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: item?.id || crypto.randomUUID(),
            ...formData
        } as ScheduleItem);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{item ? "Editar Item da Agenda" : "Adicionar Novo Item"}</DialogTitle>
                    <DialogDescription>
                        Defina o horário e detalhes da atividade.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="time" className="text-right">
                                Horário
                            </Label>
                            <Input
                                id="time"
                                type="time"
                                value={formData.time || ""}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="endTime" className="text-right">
                                Fim
                            </Label>
                            <Input
                                id="endTime"
                                type="time"
                                value={formData.endTime || ""}
                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">
                                Título
                            </Label>
                            <Input
                                id="title"
                                value={formData.title || ""}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="type" className="text-right">
                                Tipo
                            </Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value: "activity" | "meal" | "care" | "project") => setFormData({ ...formData, type: value })}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="activity">Atividade</SelectItem>
                                    <SelectItem value="meal">Alimentação</SelectItem>
                                    <SelectItem value="care">Cuidado/Higiene</SelectItem>
                                    <SelectItem value="project">Sessão de Projeto</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Project / Learning Plan Selector - only show for Project Session type */}
                        {formData.type === "project" && (
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="projectId" className="text-right text-indigo-600 font-semibold">
                                    Projeto
                                </Label>
                                <Select
                                    value={formData.projectId || "none"}
                                    onValueChange={(value: string) => setFormData({ ...formData, projectId: value === "none" ? undefined : value })}
                                >
                                    <SelectTrigger className="col-span-3 border-indigo-200 focus:border-indigo-500 bg-indigo-50/30">
                                        <SelectValue placeholder="Vincular a um projeto" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Nenhum (Atividade Avulsa)</SelectItem>
                                        {projects.map((p: Project) => (
                                            <SelectItem key={p.id} value={p.id}>
                                                {p.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">
                                Descrição
                            </Label>
                            <Textarea
                                id="description"
                                value={formData.description || ""}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Salvar</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

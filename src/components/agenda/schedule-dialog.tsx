"use client";

import { useEffect, useState } from "react";
import { ScheduleItem } from "@/lib/data";
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
    time: "",
    title: "",
    type: "activity",
    description: ""
};

export function ScheduleDialog({ open, onOpenChange, item, onSave }: ScheduleDialogProps) {
    const [formData, setFormData] = useState<Partial<ScheduleItem>>(item ? { ...item } : emptyItem);

    // useEffect removed - we rely on the parent changing the 'key' prop to reset state

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
                                onValueChange={(value: "activity" | "meal" | "care") => setFormData({ ...formData, type: value })}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="activity">Atividade</SelectItem>
                                    <SelectItem value="meal">Alimentação</SelectItem>
                                    <SelectItem value="care">Cuidado/Higiene</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
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

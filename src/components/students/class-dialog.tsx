"use client";

import { useState } from "react";
import { SchoolClass } from "@/lib/data";
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

interface ClassDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    schoolClass?: SchoolClass | null;
    onSave: (schoolClass: SchoolClass) => void;
}

const emptyClass: Omit<SchoolClass, "id"> = {
    name: "",
    description: "",
};

import { useAppStore } from "@/lib/store";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function ClassDialog({ open, onOpenChange, schoolClass, onSave }: ClassDialogProps) {
    const { users } = useAppStore();
    const teachers = users.filter(u => u.role === "teacher");
    const [formData, setFormData] = useState<Partial<SchoolClass>>(schoolClass ? { ...schoolClass } : emptyClass);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: schoolClass?.id || formData.name?.toLowerCase().replace(/\s+/g, '-') || crypto.randomUUID(),
            ...formData
        } as SchoolClass);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{schoolClass ? "Editar Turma" : "Adicionar Nova Turma"}</DialogTitle>
                    <DialogDescription>
                        Preencha as informações da turma abaixo.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="className" className="text-right">
                                Nome
                            </Label>
                            <Input
                                id="className"
                                value={formData.name || ""}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="classDesc" className="text-right">
                                Descrição
                            </Label>
                            <Input
                                id="classDesc"
                                value={formData.description || ""}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="teacher" className="text-right">
                                Professor(a)
                            </Label>
                            <div className="col-span-3">
                                <Select
                                    value={formData.teacherId || "none"}
                                    onValueChange={(value) => setFormData({ ...formData, teacherId: value === "none" ? undefined : value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione um professor..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">-- Sem Professor --</SelectItem>
                                        {teachers.map(teacher => (
                                            <SelectItem key={teacher.id} value={teacher.id}>
                                                {teacher.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
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

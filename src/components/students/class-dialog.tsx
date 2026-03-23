"use client";

import { useState } from "react";
import { SchoolClass } from "@/types/school-class";
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
import { Loader2 } from "lucide-react";

interface ClassDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    schoolClass?: SchoolClass | null;
    onSave: (schoolClass: SchoolClass) => void;
    isLoading?: boolean;
}

const emptyClass: Partial<SchoolClass> = {
    name: "",
    description: "",
};

import { getUsers } from "@/services/user.service";
import { User } from "@/types/user";
import { useEffect } from "react";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function ClassDialog({ open, onOpenChange, schoolClass, onSave, isLoading }: ClassDialogProps) {
    const [teachers, setTeachers] = useState<User[]>([]);
    const [assistants, setAssistants] = useState<User[]>([]);
    const [formData, setFormData] = useState<Partial<SchoolClass>>(schoolClass ? { ...schoolClass } : emptyClass);

    useEffect(() => {
        if (open) {
            setFormData(schoolClass ? { ...schoolClass } : emptyClass);
            getUsers().then(users => {
                setTeachers(users.filter(u => u.role === "teacher"));
                setAssistants(users.filter(u => u.role === "assistant"));
            });
        }
    }, [open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: schoolClass?.id || formData.name?.toLowerCase().replace(/\s+/g, '-') || crypto.randomUUID(),
            ...formData
        } as SchoolClass);
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
                            <div className="col-span-3 space-y-1">
                                <Input
                                    id="className"
                                    value={formData.name || ""}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    disabled={!!schoolClass}
                                    required
                                />
                                {!!schoolClass && (
                                    <p className="text-xs text-slate-400">O nome da turma não pode ser alterado.</p>
                                )}
                            </div>
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
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="assistant" className="text-right whitespace-nowrap">
                                Auxiliar Pedagógico(a)
                            </Label>
                            <div className="col-span-3">
                                <Select
                                    value={formData.assistantId || "none"}
                                    onValueChange={(value) => setFormData({ ...formData, assistantId: value === "none" ? undefined : value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione um auxiliar..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">-- Sem Auxiliar --</SelectItem>
                                        {assistants.map(assistant => (
                                            <SelectItem key={assistant.id} value={assistant.id}>
                                                {assistant.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                "Salvar"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

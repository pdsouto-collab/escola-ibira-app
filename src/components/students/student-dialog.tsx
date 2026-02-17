"use client";

import { useEffect, useState } from "react";
import { Student } from "@/lib/data";
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

interface StudentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    student?: Student | null;
    onSave: (student: Student) => void;
}

const emptyStudent: Omit<Student, "id"> = {
    name: "",
    age: 0,
    status: "presente",
    parentName: "",
    classId: "",
    photo: ""
};

export function StudentDialog({ open, onOpenChange, student, onSave }: StudentDialogProps) {
    const { classes } = useAppStore();
    const [formData, setFormData] = useState<Partial<Student>>(student ? { ...student } : emptyStudent);

    // useEffect removed - we rely on the parent changing the 'key' prop to reset state

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Validation could go here
        onSave({
            id: student?.id || crypto.randomUUID(),
            ...formData
        } as Student);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{student ? "Editar Aluno" : "Adicionar Novo Aluno"}</DialogTitle>
                    <DialogDescription>
                        Preencha as informações do aluno abaixo. Clique em salvar quando terminar.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Nome
                            </Label>
                            <Input
                                id="name"
                                value={formData.name || ""}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="age" className="text-right">
                                Idade
                            </Label>
                            <Input
                                id="age"
                                type="number"
                                value={formData.age || ""}
                                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="class" className="text-right">
                                Turma
                            </Label>
                            <Select
                                value={formData.classId}
                                onValueChange={(value) => setFormData({ ...formData, classId: value })}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Selecione a turma" />
                                </SelectTrigger>
                                <SelectContent>
                                    {classes.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="parent" className="text-right">
                                Responsável
                            </Label>
                            <Input
                                id="parent"
                                value={formData.parentName || ""}
                                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">
                                Status
                            </Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value: "presente" | "ausente") => setFormData({ ...formData, status: value })}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Selecione o status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="presente">Presente</SelectItem>
                                    <SelectItem value="ausente">Ausente</SelectItem>
                                </SelectContent>
                            </Select>
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

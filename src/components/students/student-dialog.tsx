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

    // Add image preview state
    const [imagePreview, setImagePreview] = useState<string>(student?.photo || "");

    useEffect(() => {
        if (student) {
            setFormData({ ...student });
            setImagePreview(student.photo || "");
        } else {
            setFormData(emptyStudent);
            setImagePreview("");
        }
    }, [student, open]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setImagePreview(base64String);
                setFormData(prev => ({ ...prev, photo: base64String }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value;
        setImagePreview(url);
        setFormData(prev => ({ ...prev, photo: url }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: student?.id || crypto.randomUUID(),
            ...formData,
            photo: imagePreview // Ensure photo is saved from preview state if set
        } as Student);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle>{student ? "Editar Aluno" : "Adicionar Novo Aluno"}</DialogTitle>
                    <DialogDescription>
                        Preencha as informações do aluno abaixo.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        {/* Image Upload Section */}
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label className="text-right pt-2">
                                Foto
                            </Label>
                            <div className="col-span-3 space-y-4">
                                <div className="flex items-center gap-4">
                                    {imagePreview ? (
                                        <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-slate-200">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-300">
                                            Sem foto
                                        </div>
                                    )}
                                    <div className="flex-1 space-y-2">
                                        <Input
                                            type="text"
                                            placeholder="URL da imagem (opcional)"
                                            value={formData.photo || ""}
                                            onChange={handleImageUrlChange}
                                        />
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-slate-500">ou</span>
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="text-sm file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

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

"use client";

import { useState } from "react";
import { User } from "@/types/user";
import { UserRole } from "@/types/user-role";
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

interface UserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user?: User | null;
    onSave: (user: User) => void;
    // Optional: lock role selection (e.g. when creating teachers only)
    fixedRole?: UserRole;
}

const emptyUser: Omit<User, "id"> = {
    name: "",
    email: "",
    role: "teacher", // Default
    avatar: "https://github.com/shadcn.png",
    status: "active",
};

export function UserDialog({ open, onOpenChange, user, onSave, fixedRole }: UserDialogProps) {
    const [formData, setFormData] = useState<Partial<User>>(user ? { ...user } : { ...emptyUser, role: fixedRole || "teacher" });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            role: fixedRole || formData.role, // Ensure role is respected
        } as User);
        onOpenChange(false);
        // Reset form for next use if adding
        if (!user) setFormData({ ...emptyUser, role: fixedRole || "teacher" });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{user ? "Editar Usuário" : "Adicionar Usuário"}</DialogTitle>
                    <DialogDescription>
                        Preencha as informações do usuário abaixo.
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
                            <Label htmlFor="email" className="text-right">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email || ""}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="col-span-3"
                                required
                            />
                        </div>

                        {!fixedRole && (
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="role" className="text-right">
                                    Função
                                </Label>
                                <Select
                                    value={formData.role}
                                    onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Selecione a função" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="director">Diretor(a)</SelectItem>
                                        <SelectItem value="admin">Administrador(a)</SelectItem>
                                        <SelectItem value="teacher">Professor(a)</SelectItem>
                                        <SelectItem value="guardian">Responsável</SelectItem>
                                        <SelectItem value="nutritionist">Nutricionista</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="submit">Salvar</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

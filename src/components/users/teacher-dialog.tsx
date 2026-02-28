"use client";

import { useState, useEffect } from "react";
import { User, SchoolClass } from "@/lib/data";
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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserCircle, Briefcase, Lock, BookOpen, GraduationCap } from "lucide-react";

interface TeacherDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user?: User | null;
    onSave: (user: User) => void;
}

const emptyTeacher: Omit<User, "id"> = {
    name: "",
    email: "",
    role: "teacher",
    avatar: "https://github.com/shadcn.png",
    status: "active",
    cpf: "",
    phone: "",
    birthDate: "",
    address: "",
    hiringDate: "",
    education: "",
    specialization: [],
    assignedClassIds: [],
};

export function TeacherDialog({ open, onOpenChange, user, onSave }: TeacherDialogProps) {
    const { classes, students } = useAppStore();
    const [formData, setFormData] = useState<Partial<User>>(emptyTeacher);
    const [activeTab, setActiveTab] = useState("personal");

    useEffect(() => {
        if (user) {
            setFormData({ ...user });
        } else {
            setFormData(emptyTeacher);
        }
    }, [user, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: user?.id || crypto.randomUUID(),
            ...formData,
            role: "teacher",
            avatar: formData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name || 'teacher'}`,
        } as User);
        onOpenChange(false);
    };

    const toggleClass = (classId: string) => {
        const currentIds = formData.assignedClassIds || [];
        if (currentIds.includes(classId)) {
            setFormData({ ...formData, assignedClassIds: currentIds.filter(id => id !== classId) });
        } else {
            setFormData({ ...formData, assignedClassIds: [...currentIds, classId] });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0 overflow-hidden bg-slate-50">
                <DialogHeader className="p-6 bg-white border-b">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 rounded-lg">
                            <GraduationCap className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold text-slate-900">
                                {user ? "Editar Professor(a)" : "Novo Registro de Docente"}
                            </DialogTitle>
                            <DialogDescription>
                                Gestão completa do perfil acadêmico e administrativo.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                        <div className="px-6 py-2 bg-white border-b">
                            <TabsList className="grid w-full grid-cols-3 bg-slate-100/50">
                                <TabsTrigger value="personal" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                    <UserCircle className="w-4 h-4" /> Pessoal
                                </TabsTrigger>
                                <TabsTrigger value="professional" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                    <Briefcase className="w-4 h-4" /> Profissional
                                </TabsTrigger>
                                <TabsTrigger value="classes" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                    <BookOpen className="w-4 h-4" /> Turmas
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <ScrollArea className="flex-1 p-6">
                            <TabsContent value="personal" className="mt-0 space-y-4">
                                <section className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-sm font-semibold">Nome Completo</Label>
                                            <Input
                                                id="name"
                                                value={formData.name || ""}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                required
                                                placeholder="Ex: Maria Oliveira"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-sm font-semibold text-indigo-600">E-mail Institucional</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={formData.email || ""}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                required
                                                placeholder="maria.prof@escolaibira.com.br"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="cpf" className="text-sm font-semibold uppercase text-slate-500">CPF</Label>
                                            <Input
                                                id="cpf"
                                                value={formData.cpf || ""}
                                                onChange={e => setFormData({ ...formData, cpf: e.target.value })}
                                                placeholder="000.000.000-00"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone" className="text-sm font-semibold uppercase text-slate-500">Telefone</Label>
                                            <Input
                                                id="phone"
                                                value={formData.phone || ""}
                                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                placeholder="(11) 99999-9999"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="birthDate" className="text-sm font-semibold uppercase text-slate-500">Nascimento</Label>
                                            <Input
                                                id="birthDate"
                                                type="date"
                                                value={formData.birthDate || ""}
                                                onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="address" className="text-sm font-semibold uppercase text-slate-500">Endereço Residencial</Label>
                                        <Input
                                            id="address"
                                            value={formData.address || ""}
                                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                                            placeholder="Rua, Número, Bairro, Cidade - UF"
                                        />
                                    </div>
                                </section>
                            </TabsContent>

                            <TabsContent value="professional" className="mt-0 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="hiringDate" className="text-sm font-semibold italic text-slate-400">Data de Admissão</Label>
                                        <Input
                                            id="hiringDate"
                                            type="date"
                                            value={formData.hiringDate || ""}
                                            onChange={e => setFormData({ ...formData, hiringDate: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="status" className="text-sm font-semibold italic text-slate-400">Status</Label>
                                        <Select
                                            value={formData.status}
                                            onValueChange={val => setFormData({ ...formData, status: val as "active" | "inactive" })}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">Ativo(a)</SelectItem>
                                                <SelectItem value="inactive">Inativo(a)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="education" className="text-sm font-semibold uppercase text-indigo-600">Formação Acadêmica</Label>
                                    <Input
                                        id="education"
                                        value={formData.education || ""}
                                        onChange={e => setFormData({ ...formData, education: e.target.value })}
                                        placeholder="Curso / Instituição / Ano"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bio" className="text-sm font-semibold uppercase text-slate-500">Bio / Notas Administrativas</Label>
                                    <Textarea
                                        id="bio"
                                        value={formData.bio || ""}
                                        onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                        placeholder="Breve descrição ou anotações sobre o docente..."
                                        rows={4}
                                    />
                                </div>
                            </TabsContent>

                            <TabsContent value="classes" className="mt-0 space-y-4">
                                <div className="p-4 bg-white border rounded-xl shadow-sm">
                                    <Label className="text-sm font-bold block mb-4">Escolha as turmas que este docente atende:</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {classes.map(c => (
                                            <div key={c.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-pointer group">
                                                <Checkbox
                                                    id={`class-${c.id}`}
                                                    checked={(formData.assignedClassIds || []).includes(c.id)}
                                                    onCheckedChange={() => toggleClass(c.id)}
                                                    className="w-5 h-5 rounded border-slate-300"
                                                />
                                                <Label
                                                    htmlFor={`class-${c.id}`}
                                                    className="text-sm font-medium cursor-pointer flex-1 group-hover:text-indigo-700"
                                                >
                                                    {c.name}
                                                    <span className="block text-[10px] text-slate-400 font-normal">
                                                        {students.filter(s => s.classId === c.id).length} alunos registrados
                                                    </span>
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </TabsContent>
                        </ScrollArea>
                    </Tabs>

                    <DialogFooter className="p-6 bg-white border-t">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8">
                            Salvar Alterações
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

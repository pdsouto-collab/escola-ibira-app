"use client";

import { useEffect, useState } from "react";
import { Plus, Search, UserCog, Edit, Trash2, X, Check, Eye, EyeOff } from "lucide-react";
import { getUsers, createUser, updateUser, deleteUser } from "@/services/user.service";
import { getStudents } from "@/services/student.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import { User as UserType } from "@/types/user";
import { Student } from "@/types/student";
import { formatPhone } from "@/lib/utils";

export default function UsersSettingsPage() {
    const [users, setUsers] = useState<UserType[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);

    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<string | null>(null);

    // Form states
    const initialForm = {
        name: "",
        email: "",
        cpf: "",
        phone: "",
        birthDate: "",
        address: "",
        password: "",
        role: "teacher",
        status: "active",
        linkedStudentIds: [] as string[]
    };
    const [formData, setFormData] = useState(initialForm);
    const [searchStudent, setSearchStudent] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersData, studentsData] = await Promise.all([
                getUsers(),
                getStudents().catch(() => [])
            ]);
            setUsers(usersData);
            setStudents(studentsData);
        } catch (error) {
            console.error("Erro ao carregar os dados:", error);
            toast.error("Não foi possível carregar a lista de usuários.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenForm = (user?: UserType) => {
        if (user) {
            setEditId(user.id);
            setFormData({
                name: user.name || "",
                email: user.email || "",
                cpf: user.cpf || "",
                phone: formatPhone(user.phone || ""),
                birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : "",
                address: user.address || "",
                password: "", // In edit mode, leave blank to not change
                role: user.role || "teacher",
                status: user.status || "active",
                linkedStudentIds: user.linkedStudentIds || []
            });
        } else {
            setEditId(null);
            setFormData(initialForm);
        }
        setSearchStudent("");
        setShowPassword(false);
        setIsFormOpen(true);
    };

    const handleSave = async () => {
        setIsSubmitting(true);
        try {
            const payload: any = {
                name: formData.name,
                email: formData.email,
                cpf: formData.cpf,
                phone: formData.phone,
                birthDate: formData.birthDate,
                address: formData.address,
                role: formData.role,
                status: formData.status,
            };

            // Handling password updates exactly as mobile
            if (!editId && !formData.password?.trim()) {
                payload.password = "123456";
            } else if (formData.password?.trim()) {
                payload.password = formData.password;
            }

            if (payload.role === "guardian") {
                payload.linkedStudentIds = formData.linkedStudentIds;
            } else {
                payload.linkedStudentIds = [];
            }

            if (editId) {
                await updateUser(editId, payload);
                toast.success("Usuário atualizado com sucesso!");
            } else {
                await createUser(payload);
                toast.success("Usuário criado com sucesso!");
            }
            setIsFormOpen(false);
            fetchData();
        } catch (error) {
            console.error("Erro ao salvar:", error);
            toast.error("Erro ao salvar o registro. Verifique os campos ou as permissões.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDelete = (id: string) => {
        setUserToDelete(id);
        setIsConfirmDeleteOpen(true);
    };

    const handleDelete = async () => {
        if (!userToDelete) return;
        try {
            await deleteUser(userToDelete);
            toast.success("Usuário removido com sucesso!");
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error("Não foi possível apagar o usuário.");
        } finally {
            setIsConfirmDeleteOpen(false);
            setUserToDelete(null);
        }
    };

    const toggleStudentLink = (studentId: string) => {
        setFormData(prev => {
            const currentLinks = prev.linkedStudentIds || [];
            if (currentLinks.includes(studentId)) {
                return { ...prev, linkedStudentIds: currentLinks.filter(id => id !== studentId) };
            } else {
                return { ...prev, linkedStudentIds: [...currentLinks, studentId] };
            }
        });
    };

    const getRoleBadge = (role: string) => {
        const roles: Record<string, { label: string; style: string }> = {
            admin: { label: "Admin", style: "bg-purple-100 text-purple-800" },
            director: { label: "Diretor", style: "bg-indigo-100 text-indigo-800" },
            teacher: { label: "Professor", style: "bg-blue-100 text-blue-800" },
            guardian: { label: "Responsável", style: "bg-amber-100 text-amber-800" },
            nutritionist: { label: "Nutricionista", style: "bg-emerald-100 text-emerald-800" },
        };
        const rb = roles[role] || { label: role, style: "bg-slate-100 text-slate-800" };
        return <Badge variant="secondary" className={rb.style}>{rb.label}</Badge>;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <UserCog className="h-8 w-8 text-[#2E798A]" />
                        Configurações de usuários
                    </h1>
                    <p className="text-slate-500">
                        Gerencie os perfis de acesso, permissões e associe estudantes aos responsáveis.
                    </p>
                </div>
                <Button onClick={() => handleOpenForm()} className="bg-[#2E798A] hover:bg-[#256372] shadow-md gap-2" size="lg">
                    <Plus className="h-5 w-5" /> Adicionar Usuário
                </Button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                        <TableRow>
                            <TableHead className="w-[300px]">Usuário</TableHead>
                            <TableHead>Contato</TableHead>
                            <TableHead>Perfil</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-10 text-slate-500">
                                    Carregando...
                                </TableCell>
                            </TableRow>
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-10 text-slate-500">
                                    Nenhum usuário cadastrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id} className="hover:bg-slate-50">
                                    <TableCell>
                                        <div className="font-semibold text-slate-800">{user.name}</div>
                                        <div className="text-sm text-slate-500">{user.email}</div>
                                        {user.cpf && <div className="text-xs text-slate-400">CPF: {user.cpf}</div>}
                                    </TableCell>
                                    <TableCell>
                                        {user.phone ? <div className="text-sm text-slate-600">{user.phone}</div> : <span className="text-slate-400 text-sm">-</span>}
                                    </TableCell>
                                    <TableCell>
                                        {getRoleBadge(user.role || 'teacher')}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.status === 'active' ? "default" : "destructive"} className={user.status === 'active' ? "bg-emerald-500" : ""}>
                                            {user.status === 'active' ? "Ativo" : "Inativo"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="outline" size="sm" onClick={() => handleOpenForm(user)} className="text-slate-600 border-slate-200">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => confirmDelete(user.id)} className="text-rose-500 border-rose-200 hover:bg-rose-50">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Modal CRUD Genérico adaptado para Web */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto w-full p-6">
                    <DialogHeader className="mb-4">
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            <UserCog className="h-6 w-6 text-[#2E798A]" />
                            {editId ? 'Editar Usuário' : 'Novo Usuário'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600 uppercase ml-1">Nome Completo</label>
                                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Nome da pessoa" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600 uppercase ml-1">E-mail</label>
                                <Input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="email@exemplo.com" type="email" />
                            </div>
                            
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600 uppercase ml-1">CPF</label>
                                <Input value={formData.cpf} onChange={(e) => setFormData({ ...formData, cpf: e.target.value })} placeholder="000.000.000-00" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600 uppercase ml-1">Telefone</label>
                                <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })} placeholder="(00) 00000-0000" />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600 uppercase ml-1">Data de Nascimento</label>
                                <Input value={formData.birthDate} onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })} type="date" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600 uppercase ml-1">Senha</label>
                                <div className="relative">
                                    <Input 
                                        value={formData.password} 
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                                        placeholder={editId ? "Em branco p/ s/ alt." : "Padrão: 123456"} 
                                        type={showPassword ? "text" : "password"} 
                                    />
                                    <button 
                                        type="button" 
                                        className="absolute right-3 top-[10px] text-slate-400 hover:text-slate-600"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1 mt-1">
                            <label className="text-xs font-semibold text-slate-600 uppercase ml-1">Endereço</label>
                            <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Endereço completo" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 ml-1">PERFIL</label>
                                <div className="flex flex-wrap gap-2">
                                    {['admin', 'director', 'teacher', 'nutritionist', 'guardian'].map(r => (
                                        <button 
                                            key={r} 
                                            onClick={() => setFormData({ ...formData, role: r })} 
                                            className={`px-3 py-1.5 text-xs rounded-md border font-medium transition-colors ${formData.role === r ? 'bg-[#2E798A] text-white border-[#2E798A]' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100'}`}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 ml-1">STATUS</label>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setFormData({ ...formData, status: 'active' })} 
                                        className={`flex-1 py-1.5 rounded-md border font-medium text-xs transition-colors ${formData.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100'}`}
                                    >
                                        Ativo
                                    </button>
                                    <button 
                                        onClick={() => setFormData({ ...formData, status: 'inactive' })} 
                                        className={`flex-1 py-1.5 rounded-md border font-medium text-xs transition-colors ${formData.status === 'inactive' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100'}`}
                                    >
                                        Inativo
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Associar alunos caso seja Guardian */}
                        {formData.role === 'guardian' && (
                            <div className="mt-6 p-4 border border-slate-200 rounded-xl bg-white shadow-sm">
                                <h3 className="text-sm font-bold text-slate-800 mb-3">Turmas / Alunos Associados (Guardian)</h3>
                                
                                <div className="flex items-center bg-slate-50 border border-slate-200 px-3 rounded-lg mb-4">
                                    <Search className="h-4 w-4 text-slate-400" />
                                    <Input 
                                        value={searchStudent} 
                                        onChange={(e) => setSearchStudent(e.target.value)} 
                                        placeholder="Buscar aluno..." 
                                        className="border-none bg-transparent focus-visible:ring-0 shadow-none"
                                    />
                                </div>

                                {formData.linkedStudentIds.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {students.filter(s => formData.linkedStudentIds.includes(s.id)).map(s => (
                                            <Badge key={s.id} variant="secondary" className="bg-[#2E798A]/10 text-[#2E798A] hover:bg-[#2E798A]/20 py-1 px-3 flex items-center gap-1">
                                                {s.name.split(' ')[0]}
                                                <button onClick={() => toggleStudentLink(s.id)} className="ml-1 hover:text-rose-500">
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                )}

                                <div className="max-h-48 overflow-y-auto border border-slate-100 rounded-md divide-y divide-slate-100">
                                    {students.filter(s => s.name?.toLowerCase().includes(searchStudent.toLowerCase())).map(s => {
                                        const isLinked = formData.linkedStudentIds.includes(s.id);
                                        return (
                                            <button 
                                                key={s.id} 
                                                onClick={() => toggleStudentLink(s.id)}
                                                className={`w-full flex items-center px-3 py-2.5 text-sm transition-colors text-left ${isLinked ? 'bg-[#2E798A]/5 border-l-2 border-l-[#2E798A]' : 'hover:bg-slate-50 border-l-2 border-l-transparent'}`}
                                            >
                                                <div className={`w-4 h-4 mr-3 flex items-center justify-center rounded border transition-colors ${isLinked ? 'bg-[#2E798A] border-[#2E798A]' : 'bg-white border-slate-300'}`}>
                                                    {isLinked && <Check className="h-3 w-3 text-white" />}
                                                </div>
                                                <span className={isLinked ? "font-semibold text-[#2E798A]" : "text-slate-600"}>
                                                    {s.name || 'Sem nome'} {(s as any).className ? `(${(s as any).className})` : ''}
                                                </span>
                                            </button>
                                        )
                                    })}
                                    {students.filter(s => s.name?.toLowerCase().includes(searchStudent.toLowerCase())).length === 0 && (
                                        <div className="py-4 text-center text-sm text-slate-500">Nenhum aluno encontrado</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="mt-6 pt-4 border-t border-slate-100">
                        <Button variant="outline" onClick={() => setIsFormOpen(false)} disabled={isSubmitting}>Cancelar</Button>
                        <Button onClick={handleSave} disabled={isSubmitting} className="bg-[#E89F67] hover:bg-[#d68a54]">
                            {isSubmitting ? "Salvando..." : "Salvar Registro"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDialog 
                open={isConfirmDeleteOpen} 
                onOpenChange={setIsConfirmDeleteOpen}
                title="Excluir Usuário" 
                description="Tem certeza que deseja apagar este usuário? Esta ação não pode ser desfeita." 
                onConfirm={handleDelete}  
                confirmText="Excluir"
                cancelText="Cancelar"
            />
        </div>
    );
}

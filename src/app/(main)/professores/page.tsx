"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { UserPlus, MoreVertical, Edit2, Trash2, Mail, Phone, Calendar, MapPin, Briefcase } from "lucide-react";
import { User } from "@/types/user";
import { createUser, updateUser as updateUserService, deleteUser, getUsers } from "@/services/user.service";
import { TeacherDialog } from "@/components/users/teacher-dialog";
import { getClasses } from "@/services/school-class.service";
import { getStudents } from "@/services/student.service";
import { Student } from "@/types/student";
import { SchoolClass } from "@/types/school-class";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function TeachersPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const currentUser = session?.user as any;

    const [localUsers, setLocalUsers] = useState<User[]>([]);
    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string } | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingClasses, setIsLoadingClasses] = useState(true);
    const [confirmDeleteUser, setConfirmDeleteUser] = useState<User | null>(null);

    const loadData = async () => {
        setIsLoadingClasses(true);
        try {
            const [usersData, classesData, studentsData] = await Promise.all([
                getUsers(),
                getClasses(),
                getStudents()
            ]);
            setLocalUsers(usersData);
            setClasses(classesData);
            setStudents(studentsData);
        } catch (error) {
            console.error("Erro ao carregar dados", error);
        } finally {
            setIsLoadingClasses(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // RBAC: Redirect if not Director or Admin
    useEffect(() => {
        if (currentUser && currentUser.role !== "director" && currentUser.role !== "admin") {
            router.push("/");
        }
    }, [router, currentUser]);

    // Filter only teachers and assistants
    const teachers = localUsers.filter(u => u.role === "teacher" || u.role === "assistant");

    const handleAddTeacher = () => {
        setEditingUser(null);
        setIsDialogOpen(true);
    };

    const handleEditTeacher = (teacher: User) => {
        setEditingUser(teacher);
        setIsDialogOpen(true);
    };

    const handleDeleteTeacher = (teacher: User) => {
        setConfirmDeleteUser(teacher);
    };

    const confirmDeleteTeacherAction = async () => {
        if (confirmDeleteUser) {
            try {
                await deleteUser(confirmDeleteUser.id);
                setLocalUsers(prev => prev.filter(u => u.id !== confirmDeleteUser.id));
                toast.success("Professor removido com sucesso");
            } catch (error) {
                console.error("Erro ao deletar docente:", error);
                toast.error("Ocorreu um erro ao tentar remover o docente.");
            } finally {
                setConfirmDeleteUser(null);
            }
        }
    };

    const handleSaveTeacher = async (teacher: User) => {
        setIsSaving(true);
        try {
            if (teacher.id && localUsers.some(u => u.id === teacher.id)) {
                const updated = await updateUserService(teacher.id, teacher);
                setLocalUsers(prev => prev.map(u => u.id === teacher.id ? updated : u));
            } else {
                teacher.password = '123456'; // Senha padrão para criação de docentes
                const newUser = await createUser(teacher);
                setLocalUsers(prev => [...prev, newUser]);
                setCreatedCredentials({
                    email: newUser.email,
                    password: teacher.password || "123456",
                });
            }
            setIsDialogOpen(false);
        } catch (error) {
            console.error("Erro ao salvar docente:", error);
            toast.error("Ocorreu um erro ao tentar salvar os dados do docente.");
        } finally {
            setIsSaving(false);
        }
    };

    if (!currentUser || (currentUser.role !== "director" && currentUser.role !== "admin")) {
        return null; // or a loading spinner while redirecting
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Docentes</h1>
                    <p className="text-slate-500 text-sm">Gerencie o cadastro dos docentes da escola.</p>
                </div>
                <Button onClick={handleAddTeacher} className="bg-primary hover:bg-primary/90 text-white gap-2 shadow-sm">
                    <UserPlus className="w-4 h-4" />
                    Novo Docente
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {teachers.map((teacher) => (
                    <div key={teacher.id} className="group relative bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                <AvatarImage src={teacher.avatar} alt={teacher.name} />
                                <AvatarFallback>{teacher.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold text-slate-900 truncate">
                                    {teacher.name}
                                </h3>
                                <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 truncate">
                                    <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                                    {teacher.email}
                                </div>
                                <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 truncate">
                                    <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                                    {teacher.phone || "(s/ telefone)"}
                                </div>
                                <div className="mt-3 flex flex-wrap gap-1">
                                    {teacher.assignedClassIds && teacher.assignedClassIds.length > 0 ? (
                                        teacher.assignedClassIds.map(classId => (
                                            <Badge key={classId} variant="secondary" className="text-[9px] px-1.5 py-0 bg-blue-50 text-blue-700 hover:bg-blue-100 border-none">
                                                {classId}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-[10px] text-slate-400 italic">Sem turmas</span>
                                    )}
                                </div>

                                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                                    {teacher.education && (
                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                                            <Briefcase className="h-3 w-3 flex-shrink-0" />
                                            {teacher.education}
                                        </div>
                                    )}
                                    {teacher.hiringDate && (
                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 italic">
                                            <Calendar className="h-3 w-3 flex-shrink-0" />
                                            Desde {new Date(teacher.hiringDate + "T12:00:00").toLocaleDateString('pt-BR')}
                                        </div>
                                    )}
                                </div>

                                {teacher.specialization && teacher.specialization.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-1">
                                        {teacher.specialization.map(spec => (
                                            <span key={spec} className="text-[9px] bg-slate-100 text-slate-600 px-1.5 rounded-full border border-slate-200">
                                                {spec}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {teacher.status === "inactive" && (
                                    <Badge variant="destructive" className="mt-2 text-[9px] py-0 absolute top-2 left-2">Inativo</Badge>
                                )}
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 -mr-2 -mt-2">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleEditTeacher(teacher)}>
                                        <Edit2 className="mr-2 h-3.5 w-3.5" />
                                        Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDeleteTeacher(teacher)} className="text-red-600 focus:text-red-600">
                                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                                        Excluir
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                ))}
            </div>

            <TeacherDialog
                key={editingUser?.id || 'new-teacher'}
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                user={editingUser}
                classes={classes}
                students={students}
                onSave={handleSaveTeacher}
                isLoading={isSaving}
            />

            <Dialog open={!!createdCredentials} onOpenChange={(open) => !open && setCreatedCredentials(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Docente Cadastrado!</DialogTitle>
                        <DialogDescription>
                            O docente foi cadastrado com sucesso. Compartilhe as credenciais abaixo:
                        </DialogDescription>
                    </DialogHeader>
                    <div className="bg-slate-100 p-4 rounded-md space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-slate-700">Email:</span>
                            <span className="text-slate-900 select-all">{createdCredentials?.email}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-slate-700">Senha Provisória:</span>
                            <span className="font-mono text-slate-900 select-all">{createdCredentials?.password}</span>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setCreatedCredentials(null)}>Entendi</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={!!confirmDeleteUser}
                onOpenChange={(open) => !open && setConfirmDeleteUser(null)}
                title="Remover Professor"
                description={`Tem certeza que deseja remover o registro de ${confirmDeleteUser?.name}? Esta ação não pode ser desfeita.`}
                onConfirm={confirmDeleteTeacherAction}
            />
        </div>
    );
}

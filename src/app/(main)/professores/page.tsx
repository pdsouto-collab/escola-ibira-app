"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { UserPlus, MoreVertical, Edit2, Trash2, Mail } from "lucide-react";
import { User } from "@/lib/data";
import { UserDialog } from "@/components/users/user-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function TeachersPage() {
    const router = useRouter();
    const { users, currentUser, addUser, updateUser, removeUser } = useAppStore();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // RBAC: Redirect if not Director or Admin
    useEffect(() => {
        if (currentUser && currentUser.role !== "director" && currentUser.role !== "admin") {
            router.push("/");
        }
    }, [currentUser, router]);

    // Filter only teachers
    const teachers = users.filter(u => u.role === "teacher");

    const handleAddTeacher = () => {
        setEditingUser(null);
        setIsDialogOpen(true);
    };

    const handleEditTeacher = (teacher: User) => {
        setEditingUser(teacher);
        setIsDialogOpen(true);
    };

    const handleDeleteTeacher = (teacher: User) => {
        // eslint-disable-next-line no-restricted-globals
        if (confirm(`Tem certeza que deseja remover o registro de ${teacher.name}?`)) {
            removeUser(teacher.id);
        }
    };

    const handleSaveTeacher = (teacher: User) => {
        if (teacher.id && users.some(u => u.id === teacher.id)) {
            updateUser(teacher.id, teacher);
        } else {
            addUser(teacher);
        }
    };

    if (!currentUser || (currentUser.role !== "director" && currentUser.role !== "admin")) {
        return null; // or a loading spinner while redirecting
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Professores</h1>
                    <p className="text-slate-500 text-sm">Gerencie o cadastro dos professores da escola.</p>
                </div>
                <Button onClick={handleAddTeacher} className="bg-primary hover:bg-primary/90 text-white gap-2 shadow-sm">
                    <UserPlus className="w-4 h-4" />
                    Novo Professor
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
                                <div className="mt-2 flex flex-wrap gap-1">
                                    {teacher.assignedClassIds && teacher.assignedClassIds.length > 0 ? (
                                        teacher.assignedClassIds.map(classId => (
                                            <span key={classId} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700">
                                                {classId}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-[10px] text-slate-400 italic">Sem turmas atribuídas</span>
                                    )}
                                </div>
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

            <UserDialog
                key={editingUser?.id || 'new-user'}
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                user={editingUser}
                onSave={handleSaveTeacher}
                fixedRole="teacher"
            />
        </div>
    );
}

"use client";

import { useState } from "react";
import { StudentList } from "@/components/students/student-list";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Plus, Users, MoreVertical, Edit2, Trash2, FolderPlus } from "lucide-react";
import { StudentDialog } from "@/components/students/student-dialog";
import { ClassDialog } from "@/components/students/class-dialog";
import { Student } from "@/types/student";
import { SchoolClass } from "@/types/school-class";
import { getClasses, createClass, updateClass, deleteClass } from "@/services/school-class.service";
import { getStudents, createStudent, updateStudent, deleteStudent } from "@/services/student.service";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoadingStudents, setIsLoadingStudents] = useState(true);
    const { data: session } = useSession();
    const currentUser = session?.user as any;

    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [isLoadingClasses, setIsLoadingClasses] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);

    // Dialog States
    const [isStudentDialogOpen, setIsStudentDialogOpen] = useState(false);
    const [isClassDialogOpen, setIsClassDialogOpen] = useState(false);

    // Selection States
    const [selectedClassId, setSelectedClassId] = useState<string | "all">("all");
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);

    // Confirmation Dialog States
    const [confirmDeleteStudent, setConfirmDeleteStudent] = useState<Student | null>(null);
    const [confirmDeleteClass, setConfirmDeleteClass] = useState<SchoolClass | null>(null);

    useEffect(() => {
        fetchClasses();
        fetchStudents();
    }, []);

    async function fetchStudents() {
        setIsLoadingStudents(true);
        try {
            const data = await getStudents();
            setStudents(data);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar alunos");
        } finally {
            setIsLoadingStudents(false);
        }
    }

    async function fetchClasses() {
        setIsLoadingClasses(true);
        try {
            const data = await getClasses();
            setClasses(data);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar turmas");
        } finally {
            setIsLoadingClasses(false);
        }
    }

    // Filter classes based on role
    const visibleClasses = currentUser?.role === "teacher"
        ? classes.filter(c => c.teacherId === currentUser.id)
        : classes;

    const canManageClasses = currentUser?.role === "director" || currentUser?.role === "admin";

    // Derived State
    const filteredStudents = selectedClassId === "all"
        ? (currentUser?.role === "teacher"
            ? students.filter(s => visibleClasses.some(c => c.id === s.classId))
            : students)
        : students.filter(s => s.classId === selectedClassId);

    const selectedClass = classes.find(c => c.id === selectedClassId);

    // Handlers - Students
    const handleAddStudent = () => {
        setEditingStudent({
            classId: selectedClassId === "all" ? "" : selectedClassId
        } as Student);
        setIsStudentDialogOpen(true);
    };

    const handleEditStudent = (student: Student) => {
        setEditingStudent(student);
        setIsStudentDialogOpen(true);
    };

    const handleDeleteStudent = (student: Student) => {
        setConfirmDeleteStudent(student);
    };

    const confirmDeleteStudentAction = async () => {
        if (confirmDeleteStudent) {
            setIsActionLoading(true);
            try {
                await deleteStudent(confirmDeleteStudent.id);
                toast.success("Aluno removido com sucesso");
                await fetchStudents();
                setConfirmDeleteStudent(null);
            } catch (error) {
                console.error(error);
                toast.error("Erro ao remover aluno");
            } finally {
                setIsActionLoading(false);
            }
        }
    };

    const handleSaveStudent = async (student: Student) => {
        setIsActionLoading(true);
        try {
            const exists = students.some(s => s.id === student.id);
            if (exists) {
                await updateStudent(student.id, student);
                toast.success("Aluno atualizado com sucesso");
            } else {
                await createStudent(student);
                toast.success("Aluno criado com sucesso");
            }
            setIsStudentDialogOpen(false);
            await fetchStudents();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao salvar aluno");
        } finally {
            setIsActionLoading(false);
        }
    };

    // Handlers - Classes
    const handleAddClass = () => {
        setEditingClass(null);
        setIsClassDialogOpen(true);
    };

    const handleEditClass = (schoolClass: SchoolClass) => {
        setEditingClass(schoolClass);
        setIsClassDialogOpen(true);
    };

    const handleSaveClass = async (schoolClass: SchoolClass) => {
        setIsActionLoading(true);
        try {
            const exists = classes.some(c => c.id === schoolClass.id);
            if (exists) {
                await updateClass(schoolClass.id, schoolClass);
                toast.success("Turma atualizada com sucesso");
            } else {
                await createClass(schoolClass);
                toast.success("Turma criada com sucesso");
            }
            setIsClassDialogOpen(false);
            await fetchClasses();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao salvar turma");
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleDeleteClass = (schoolClass: SchoolClass) => {
        setConfirmDeleteClass(schoolClass);
    };

    const confirmDeleteClassAction = async () => {
        if (confirmDeleteClass) {
            setIsActionLoading(true);
            try {
                await deleteClass(confirmDeleteClass.id);
                toast.success("Turma removida com sucesso");
                if (selectedClassId === confirmDeleteClass.id) {
                    setSelectedClassId("all");
                }
                await fetchClasses();
            } catch (error) {
                console.error(error);
                toast.error("Erro ao remover turma");
            } finally {
                setIsActionLoading(false);
                setConfirmDeleteClass(null);
            }
        }
    };



    return (
        <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar - Class List */}
            <aside className="w-full md:w-64 flex-shrink-0 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-slate-900">Turmas</h2>
                    {canManageClasses && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleAddClass}
                            disabled={isActionLoading}
                            title="Nova Turma"
                        >
                            {isActionLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <FolderPlus className="h-4 w-4 text-slate-500 hover:text-primary" />
                            )}
                        </Button>
                    )}
                </div>

                <nav className="space-y-1">
                    <button
                        onClick={() => setSelectedClassId("all")}
                        className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                            selectedClassId === "all"
                                ? "bg-white text-primary shadow-sm ring-1 ring-slate-200"
                                : "text-slate-600 hover:bg-white/50 hover:text-slate-900"
                        )}
                    >
                        <Users className="h-4 w-4" />
                        Todos os Alunos
                        <span className="ml-auto text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                            {filteredStudents.length}
                        </span>
                    </button>

                    {isLoadingClasses || isLoadingStudents ? (
                        <div className="flex flex-col gap-2 p-3">
                            <div className="h-8 w-full bg-slate-100 animate-pulse rounded" />
                            <div className="h-8 w-full bg-slate-100 animate-pulse rounded" />
                            <div className="h-8 w-full bg-slate-100 animate-pulse rounded" />
                        </div>
                    ) : (
                        visibleClasses.map((schoolClass) => (
                            <div key={schoolClass.id} className="group relative">
                                <button
                                    onClick={() => setSelectedClassId(schoolClass.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors pr-8",
                                        selectedClassId === schoolClass.id
                                            ? "bg-white text-primary shadow-sm ring-1 ring-slate-200"
                                            : "text-slate-600 hover:bg-white/50 hover:text-slate-900"
                                    )}
                                >
                                    <span className={cn(
                                        "h-2 w-2 rounded-full",
                                        selectedClassId === schoolClass.id ? "bg-primary" : "bg-slate-300"
                                    )} />
                                    {schoolClass.name}
                                    <span className="ml-auto text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                                        {students.filter(s => s.classId === schoolClass.id).length}
                                    </span>
                                </button>

                                {/* Class Actions Dropdown - Only for Admins/Directors */}
                                {canManageClasses && (
                                    <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                                    <MoreVertical className="h-3 w-3" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEditClass(schoolClass)}>
                                                    <Edit2 className="mr-2 h-3 w-3" />
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDeleteClass(schoolClass)} className="text-red-600">
                                                    <Trash2 className="mr-2 h-3 w-3" />
                                                    Excluir
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </nav>
            </aside>

            {/* Main Content - Student List */}
            <main className="flex-1 space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            {selectedClassId === "all" ? "Todos os Alunos" : selectedClass?.name}
                        </h1>
                        <p className="text-slate-500 text-sm">
                            {selectedClassId === "all"
                                ? "Gerencie todos os alunos da escola."
                                : selectedClass?.description || "Gerencie os alunos desta turma."}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button onClick={handleAddStudent} className="bg-primary hover:bg-primary/90 text-white gap-2 shadow-sm">
                            <Plus className="w-4 h-4" />
                            Novo Aluno
                        </Button>
                    </div>
                </div>

                {isLoadingStudents ? (
                    <div className="flex items-center justify-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <StudentList
                        students={filteredStudents}
                        classes={classes}
                        onEdit={handleEditStudent}
                        onDelete={handleDeleteStudent}
                    />
                )}

                <StudentDialog
                    key={editingStudent?.id || 'new-student'}
                    open={isStudentDialogOpen}
                    onOpenChange={setIsStudentDialogOpen}
                    student={editingStudent}
                    classes={classes}
                    onSave={handleSaveStudent}
                />

                <ClassDialog
                    key={editingClass?.id || 'new-class'}
                    open={isClassDialogOpen}
                    onOpenChange={setIsClassDialogOpen}
                    schoolClass={editingClass}
                    onSave={handleSaveClass}
                    isLoading={isActionLoading}
                />

                <ConfirmDialog
                    open={!!confirmDeleteStudent}
                    onOpenChange={(open) => !open && setConfirmDeleteStudent(null)}
                    title="Excluir Aluno"
                    description={`Tem certeza que deseja remover ${confirmDeleteStudent?.name}? Esta ação não pode ser desfeita.`}
                    onConfirm={confirmDeleteStudentAction}
                />

                <ConfirmDialog
                    open={!!confirmDeleteClass}
                    onOpenChange={(open) => !open && setConfirmDeleteClass(null)}
                    title="Excluir Turma"
                    description={`Tem certeza que deseja remover a turma ${confirmDeleteClass?.name}? Os alunos desta turma não serão excluídos, mas ficarão sem turma.`}
                    onConfirm={confirmDeleteClassAction}
                />
            </main>
        </div>
    );
}

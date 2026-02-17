"use client";

import { useState } from "react";
import { StudentList } from "@/components/students/student-list";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Plus, Users, MoreVertical, Edit2, Trash2, FolderPlus } from "lucide-react";
import { StudentDialog } from "@/components/students/student-dialog";
import { ClassDialog } from "@/components/students/class-dialog";
import { Student, SchoolClass } from "@/lib/data";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function StudentsPage() {
    const { students, classes, addStudent, updateStudent, removeStudent, addClass, updateClass, removeClass } = useAppStore();

    // Dialog States
    const [isStudentDialogOpen, setIsStudentDialogOpen] = useState(false);
    const [isClassDialogOpen, setIsClassDialogOpen] = useState(false);

    // Selection States
    const [selectedClassId, setSelectedClassId] = useState<string | "all">("all");
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);

    // Derived State
    const filteredStudents = selectedClassId === "all"
        ? students
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
        // eslint-disable-next-line no-restricted-globals
        if (confirm(`Tem certeza que deseja remover ${student.name}?`)) {
            removeStudent(student.id);
        }
    };

    const handleSaveStudent = (student: Student) => {
        if (student.id && students.some(s => s.id === student.id)) {
            updateStudent(student.id, student);
        } else {
            addStudent(student);
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

    const handleDeleteClass = (schoolClass: SchoolClass) => {
        // eslint-disable-next-line no-restricted-globals
        if (confirm(`Tem certeza que deseja remover a turma ${schoolClass.name}? Os alunos desta turma não serão excluídos, mas ficarão sem turma.`)) {
            removeClass(schoolClass.id);
            if (selectedClassId === schoolClass.id) {
                setSelectedClassId("all");
            }
        }
    };

    const handleSaveClass = (schoolClass: SchoolClass) => {
        if (schoolClass.id && classes.some(c => c.id === schoolClass.id)) {
            updateClass(schoolClass.id, schoolClass);
        } else {
            addClass(schoolClass);
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar - Class List */}
            <aside className="w-full md:w-64 flex-shrink-0 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-slate-900">Turmas</h2>
                    <Button variant="ghost" size="icon" onClick={handleAddClass} title="Nova Turma">
                        <FolderPlus className="h-4 w-4 text-slate-500 hover:text-primary" />
                    </Button>
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
                            {students.length}
                        </span>
                    </button>

                    {classes.map((schoolClass) => (
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

                            {/* Class Actions Dropdown */}
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
                        </div>
                    ))}
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
                    <Button onClick={handleAddStudent} className="bg-primary hover:bg-primary/90 text-white gap-2 shadow-sm">
                        <Plus className="w-4 h-4" />
                        Novo Aluno
                    </Button>
                </div>

                <StudentList
                    students={filteredStudents}
                    onEdit={handleEditStudent}
                    onDelete={handleDeleteStudent}
                />

                <StudentDialog
                    key={editingStudent?.id || 'new-student'}
                    open={isStudentDialogOpen}
                    onOpenChange={setIsStudentDialogOpen}
                    student={editingStudent}
                    onSave={handleSaveStudent}
                />

                <ClassDialog
                    key={editingClass?.id || 'new-class'}
                    open={isClassDialogOpen}
                    onOpenChange={setIsClassDialogOpen}
                    schoolClass={editingClass}
                    onSave={handleSaveClass}
                />
            </main>
        </div>
    );
}

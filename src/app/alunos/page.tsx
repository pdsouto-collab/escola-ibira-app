"use client";

import { useState } from "react";
import { StudentList } from "@/components/students/student-list";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { StudentDialog } from "@/components/students/student-dialog";
import { Student } from "@/lib/data";

export default function StudentsPage() {
    const { students, addStudent, updateStudent, removeStudent } = useAppStore();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);

    const handleAdd = () => {
        setEditingStudent(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (student: Student) => {
        setEditingStudent(student);
        setIsDialogOpen(true);
    };

    const handleDelete = (student: Student) => {
        // eslint-disable-next-line no-restricted-globals
        if (confirm(`Tem certeza que deseja remover ${student.name}?`)) {
            removeStudent(student.id);
        }
    };

    const handleSave = (student: Student) => {
        if (editingStudent) {
            updateStudent(student.id, student);
        } else {
            addStudent(student);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-800">Alunos</h1>
                    <p className="text-slate-500">Gerencie as informações e acompanhe o desenvolvimento de cada criança.</p>
                </div>
                <Button onClick={handleAdd} className="bg-primary hover:bg-primary/90 text-white gap-2">
                    <Plus className="w-4 h-4" />
                    Novo Aluno
                </Button>
            </div>

            <StudentList
                students={students}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <StudentDialog
                key={editingStudent?.id || 'new'}
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                student={editingStudent}
                onSave={handleSave}
            />
        </div>
    );
}

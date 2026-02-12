"use client";

import { useState } from "react";
import { Student } from "@/lib/data";
import { StudentCard } from "./student-card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface StudentListProps {
    students: Student[];
}

export function StudentList({ students }: StudentListProps) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.class.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                    placeholder="Buscar aluno por nome ou turma..."
                    className="pl-9 bg-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredStudents.map((student) => (
                    <StudentCard key={student.id} student={student} />
                ))}
            </div>

            {filteredStudents.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                    Nenhum aluno encontrado.
                </div>
            )}
        </div>
    );
}

"use client";

import { Student } from "@/types/student";
import { useAppStore } from "@/lib/store";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Edit2, Trash2, Check } from "lucide-react";

import { SchoolClass } from "@/types/school-class";

interface StudentCardProps {
    student: Student;
    classes: SchoolClass[];
    onEdit?: (student: Student) => void;
    onDelete?: (student: Student) => void;
}

export function StudentCard({ student, classes, onEdit, onDelete }: StudentCardProps) {
    const studentClass = classes.find(c => c.id === student.classId);

    return (
        <Card className="overflow-hidden hover:shadow-md transition-shadow group relative">
            <div className="aspect-square bg-slate-100 relative">
                {student.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={student.photo}
                        alt={student.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <User className="w-16 h-16" />
                    </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="secondary" size="icon" className="h-8 w-8 bg-white/90 hover:bg-white text-slate-600 shadow-sm" onClick={(e) => { e.stopPropagation(); onEdit?.(student); }}>
                        <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="destructive" size="icon" className="h-8 w-8 opacity-90 hover:opacity-100 shadow-sm" onClick={(e) => { e.stopPropagation(); onDelete?.(student); }}>
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>
            <CardHeader className="p-4 pb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg">{student.name}</CardTitle>
                        <CardDescription>{studentClass?.name || 'Sem turma'}</CardDescription>
                    </div>
                    {student.status === "presente" ? (
                        <div className="flex items-center text-green-600 text-xs font-medium bg-green-50 px-2 py-1 rounded-full border border-green-100">
                            <Check className="w-3 h-3 mr-1" />
                            Presente
                        </div>
                    ) : (
                        <div className="flex items-center text-slate-400 text-xs font-medium bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
                            Ausente
                        </div>
                    )}
                </div>
            </CardHeader>
        </Card>
    );
}

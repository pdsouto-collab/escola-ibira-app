"use client";
import React, { useState, useEffect, use } from "react";
import { getStudentById } from "@/services/student.service";
import { getStudentCurriculum } from "@/lib/data";
import { getClassById } from "@/services/school-class.service";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Student } from "@/types/student";
import { SchoolClass } from "@/types/school-class";

interface StudentProfilePageProps {
    params: Promise<{ id: string }>;
}


export default function StudentProfilePage({ params }: StudentProfilePageProps) {
    const { id } = use(params);
    const [student, setStudent] = useState<Student | null>(null);
    const [studentClass, setStudentClass] = useState<SchoolClass | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            try {
                const studentData = await getStudentById(id);
                if (studentData) {
                    setStudent(studentData);
                    if (studentData.classId) {
                        const classData = await getClassById(studentData.classId);
                        setStudentClass(classData);
                    }
                }
            } catch (error) {
                console.error("Erro ao carregar dados do aluno:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, [id]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    if (!student) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4">
                <p className="text-slate-500 font-medium">Aluno não encontrado.</p>
                <Link href="/alunos">
                    <Button variant="outline" className="gap-2">
                        <ArrowLeft className="h-4 w-4" /> Voltar para a lista
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/alunos">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold text-slate-900">{student.name}</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <h2 className="text-xl font-semibold mb-4 text-slate-800">Informações do Aluno</h2>
                    <div className="space-y-3">
                        <p><span className="font-medium text-slate-600">Turma:</span> {studentClass?.name || "Não atribuída"}</p>
                        <p><span className="font-medium text-slate-600">Idade:</span> {student.age} anos</p>
                        <p><span className="font-medium text-slate-600">Responsável:</span> {student.parentName}</p>
                        <p><span className="font-medium text-slate-600">Status:</span> {student.status}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <h2 className="text-xl font-semibold mb-4 text-slate-800">Resumo Pedagógico</h2>
                    <p className="text-slate-500">Visualização do progresso (Em desenvolvimento)</p>
                    {/* Placeholder for Mosaic or charts */}
                </div>
            </div>
        </div>
    );
}

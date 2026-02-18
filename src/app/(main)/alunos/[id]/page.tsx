import { mockStudents, getStudentCurriculum, mockClasses } from "@/lib/data";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface StudentProfilePageProps {
    params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
    return mockStudents.map((student) => ({
        id: student.id,
    }));
}

export default async function StudentProfilePage({ params }: StudentProfilePageProps) {
    const { id } = await params;
    const student = mockStudents.find((s) => s.id === id);

    if (!student) {
        notFound();
    }

    const educationPlan = getStudentCurriculum(id);
    const studentClass = mockClasses.find(c => c.id === student.classId);

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

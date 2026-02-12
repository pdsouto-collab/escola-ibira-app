
import { StudentList } from "@/components/students/student-list";
import { mockStudents } from "@/lib/data";

export default function StudentsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-slate-800">Alunos</h1>
                <p className="text-slate-500">Gerencie as informações e acompanhe o desenvolvimento de cada criança.</p>
            </div>

            <StudentList students={mockStudents} />
        </div>
    );
}

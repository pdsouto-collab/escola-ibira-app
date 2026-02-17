"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { MilestoneReport } from "@/components/reports/milestone-report";
import { DailyLogReport } from "@/components/reports/daily-log-report";
import { PortfolioReport } from "@/components/reports/portfolio-report";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ReportsPage() {
    const { students } = useAppStore();
    // Default to the first student if available
    const [manualSelection, setManualSelection] = useState<string>("");

    // Use manual selection or default to first student
    const selectedStudentId = manualSelection || (students.length > 0 ? students[0].id : "");

    // No useEffect needed for selection logic

    const selectedStudent = students.find(s => s.id === selectedStudentId);

    if (!selectedStudent) {
        return <div className="p-8 text-center text-slate-500">Nenhum aluno encontrado. Cadastre alunos na aba &apos;Estudantes&apos;.</div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Relatórios de Desenvolvimento</h1>
                    <p className="text-slate-500">Acompanhe o progresso e o dia a dia das crianças.</p>
                </div>

                <div className="flex items-center gap-4 bg-white p-2 rounded-xl border shadow-sm">
                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedStudent.name}`} />
                        <AvatarFallback>{selectedStudent.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <Select value={selectedStudentId} onValueChange={setManualSelection}>
                        <SelectTrigger className="w-[200px] border-none shadow-none focus:ring-0">
                            <SelectValue placeholder="Selecione um aluno" />
                        </SelectTrigger>
                        <SelectContent>
                            {students.map((student) => (
                                <SelectItem key={student.id} value={student.id}>
                                    {student.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Tabs defaultValue="milestones" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8">
                    <TabsTrigger value="milestones">Marcos de Desenvolvimento</TabsTrigger>
                    <TabsTrigger value="daily">Diário de Bordo</TabsTrigger>
                    <TabsTrigger value="portfolio">Portfólio de Aprendizagem</TabsTrigger>
                </TabsList>

                <TabsContent value="milestones" className="animate-in fade-in-50 duration-500 slide-in-from-bottom-2">
                    <div className="mb-4">
                        <h2 className="text-xl font-semibold text-slate-700 mb-2">Progresso por Áreas da BNCC</h2>
                        <p className="text-slate-500 mb-6">Visualização do desenvolvimento da criança em relação aos objetivos de aprendizagem.</p>
                        <MilestoneReport studentId={selectedStudentId} />
                    </div>
                </TabsContent>

                <TabsContent value="daily" className="animate-in fade-in-50 duration-500 slide-in-from-bottom-2">
                    <div className="mb-4">
                        <h2 className="text-xl font-semibold text-slate-700 mb-2">Rotina e Atividades do Dia</h2>
                        <p className="text-slate-500 mb-6">Resumo diário da alimentação, sono e experiências vivenciadas.</p>
                        <DailyLogReport studentId={selectedStudentId} />
                    </div>
                </TabsContent>

                <TabsContent value="portfolio" className="animate-in fade-in-50 duration-500 slide-in-from-bottom-2">
                    <div className="mb-4">
                        <h2 className="text-xl font-semibold text-slate-700 mb-2">Galeria de Vivências</h2>
                        <p className="text-slate-500 mb-6">Registros fotográficos e observações de momentos significativos.</p>
                        <PortfolioReport studentId={selectedStudentId} />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

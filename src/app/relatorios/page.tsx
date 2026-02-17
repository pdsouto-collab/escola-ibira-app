"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { MilestoneReport } from "@/components/reports/milestone-report";
import { DailyLogReport } from "@/components/reports/daily-log-report";
import { PortfolioReport } from "@/components/reports/portfolio-report";
import { User } from "lucide-react";
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
    const { students, classes } = useAppStore();

    // Class Filter State
    const [selectedClassId, setSelectedClassId] = useState<string>("all");

    // Default to the first student if available
    const [manualSelection, setManualSelection] = useState<string>("");

    // Filter students based on class
    const filteredStudents = selectedClassId === "all"
        ? students
        : students.filter(s => s.classId === selectedClassId);

    // Use manual selection or default to first student in the filtered list
    // If the manual selection is not in the filtered list (e.g. changed class), reset or pick first
    const effectiveStudentId = (manualSelection && filteredStudents.find(s => s.id === manualSelection))
        ? manualSelection
        : (filteredStudents.length > 0 ? filteredStudents[0].id : "");

    const selectedStudent = students.find(s => s.id === effectiveStudentId);

    if (!selectedStudent && students.length === 0) {
        return <div className="p-8 text-center text-slate-500">Nenhum aluno encontrado. Cadastre alunos na aba &apos;Estudantes&apos;.</div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Relatórios de Desenvolvimento</h1>
                    <p className="text-slate-500">Acompanhe o progresso e o dia a dia das crianças.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
                    {/* Class Filter */}
                    <Select value={selectedClassId} onValueChange={(val) => {
                        setSelectedClassId(val);
                        setManualSelection(""); // Reset student selection when class changes
                    }}>
                        <SelectTrigger className="w-[200px] bg-white">
                            <SelectValue placeholder="Filtrar por turma" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas as Turmas</SelectItem>
                            {classes.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                    {c.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Student Selector */}
                    <div className="flex items-center gap-4 bg-white p-2 rounded-xl border shadow-sm">
                        {selectedStudent ? (
                            <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedStudent.name}`} />
                                <AvatarFallback>{selectedStudent.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                        ) : (
                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                <User className="h-5 w-5" />
                            </div>
                        )}
                        <Select value={effectiveStudentId} onValueChange={setManualSelection}>
                            <SelectTrigger className="w-[200px] border-none shadow-none focus:ring-0">
                                <SelectValue placeholder="Selecione um aluno" />
                            </SelectTrigger>
                            <SelectContent>
                                {filteredStudents.map((student) => (
                                    <SelectItem key={student.id} value={student.id}>
                                        {student.name}
                                    </SelectItem>
                                ))}
                                {filteredStudents.length === 0 && (
                                    <div className="p-2 text-sm text-slate-500 text-center">
                                        Nenhum aluno nesta turma
                                    </div>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
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
                        {selectedStudent ? (
                            <MilestoneReport studentId={effectiveStudentId} />
                        ) : (
                            <div className="text-center py-12 text-slate-400">Selecione um aluno para visualizar</div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="daily" className="animate-in fade-in-50 duration-500 slide-in-from-bottom-2">
                    <div className="mb-4">
                        <h2 className="text-xl font-semibold text-slate-700 mb-2">Rotina e Atividades do Dia</h2>
                        <p className="text-slate-500 mb-6">Resumo diário da alimentação, sono e experiências vivenciadas.</p>
                        {selectedStudent ? (
                            <DailyLogReport studentId={effectiveStudentId} />
                        ) : (
                            <div className="text-center py-12 text-slate-400">Selecione um aluno para visualizar</div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="portfolio" className="animate-in fade-in-50 duration-500 slide-in-from-bottom-2">
                    <div className="mb-4">
                        <h2 className="text-xl font-semibold text-slate-700 mb-2">Galeria de Vivências</h2>
                        <p className="text-slate-500 mb-6">Registros fotográficos e observações de momentos significativos.</p>
                        {selectedStudent ? (
                            <PortfolioReport studentId={effectiveStudentId} />
                        ) : (
                            <div className="text-center py-12 text-slate-400">Selecione um aluno para visualizar</div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

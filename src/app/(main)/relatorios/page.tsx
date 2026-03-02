"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { MilestoneReport } from "@/components/reports/milestone-report";
import { DailyLogReport } from "@/components/reports/daily-log-report";
import { PortfolioReport } from "@/components/reports/portfolio-report";
import { SkillsChart } from "@/components/reports/skills-chart";
import { ObservationList } from "@/components/reports/observation-list";
import { User } from "lucide-react";
import { BulkPortfolioDialog } from "@/components/portfolio/bulk-portfolio-dialog";
import { DailyLogDialog } from "@/components/agenda/daily-log-dialog";
import { parseISO } from "date-fns";
import { cn } from "@/lib/utils";
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
    const { students, classes, currentUser } = useAppStore();

    // Class Filter State
    const [selectedClassId, setSelectedClassId] = useState<string>("all");

    // Default to the first student if available
    const [manualSelection, setManualSelection] = useState<string>("");

    // Filter students based on class and role
    const visibleStudents = currentUser?.role === "guardian"
        ? students.filter(s => currentUser.linkedStudentIds?.includes(s.id))
        : (selectedClassId === "all" ? students : students.filter(s => s.classId === selectedClassId));

    // Use manual selection or default to first student in the filtered list
    const effectiveStudentId = (manualSelection && visibleStudents.find(s => s.id === manualSelection))
        ? manualSelection
        : (visibleStudents.length > 0 ? visibleStudents[0].id : "");

    const selectedStudent = students.find(s => s.id === effectiveStudentId);

    const showMilestones = currentUser?.role !== "nutritionist";
    const showPortfolio = currentUser?.role !== "nutritionist";
    const showDaily = true;

    // Edit Modal State
    const [isPortfolioEditOpen, setIsPortfolioEditOpen] = useState(false);
    const [isDailyLogEditOpen, setIsDailyLogEditOpen] = useState(false);
    const [editDate, setEditDate] = useState<Date>(new Date());

    const handleEditPortfolio = (dateStr: string) => {
        setEditDate(parseISO(dateStr));
        setIsPortfolioEditOpen(true);
    };

    const handleEditDailyLog = (dateStr: string) => {
        setEditDate(parseISO(dateStr));
        setIsDailyLogEditOpen(true);
    };

    if (!selectedStudent && visibleStudents.length === 0) {
        return <div className="p-8 text-center text-slate-500">Nenhum aluno encontrado ou permissão insuficiente.</div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Relatórios de Desenvolvimento</h1>
                    <p className="text-slate-500">Acompanhe o progresso e o dia a dia das crianças.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
                    {/* Class Filter - Hide for Guardians */}
                    {currentUser?.role !== "guardian" && (
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
                    )}

                    {/* Student Selector - Hide if only one student visible */}
                    {visibleStudents.length > 1 && (
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
                                    {visibleStudents.map((student) => (
                                        <SelectItem key={student.id} value={student.id}>
                                            {student.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Simple badge if only one student visible */}
                    {visibleStudents.length === 1 && selectedStudent && (
                        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border shadow-sm">
                            <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedStudent.name}`} />
                                <AvatarFallback>{selectedStudent.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="font-semibold text-slate-700">{selectedStudent.name}</span>
                        </div>
                    )}
                </div>
            </div>

            <Tabs defaultValue="milestones" className="w-full">
                <TabsList className="flex w-full mb-8 bg-slate-100/50 p-1.5 rounded-xl border">
                    <TabsTrigger value="milestones" className="flex-1 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all font-semibold">
                        Relatório de Desenvolvimento
                    </TabsTrigger>
                    <TabsTrigger value="portfolio" className="flex-1 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all font-semibold">
                        Galeria de Vivências
                    </TabsTrigger>
                    <TabsTrigger value="daily" className="flex-1 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all font-semibold">
                        Diário de Bordo
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="milestones" className="animate-in fade-in-50 duration-500 slide-in-from-bottom-2">
                    <div className="mb-4 space-y-16">
                        {/* 1. Skill Chart */}
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                                Desenvolvimento por Áreas da BNCC
                            </h2>
                            <p className="text-slate-500 mb-6">Comparativo entre o currículo proposto e o nível de consolidação da criança.</p>
                            {selectedStudent ? (
                                <SkillsChart studentId={effectiveStudentId} />
                            ) : (
                                <div className="text-center py-12 text-slate-400">Selecione um aluno para visualizar</div>
                            )}
                        </div>

                        {/* 2. Professor Observations */}
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                                Registros e Evidências do Ciclo
                            </h2>
                            {selectedStudent ? (
                                <ObservationList studentId={effectiveStudentId} />
                            ) : (
                                <div className="text-center py-12 text-slate-400">Selecione um aluno para visualizar</div>
                            )}
                        </div>

                        {/* 3. Milestone Grid */}
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-orange-500 rounded-full" />
                                Trilha de Competências e Habilidades
                            </h2>
                            {selectedStudent ? (
                                <MilestoneReport studentId={effectiveStudentId} />
                            ) : (
                                <div className="text-center py-12 text-slate-400">Selecione um aluno para visualizar</div>
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="portfolio" className="animate-in fade-in-50 duration-500 slide-in-from-bottom-2">
                    <div className="mb-4">
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Galeria de Vivências do Aluno</h2>
                        <p className="text-slate-500 mb-6 font-medium">Registros fotográficos de atividades esporádicas que marcam o ano escolar.</p>
                        {selectedStudent ? (
                            <PortfolioReport studentId={effectiveStudentId} onEdit={currentUser?.role !== "guardian" ? handleEditPortfolio : undefined} />
                        ) : (
                            <div className="text-center py-12 text-slate-400">Selecione um aluno para visualizar</div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="daily" className="animate-in fade-in-50 duration-500 slide-in-from-bottom-2">
                    <div className="mb-4">
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Diário de Bordo</h2>
                        <p className="text-slate-500 mb-6">Acompanhe a rotina diária, alimentação, sono e humor do aluno.</p>
                        {selectedStudent ? (
                            <DailyLogReport studentId={effectiveStudentId} onEdit={currentUser?.role !== "guardian" ? handleEditDailyLog : undefined} />
                        ) : (
                            <div className="text-center py-12 text-slate-400">Selecione um aluno para visualizar</div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            {selectedStudent && (
                <>
                    <BulkPortfolioDialog
                        key={`edit-port-${editDate.toISOString()}-${selectedStudent.classId}`}
                        open={isPortfolioEditOpen}
                        onOpenChange={setIsPortfolioEditOpen}
                        date={editDate}
                        classId={selectedStudent.classId}
                    />
                    <DailyLogDialog
                        key={`edit-log-${editDate.toISOString()}-${selectedStudent.classId}`}
                        open={isDailyLogEditOpen}
                        onOpenChange={setIsDailyLogEditOpen}
                        date={editDate}
                        classId={selectedStudent.classId}
                    />
                </>
            )}
        </div>
    );
}

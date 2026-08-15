"use client";

import { useState, useEffect } from "react";
import { getStudents } from "@/services/student.service";
import { Student } from "@/types/student";
import { SEMESTERS } from "@/constants/semesters";
import { YEARS } from "@/constants/years";
import { MilestoneReport } from "@/components/reports/milestone-report";
import { DailyLogReport } from "@/components/reports/daily-log-report";
import { PortfolioReport } from "@/components/reports/portfolio-report";
import { SkillsChart } from "@/components/reports/skills-chart";
import { User, Loader2 } from "lucide-react";
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
import { useSession } from "next-auth/react";
import { getClasses } from "@/services/school-class.service";
import { SchoolClass } from "@/types/school-class";

export default function ReportsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { data: session } = useSession();
    const currentUser = session?.user as any;

    // Class Filter State
    const [selectedClassId, setSelectedClassId] = useState<string>("all");
    const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
    const [manualSelection, setManualSelection] = useState<string>("");

    // Edit Modal State
    const [isPortfolioEditOpen, setIsPortfolioEditOpen] = useState(false);
    const [isDailyLogEditOpen, setIsDailyLogEditOpen] = useState(false);
    const [editDate, setEditDate] = useState<Date>(new Date());

    async function fetchClasses() {
        try {
            const data = await getClasses();
            setClasses(data);
        } catch (error) {
            console.error("Erro ao buscar turmas:", error);
        }
    }

    async function fetchStudents() {
        try {
            const data = await getStudents();
            setStudents(data);
        } catch (error) {
            console.error("Erro ao buscar alunos:", error);
        }
    }

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            await Promise.all([fetchClasses(), fetchStudents()]);
            setIsLoading(false);
        };
        loadData();
    }, []);

    const isTeacher = currentUser?.role === "teacher";
    const teacherClasses = isTeacher
        ? classes.filter(c => c.teacherId === currentUser?.id || c.assistantId === currentUser?.id || currentUser?.assignedClassIds?.includes(c.id))
        : classes;

    const availableClasses = isTeacher ? teacherClasses : classes;

    // Filter students based on class and role
    const visibleStudents = currentUser?.role === "guardian"
        ? students.filter(s => currentUser.linkedStudentIds?.includes(s.id))
        : (isTeacher
            ? (selectedClassId === "all"
                ? students.filter(s => teacherClasses.some(c => c.id === s.classId))
                : students.filter(s => s.classId === selectedClassId))
            : (selectedClassId === "all" ? students : students.filter(s => s.classId === selectedClassId)));

    // Use manual selection or default to first student in the filtered list
    const effectiveStudentId = (manualSelection && visibleStudents.find(s => s.id === manualSelection))
        ? manualSelection
        : (visibleStudents.length > 0 ? visibleStudents[0].id : "");

    const selectedStudent = students.find(s => s.id === effectiveStudentId);

    const handleEditPortfolio = (dateStr: string) => {
        setEditDate(parseISO(dateStr));
        setIsPortfolioEditOpen(true);
    };

    const handleEditDailyLog = (dateStr: string) => {
        setEditDate(parseISO(dateStr));
        setIsDailyLogEditOpen(true);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12 min-h-[500px]">
                <Loader2 className="w-8 h-8 text-slate-400 animate-spin mr-3" />
                <div className="text-slate-500 text-lg animate-pulse">Carregando relatórios...</div>
            </div>
        );
    }

    if (isTeacher && teacherClasses.length === 0) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Relatórios de Desenvolvimento</h1>
                    <p className="text-slate-500">Acompanhe o progresso e o dia a dia das crianças.</p>
                </div>
                <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-10 text-center max-w-lg mx-auto shadow-sm">
                    <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-700">
                        <User className="w-7 h-7" />
                    </div>
                    <h3 className="text-lg font-bold text-amber-900 mb-2">Nenhuma turma vinculada ao seu perfil</h3>
                    <p className="text-amber-700/90 text-sm leading-relaxed">
                        Você está autenticado como professor(a), mas ainda não possui nenhuma turma atribuída. Peça à administração ou coordenação da escola para vincular sua turma no painel de Docentes / Turmas.
                    </p>
                </div>
            </div>
        );
    }

    if (!selectedStudent && visibleStudents.length === 0) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Relatórios de Desenvolvimento</h1>
                    <p className="text-slate-500">Acompanhe o progresso e o dia a dia das crianças.</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-10 text-center max-w-lg mx-auto shadow-sm">
                    <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
                        <User className="w-7 h-7" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Nenhum aluno encontrado</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                        {selectedClassId !== "all" 
                            ? "Não há alunos cadastrados nesta turma selecionada."
                            : "Não foram encontrados alunos disponíveis para o seu acesso."}
                    </p>
                </div>
            </div>
        );
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
                                <SelectItem value="all">Todas as {isTeacher ? "Minhas Turmas" : "Turmas"}</SelectItem>
                                {availableClasses.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}

                    {/* Period Filter */}
                    <div className="flex items-center gap-2">
                        <Select value={selectedPeriod === "all" ? "all" : selectedPeriod.split(" / ")[0]} onValueChange={(val) => {
                            if (val === "all") setSelectedPeriod("all");
                            else setSelectedPeriod(`${val} / ${selectedPeriod === "all" ? new Date().getFullYear() : selectedPeriod.split(" / ")[1] || new Date().getFullYear()}`);
                        }}>
                            <SelectTrigger className="w-[150px] bg-white">
                                <SelectValue placeholder="Semestre" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Qualquer Sem.</SelectItem>
                                {SEMESTERS.map(sem => (
                                    <SelectItem key={sem} value={sem}>{sem}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={selectedPeriod === "all" ? "all" : selectedPeriod.split(" / ")[1]} onValueChange={(val) => {
                            if (val === "all") setSelectedPeriod("all");
                            else setSelectedPeriod(`${selectedPeriod === "all" ? "1º Semestre" : selectedPeriod.split(" / ")[0] || "1º Semestre"} / ${val}`);
                        }}>
                            <SelectTrigger className="w-[110px] bg-white">
                                <SelectValue placeholder="Ano" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Qualquer Ano</SelectItem>
                                {YEARS.map(ano => (
                                    <SelectItem key={ano} value={ano}>{ano}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

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
                        Relatório BNCC
                    </TabsTrigger>
                    <TabsTrigger value="ibira" className="flex-1 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm transition-all font-semibold">
                        Relatório Ibirá
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
                        {/* 1. Skill Chart - filtrado por BNCC */}
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                                Desenvolvimento de Habilidades e Competências (por Áreas BNCC)
                            </h2>
                            <p className="text-slate-500 mb-6">Comparativo entre o currículo proposto e o nível de consolidação da criança.</p>
                            {selectedStudent ? (
                                <SkillsChart student={selectedStudent} filter="bncc" period={selectedPeriod} />
                            ) : (
                                <div className="text-center py-12 text-slate-400">Selecione um aluno para visualizar</div>
                            )}
                        </div>

                        {/* 2. Milestone Grid - filtrado por BNCC */}
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-orange-500 rounded-full" />
                                Trilha de Habilidades e Competências (BNCC)
                            </h2>
                            {selectedStudent ? (
                                <MilestoneReport student={selectedStudent} filter="bncc" period={selectedPeriod} />
                            ) : (
                                <div className="text-center py-12 text-slate-400">Selecione um aluno para visualizar</div>
                            )}
                        </div>
                    </div>
                </TabsContent>

                {/* ── ABA IBIRÁ ── */}
                <TabsContent value="ibira" className="animate-in fade-in-50 duration-500 slide-in-from-bottom-2">
                    <div className="mb-4 space-y-16">
                        {/* Skill Chart - filtrado por Ibirá */}
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-green-500 rounded-full" />
                                Desenvolvimento de Habilidades e Competências (por Áreas IBIRÁ)
                            </h2>
                            <p className="text-slate-500 mb-6">Comparativo entre as habilidades e competências Ibirá propostas e o nível de consolidação da criança.</p>
                            {selectedStudent ? (
                                <SkillsChart student={selectedStudent} filter="ibira" period={selectedPeriod} />
                            ) : (
                                <div className="text-center py-12 text-slate-400">Selecione um aluno para visualizar</div>
                            )}
                        </div>

                        {/* Milestone Grid - filtrado por Ibirá */}
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-green-500 rounded-full" />
                                Trilha de Habilidades e Competências (IBIRÁ)
                            </h2>
                            {selectedStudent ? (
                                <MilestoneReport student={selectedStudent} filter="ibira" period={selectedPeriod} />
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
                        classes={classes}
                        classId={selectedStudent.classId}
                        students={students}
                    />
                    <DailyLogDialog
                        key={`edit-log-${editDate.toISOString()}-${selectedStudent.classId}`}
                        open={isDailyLogEditOpen}
                        onOpenChange={setIsDailyLogEditOpen}
                        date={editDate}
                        classId={selectedStudent.classId}
                        students={students}
                    />
                </>
            )}
        </div>
    );
}

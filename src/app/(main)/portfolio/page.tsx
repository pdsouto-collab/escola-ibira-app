"use client";

import React, { useState, useMemo, useRef } from "react";
import { useAppStore } from "@/lib/store";
import { Assessment } from "@/lib/data";
import { TreeRatingPicker } from "@/components/assessment/tree-rating-picker";
import { AssessmentDrawer } from "@/components/assessment/assessment-drawer";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
    BookMarked, Calendar, User, Users, ClipboardList, Pencil, FileText,
    Image as ImageIcon, File, ChevronRight, FolderKanban, Star
} from "lucide-react";

// ────────────────────────────────────────────
// Mini tree indicator (read-only, compact)
// ────────────────────────────────────────────
function MiniTree({ rating }: { rating?: number }) {
    if (!rating) return <span className="text-slate-300 text-xs italic">Sem nota</span>;
    const trees = ["🌱", "🌿", "🌳", "🌲", "🍎"];
    const colors = ["text-green-300", "text-green-400", "text-green-500", "text-green-600", "text-green-700"];
    return (
        <span className={cn("text-base font-bold", colors[rating - 1])}>
            {trees[rating - 1]} <span className="text-xs font-medium">{rating}/5</span>
        </span>
    );
}

// ────────────────────────────────────────────
// Small attachment thumbnail
// ────────────────────────────────────────────
function AttachmentThumb({ att }: { att: Assessment["attachments"][0] }) {
    if (att.type === "photo") {
        // eslint-disable-next-line @next/next/no-img-element
        return <img src={att.url} alt={att.name} className="w-10 h-10 rounded object-cover border" />;
    }
    return (
        <div className="w-10 h-10 rounded border bg-slate-100 flex items-center justify-center">
            <File className="w-4 h-4 text-slate-400" />
        </div>
    );
}

// ────────────────────────────────────────────
// Assessment Card
// ────────────────────────────────────────────
function AssessmentCard({ assessment, onEdit, students, classes }: {
    assessment: Assessment;
    onEdit: () => void;
    students: ReturnType<typeof useAppStore>["students"];
    classes: ReturnType<typeof useAppStore>["classes"];
}) {
    const student = assessment.studentId ? students.find(s => s.id === assessment.studentId) : null;
    const cls = assessment.classId
        ? classes.find(c => c.id === assessment.classId)
        : (student ? classes.find(c => c.id === student.classId) : null);
    const date = new Date(assessment.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

    return (
        <div className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-all group">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar className="w-3 h-3" />
                    <span>{date}</span>
                    {assessment.scope === "class" ? (
                        <span className="flex items-center gap-1 ml-1 text-indigo-600 font-medium">
                            <Users className="w-3 h-3" /> {cls?.name || "Turma"}
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 ml-1 text-violet-600 font-medium">
                            <User className="w-3 h-3" /> {student?.name || "Aluno"}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <MiniTree rating={assessment.rating} />
                    <button
                        type="button"
                        onClick={onEdit}
                        className="p-1 text-slate-300 hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                        <Pencil className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* Observations */}
            {assessment.observations && (
                <p className="text-sm text-slate-700 leading-relaxed mb-3 line-clamp-3">
                    &ldquo;{assessment.observations}&rdquo;
                </p>
            )}

            {/* Attachments */}
            {assessment.attachments.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                    {assessment.attachments.map(att => (
                        <AttachmentThumb key={att.id} att={att} />
                    ))}
                </div>
            )}
        </div>
    );
}

// ────────────────────────────────────────────
// View: By Project
// ────────────────────────────────────────────
function ProjectView({
    projectFilter, allProjects, assessments, schedule, students, classes, onAvaliacao
}: {
    projectFilter: string;
    allProjects: ReturnType<typeof useAppStore>["projects"];
    assessments: Assessment[];
    schedule: ReturnType<typeof useAppStore>["schedule"];
    students: ReturnType<typeof useAppStore>["students"];
    classes: ReturnType<typeof useAppStore>["classes"];
    onAvaliacao: (ctx: Partial<Assessment> & { contextLabel: string }) => void;
}) {
    const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
    const projects = projectFilter === "all" ? allProjects : allProjects.filter(p => p.id === projectFilter);

    return (
        <div className="space-y-8">
            {projects.map(project => {
                const sessions = schedule.filter(s => s.projectId === project.id);
                const projectAssessments = assessments.filter(a => a.projectId === project.id);
                const avgRating = projectAssessments.filter(a => a.rating).reduce((acc, a, _, arr) => acc + (a.rating ?? 0) / arr.length, 0);

                return (
                    <div key={project.id} className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                        {/* Project Header */}
                        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FolderKanban className="w-5 h-5 text-white/80" />
                                <div>
                                    <h2 className="text-white font-bold text-lg">{project.title}</h2>
                                    <p className="text-violet-200 text-sm">{sessions.length} sess&#xF5;es &bull; {projectAssessments.length} avalia&#xE7;&#xF5;es</p>
                                </div>
                            </div>
                            {avgRating > 0 && (
                                <div className="bg-white/20 rounded-xl px-3 py-1.5 text-right">
                                    <p className="text-[10px] text-white/70 uppercase tracking-wide">M&#xE9;dia</p>
                                    <p className="text-white font-bold text-sm">{avgRating.toFixed(1)}/5</p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Sessions */}
                            {sessions.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3">Sess&#xF5;es</h3>
                                    <div className="space-y-3">
                                        {sessions.map(session => {
                                            const sessionAssessments = projectAssessments.filter(a => a.sessionId === session.id);
                                            const dateStr = session.date
                                                ? (typeof session.date === "string" ? session.date.split("-").reverse().join("/") : "")
                                                : "";
                                            return (
                                                <div key={session.id} className="flex items-center justify-between border rounded-xl px-4 py-3 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                                                    <div>
                                                        <p className="font-semibold text-slate-800 text-sm">{session.title}</p>
                                                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                                            <Calendar className="w-3 h-3" /> {dateStr}
                                                            <span className="text-slate-300">&#xB7;</span>
                                                            {session.time} &#x2013; {session.endTime}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        {sessionAssessments.length > 0 ? (
                                                            <MiniTree rating={sessionAssessments[sessionAssessments.length - 1]?.rating} />
                                                        ) : (
                                                            <span className="text-xs text-slate-400 italic">Sem avalia&#xE7;&#xE3;o</span>
                                                        )}
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-7 px-2 text-xs text-green-600 border-green-200 hover:bg-green-50"
                                                            onClick={() => onAvaliacao({
                                                                sessionId: session.id,
                                                                projectId: project.id,
                                                                contextLabel: `${session.title} · ${dateStr}`
                                                            })}
                                                        >
                                                            <ClipboardList className="w-3 h-3 mr-1" />Avaliar
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Assessments */}
                            {projectAssessments.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3">Avalia&#xE7;&#xF5;es Registradas</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {projectAssessments.map(a => (
                                            <AssessmentCard
                                                key={a.id}
                                                assessment={a}
                                                onEdit={() => setEditingAssessment(a)}
                                                students={students}
                                                classes={classes}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {projectAssessments.length === 0 && sessions.length === 0 && (
                                <p className="text-slate-400 text-sm text-center py-4">Nenhuma sess&#xE3;o ou avalia&#xE7;&#xE3;o ainda.</p>
                            )}
                        </div>
                    </div>
                );
            })}

            {editingAssessment && (
                <AssessmentDrawer
                    open={!!editingAssessment}
                    onOpenChange={(open) => { if (!open) setEditingAssessment(null); }}
                    sessionId={editingAssessment.sessionId}
                    projectId={editingAssessment.projectId}
                    defaultClassId={editingAssessment.classId}
                    contextLabel="Editar avalia&#xE7;&#xE3;o"
                />
            )}
        </div>
    );
}

// ────────────────────────────────────────────
// View: By Student
// ────────────────────────────────────────────
function StudentView({
    assessments, students, classes, projects, schedule, studentFilter, classFilter, onAvaliacao
}: {
    assessments: Assessment[];
    students: ReturnType<typeof useAppStore>["students"];
    classes: ReturnType<typeof useAppStore>["classes"];
    projects: ReturnType<typeof useAppStore>["projects"];
    schedule: ReturnType<typeof useAppStore>["schedule"];
    studentFilter: string;
    classFilter: string;
    onAvaliacao: (ctx: Partial<Assessment> & { contextLabel: string }) => void;
}) {
    const filteredStudents = students.filter(s => {
        if (classFilter !== "all" && s.classId !== classFilter) return false;
        if (studentFilter !== "all" && s.id !== studentFilter) return false;
        return true;
    });

    return (
        <div className="space-y-8">
            {filteredStudents.map(student => {
                const studentAssessments = [
                    // Individual assessments for this student
                    ...assessments.filter(a => a.studentId === student.id),
                    // Class-wide assessments for this student's class
                    ...assessments.filter(a => a.scope === "class" && a.classId === student.classId),
                ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

                const photos = studentAssessments.flatMap(a => a.attachments.filter(att => att.type === "photo"));
                const avgRating = studentAssessments.filter(a => a.rating).reduce((acc, a, _, arr) => acc + (a.rating ?? 0) / arr.length, 0);
                const cls = classes.find(c => c.id === student.classId);

                return (
                    <div key={student.id} className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                        {/* Student Header */}
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg">
                                    {student.name.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-white font-bold text-lg">{student.name}</h2>
                                    <p className="text-emerald-100 text-sm">{cls?.name} &bull; {studentAssessments.length} avalia&#xE7;&#xF5;es</p>
                                </div>
                            </div>
                            {avgRating > 0 && (
                                <div className="bg-white/20 rounded-xl px-3 py-1.5 text-right">
                                    <p className="text-[10px] text-white/70">M&#xE9;dia geral</p>
                                    <p className="text-white font-bold text-sm">{avgRating.toFixed(1)}/5</p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Timeline of assessments */}
                            {studentAssessments.length > 0 ? (
                                <div>
                                    <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3">Linha do Tempo</h3>
                                    <div className="space-y-3">
                                        {studentAssessments.map(a => {
                                            const session = a.sessionId ? schedule.find(s => s.id === a.sessionId) : null;
                                            const project = a.projectId ? projects.find(p => p.id === a.projectId) : null;
                                            const date = new Date(a.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
                                            return (
                                                <div key={a.id} className="flex gap-3 items-start">
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-xs font-bold text-slate-400 w-10 text-center">{date}</span>
                                                        <div className="w-0.5 flex-1 bg-slate-100 mt-1" />
                                                    </div>
                                                    <div className="flex-1 bg-slate-50 rounded-xl p-3 mb-1">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-xs font-semibold text-slate-600">
                                                                {project ? project.title : "Rotina"}
                                                                {session ? ` · ${session.title}` : ""}
                                                            </span>
                                                            <MiniTree rating={a.rating} />
                                                        </div>
                                                        {a.observations && (
                                                            <p className="text-xs text-slate-600 italic line-clamp-2">&ldquo;{a.observations}&rdquo;</p>
                                                        )}
                                                        {a.attachments.length > 0 && (
                                                            <div className="flex gap-1 mt-2">
                                                                {a.attachments.map(att => <AttachmentThumb key={att.id} att={att} />)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-slate-400 text-sm text-center py-4 italic">Nenhuma avalia&#xE7;&#xE3;o registrada ainda.</p>
                            )}

                            {/* Photo gallery */}
                            {photos.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4" /> Galeria de Evid&#xEA;ncias ({photos.length})
                                    </h3>
                                    <div className="grid grid-cols-4 gap-2">
                                        {photos.map((p, i) => (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img key={i} src={p.url} alt={p.name} className="w-full aspect-square object-cover rounded-lg border" />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quick assess button */}
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 border-green-200 hover:bg-green-50"
                                onClick={() => onAvaliacao({ studentId: student.id, defaultClassId: student.classId, contextLabel: student.name } as Partial<Assessment> & { contextLabel: string })}
                            >
                                <ClipboardList className="w-3.5 h-3.5 mr-1.5" /> Nova avalia&#xE7;&#xE3;o para {student.name.split(" ")[0]}
                            </Button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ────────────────────────────────────────────
// Main Portfolio Page
// ────────────────────────────────────────────
export default function PortfolioPage() {
    const { assessments, projects, students, classes, schedule } = useAppStore();
    const [view, setView] = useState<"project" | "student">("project");
    const [projectFilter, setProjectFilter] = useState("all");
    const [classFilter, setClassFilter] = useState("all");
    const [studentFilter, setStudentFilter] = useState("all");
    const [drawerCtx, setDrawerCtx] = useState<(Partial<Assessment> & { contextLabel: string }) | null>(null);

    const studentsInClass = useMemo(
        () => classFilter === "all" ? students : students.filter(s => s.classId === classFilter),
        [students, classFilter]
    );

    const handleOpenReport = (projectId: string, studentId: string) => {
        window.open(`/portfolio/report?project=${projectId}&student=${studentId}`, "_blank");
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Page Header */}
            <div className="bg-white border-b px-8 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                        <BookMarked className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Portf&#xF3;lio</h1>
                        <p className="text-slate-500 text-sm">{assessments.length} avalia&#xE7;&#xF5;es registradas</p>
                    </div>
                </div>
                {/* View switcher */}
                <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
                    <button
                        onClick={() => setView("project")}
                        className={cn("px-4 py-1.5 rounded-lg text-sm font-medium transition-all", view === "project" ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700")}
                    >
                        <FolderKanban className="w-4 h-4 inline mr-1.5" /> Por Projeto
                    </button>
                    <button
                        onClick={() => setView("student")}
                        className={cn("px-4 py-1.5 rounded-lg text-sm font-medium transition-all", view === "student" ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700")}
                    >
                        <User className="w-4 h-4 inline mr-1.5" /> Por Aluno
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white border-b px-8 py-3 flex items-center gap-3">
                {view === "project" && (
                    <Select value={projectFilter} onValueChange={setProjectFilter}>
                        <SelectTrigger className="w-56 h-8 text-sm"><SelectValue placeholder="Todos os projetos" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os projetos</SelectItem>
                            {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
                        </SelectContent>
                    </Select>
                )}
                {view === "student" && (
                    <>
                        <Select value={classFilter} onValueChange={v => { setClassFilter(v); setStudentFilter("all"); }}>
                            <SelectTrigger className="w-44 h-8 text-sm"><SelectValue placeholder="Todas as turmas" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas as turmas</SelectItem>
                                {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={studentFilter} onValueChange={setStudentFilter}>
                            <SelectTrigger className="w-48 h-8 text-sm"><SelectValue placeholder="Todos os alunos" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos os alunos</SelectItem>
                                {studentsInClass.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </>
                )}
                {view === "project" && projectFilter !== "all" && studentFilter !== "all" && (
                    <Button size="sm" variant="outline" className="ml-auto text-xs gap-1.5" onClick={() => handleOpenReport(projectFilter, studentFilter)}>
                        <FileText className="w-3.5 h-3.5" /> Gerar Report Card
                    </Button>
                )}
                {assessments.length === 0 && (
                    <p className="text-xs text-slate-400 ml-auto">Fa&#xE7;a a primeira avalia&#xE7;&#xE3;o nas Rotinas para come&#xE7;ar!</p>
                )}
            </div>

            {/* Content */}
            <div className="px-8 py-6 max-w-5xl mx-auto">
                {view === "project" ? (
                    <ProjectView
                        projectFilter={projectFilter}
                        allProjects={projects}
                        assessments={assessments}
                        schedule={schedule}
                        students={students}
                        classes={classes}
                        onAvaliacao={(ctx) => setDrawerCtx(ctx)}
                    />
                ) : (
                    <StudentView
                        assessments={assessments}
                        students={students}
                        classes={classes}
                        projects={projects}
                        schedule={schedule}
                        studentFilter={studentFilter}
                        classFilter={classFilter}
                        onAvaliacao={(ctx) => setDrawerCtx(ctx)}
                    />
                )}
            </div>

            {/* Floating assessment drawer */}
            {drawerCtx && (
                <AssessmentDrawer
                    open={!!drawerCtx}
                    onOpenChange={(open) => { if (!open) setDrawerCtx(null); }}
                    sessionId={drawerCtx.sessionId}
                    projectId={drawerCtx.projectId}
                    defaultClassId={drawerCtx.classId ?? (drawerCtx as Record<string, string>).defaultClassId}
                    defaultStudentId={drawerCtx.studentId}
                    contextLabel={drawerCtx.contextLabel}
                />
            )}
        </div>
    );
}

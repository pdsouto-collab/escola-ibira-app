"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SEMESTERS } from "@/constants/semesters";
import { YEARS } from "@/constants/years";
import { Assessment } from "@/types/assessment";
import { AssessmentService } from "@/services/assessment.service";
import { AssessmentDrawer } from "@/components/assessment/assessment-drawer";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
    BookMarked, Calendar, User, Users, ClipboardList, Pencil, FileText,
    Image as ImageIcon, File, FolderKanban, Star, Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ProgressChart, ProgressChartData } from "@/components/assessment/progress-chart";
import { LibraryItem } from "@/types/library-item";
import { getListBncc } from "@/services/bncc.service";
import { getClasses } from "@/services/school-class.service";
import { getStudents } from "@/services/student.service";
import { SchoolClass } from "@/types/school-class";
import { Student } from "@/types/student";
import { Project } from "@/types/project";
import { getProjects } from "@/services/project.service";
import { ScheduleItem } from "@/types/schedule";
import { getSchedules } from "@/services/schedule.service";
import { getKnowledgeTrees } from "@/services/knowledge.service";
import { matchesPeriod } from "@/lib/filter-utils";

// ────────────────────────────────────────────
// Helper: find node name recursively
// ────────────────────────────────────────────
const resolveNodeInfo = (id: string, skillsTree: any[], contentsTree: any[], libraryItems: any[]) => {
    // Collect possible matching IDs (including codes)
    const validIds = new Set<string>([id]);
    const libraryItem = libraryItems.find(item => item.id === id || item.code === id);
    if (libraryItem) {
        validIds.add(libraryItem.id);
        if (libraryItem.code) validIds.add(libraryItem.code);
    }

    // 1. Search in Knowledge Trees (Skills and Contents)
    const searchTrees = (nodes: any[]): any | null => {
        for (const node of nodes) {
            if (validIds.has(node.id) || (node.libraryItemId && validIds.has(node.libraryItemId))) {
                return {
                    id: node.id,
                    name: node.name,
                    code: node.code || (node.libraryItemId ? node.libraryItemId : null),
                    description: node.description,
                    level: node.level
                };
            }
            if (node.children) {
                const found = searchTrees(node.children);
                if (found) return found;
            }
        }
        return null;
    };

    const treeNode = searchTrees([...skillsTree, ...contentsTree]);
    if (treeNode) return treeNode;

    // 2. Fallback to Library Item
    if (libraryItem) return {
        id: libraryItem.id,
        name: libraryItem.name,
        code: libraryItem.code || libraryItem.id,
        description: libraryItem.description,
        level: libraryItem.type === "skill" ? "micro" : "atomico"
    };

    // 3. Fallback
    return { id, name: id, code: id };
};

/** Finds all evaluatable nodes (L3/L4) within a given node or set of IDs */
const findEvaluatableNodes = (allNodes: any[], targetIds: string[]): any[] => {
    const results: any[] = [];
    const search = (nodes: any[], active = false) => {
        for (const node of nodes) {
            const nodeIsTarget = targetIds.includes(node.id) || (node.libraryItemId && targetIds.includes(node.libraryItemId));
            const isTargetOrDescendant = active || nodeIsTarget;

            // L3 (micro) and L4 (atomico) are assessment-ready
            if (isTargetOrDescendant && (node.level === "micro" || node.level === "atomico")) {
                results.push(node);
            }
            if (node.children) {
                search(node.children, isTargetOrDescendant);
            }
        }
    };
    search(allNodes);
    return results;
};

const getProjectNodes = (project: any, skillsTree: any[], contentsTree: any[], libraryItems: any[]) => {
    const directSkillIds = project.bnccSkillIds || [];
    const directContentIds = project.contentIds || [];

    // Expand search scope by including linked library codes
    const targetSet = new Set<string>();
    [...directSkillIds, ...directContentIds].forEach(id => {
        targetSet.add(id);
        const li = libraryItems.find(item => item.id === id || item.code === id);
        if (li) {
            targetSet.add(li.id);
            if (li.code) targetSet.add(li.code);
        }
    });

    const recursiveNodes = findEvaluatableNodes([...skillsTree, ...contentsTree], Array.from(targetSet));

    const displayedNodeIds = new Set<string>();
    const displayedKeys = new Set<string>(); // to prevent duplicates with same BNCC code
    const microNodes: any[] = [];
    const atomicoNodes: any[] = [];

    // 1. Add direct skills/contents
    [...directSkillIds, ...directContentIds].forEach(id => {
        const info = resolveNodeInfo(id, skillsTree, contentsTree, libraryItems);
        const dedupKey = info.code || info.libraryItemId || info.name;
        if (!displayedNodeIds.has(info.id) && !displayedKeys.has(dedupKey)) {
            if (info.level === "atomico") atomicoNodes.push(info);
            else microNodes.push(info);
            displayedNodeIds.add(info.id);
            if (dedupKey) displayedKeys.add(dedupKey);
        }
    });

    // 2. Add recursive evaluatable nodes (if not already displayed)
    recursiveNodes.forEach(node => {
        const dedupKey = node.code || node.libraryItemId || node.name;
        if (!displayedNodeIds.has(node.id) && !displayedKeys.has(dedupKey)) {
            const info = {
                ...node,
                code: node.code || (node.libraryItemId ? node.libraryItemId : null)
            };
            if (info.level === "atomico") atomicoNodes.push(info);
            else microNodes.push(info);
            displayedNodeIds.add(node.id);
            if (dedupKey) displayedKeys.add(dedupKey);
        }
    });

    return { microNodes, atomicoNodes };
};


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
    students: Student[];
    classes: SchoolClass[];
}) {
    const student = assessment.studentId ? students.find(s => s.id === assessment.studentId) : null;
    const cls = assessment.classId
        ? classes.find(c => c.id === assessment.classId)
        : (student ? classes.find(c => c.id === student.classId) : null);
    const date = new Date(assessment.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

    return (
        <div className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-all group">
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
            {assessment.observations && (
                <p className="text-sm text-slate-700 leading-relaxed mb-3 line-clamp-3">
                    &ldquo;{assessment.observations}&rdquo;
                </p>
            )}
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
    projectFilter, allProjects, assessments, schedule, students, classes, skillsTree, contentsTree, libraryItems, onAvaliacao, onEdit
}: {
    projectFilter: string;
    allProjects: Project[];
    assessments: Assessment[];
    schedule: ScheduleItem[];
    students: Student[];
    classes: SchoolClass[];
    skillsTree: any[];
    contentsTree: any[];
    libraryItems: LibraryItem[]
    onAvaliacao: (ctx: Partial<Assessment> & { contextLabel: string }) => void;
    onEdit: (assessment: Assessment) => void;
}) {
    const projects = projectFilter === "all" ? allProjects : allProjects.filter(p => p.id === projectFilter);

    useEffect(() => {
        getListaBNCC();
    }, [])

    async function getListaBNCC() {
        await getListBncc().then((data) => {
            libraryItems = data;
        });
    }

    return (
        <div className="space-y-8">
            {projects.map(project => {
                const sessions = schedule.filter(s => s.projectId === project.id);
                const projectAssessments = assessments.filter(a => a.projectId === project.id);
                const avgRating = projectAssessments.filter(a => a.rating).reduce((acc, a, _, arr) => acc + (a.rating ?? 0) / arr.length, 0);

                return (
                    <div key={project.id} className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FolderKanban className="w-5 h-5 text-white/80" />
                                <div>
                                    <h2 className="text-white font-bold text-lg">{project.title}</h2>
                                    <p className="text-violet-200 text-sm">{sessions.length} sessões &bull; {projectAssessments.length} avaliações</p>
                                </div>
                            </div>
                            {avgRating > 0 && (
                                <div className="bg-white/20 rounded-xl px-3 py-1.5 text-right">
                                    <p className="text-[10px] text-white/70 uppercase tracking-wide">Média</p>
                                    <p className="text-white font-bold text-sm">{avgRating.toFixed(1)}/5</p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 space-y-8">
                            {sessions.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-slate-400" /> Sessões
                                    </h3>
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
                                                            {session.time} – {session.endTime}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        {sessionAssessments.length > 0 ? (
                                                            <MiniTree rating={sessionAssessments[sessionAssessments.length - 1]?.rating} />
                                                        ) : (
                                                            <span className="text-xs text-slate-400 italic">Sem avaliação</span>
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

                            {/* Skills/Contents/Atomics block */}
                            {(() => {
                                const { microNodes, atomicoNodes } = getProjectNodes(project, skillsTree, contentsTree, libraryItems);
                                if (microNodes.length === 0 && atomicoNodes.length === 0) return null;

                                return (
                                    <>
                                        {microNodes.length > 0 && (
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                    <Star className="w-4 h-4 text-amber-500" /> Habilidades & Competências
                                                </h3>
                                                <div className="grid grid-cols-1 gap-2">
                                                    {microNodes.map(node => (
                                                        <div key={node.id} className="flex flex-col border rounded-xl bg-slate-50/30 hover:bg-slate-50 transition-colors group overflow-hidden">
                                                            <div className="flex items-center justify-between px-4 py-2">
                                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                                    <Badge variant="outline" className="text-[10px] font-mono bg-white border-slate-200 text-slate-600 shrink-0">
                                                                        {node.code || "Sk"}
                                                                    </Badge>
                                                                    <p className="text-sm text-slate-700 truncate font-semibold">{node.name}</p>
                                                                </div>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-7 px-2 text-[10px] text-indigo-700 opacity-0 group-hover:opacity-100 hover:bg-indigo-100/50"
                                                                    onClick={() => onAvaliacao({
                                                                        knowledgeNodeId: node.id,
                                                                        projectId: project.id,
                                                                        contextLabel: node.name
                                                                    })}
                                                                >
                                                                    <ClipboardList className="w-3 h-3 mr-1" />Avaliar
                                                                </Button>
                                                            </div>
                                                            {node.description && (
                                                                <div className="px-4 pb-2 pt-0">
                                                                    <p className="text-[10px] text-slate-500 leading-tight italic pl-1 border-l-2 border-slate-200 ml-2">
                                                                        {node.description}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {atomicoNodes.length > 0 && (
                                            <div className="mt-6">
                                                <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                    <Star className="w-4 h-4 text-amber-500" /> Habilidades Específicas & Evidências
                                                </h3>
                                                <div className="grid grid-cols-1 gap-2">
                                                    {atomicoNodes.map(node => (
                                                        <div key={node.id} className="flex flex-col border rounded-xl bg-amber-50/30 hover:bg-amber-50 transition-colors group overflow-hidden">
                                                            <div className="flex items-center justify-between px-4 py-2">
                                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                                    <Badge variant="outline" className="text-[10px] font-mono bg-white border-amber-200 text-amber-700 shrink-0">
                                                                        {node.code || "Ev"}
                                                                    </Badge>
                                                                    <p className="text-sm text-slate-700 truncate font-semibold">{node.name}</p>
                                                                </div>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-7 px-2 text-[10px] text-amber-700 opacity-0 group-hover:opacity-100 hover:bg-amber-100/50"
                                                                    onClick={() => onAvaliacao({
                                                                        knowledgeNodeId: node.id,
                                                                        projectId: project.id,
                                                                        contextLabel: node.name
                                                                    })}
                                                                >
                                                                    <ClipboardList className="w-3 h-3 mr-1" />Avaliar
                                                                </Button>
                                                            </div>
                                                            {node.description && (
                                                                <div className="px-4 pb-2 pt-0">
                                                                    <p className="text-[10px] text-slate-500 leading-tight italic pl-1 border-l-2 border-slate-200 ml-2">
                                                                        {node.description}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                );
                            })()}

                            {projectAssessments.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3">Avaliações Registradas</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {projectAssessments.map(a => (
                                            <AssessmentCard
                                                key={a.id}
                                                assessment={a}
                                                onEdit={() => onEdit(a)}
                                                students={students}
                                                classes={classes}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {projectAssessments.length === 0 && sessions.length === 0 && (
                                <p className="text-slate-400 text-sm text-center py-4">Nenhuma sessão ou avaliação ainda.</p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ────────────────────────────────────────────
// View: By Student
// ────────────────────────────────────────────
function StudentView({
    assessments, students, classes, projects, schedule, skillsTree, contentsTree, libraryItems, studentFilter, classFilter, projectFilter, setProjectFilter, onAvaliacao, onEdit
}: {
    assessments: Assessment[];
    students: Student[];
    classes: SchoolClass[];
    projects: Project[];
    schedule: ScheduleItem[];
    skillsTree: any[];
    contentsTree: any[];
    libraryItems: LibraryItem[]
    studentFilter: string;
    classFilter: string;
    projectFilter: string;
    setProjectFilter: (v: string) => void;
    onAvaliacao: (ctx: Partial<Assessment> & { contextLabel: string }) => void;
    onEdit: (assessment: Assessment) => void;
}) {

    useEffect(() => {
        getListaBNCC();
    }, [])

    async function getListaBNCC() {
        await getListBncc().then((data) => {
            libraryItems = data;
        });
    }

    const filteredStudents = students.filter(s => {
        if (classFilter !== "all" && s.classId !== classFilter) return false;
        if (studentFilter !== "all" && s.id !== studentFilter) return false;
        return true;
    });

    return (
        <div className="space-y-8">
            {filteredStudents.map(student => {
                const studentAssessments = [
                    ...assessments.filter(a => a.studentId === student.id),
                    ...assessments.filter(a => a.scope === "class" && a.classId === student.classId),
                ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

                const photos = studentAssessments.flatMap(a => a.attachments.filter(att => att.type === "photo"));
                const avgRating = studentAssessments.filter(a => a.rating).reduce((acc, a, _, arr) => acc + (a.rating ?? 0) / arr.length, 0);
                const cls = classes.find(c => c.id === student.classId);

                return (
                    <div key={student.id} className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg">
                                    {student.name.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-white font-bold text-lg">{student.name}</h2>
                                    <p className="text-emerald-100 text-sm">{cls?.name} &bull; {studentAssessments.length} avaliações</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {avgRating > 0 && (
                                    <div className="bg-white/20 rounded-xl px-3 py-1.5 text-right">
                                        <p className="text-[10px] text-white/70">Média geral</p>
                                        <p className="text-white font-bold text-sm">{avgRating.toFixed(1)}/5</p>
                                    </div>
                                )}
                                <Link href={`/portfolio/report?student=${student.id}`}>
                                    <Button size="sm" variant="outline" className="h-9 gap-1.5 bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white transition-colors">
                                        <FileText className="w-4 h-4" /> Relatório
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {(() => {
                                // Find projects linked to this student
                                const studentProjects = projects.filter(p => {
                                    const stuClass = classes.find(c => String(c.id) === String(student.classId));
                                    const classNameSlug = stuClass ? stuClass.name.toLowerCase().replace(/\s+/g, '-').replace(/ii/g, 'ii').replace(/i/g, 'i') : ""; // basic normalization

                                    const studentMatch = (p.students || []).some(id => String(id) === String(student.id));
                                    const classMatch = (p.classes || []).some(id => {
                                        const strId = String(id);
                                        return strId === String(student.classId) || 
                                               strId.toLowerCase() === classNameSlug ||
                                               (stuClass && strId.toLowerCase().includes(stuClass.name.split(" ")[0].toLowerCase()));
                                    });

                                    // Fallback if no specific assignment
                                    const hasAssignments = (p.classes && p.classes.length > 0) || (p.students && p.students.length > 0);
                                    
                                    // If we matched or the project is global
                                    return studentMatch || classMatch || !hasAssignments;
                                });

                                if (studentProjects.length === 0) {
                                    return (
                                        <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed">
                                            <FolderKanban className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                                            <p className="text-slate-500 font-medium">Nenhum projeto associado a este aluno.</p>
                                            <p className="text-slate-400 text-xs mt-1">Crie um projeto e associe à turma deste aluno para realizar avaliações estruturadas.</p>
                                        </div>
                                    );
                                }

                                return (
                                    <div className="space-y-8">
                                        {/* Chart Section */}
                                        {(() => {
                                            const allMicro: any[] = [];
                                            const allAtomico: any[] = [];
                                            studentProjects.forEach(p => {
                                                const { microNodes, atomicoNodes } = getProjectNodes(p, skillsTree, contentsTree, libraryItems);
                                                allMicro.push(...microNodes);
                                                allAtomico.push(...atomicoNodes);
                                            });

                                            const map = new Map();
                                            [...allMicro, ...allAtomico].forEach(n => map.set(n.id, n));
                                            const allNodes = Array.from(map.values());

                                            if (allNodes.length === 0) return null;

                                            const chartDataMap = new Map<string, ProgressChartData>();
                                            allNodes.forEach(node => {
                                                const subject = node.subject || "Outros";
                                                if (!chartDataMap.has(subject)) {
                                                    chartDataMap.set(subject, { subject, proposto: 0, desenvolvido: 0, total: 0 });
                                                }
                                                const data = chartDataMap.get(subject)!;
                                                data.proposto += 1;
                                                data.total += 1;
                                                const nodeAssessment = studentAssessments.find(a => a.knowledgeNodeId === node.id);
                                                if (nodeAssessment && (nodeAssessment.rating ?? 0) >= 3) {
                                                    data.desenvolvido += 1;
                                                }
                                            });
                                            const chartData = Array.from(chartDataMap.values()).sort((a, b) => a.subject.localeCompare(b.subject));

                                            return (
                                                <div className="border rounded-2xl bg-white p-2 shadow-sm mb-6">
                                                    <ProgressChart data={chartData} />
                                                </div>
                                            );
                                        })()}

                                        {/* Projects Section */}
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                                                <FolderKanban className="w-4 h-4 text-indigo-500" /> Projetos & Planos de Aula
                                            </h3>
                                            <div className="grid grid-cols-1 gap-4">
                                            {studentProjects.map(project => {
                                                const projectSessions = schedule.filter(s => s.projectId === project.id);
                                                const { microNodes, atomicoNodes } = getProjectNodes(project, skillsTree, contentsTree, libraryItems);

                                                return (
                                                    <div key={project.id} className="border rounded-xl bg-white overflow-hidden shadow-sm">
                                                        <div className="bg-slate-50 px-4 py-2.5 border-b flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <FolderKanban className="w-4 h-4 text-indigo-500" />
                                                                <span className="text-sm font-bold text-slate-700">{project.title}</span>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <Badge variant="outline" className="text-[10px] bg-white text-slate-500">{projectSessions.length} sessões</Badge>
                                                            </div>
                                                        </div>
                                                        <div className="p-4 space-y-6">
                                                            {projectSessions.length > 0 && (
                                                                <div className="space-y-3">
                                                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                                                        <Calendar className="w-3 h-3" /> Sessões do Projeto
                                                                    </h4>
                                                                    <div className="space-y-2">
                                                                        {projectSessions.map(session => {
                                                                            const sessionAssessment = studentAssessments.find(a => a.sessionId === session.id);
                                                                            const dateStr = session.date ? (typeof session.date === "string" ? session.date.split("-").reverse().join("/") : "") : "";
                                                                            return (
                                                                                <div key={session.id} className="flex items-center justify-between border rounded-xl px-4 py-2.5 bg-slate-50/30 hover:bg-slate-50 transition-colors group">
                                                                                    <div className="min-w-0">
                                                                                        <p className="font-semibold text-slate-800 text-xs truncate">{session.title}</p>
                                                                                        <p className="text-[10px] text-slate-400 mt-0.5">{dateStr} · {session.time}</p>
                                                                                    </div>
                                                                                    <div className="flex items-center gap-3 shrink-0">
                                                                                        {sessionAssessment ? (
                                                                                            <MiniTree rating={sessionAssessment.rating} />
                                                                                        ) : (
                                                                                            <span className="text-[10px] text-slate-400 italic">Sem avaliação</span>
                                                                                        )}
                                                                                        <Button
                                                                                            size="sm"
                                                                                            variant="outline"
                                                                                            className="h-7 px-2 text-[10px] text-green-600 border-green-200 hover:bg-green-50"
                                                                                            onClick={() => onAvaliacao({
                                                                                                sessionId: session.id,
                                                                                                projectId: project.id,
                                                                                                studentId: student.id,
                                                                                                contextLabel: `${student.name.split(" ")[0]}: ${session.title}`
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

                                                            {microNodes.length > 0 && (
                                                                <div className="space-y-3">
                                                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                                                        <Star className="w-3 h-3 text-amber-500" /> Habilidades & Competências
                                                                    </h4>
                                                                    <div className="space-y-2">
                                                                        {microNodes.map(node => {
                                                                            const nodeAssessment = studentAssessments.find(a => a.knowledgeNodeId === node.id);
                                                                            return (
                                                                                <div key={node.id} className="flex flex-col border rounded-xl bg-slate-50/30 hover:bg-slate-50 transition-colors group overflow-hidden">
                                                                                    <div className="flex items-center justify-between px-4 py-2.5">
                                                                                        <div className="flex items-center gap-2 min-w-0">
                                                                                            <Badge variant="outline" className="text-[9px] font-mono bg-white shrink-0 border-slate-200 text-slate-600">
                                                                                                {node.code || "Sk"}
                                                                                            </Badge>
                                                                                            <p className="text-xs text-slate-700 truncate font-semibold">{node.name}</p>
                                                                                        </div>
                                                                                        <div className="flex items-center gap-3 shrink-0">
                                                                                            {nodeAssessment ? (
                                                                                                <MiniTree rating={nodeAssessment.rating} />
                                                                                            ) : (
                                                                                                <span className="text-[10px] text-slate-400 italic">Sem avaliação</span>
                                                                                            )}
                                                                                            <Button
                                                                                                size="sm"
                                                                                                variant="outline"
                                                                                                className="h-7 px-2 text-[10px] text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                                                                                                onClick={() => onAvaliacao({
                                                                                                    knowledgeNodeId: node.id,
                                                                                                    projectId: project.id,
                                                                                                    studentId: student.id,
                                                                                                    contextLabel: `${student.name.split(" ")[0]}: ${node.name}`
                                                                                                })}
                                                                                            >
                                                                                                <ClipboardList className="w-3 h-3 mr-1" />Avaliar
                                                                                            </Button>
                                                                                        </div>
                                                                                    </div>
                                                                                    {node.description && (
                                                                                        <div className="px-4 pb-2.5 pt-0">
                                                                                            <p className="text-[10px] text-slate-500 leading-tight italic pl-1 border-l-2 border-slate-200 ml-2">
                                                                                                {node.description}
                                                                                            </p>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {atomicoNodes.length > 0 && (
                                                                <div className="space-y-3">
                                                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                                                        <Star className="w-3 h-3 text-amber-500" /> Habilidades Específicas & Evidências
                                                                    </h4>
                                                                    <div className="space-y-2">
                                                                        {atomicoNodes.map(node => {
                                                                            const nodeAssessment = studentAssessments.find(a => a.knowledgeNodeId === node.id);
                                                                            return (
                                                                                <div key={node.id} className="flex flex-col border rounded-xl bg-amber-50/30 hover:bg-amber-50 transition-colors group overflow-hidden">
                                                                                    <div className="flex items-center justify-between px-4 py-2.5">
                                                                                        <div className="flex items-center gap-2 min-w-0">
                                                                                            <Badge variant="outline" className="text-[9px] font-mono bg-white shrink-0 border-amber-200 text-amber-700">
                                                                                                {node.code || "Ev"}
                                                                                            </Badge>
                                                                                            <p className="text-xs text-slate-700 truncate font-semibold">{node.name}</p>
                                                                                        </div>
                                                                                        <div className="flex items-center gap-3 shrink-0">
                                                                                            {nodeAssessment ? (
                                                                                                <MiniTree rating={nodeAssessment.rating} />
                                                                                            ) : (
                                                                                                <span className="text-[10px] text-slate-400 italic">Sem avaliação</span>
                                                                                            )}
                                                                                            <Button
                                                                                                size="sm"
                                                                                                variant="outline"
                                                                                                className="h-7 px-2 text-[10px] text-amber-700 border-amber-200 hover:bg-amber-50"
                                                                                                onClick={() => onAvaliacao({
                                                                                                    knowledgeNodeId: node.id,
                                                                                                    projectId: project.id,
                                                                                                    studentId: student.id,
                                                                                                    contextLabel: `${student.name.split(" ")[0]}: ${node.name}`
                                                                                                })}
                                                                                            >
                                                                                                <ClipboardList className="w-3 h-3 mr-1" />Avaliar
                                                                                            </Button>
                                                                                        </div>
                                                                                    </div>
                                                                                    {node.description && (
                                                                                        <div className="px-4 pb-2.5 pt-0">
                                                                                            <p className="text-[10px] text-slate-500 leading-tight italic pl-1 border-l-2 border-slate-200 ml-2">
                                                                                                {node.description}
                                                                                            </p>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                                );
                            })()}

                            {photos.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4" /> Galeria de Vivências ({photos.length})
                                    </h3>
                                    <div className="grid grid-cols-4 gap-2">
                                        {photos.map((p, i) => (
                                            <img key={i} src={p.url} alt={p.name} className="w-full aspect-square object-cover rounded-lg border" />
                                        ))}
                                    </div>
                                </div>
                            )}

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
function PortfolioContent() {
    const [skillsTree, setSkillsTree] = useState<any[]>([]);
        const [contentsTree, setContentsTree] = useState<any[]>([]);
        useEffect(() => {
            getKnowledgeTrees('skill').then(setSkillsTree);
            getKnowledgeTrees('content').then(setContentsTree);
            }, []);
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [isLoadingAssessments, setIsLoadingAssessments] = useState(true);
    const [allProjects, setAllProjects] = useState<Project[]>([]);
    const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoadingClasses, setIsLoadingClasses] = useState(true);
    const [isLoadingStudents, setIsLoadingStudents] = useState(true);
    const [isLoadingSchedules, setIsLoadingSchedules] = useState(true);
    const searchParams = useSearchParams();
    const initialClassId = searchParams.get("classId");

    const [view, setView] = useState<"project" | "student">(initialClassId ? "student" : "project");
    const [projectFilter, setProjectFilter] = useState("all");
    const [semesterFilter, setSemesterFilter] = useState("all");
    const [yearFilter, setYearFilter] = useState("all");
    const [classFilter, setClassFilter] = useState(initialClassId || "all");
    const [studentFilter, setStudentFilter] = useState("all");
    const [drawerCtx, setDrawerCtx] = useState<(Partial<Assessment> & { contextLabel: string }) | null>(null);
    const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);

    const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);

    async function fetchClasses() {
        try {
            const data = await getClasses();
            setClasses(data);
        } catch (error) {
            console.error("Erro ao buscar turmas:", error);
        } finally {
            setIsLoadingClasses(false);
        }
    }

    async function fetchProjects() {
        try {
            const data = await getProjects();
            setAllProjects(data || []);
        } catch (error) {
            console.error("Erro ao buscar projetos:", error);
        }
    }

    async function fetchStudents() {
        try {
            const data = await getStudents();
            setStudents(data);
        } catch (error) {
            console.error("Erro ao buscar alunos:", error);
        } finally {
            setIsLoadingStudents(false);
        }
    }

    async function fetchSchedules() {
        try {
            const data = await getSchedules();
            setSchedule(data);
        } catch (error) {
            console.error("Erro ao buscar agenda:", error);
        } finally {
            setIsLoadingSchedules(false);
        }
    }

    useEffect(() => {
        fetchClasses();
        fetchStudents();
        fetchProjects();
        fetchSchedules();
        fetchAssessments();
        getListaBNCC();
    }, []);

    async function fetchAssessments() {
        try {
            const data = await AssessmentService.getAll();
            setAssessments(data);
        } catch (error) {
            console.error("Erro ao buscar avaliações:", error);
        } finally {
            setIsLoadingAssessments(false);
        }
    }

    async function getListaBNCC() {
        await getListBncc().then(setLibraryItems);
    }

    // Sync class filter if search param changes
    useEffect(() => {
        if (initialClassId) {
            setClassFilter(initialClassId);
            setView("student");
        }
    }, [initialClassId]);

    const studentsInClass = useMemo(
        () => classFilter === "all" ? students : students.filter(s => s.classId === classFilter),
        [students, classFilter]
    );

    const handleOpenReport = (projectId: string, studentId: string) => {
        window.open(`/portfolio/report?project=${projectId}&student=${studentId}`, "_blank");
    };

    const filteredProjects = useMemo(() => {
        return allProjects.filter(p => matchesPeriod(p.period, p.startDate, semesterFilter, yearFilter));
    }, [allProjects, semesterFilter, yearFilter]);

    const filteredAssessments = useMemo(() => {
        return assessments.filter(a => matchesPeriod(a.period, a.createdAt, semesterFilter, yearFilter));
    }, [assessments, semesterFilter, yearFilter]);

    if (isLoadingClasses || isLoadingStudents || isLoadingSchedules || isLoadingAssessments) {
        return (
            <div className="flex items-center justify-center p-12 min-h-screen">
                <Loader2 className="w-8 h-8 text-slate-400 animate-spin mr-3" />
                <div className="text-slate-500 text-lg animate-pulse">Carregando portfólio...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="bg-white border-b px-8 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                        <BookMarked className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Portfólio</h1>
                        <p className="text-slate-500 text-sm">{assessments.length} avaliações registradas</p>
                    </div>
                </div>
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

            <div className="bg-white border-b px-8 py-3 flex items-center gap-3">
                <Select value={semesterFilter} onValueChange={setSemesterFilter}>
                    <SelectTrigger className="w-32 h-8 text-sm"><SelectValue placeholder="Semestre" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todo Sem.</SelectItem>
                        {SEMESTERS.map(sem => <SelectItem key={sem} value={sem}>{sem}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={yearFilter} onValueChange={setYearFilter}>
                    <SelectTrigger className="w-28 h-8 text-sm"><SelectValue placeholder="Ano" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todo Ano</SelectItem>
                        {YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                    </SelectContent>
                </Select>

                {view === "project" && (
                    <Select value={projectFilter} onValueChange={setProjectFilter}>
                        <SelectTrigger className="w-56 h-8 text-sm"><SelectValue placeholder="Todos os projetos" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os projetos</SelectItem>
                            {filteredProjects.map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
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
                <div className="ml-auto flex items-center gap-2">
                    {studentFilter !== "all" && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="text-xs gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            onClick={() => window.open(`/portfolio/report?student=${studentFilter}`, "_blank")}
                        >
                            <FileText className="w-3.5 h-3.5" /> Gerar Report Card do Aluno
                        </Button>
                    )}
                    {projectFilter !== "all" && studentFilter !== "all" && (
                        <Button size="sm" variant="outline" className="text-xs gap-1.5 border-indigo-200 text-indigo-700 hover:bg-indigo-50" onClick={() => handleOpenReport(projectFilter, studentFilter)}>
                            <FileText className="w-3.5 h-3.5" /> Gerar Report Card do Projeto
                        </Button>
                    )}
                </div>
            </div>

            <div className="px-8 py-6 max-w-5xl mx-auto">
                {view === "project" ? (
                    <ProjectView
                        projectFilter={projectFilter}
                        allProjects={filteredProjects}
                        assessments={filteredAssessments}
                        schedule={schedule}
                        students={students}
                        classes={classes}
                        skillsTree={skillsTree}
                        contentsTree={contentsTree}
                        libraryItems={libraryItems}
                        onAvaliacao={(ctx) => setDrawerCtx(ctx)}
                        onEdit={(a) => setEditingAssessment(a)}
                    />
                ) : (
                    <StudentView
                        assessments={filteredAssessments}
                        students={students}
                        classes={classes}
                        projects={filteredProjects}
                        schedule={schedule}
                        skillsTree={skillsTree}
                        contentsTree={contentsTree}
                        libraryItems={libraryItems}
                        studentFilter={studentFilter}
                        classFilter={classFilter}
                        projectFilter={projectFilter}
                        setProjectFilter={setProjectFilter}
                        onAvaliacao={(ctx) => setDrawerCtx(ctx)}
                        onEdit={(a) => setEditingAssessment(a)}
                    />
                )}
            </div>

            {drawerCtx && (
                <AssessmentDrawer
                    open={!!drawerCtx}
                    onOpenChange={(open) => { if (!open) setDrawerCtx(null); }}
                    students={students}
                    knowledgeNodeId={drawerCtx.knowledgeNodeId}
                    sessionId={drawerCtx.sessionId}
                    projectId={drawerCtx.projectId}
                    defaultClassId={drawerCtx.classId}
                    defaultStudentId={drawerCtx.studentId}
                    contextLabel={drawerCtx.contextLabel}
                    onSaved={fetchAssessments}
                />
            )}

            {editingAssessment && (
                <AssessmentDrawer
                    open={!!editingAssessment}
                    onOpenChange={(open) => { if (!open) setEditingAssessment(null); }}
                    students={students}
                    assessmentId={editingAssessment.id}
                    initialRating={editingAssessment.rating}
                    initialObservations={editingAssessment.observations}
                    initialAttachments={editingAssessment.attachments}
                    knowledgeNodeId={editingAssessment.knowledgeNodeId}
                    sessionId={editingAssessment.sessionId}
                    projectId={editingAssessment.projectId}
                    defaultClassId={editingAssessment.classId}
                    defaultStudentId={editingAssessment.studentId}
                    onSaved={fetchAssessments}
                />
            )}
        </div>
    );
}

export default function PortfolioPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center">Carregando portfólio...</div>}>
            <PortfolioContent />
        </Suspense>
    );
}

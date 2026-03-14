"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { Assessment } from "@/lib/data";
import { TreeRatingPicker } from "@/components/assessment/tree-rating-picker";
import { Button } from "@/components/ui/button";
import { Printer, Download, ChevronLeft, Star, Target, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { RadialMatrix } from "@/components/mosaic/radial-matrix";
import { Badge } from "@/components/ui/badge";
import { SkillsChart } from "@/components/reports/skills-chart";
import { CalendarIcon } from "lucide-react";
import { LibraryItem } from "@/types/library-item";
import { getListBncc } from "@/services/bncc.service";

// ─────────────────────────────────────────────────────────────────────────
// Node Resolvers
// ─────────────────────────────────────────────────────────────────────────
const resolveNodeInfo = (id: string, skillsTree: any[], contentsTree: any[], libraryItems: any[]) => {
    const validIds = new Set<string>([id]);
    const libraryItem = libraryItems.find(item => item.id === id || item.code === id);
    if (libraryItem) {
        validIds.add(libraryItem.id);
        if (libraryItem.code) validIds.add(libraryItem.code);
    }
    const searchTrees = (nodes: any[], rootName?: string): any | null => {
        for (const node of nodes) {
            const currentRootName = node.level === "macro" ? node.name : rootName;
            if (validIds.has(node.id) || (node.libraryItemId && validIds.has(node.libraryItemId))) {
                return {
                    id: node.id,
                    name: node.name,
                    code: node.code || (node.libraryItemId ? node.libraryItemId : null),
                    description: node.description,
                    level: node.level,
                    subject: currentRootName || libraryItem?.subGroup || "Outros"
                };
            }
            if (node.children) {
                const found = searchTrees(node.children, currentRootName);
                if (found) return found;
            }
        }
        return null;
    };
    const treeNode = searchTrees([...skillsTree, ...contentsTree]);
    if (treeNode) return treeNode;
    if (libraryItem) return {
        id: libraryItem.id,
        name: libraryItem.name,
        code: libraryItem.code || libraryItem.id,
        description: libraryItem.description,
        level: libraryItem.type === "skill" ? "micro" : "atomico",
        subject: libraryItem.subGroup || "Outros"
    };
    return { id, name: id, code: id, subject: "Outros" };
};

const findEvaluatableNodes = (allNodes: any[], targetIds: string[]): any[] => {
    const results: any[] = [];
    const search = (nodes: any[], active = false) => {
        for (const node of nodes) {
            const nodeIsTarget = targetIds.includes(node.id) || (node.libraryItemId && targetIds.includes(node.libraryItemId));
            const isTargetOrDescendant = active || nodeIsTarget;
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
    const microNodes: any[] = [];
    const atomicoNodes: any[] = [];

    [...directSkillIds, ...directContentIds].forEach(id => {
        const info = resolveNodeInfo(id, skillsTree, contentsTree, libraryItems);
        if (!displayedNodeIds.has(info.id)) {
            if (info.level === "atomico") atomicoNodes.push(info);
            else microNodes.push(info);
            displayedNodeIds.add(info.id);
        }
    });

    recursiveNodes.forEach(node => {
        if (!displayedNodeIds.has(node.id)) {
            const info = {
                ...node,
                code: node.code || (node.libraryItemId ? node.libraryItemId : null)
            };
            if (info.level === "atomico") atomicoNodes.push(info);
            else microNodes.push(info);
            displayedNodeIds.add(node.id);
        }
    });

    return { microNodes, atomicoNodes };
};

// ─────────────────────────────────────────────────────────────────────────
// Helper: average rating
// ─────────────────────────────────────────────────────────────────────────
function avgRating(assessments: Assessment[]): number {
    const rated = assessments.filter(a => a.rating);
    if (!rated.length) return 0;
    return rated.reduce((s, a) => s + (a.rating ?? 0), 0) / rated.length;
}

// ─────────────────────────────────────────────────────────────────────────
// Mini row with tree
// ─────────────────────────────────────────────────────────────────────────
// Removed unused RatingRow function

// ─────────────────────────────────────────────────────────────────────────
// Report Card Component (printable)
// ─────────────────────────────────────────────────────────────────────────
function ReportCard({
    studentId,
    projectId,
}: {
    studentId: string;
    projectId?: string | null;
}) {
    const { projects, students, classes, assessments, schedule, skillsTree, contentsTree, dailyLogs, portfolioEntries } = useAppStore();

    const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
    
    useEffect(() => {
        getListaBNCC();
    }, [])

    async function getListaBNCC(){
        await getListBncc().then(setLibraryItems);
    }

    const student = students.find(s => s.id === studentId);
    if (!student) {
        return <div className="text-center py-20 text-slate-400">Aluno n&#xE3;o encontrado.</div>;
    }
    const cls = classes.find(c => c.id === student.classId);

    let studentProjects = projects.filter(p => {
        const studentMatch = (p.students || []).some(id => String(id) === String(student.id));
        const classMatch = (p.classes || []).some(id => String(id) === String(student.classId));
        return studentMatch || classMatch;
    });

    if (projectId && projectId !== "all") {
        studentProjects = studentProjects.filter(p => p.id === projectId);
    }

    // Get relevant assessments
    const relevantAssessments = assessments.filter(a => {
        return a.studentId === studentId || (a.scope === "class" && a.classId === student.classId);
    });

    // Get sessions across all projects
    const sessions = schedule
        .filter(s => studentProjects.some(p => p.id === s.projectId))
        .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));

    const overallAvg = avgRating(relevantAssessments);
    const overallRating = overallAvg > 0 ? Math.round(overallAvg) as 1 | 2 | 3 | 4 | 5 : undefined;

    const today = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

    // Student Portfolio Entries (Galeria de Vivências)
    const studentGallery = portfolioEntries.filter((e: any) => e.studentId === studentId);

    return (
        <div className="report-card bg-white max-w-6xl mx-auto shadow-2xl rounded-3xl overflow-hidden print:shadow-none print:rounded-none print:max-w-none">

            {/* ── HEADER BAND ───────────────────────────────────────── */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 px-10 py-8 text-white">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        {/* School logo placeholder */}
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">🌳</div>
                        <div>
                            <p className="text-white/70 text-xs uppercase tracking-widest">Escola Ibirá</p>
                            <p className="font-bold text-lg leading-tight">Portf&#xF3;lio de Aprendizagem</p>
                        </div>
                    </div>
                    <p className="text-white/60 text-xs">{today}</p>
                </div>

                <div>
                    <p className="text-emerald-200 text-sm font-medium uppercase tracking-widest mb-1">Aluno(a)</p>
                    <h1 className="text-3xl font-bold">{student.name}</h1>
                    {cls && <p className="text-emerald-100 text-sm mt-2 font-medium">{cls.name}</p>}
                </div>

                <div className="mt-5 pt-5 border-t border-white/20 flex flex-wrap gap-2">
                    <p className="w-full text-emerald-200 text-xs font-semibold uppercase mb-1">Projetos Participados</p>
                    {studentProjects.map(p => (
                        <div key={p.id} className="bg-white/20 rounded-full px-3 py-1 text-xs font-medium border border-white/20">
                            {p.title}
                        </div>
                    ))}
                    {studentProjects.length === 0 && (
                        <span className="text-sm italic text-emerald-100">Nenhum projeto registrado.</span>
                    )}
                </div>
            </div>

            {/* ── OVERALL RATING ────────────────────────────────────── */}
            {overallRating && (
                <div className="bg-gradient-to-b from-green-50 to-white px-10 py-8 flex flex-col items-center text-center border-b">
                    <p className="text-xs uppercase tracking-widest text-slate-500 mb-3">Desenvolvimento Geral do Aluno</p>
                    <TreeRatingPicker value={overallRating} readOnly size="lg" />
                    <p className="text-slate-500 text-sm mt-2">
                        Média: <span className="font-bold text-slate-800">{overallAvg.toFixed(1)}/5</span> &bull; {relevantAssessments.length} avaliações
                    </p>
                </div>
            )}

            <div className="px-10 py-12 space-y-16">
                {/* ── PHOTO GALLERY (Galeria de Vivências) ────────────────── */}
                {studentGallery.length > 0 && (
                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-1.5 h-8 bg-emerald-500 rounded-full" />
                            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Galeria de Vivências</h2>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {studentGallery.map((vivencia: any) => (
                                <div key={vivencia.id} className="group relative aspect-square overflow-hidden rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300">
                                    <img
                                        src={vivencia.imageUrl || "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&q=80&w=400&h=400"}
                                        alt={vivencia.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 opacity-100">
                                        <p className="text-white text-[10px] font-black uppercase tracking-widest mb-1">
                                            {vivencia.date.split("-").reverse().join("/")}
                                        </p>
                                        <p className="text-white text-xs font-bold line-clamp-2">{vivencia.title}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ── PROFESSOR OBSERVATIONS ───────────────────────────── */}
                {relevantAssessments.filter(a => a.observations).length > 0 && (
                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-1.5 h-8 bg-indigo-500 rounded-full" />
                            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Registros e Observações</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {relevantAssessments.filter(a => a.observations).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(a => {
                                const date = new Date(a.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
                                const trees = ["🌱", "🌿", "🌳", "🌲", "🍎"];
                                const nodeInfo = resolveNodeInfo(a.knowledgeNodeId || "", skillsTree, contentsTree, libraryItems);
                                return (
                                    <div key={a.id} className="bg-slate-50/40 border border-slate-100 rounded-3xl p-6 flex gap-6 hover:bg-white hover:shadow-xl transition-all duration-300 group">
                                        <div className="flex flex-col items-center gap-1 shrink-0 bg-white p-3 rounded-2xl shadow-sm border border-slate-100 min-w-[65px] h-fit group-hover:border-indigo-100 transition-colors">
                                            {a.rating ? (
                                                <>
                                                    <span className="text-3xl">{trees[a.rating - 1]}</span>
                                                    <span className="text-xs font-black text-slate-600 tracking-tighter">{a.rating}/5</span>
                                                </>
                                            ) : (
                                                <Target className="w-8 h-8 text-slate-200" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-3">
                                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">{date}</span>
                                                <span className="text-[10px] font-bold text-slate-400 truncate ml-4 bg-slate-100 px-2 py-0.5 rounded-full">{nodeInfo?.name}</span>
                                            </div>
                                            <p className="text-sm text-slate-600 leading-relaxed font-medium italic">&ldquo;{a.observations}&rdquo;</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* ── SESSION COMPONENT (Full Width) ─────────────────── */}
                {sessions.length > 0 && (
                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-1.5 h-8 bg-amber-500 rounded-full" />
                            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Sessões em Projeto</h2>
                        </div>
                        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden divide-y divide-slate-50">
                            {sessions.map(session => {
                                const sessionAssessments = relevantAssessments.filter(a => a.sessionId === session.id);
                                const lastRating = sessionAssessments.at(-1)?.rating;
                                const lastObs = sessionAssessments.at(-1)?.observations;
                                const dateStr = session.date
                                    ? (typeof session.date === "string" ? session.date.split("-").reverse().join("/") : "")
                                    : "";
                                const p = studentProjects.find(pr => pr.id === session.projectId);

                                const trees = ["🌱", "🌿", "🌳", "🌲", "🍎"];

                                return (
                                    <div key={session.id} className="p-6 flex items-center gap-8 hover:bg-slate-50 transition-colors">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="text-lg font-bold text-slate-800 leading-tight tracking-tight">
                                                    {session.title}
                                                </p>
                                                {p && <span className="text-xs bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">Projeto: {p.title}</span>}
                                            </div>
                                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">{dateStr}</p>
                                            {lastObs && <p className="text-sm text-slate-500 italic mt-3 border-l-4 border-slate-200 pl-4 leading-relaxed font-medium">&ldquo;{lastObs}&rdquo;</p>}
                                        </div>
                                        <div className="shrink-0 text-center bg-white rounded-2xl p-3 min-w-[80px] border border-slate-200 shadow-sm">
                                            {lastRating ? (
                                                <>
                                                    <div className="text-3xl leading-none mb-1">{trees[lastRating - 1]}</div>
                                                    <div className="text-xs font-black text-slate-600 tracking-tighter">{lastRating}/5</div>
                                                </>
                                            ) : (
                                                <span className="text-xs text-slate-300 font-bold uppercase tracking-widest italic">Pendente</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* ── TRABALHADO VS DESENVOLVIDO (Progress Chart - Full Width) ────────────────── */}
                <section className="break-inside-avoid">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-1.5 h-8 bg-teal-500 rounded-full" />
                        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Desenvolvimento por Área BNCC</h2>
                    </div>
                    <div className="print:shadow-none print:border-none">
                        <SkillsChart studentId={student.id} />
                    </div>
                </section>

                {/* ── TRILHAS DE DESENVOLVIMENTO ────────────────────── */}
                <section className="break-inside-avoid page-break-inside-avoid" style={{ pageBreakInside: "avoid" }}>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-1.5 h-6 bg-slate-800 rounded-full" />
                        <h2 className="text-xl font-bold text-slate-800">Trilha Habilidades Consolidada</h2>
                    </div>
                    <div className="border border-slate-100 rounded-3xl p-8 bg-white flex justify-center items-center print:border-none print:shadow-none min-h-[600px] shadow-sm">
                        <div className="w-full h-full flex items-center justify-center">
                            <RadialMatrix
                                data={skillsTree}
                                treeType="skill"
                                assessments={relevantAssessments}
                                projects={studentProjects}
                                selectedProjectId={"all"}
                                selectedStudentId={student.id}
                                selectedClassId={student.classId}
                                libraryItems={libraryItems}
                            />
                        </div>
                    </div>
                </section>

                <section className="break-inside-avoid page-break-inside-avoid" style={{ pageBreakInside: "avoid" }}>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                        <h2 className="text-xl font-bold text-slate-800">Trilha de Competências Consolidada</h2>
                    </div>
                    <div className="border border-slate-100 rounded-3xl p-8 bg-white flex justify-center items-center print:border-none print:shadow-none min-h-[600px] shadow-sm">
                        <div className="w-full h-full flex items-center justify-center">
                            <RadialMatrix
                                data={contentsTree}
                                treeType="content"
                                assessments={relevantAssessments}
                                projects={studentProjects}
                                selectedProjectId={"all"}
                                selectedStudentId={student.id}
                                selectedClassId={student.classId}
                                libraryItems={libraryItems}
                            />
                        </div>
                    </div>
                </section>

                {/* ── FOOTER ────────────────────────────────────────── */}
                <footer className="pt-10 border-t border-slate-100 text-center">
                    <div className="inline-block px-10 py-1 bg-slate-50 rounded-full border border-slate-100 mb-4">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Escola Ibirá &bull; {today}</p>
                    </div>
                    <p className="text-xs text-slate-300">Este documento é confidencial e destinado exclusivamente ao acompanhamento pedagógico da família.</p>
                </footer>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────
// Page Wrapper (with print/export controls)
// ─────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────
// Page Content (using useSearchParams)
// ─────────────────────────────────────────────────────────────────────────
function ReportCardContent() {
    const searchParams = useSearchParams();
    const studentId = searchParams.get("student");
    const projectId = searchParams.get("project");

    const handlePrint = () => window.print();

    if (!studentId) {
        return <div className="text-center py-20 text-slate-400">Parâmetro de aluno ausente.</div>;
    }

    return (
        <>
            {/* Print styles */}
            <style>{`
                @media print {
                    @page {
                        size: landscape;
                        margin: 0;
                    }
                    .no-print { display: none !important; }
                    body { background: white; margin: 0; padding: 0; }
                    .report-card { 
                        box-shadow: none; 
                        width: 100% !important;
                        max-width: none !important;
                        margin: 0 !important;
                        border-radius: 0 !important;
                    }
                    .no-print-padding { padding: 0 !important; }
                }
            `}</style>

            {/* Controls bar (hidden on print) */}
            <div className="no-print bg-white border-b px-6 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
                <Link href="/portfolio">
                    <Button variant="ghost" size="sm" className="gap-2">
                        <ChevronLeft className="w-4 h-4" /> Voltar ao Portfólio
                    </Button>
                </Link>
                <div className="flex-1" />
                <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
                    <Printer className="w-4 h-4" /> Imprimir
                </Button>
                <Button size="sm" onClick={handlePrint} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Download className="w-4 h-4" /> Exportar PDF
                </Button>
            </div>

            {/* Report content */}
            <div className="min-h-screen bg-slate-100 py-12 px-6 print:p-0 print:bg-white no-print-padding">
                <ReportCard studentId={studentId} projectId={projectId} />
            </div>
        </>
    );
}

// ─────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────
export default function ReportCardPage() {
    return (
        <React.Suspense fallback={<div className="p-20 text-center text-slate-400">Carregando relat&#xF3;rio...</div>}>
            <ReportCardContent />
        </React.Suspense>
    );
}

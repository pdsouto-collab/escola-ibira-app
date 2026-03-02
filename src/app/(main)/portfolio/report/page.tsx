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
import { ProgressChart, ProgressChartData } from "@/components/assessment/progress-chart";
import { CalendarIcon } from "lucide-react";

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
    const { projects, students, classes, assessments, schedule, skillsTree, contentsTree, libraryItems, dailyLogs } = useAppStore();

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

    // Photos across all assessments
    const allPhotos = relevantAssessments.flatMap(a => a.attachments.filter(att => att.type === "photo"));

    return (
        <div className="report-card bg-white max-w-3xl mx-auto shadow-xl rounded-2xl overflow-hidden print:shadow-none print:rounded-none print:max-w-none">

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
                <div className="bg-gradient-to-b from-green-50 to-white px-10 py-6 flex flex-col items-center text-center border-b">
                    <p className="text-xs uppercase tracking-widest text-slate-500 mb-3">Desenvolvimento Geral do Aluno</p>
                    <TreeRatingPicker value={overallRating} readOnly size="lg" />
                    <p className="text-slate-500 text-sm mt-1">
                        Média: <span className="font-bold text-slate-800">{overallAvg.toFixed(1)}/5</span> &bull; {relevantAssessments.length} avaliações
                    </p>
                </div>
            )}

            <div className="px-10 py-10 space-y-12">
                {/* ── PHOTO GALLERY (Galeria de Vivências) ────────────────── */}
                {allPhotos.length > 0 && (
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                            <h2 className="text-xl font-bold text-slate-800">Galeria de Vivências</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {allPhotos.map((photo, i) => (
                                <div key={i} className="group relative aspect-square overflow-hidden rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                    <img
                                        src={photo.url}
                                        alt={photo.name || `Evidência ${i + 1}`}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    {photo.name && (
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                                            <p className="text-white text-[10px] font-medium line-clamp-1">{photo.name}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ── PROFESSOR OBSERVATIONS ───────────────────────────── */}
                {relevantAssessments.filter(a => a.observations).length > 0 && (
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                            <h2 className="text-xl font-bold text-slate-800">Observações do Professor</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {relevantAssessments.filter(a => a.observations).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(a => {
                                const date = new Date(a.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
                                const trees = ["🌱", "🌿", "🌳", "🌲", "🍎"];
                                const nodeInfo = resolveNodeInfo(a.knowledgeNodeId || "", skillsTree, contentsTree, libraryItems);
                                return (
                                    <div key={a.id} className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 flex gap-4 hover:bg-white hover:shadow-md transition-all">
                                        <div className="flex flex-col items-center gap-1 shrink-0 bg-white p-2 rounded-xl border border-slate-100 min-w-[50px]">
                                            {a.rating ? (
                                                <>
                                                    <span className="text-2xl">{trees[a.rating - 1]}</span>
                                                    <span className="text-[10px] font-bold text-slate-500">{a.rating}/5</span>
                                                </>
                                            ) : (
                                                <Target className="w-6 h-6 text-slate-200" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{date}</span>
                                                <span className="text-[10px] font-medium text-slate-400 truncate ml-2">{nodeInfo?.name}</span>
                                            </div>
                                            <p className="text-sm text-slate-600 leading-relaxed italic">&ldquo;{a.observations}&rdquo;</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* ── SESSIONS AND MILESTONES ─────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {sessions.length > 0 && (
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
                                <h2 className="text-xl font-bold text-slate-800">Sessões Registradas</h2>
                            </div>
                            <div className="bg-white border rounded-2xl shadow-sm divide-y">
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
                                        <div key={session.id} className="p-4 flex items-start gap-4">
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-slate-800 leading-tight">
                                                    {session.title}
                                                    {p && <span className="text-slate-400 font-medium ml-1">[{p.title}]</span>}
                                                </p>
                                                <p className="text-[10px] font-bold text-emerald-600 mt-1 uppercase tracking-widest">{dateStr}</p>
                                                {lastObs && <p className="text-xs text-slate-500 italic mt-2 border-l-2 border-slate-100 pl-3 leading-relaxed">&ldquo;{lastObs}&rdquo;</p>}
                                            </div>
                                            <div className="shrink-0 text-center bg-slate-50 rounded-xl p-2 min-w-[60px] border border-slate-100">
                                                {lastRating ? (
                                                    <>
                                                        <div className="text-xl leading-none mb-1">{trees[lastRating - 1]}</div>
                                                        <div className="text-[10px] font-black text-slate-500">{lastRating}/5</div>
                                                    </>
                                                ) : (
                                                    <span className="text-xs text-slate-300 italic">—</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {/* ── TRABALHADO VS DESENVOLVIDO (Progress Chart) ────────────────── */}
                    {(() => {
                        const allMicro: any[] = [];
                        const allAtomico: any[] = [];
                        studentProjects.forEach(p => {
                            const { microNodes, atomicoNodes } = getProjectNodes(p, skillsTree, contentsTree, libraryItems);
                            allMicro.push(...microNodes);
                            allAtomico.push(...atomicoNodes);
                        });

                        // Deduplicate
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

                            const nodeAssessment = relevantAssessments.find(a => a.knowledgeNodeId === node.id);
                            if (nodeAssessment && (nodeAssessment.rating ?? 0) >= 3) {
                                data.desenvolvido += 1;
                            }
                        });

                        const chartData = Array.from(chartDataMap.values()).sort((a, b) => a.subject.localeCompare(b.subject));

                        return (
                            <section className="break-inside-avoid">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-1.5 h-6 bg-teal-500 rounded-full" />
                                    <h2 className="text-xl font-bold text-slate-800">Desenvolvimento por Área</h2>
                                </div>
                                <div className="bg-white border rounded-2xl shadow-sm p-4">
                                    <ProgressChart data={chartData} />
                                </div>
                            </section>
                        );
                    })()}
                </div>

                {/* ── MATRIZ CIRCULAR ────────────────────── */}
                <section className="break-inside-avoid page-break-inside-avoid" style={{ pageBreakInside: "avoid" }}>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-1.5 h-6 bg-slate-800 rounded-full" />
                        <h2 className="text-xl font-bold text-slate-800">Mapa de Habilidades Consolidadas</h2>
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
                    .no-print { display: none !important; }
                    body { background: white; }
                    .report-card { box-shadow: none; }
                }
            `}</style>

            {/* Controls bar (hidden on print) */}
            <div className="no-print bg-white border-b px-6 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
                <Link href="/portfolio">
                    <Button variant="ghost" size="sm" className="gap-2">
                        <ChevronLeft className="w-4 h-4" /> Voltar ao Portf&#xF3;lio
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
            <div className="min-h-screen bg-slate-100 py-8 px-4 print:p-0 print:bg-white no-print-padding">
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

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
function RatingRow({ label, rating, obs }: { label: string; rating?: number; obs?: string }) {
    const trees = ["🌱", "🌿", "🌳", "🌲", "🍎"];
    return (
        <div className="flex items-start gap-4 py-3 border-b border-slate-100 last:border-0">
            <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">{label}</p>
                {obs && <p className="text-xs text-slate-500 italic mt-0.5 leading-relaxed">&ldquo;{obs}&rdquo;</p>}
            </div>
            <div className="shrink-0 text-right min-w-[80px]">
                {rating ? (
                    <span className="text-lg">{trees[rating - 1]} <span className="text-xs text-slate-500 font-semibold">{rating}/5</span></span>
                ) : (
                    <span className="text-xs text-slate-300 italic">—</span>
                )}
            </div>
        </div>
    );
}

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
                    <p className="text-slate-500 text-sm mt-3">
                        M&#xE9;dia: <span className="font-bold text-slate-800">{overallAvg.toFixed(1)}/5</span> &bull; {relevantAssessments.length} avalia&#xE7;&#xF5;es
                    </p>
                </div>
            )}

            <div className="px-10 py-8 space-y-8">

                {(() => {
                    const studentLogs = dailyLogs.filter(l => l.studentId === studentId).sort((a, b) => b.date.localeCompare(a.date));
                    if (studentLogs.length === 0) return null;
                    return (
                        <section>
                            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                                <span className="inline-block w-4 h-0.5 bg-slate-300"></span>
                                Rotina e Atividades do Dia
                            </h2>
                            <div className="space-y-4">
                                {studentLogs.map((log) => {
                                    const [y, m, d] = log.date.split("-");
                                    const dtStr = `${d}/${m}/${y}`;
                                    const moodEmoji = { happy: "😊", excited: "🤩", neutral: "😐", tired: "🥱", sad: "😢" }[log.mood];
                                    const mealTrans = { all: "Tudo", most: "Maioria", some: "Pouco", none: "Nada" };
                                    const mealColor = { all: "bg-green-100 text-green-700 border-green-200", most: "bg-blue-100 text-blue-700 border-blue-200", some: "bg-orange-100 text-orange-700 border-orange-200", none: "bg-red-100 text-red-700 border-red-200" };

                                    return (
                                        <div key={log.id} className="border border-slate-200 rounded-2xl p-6 bg-white shadow-sm">
                                            <div className="flex justify-between items-center mb-6">
                                                <h3 className="font-bold flex items-center gap-2">
                                                    <CalendarIcon className="w-5 h-5 text-slate-400" />
                                                    Diário de {dtStr}
                                                </h3>
                                                <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 bg-slate-50 py-1 px-3 rounded-full border">
                                                    HUMOR: <span className="text-xl leading-none">{moodEmoji}</span>
                                                </div>
                                            </div>

                                            <div className="mb-6">
                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                                                    🍴 Alimentação
                                                </h4>
                                                <div className="flex gap-4">
                                                    <div className="flex-1 flex flex-col items-center justify-center p-3 border rounded-xl bg-slate-50/50">
                                                        <span className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Lanche Manhã</span>
                                                        <span className={`text-xs px-3 py-1 rounded-full font-bold border bg-white ${mealColor[log.meals.breakfast]}`}>{mealTrans[log.meals.breakfast]}</span>
                                                    </div>
                                                    <div className="flex-1 flex flex-col items-center justify-center p-3 border rounded-xl bg-slate-50/50">
                                                        <span className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Almoço</span>
                                                        <span className={`text-xs px-3 py-1 rounded-full font-bold border bg-white ${mealColor[log.meals.lunch]}`}>{mealTrans[log.meals.lunch]}</span>
                                                    </div>
                                                    <div className="flex-1 flex flex-col items-center justify-center p-3 border rounded-xl bg-slate-50/50">
                                                        <span className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Lanche Tarde</span>
                                                        <span className={`text-xs px-3 py-1 rounded-full font-bold border bg-white ${mealColor[log.meals.snack]}`}>{mealTrans[log.meals.snack]}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {(log.nap.start || log.nap.end || log.nap.didNotNap) && (
                                                <div className={`mb-6 flex flex-col md:flex-row gap-4 md:items-center p-4 rounded-xl border ${log.nap.didNotNap ? 'bg-slate-50 border-slate-100 text-slate-500 italic' : 'bg-indigo-50/50 border-indigo-100'}`}>
                                                    <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${log.nap.didNotNap ? 'text-slate-400' : 'text-indigo-400'}`}>
                                                        💤 Sono / Descanso
                                                    </h4>
                                                    <p className={`text-sm font-medium md:ml-auto ${log.nap.didNotNap ? 'text-slate-500' : 'text-indigo-900'}`}>
                                                        {log.nap.didNotNap ? "Não dormiu hoje." : `${log.nap.start ? `Dorme: ${log.nap.start}` : "Dorme"} ${log.nap.end ? `às ${log.nap.end}` : ""}`}
                                                    </p>
                                                </div>
                                            )}

                                            {log.activities.length > 0 && (
                                                <div className="mb-6">
                                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Atividades Realizadas</h4>
                                                    <ul className="list-disc list-inside text-sm text-slate-700 space-y-1 ml-1">
                                                        {log.activities.map((act, i) => <li key={i}>{act}</li>)}
                                                    </ul>
                                                </div>
                                            )}

                                            {log.notes && (
                                                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                                                    <p className="text-sm text-amber-900 italic">&ldquo;{log.notes}&rdquo;</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )
                })()}

                {sessions.length > 0 && (
                    <section>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                            <span className="inline-block w-4 h-0.5 bg-slate-300"></span>
                            Sess&#xF5;es Registradas
                        </h2>
                        <div className="space-y-1">
                            {sessions.map(session => {
                                const sessionAssessments = relevantAssessments.filter(a => a.sessionId === session.id);
                                const lastRating = sessionAssessments.at(-1)?.rating;
                                const lastObs = sessionAssessments.at(-1)?.observations;
                                const dateStr = session.date
                                    ? (typeof session.date === "string" ? session.date.split("-").reverse().join("/") : "")
                                    : "";
                                const p = studentProjects.find(pr => pr.id === session.projectId);

                                return (
                                    <RatingRow
                                        key={session.id}
                                        label={`${session.title}${p ? ` [${p.title}]` : ""}${dateStr ? ` · ${dateStr}` : ""}`}
                                        rating={lastRating}
                                        obs={lastObs}
                                    />
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* ── ALL OBSERVATIONS ───────────────────────────────── */}
                {relevantAssessments.filter(a => a.observations).length > 0 && (
                    <section>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                            <span className="inline-block w-4 h-0.5 bg-slate-300"></span>
                            Observa&#xE7;&#xF5;es do Professor
                        </h2>
                        <div className="space-y-3">
                            {relevantAssessments.filter(a => a.observations).map(a => {
                                const date = new Date(a.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
                                const trees = ["🌱", "🌿", "🌳", "🌲", "🍎"];
                                return (
                                    <div key={a.id} className="bg-slate-50 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs text-slate-400 font-medium">{date}</span>
                                            {a.rating && <span className="text-sm">{trees[a.rating - 1]}</span>}
                                        </div>
                                        <p className="text-sm text-slate-700 leading-relaxed italic">&ldquo;{a.observations}&rdquo;</p>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* ── PHOTO GALLERY ──────────────────────────────────── */}
                {allPhotos.length > 0 && (
                    <section>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                            <span className="inline-block w-4 h-0.5 bg-slate-300"></span>
                            Galeria de Evid&#xEA;ncias ({allPhotos.length} fotos)
                        </h2>
                        <div className="grid grid-cols-3 gap-3">
                            {allPhotos.map((photo, i) => (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    key={i}
                                    src={photo.url}
                                    alt={photo.name || `Evidência ${i + 1}`}
                                    className="w-full aspect-square object-cover rounded-xl border border-slate-200"
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* ── TRABALHADO VS DESENVOLVIDO ───────────────────── */}
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

                    // Group by subject for chart
                    const chartDataMap = new Map<string, ProgressChartData>();

                    allNodes.forEach(node => {
                        const subject = node.subject || "Outros";
                        if (!chartDataMap.has(subject)) {
                            chartDataMap.set(subject, { subject, trabalhado: 0, desenvolvido: 0, total: 0 });
                        }

                        const data = chartDataMap.get(subject)!;
                        data.trabalhado += 1; // It is worked on because it's in a project
                        data.total += 1;

                        const nodeAssessment = relevantAssessments.find(a => a.knowledgeNodeId === node.id);
                        if (nodeAssessment && (nodeAssessment.rating ?? 0) >= 3) {
                            data.desenvolvido += 1; // Conquistado
                        }
                    });

                    const chartData = Array.from(chartDataMap.values()).sort((a, b) => a.subject.localeCompare(b.subject));

                    return (
                        <section className="break-inside-avoid">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                                <span className="inline-block w-4 h-0.5 bg-slate-300"></span>
                                Progresso por Áreas da BNCC
                            </h2>
                            <p className="text-sm text-slate-500 mb-6 font-medium">Visualização do desenvolvimento no aluno em relação aos conteúdos e habilidades trabalhados em projetos.</p>
                            <div className="bg-white border rounded-2xl shadow-sm p-2">
                                <ProgressChart data={chartData} />
                            </div>
                        </section>
                    );
                })()}

                {/* ── MATRIZ CIRCULAR ────────────────────── */}
                <section className="break-inside-avoid page-break-inside-avoid" style={{ pageBreakInside: "avoid" }}>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                        <span className="inline-block w-4 h-0.5 bg-slate-300"></span>
                        Matriz Circular de Habilidades
                    </h2>
                    <div className="border border-slate-200 rounded-2xl p-4 bg-white flex justify-center items-center print:border-none print:shadow-none min-h-[500px]">
                        <div className="w-[600px] h-[600px] print:w-[500px] print:h-[500px] flex items-center justify-center">
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
                <footer className="pt-4 border-t border-slate-100 text-center">
                    <p className="text-xs text-slate-400">Escola Ibirá &bull; Portf&#xF3;lio gerado em {today}</p>
                    <p className="text-xs text-slate-300 mt-0.5">Este documento &#xE9; confidencial e destinado ao uso familiar.</p>
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

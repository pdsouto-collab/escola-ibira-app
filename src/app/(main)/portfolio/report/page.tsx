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
    if (libraryItem) return {
        id: libraryItem.id,
        name: libraryItem.name,
        code: libraryItem.code || libraryItem.id,
        description: libraryItem.description,
        level: libraryItem.type === "skill" ? "micro" : "atomico"
    };
    return { id, name: id, code: id };
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
}: {
    studentId: string;
}) {
    const { projects, students, classes, assessments, schedule, skillsTree, contentsTree, libraryItems } = useAppStore();

    const student = students.find(s => s.id === studentId);
    if (!student) {
        return <div className="text-center py-20 text-slate-400">Aluno n&#xE3;o encontrado.</div>;
    }
    const cls = classes.find(c => c.id === student.classId);

    const studentProjects = projects.filter(p => {
        const studentMatch = (p.students || []).some(id => String(id) === String(student.id));
        const classMatch = (p.classes || []).some(id => String(id) === String(student.classId));
        return studentMatch || classMatch;
    });

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

                    return (
                        <section className="break-inside-avoid">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                                <span className="inline-block w-4 h-0.5 bg-slate-300"></span>
                                Trabalhado vs Desenvolvido
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {allNodes.map(node => {
                                    const nodeAssessment = relevantAssessments.find(a => a.knowledgeNodeId === node.id);
                                    const isDeveloped = nodeAssessment && (nodeAssessment.rating ?? 0) >= 3;
                                    const hasRating = nodeAssessment && nodeAssessment.rating;

                                    return (
                                        <div key={node.id} className="border rounded-xl p-4 bg-slate-50 flex flex-col justify-between">
                                            <div className="flex items-start gap-3">
                                                <Badge variant="outline" className="text-[10px] bg-white text-slate-500 shrink-0">
                                                    {node.code || "Sk"}
                                                </Badge>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-semibold text-slate-700 leading-snug">{node.name}</p>
                                                    {node.description && <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{node.description}</p>}
                                                </div>
                                            </div>
                                            <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
                                                <div className="flex items-center gap-1.5">
                                                    {isDeveloped ? (
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                    ) : (
                                                        <Target className="w-4 h-4 text-slate-400" />
                                                    )}
                                                    <span className="text-xs font-semibold text-slate-600">
                                                        {isDeveloped ? "Desenvolvido" : "Trabalhado"}
                                                    </span>
                                                </div>
                                                {hasRating && (
                                                    <div className="text-right">
                                                        <span className="text-sm">{"🌱🌿🌳🌲🍎"[nodeAssessment.rating! - 1]}</span>
                                                        <span className="ml-1 text-xs font-bold text-slate-500">{nodeAssessment.rating}/5</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
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
                <ReportCard studentId={studentId} />
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

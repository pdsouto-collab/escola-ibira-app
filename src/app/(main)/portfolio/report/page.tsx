"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { Assessment } from "@/lib/data";
import { TreeRatingPicker } from "@/components/assessment/tree-rating-picker";
import { Button } from "@/components/ui/button";
import { Printer, Download, ChevronLeft } from "lucide-react";
import Link from "next/link";

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
    projectId,
    studentId,
}: {
    projectId: string;
    studentId: string | null;
}) {
    const { projects, students, classes, assessments, schedule } = useAppStore();

    const project = projects.find(p => p.id === projectId);
    const student = studentId ? students.find(s => s.id === studentId) : null;
    const cls = student ? classes.find(c => c.id === student.classId) : null;

    if (!project) {
        return <div className="text-center py-20 text-slate-400">Projeto n&#xE3;o encontrado.</div>;
    }

    // Get relevant assessments
    const relevantAssessments = assessments.filter(a => {
        if (a.projectId !== projectId) return false;
        if (studentId) {
            return a.studentId === studentId || (a.scope === "class" && a.classId === student?.classId);
        }
        return true;
    });

    // Get sessions for this project
    const sessions = schedule.filter(s => s.projectId === projectId);

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
                    <p className="text-emerald-200 text-sm font-medium uppercase tracking-widest mb-1">Projeto</p>
                    <h1 className="text-3xl font-bold">{project.title}</h1>
                    {project.guidingQuestion && (
                        <p className="text-emerald-100 text-sm mt-2 italic">&ldquo;{project.guidingQuestion}&rdquo;</p>
                    )}
                </div>

                {student && (
                    <div className="mt-5 pt-5 border-t border-white/20 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">
                            {student.name.charAt(0)}
                        </div>
                        <div>
                            <p className="text-emerald-200 text-xs">Aluno(a)</p>
                            <p className="font-bold text-xl">{student.name}</p>
                            {cls && <p className="text-emerald-200 text-sm">{cls.name}</p>}
                        </div>
                    </div>
                )}
            </div>

            {/* ── OVERALL RATING ────────────────────────────────────── */}
            {overallRating && (
                <div className="bg-gradient-to-b from-green-50 to-white px-10 py-6 flex flex-col items-center text-center border-b">
                    <p className="text-xs uppercase tracking-widest text-slate-500 mb-3">Desenvolvimento Geral no Projeto</p>
                    <TreeRatingPicker value={overallRating} readOnly size="lg" />
                    <p className="text-slate-500 text-sm mt-3">
                        M&#xE9;dia: <span className="font-bold text-slate-800">{overallAvg.toFixed(1)}/5</span> &bull; {relevantAssessments.length} avalia&#xE7;&#xF5;es
                    </p>
                </div>
            )}

            <div className="px-10 py-8 space-y-8">

                {/* ── SESSIONS ───────────────────────────────────────── */}
                {sessions.length > 0 && (
                    <section>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                            <span className="inline-block w-4 h-0.5 bg-slate-300"></span>
                            Sess&#xF5;es do Projeto
                        </h2>
                        <div className="space-y-1">
                            {sessions.map(session => {
                                const sessionAssessments = relevantAssessments.filter(a => a.sessionId === session.id);
                                const lastRating = sessionAssessments.at(-1)?.rating;
                                const lastObs = sessionAssessments.at(-1)?.observations;
                                const dateStr = session.date
                                    ? (typeof session.date === "string" ? session.date.split("-").reverse().join("/") : "")
                                    : "";
                                return (
                                    <RatingRow
                                        key={session.id}
                                        label={`${session.title}${dateStr ? ` · ${dateStr}` : ""}`}
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

                {/* ── MATRIZ CIRCULAR PLACEHOLDER ────────────────────── */}
                <section>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                        <span className="inline-block w-4 h-0.5 bg-slate-300"></span>
                        Matriz Circular de Habilidades
                    </h2>
                    <div className="border-2 border-dashed border-emerald-200 rounded-2xl p-8 text-center bg-emerald-50/30">
                        <div className="text-5xl mb-3">🌀</div>
                        <p className="text-slate-500 text-sm font-medium">A Matriz Circular com as habilidades desenvolvidas neste projeto ser&#xE1; exibida aqui.</p>
                        <p className="text-slate-400 text-xs mt-1">Integra&#xE7;&#xE3;o com a Matriz Circular em desenvolvimento.</p>
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
    const projectId = searchParams.get("project") ?? "";
    const studentId = searchParams.get("student") ?? null;

    const handlePrint = () => window.print();

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
                <ReportCard projectId={projectId} studentId={studentId} />
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

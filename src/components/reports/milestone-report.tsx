"use client";

import { getStudentCurriculum, Theme } from "@/lib/data";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle, CircleDashed } from "lucide-react";

interface MilestoneReportProps {
    studentId: string;
}

export function MilestoneReport({ studentId }: MilestoneReportProps) {
    const curriculum = getStudentCurriculum(studentId);

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {curriculum.map((theme) => {
                    const totalIndicators = theme.indicators.length;
                    const achieved = theme.indicators.filter(i => i.status === "achieved").length;
                    const progress = Math.round((achieved / totalIndicators) * 100);

                    return (
                        <Card key={theme.id} className="overflow-hidden border-2" style={{ borderColor: theme.color === "orange" ? "#f97316" : theme.color === "blue" ? "#3b82f6" : theme.color === "teal" ? "#14b8a6" : "#e5e7eb" }}>
                            <CardHeader className="bg-slate-50 pb-2">
                                <CardTitle className="text-lg font-bold flex justify-between items-center">
                                    {theme.title}
                                    <span className="text-sm font-normal text-slate-500">{progress}%</span>
                                </CardTitle>
                                <Progress value={progress} className="h-2" />
                            </CardHeader>
                            <CardContent className="pt-4 space-y-3">
                                {theme.indicators.map((indicator) => (
                                    <div key={indicator.id} className="flex items-start gap-2 text-sm">
                                        {indicator.status === "achieved" ? (
                                            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                        ) : indicator.status === "in-progress" ? (
                                            <CircleDashed className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                                        ) : (
                                            <Circle className="w-4 h-4 text-slate-300 mt-0.5 shrink-0" />
                                        )}
                                        <span className={indicator.status === "achieved" ? "text-slate-700 font-medium" : "text-slate-500"}>
                                            {indicator.label}
                                        </span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    );
}

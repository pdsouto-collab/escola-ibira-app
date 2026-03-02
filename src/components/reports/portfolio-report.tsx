"use client";

import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PortfolioReportProps {
    studentId: string;
    onEdit?: (date: string) => void;
}

export function PortfolioReport({ studentId, onEdit }: PortfolioReportProps) {
    const { portfolioEntries } = useAppStore();
    const entries = portfolioEntries.filter(p => p.studentId === studentId);

    if (entries.length === 0) {
        return (
            <div className="text-center py-10 text-slate-500">
                <p>Nenhum registro de portfólio encontrado.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
            {entries.map((entry) => (
                <Card key={entry.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video w-full bg-slate-200 relative overflow-hidden">
                        {/* Placeholder for real image */}
                        {entry.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={entry.imageUrl} alt={entry.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">Sem Imagem</div>
                        )}
                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {entry.date.split("-").reverse().join("/")}
                        </div>
                    </div>
                    <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
                        <h3 className="font-bold text-lg leading-tight">{entry.title}</h3>
                        {onEdit && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                                onClick={() => onEdit(entry.date)}
                            >
                                <Edit2 className="h-4 w-4" />
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-600 line-clamp-3">
                            {entry.description}
                        </p>
                    </CardContent>
                    <CardFooter className="flex flex-wrap gap-2 pt-0">
                        {entry.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                            </Badge>
                        ))}
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}

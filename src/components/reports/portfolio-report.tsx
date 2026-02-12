"use client";

import { mockPortfolio } from "@/lib/data";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

interface PortfolioReportProps {
    studentId: string;
}

export function PortfolioReport({ studentId }: PortfolioReportProps) {
    const entries = mockPortfolio.filter(p => p.studentId === studentId);

    if (entries.length === 0) {
        return (
            <div className="text-center py-10 text-slate-500">
                <p>Nenhum registro de portfólio encontrado.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                    <CardHeader className="pb-2">
                        <h3 className="font-bold text-lg leading-tight">{entry.title}</h3>
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

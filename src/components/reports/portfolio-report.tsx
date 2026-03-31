"use client";

import { useEffect, useState } from "react";
import { getPortfolioEntries } from "@/services/portfolio.service";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import { PortfolioEntryViewer } from "@/components/portfolio/portfolio-entry-viewer";
import type { PortfolioEntry } from "@/types/portfolio-entry";

interface Props {
    studentId: string;
    onEdit?: (date: string) => void;
}

export function PortfolioReport({ studentId, onEdit }: Props) {
    const [entries, setEntries] = useState<PortfolioEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedEntry, setSelectedEntry] = useState<PortfolioEntry | null>(null);

    useEffect(() => {
        setIsLoading(true);
        getPortfolioEntries(studentId)
            .then(data => setEntries(data))
            .catch(err => console.error("Error fetching portfolio:", err))
            .finally(() => setIsLoading(false));
    }, [studentId]);

    if (isLoading) {
        return (
            <div className="text-center py-10 text-slate-500">
                <p>Carregando registros de portfólio...</p>
            </div>
        );
    }

    if (entries.length === 0) {
        return (
            <div className="text-center py-10 text-slate-500">
                <p>Nenhum registro de portfólio encontrado.</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
                {entries.map((entry) => {
                    const firstImage = entry.images && entry.images.length > 0 ? entry.images[0] : entry.imageUrl;
                    return (
                        <Card key={entry.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => setSelectedEntry(entry)}>
                            <div className="aspect-video w-full bg-slate-200 relative overflow-hidden">
                                {firstImage ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={firstImage} alt={entry.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">Sem Imagem</div>
                                )}
                                {(entry.images?.length || 0) > 1 && (
                                    <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs font-bold">
                                        +{entry.images!.length - 1} foto{(entry.images!.length - 1) > 1 ? "s" : ""}
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {entry.date.split("-").reverse().join("/")}
                                </div>
                            </div>
                            <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0 relative z-10 bg-white">
                                <h3 className="font-bold text-lg leading-tight group-hover:text-indigo-600 transition-colors">{entry.title}</h3>
                                {onEdit && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                                        onClick={(e: React.MouseEvent) => {
                                            e.stopPropagation();
                                            onEdit(entry.date);
                                        }}
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent className="relative z-10 bg-white">
                                <p className="text-sm text-slate-600 line-clamp-3">
                                    {entry.description}
                                </p>
                            </CardContent>
                            <CardFooter className="flex flex-wrap gap-2 pt-0 relative z-10 bg-white">
                                {entry.tags.map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-xs bg-indigo-50 text-indigo-700">
                                        {tag}
                                    </Badge>
                                ))}
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>

            <PortfolioEntryViewer
                open={!!selectedEntry}
                onOpenChange={(open) => !open && setSelectedEntry(null)}
                entry={selectedEntry}
            />
        </>
    );
}

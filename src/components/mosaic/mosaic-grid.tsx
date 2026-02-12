"use client";

import { useState, useMemo } from "react";
import { Theme, Indicator, Status, MosaicNode } from "@/lib/data";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Clock, LayoutGrid, PieChart } from "lucide-react";
import { IndicatorModal } from "./indicator-modal";
import { MosaicSunburst } from "./mosaic-sunburst";
import { Button } from "../ui/button";

interface MosaicGridProps {
    themes: Theme[];
}

const statusIcon = {
    "achieved": <CheckCircle2 className="h-4 w-4 text-green-600" />,
    "in-progress": <Clock className="h-4 w-4 text-amber-600" />,
    "not-started": <Circle className="h-4 w-4 text-slate-300" />,
};

const statusColor = {
    "achieved": "bg-green-100 hover:bg-green-200 border-green-200",
    "in-progress": "bg-amber-100 hover:bg-amber-200 border-amber-200",
    "not-started": "bg-white hover:bg-slate-50 border-slate-200",
};

// Helper to map Tailwind colors to Hex/CSS for SVG
const colorMap: Record<string, string> = {
    "orange": "#f97316",
    "blue": "#3b82f6",
    "teal": "#14b8a6",
    "purple": "#a855f7",
    "indigo": "#6366f1",
    "pink": "#ec4899",
    "green": "#22c55e",
};

export function MosaicGrid({ themes: initialThemes }: MosaicGridProps) {
    const [themes, setThemes] = useState(initialThemes);
    const [selectedIndicator, setSelectedIndicator] = useState<Indicator | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<"grid" | "sunburst">("sunburst");

    // Transform flat Theme[] to recursive MosaicNode[]
    const chartData: MosaicNode[] = useMemo(() => {
        return themes.map(theme => ({
            id: theme.id,
            label: theme.title,
            type: "area", // Treat themes as main areas
            status: "in-progress", // Aggregate status could be calculated, defaulting for now
            color: colorMap[theme.color] || theme.color,
            children: theme.indicators.map(ind => ({
                id: ind.id,
                label: ind.label,
                type: "skill", // Treat indicators as skills
                status: ind.status,
                evidenceCount: ind.evidenceCount
            }))
        }));
    }, [themes]);

    const handleNodeClick = (node: MosaicNode) => {
        // If it's a leaf node (skill/indicator), open the modal
        if (node.type === "skill") {
            // Find the original indicator object
            for (const theme of themes) {
                const indicator = theme.indicators.find(i => i.id === node.id);
                if (indicator) {
                    handleIndicatorClick(indicator);
                    break;
                }
            }
        }
    };

    const handleIndicatorClick = (indicator: Indicator) => {
        setSelectedIndicator(indicator);
        setIsModalOpen(true);
    };

    const handleUpdateStatus = (indicatorId: string, newStatus: Status) => {
        setThemes(prevThemes => prevThemes.map(theme => ({
            ...theme,
            indicators: theme.indicators.map(ind =>
                ind.id === indicatorId ? { ...ind, status: newStatus } : ind
            )
        })));
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-end gap-2">
                <Button
                    variant={viewMode === "sunburst" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("sunburst")}
                >
                    <PieChart className="h-4 w-4 mr-2" />
                    Mosaico
                </Button>
                <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                >
                    <LayoutGrid className="h-4 w-4 mr-2" />
                    Lista
                </Button>
            </div>

            {viewMode === "sunburst" ? (
                <div className="flex justify-center p-8 bg-slate-50 rounded-2xl border border-slate-100">
                    <MosaicSunburst
                        data={chartData}
                        onSelectNode={handleNodeClick}
                    />
                </div>
            ) : (
                <div className="space-y-8">
                    {themes.map((theme) => (
                        <div key={theme.id} className="space-y-4">
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold text-slate-800">{theme.title}</h2>
                                <div className="h-px flex-1 bg-slate-200" />
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {theme.indicators.map((indicator) => (
                                    <button
                                        key={indicator.id}
                                        onClick={() => handleIndicatorClick(indicator)}
                                        className={cn(
                                            "relative flex flex-col justify-between h-32 p-4 rounded-xl border-2 text-left transition-all hover:scale-[1.02] hover:shadow-sm",
                                            statusColor[indicator.status]
                                        )}
                                    >
                                        <span className="text-sm font-medium leading-snug line-clamp-3 text-slate-700">
                                            {indicator.label}
                                        </span>

                                        <div className="flex items-center justify-between mt-2">
                                            {statusIcon[indicator.status]}
                                            {indicator.evidenceCount && indicator.evidenceCount > 0 && (
                                                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-white/50 rounded-full text-slate-600">
                                                    {indicator.evidenceCount} 📸
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                ))}

                                <button className="flex flex-col items-center justify-center h-32 p-4 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-slate-300 hover:bg-slate-50 transition-colors">
                                    <span className="text-2xl">+</span>
                                    <span className="text-xs">Adicionar</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <IndicatorModal
                indicator={selectedIndicator}
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                onUpdateStatus={handleUpdateStatus}
            />
        </div>
    );
}

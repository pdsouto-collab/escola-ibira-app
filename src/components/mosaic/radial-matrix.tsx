"use client";

import React, { useMemo } from "react";
import { KnowledgeNode, KnowledgeLevel } from "@/lib/data";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface RadialMatrixProps {
    data: KnowledgeNode[]; // Extracted from Admin Panel Tree
    treeType: "skill" | "content";
    drilledNodeId?: string;
    onNodeClick?: (node: KnowledgeNode) => void;
    onNodeDoubleClick?: (node: KnowledgeNode) => void;
}

// ----------------------------------------------------------------------
// Geometry Utils
// ----------------------------------------------------------------------

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}

function describeArc(x: number, y: number, innerRadius: number, outerRadius: number, startAngle: number, endAngle: number) {
    const start = polarToCartesian(x, y, outerRadius, endAngle);
    const end = polarToCartesian(x, y, outerRadius, startAngle);
    const startInner = polarToCartesian(x, y, innerRadius, endAngle);
    const endInner = polarToCartesian(x, y, innerRadius, startAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
        "M", start.x, start.y,
        "A", outerRadius, outerRadius, 0, largeArcFlag, 0, end.x, end.y,
        "L", endInner.x, endInner.y,
        "A", innerRadius, innerRadius, 0, largeArcFlag, 1, startInner.x, startInner.y,
        "Z"
    ].join(" ");
}

// Counts how many leaves (L3/micro or L2/mesclado if no micro) are under a node, to divide the 360 degree circle proportionally
function countLeavesForRender(node: KnowledgeNode, currentDepth: number, maxDepth: number): number {
    if (!node.children || node.children.length === 0 || currentDepth === maxDepth - 1) {
        return 1;
    }
    return node.children.reduce((acc, child) => acc + countLeavesForRender(child, currentDepth + 1, maxDepth), 0);
}

// ----------------------------------------------------------------------
// Base Colors per level for distinction when not dynamically "filled" by projects yet
// ----------------------------------------------------------------------
const BASE_COLORS = [
    "#3b82f6", // blue
    "#10b981", // green
    "#8b5cf6", // purple
    "#f59e0b", // yellow
    "#ef4444", // red
    "#06b6d4"  // cyan
];

export function RadialMatrix({ data, treeType, drilledNodeId, onNodeClick, onNodeDoubleClick }: RadialMatrixProps) {
    const size = 800;
    const center = size / 2;
    const centerHoleRadius = 80;
    const maxRadius = size / 2 - 20;

    // Determine how many rings to draw based on drill down state
    // Default view: Eixo (Anel 1) > Competencia (Anel 2) > Habilidade (Anel 3) = 3 rings max
    // Drilled view: Competencia (Anel 1) > Habilidade (Anel 2) = 2 rings max
    const maxDepth = drilledNodeId ? 2 : 3;

    // Width of each ring
    const ringWidth = (maxRadius - centerHoleRadius) / maxDepth;
    const gap = 2; // Gap between slices

    // Truncate the tree if needed to only show up to maxDepth layers
    // The data passed respects `drilledNodeId` logic from container 
    // (if drilled, data = [drilledNode], so its children become the first ring)

    const nodesToRender = drilledNodeId && data.length === 1 && data[0].children ? data[0].children : data;

    // Total geometric "leaves" at the edge of the circle
    const totalLeaves = useMemo(() => {
        const total = nodesToRender.reduce((acc, node) => acc + countLeavesForRender(node, 0, maxDepth), 0);
        return total > 0 ? total : 1; // Prevent division by zero
    }, [nodesToRender, maxDepth]);

    // Recursive function to draw the arcs
    const renderArcs = (
        nodes: KnowledgeNode[],
        startAngle: number,
        depth: number, // 0 to maxDepth - 1
        parentColor: string,
        parentIndexOffset: number = 0
    ) => {
        let currentStartAngle = startAngle;
        const elements: React.ReactNode[] = [];

        nodes.forEach((node, idx) => {
            // How much of the pie does this node take?
            const leaves = countLeavesForRender(node, depth, maxDepth);
            const angleSpan = (leaves / totalLeaves) * 360;
            const endAngle = currentStartAngle + angleSpan;

            const innerR = centerHoleRadius + (depth * ringWidth);
            const outerR = innerR + ringWidth;

            // Give a distinct color base to the macro rings, children inherit or slightly vary
            let baseColor = parentColor;
            if (depth === 0) {
                baseColor = BASE_COLORS[(parentIndexOffset + idx) % BASE_COLORS.length];
            }

            // Opacity gradient for visual depth
            const opacity = depth === 0 ? 0.3 : (depth === 1 ? 0.6 : 0.9);
            const fillColor = baseColor;

            // The actual SVG Path
            const pathData = describeArc(center, center, innerR, outerR, currentStartAngle + gap / 2, endAngle - gap / 2);

            elements.push(
                <TooltipProvider key={node.id} delayDuration={300}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <g>
                                <path
                                    d={pathData}
                                    fill={fillColor}
                                    fillOpacity={opacity}
                                    stroke="white"
                                    strokeWidth="2"
                                    className="cursor-pointer hover:opacity-100 transition-opacity drop-shadow-sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onNodeClick?.(node);
                                    }}
                                    onDoubleClick={(e) => {
                                        e.stopPropagation();
                                        onNodeDoubleClick?.(node);
                                    }}
                                />

                                {/* Label if there is enough space */}
                                {angleSpan > 10 && (
                                    <text
                                        x={polarToCartesian(center, center, innerR + (ringWidth / 2), currentStartAngle + angleSpan / 2).x}
                                        y={polarToCartesian(center, center, innerR + (ringWidth / 2), currentStartAngle + angleSpan / 2).y}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        fill={depth === 0 ? '#1e293b' : 'white'}
                                        className="text-[10px] font-medium pointer-events-none select-none"
                                        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                                    >
                                        {node.name.length > 20 ? node.name.slice(0, 18) + '...' : node.name}
                                    </text>
                                )}
                            </g>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs z-[9999] pointer-events-none">
                            <p className="font-semibold text-sm">{node.name}</p>
                            {node.description && <p className="text-xs text-slate-500 line-clamp-2 mt-1">{node.description}</p>}
                            <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-wide">
                                Nível: {node.level} • Dê 2 cliques para Focar
                            </p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );

            // Render children for the next ring out, if we haven't hit max depth limits
            if (node.children && node.children.length > 0 && depth < maxDepth - 1) {
                const childElements = renderArcs(node.children, currentStartAngle, depth + 1, baseColor, parentIndexOffset + idx);
                elements.push(...childElements);
            }

            currentStartAngle += angleSpan;
        });

        return elements;
    };


    return (
        <div className="relative flex justify-center items-center py-4 select-none w-full h-full min-h-[500px]">
            <svg viewBox={`0 0 ${size} ${size}`} className="max-w-full max-h-full h-auto" preserveAspectRatio="xMidYMid meet">
                {/* Center Circle */}
                <circle
                    cx={center}
                    cy={center}
                    r={centerHoleRadius - 5}
                    fill="white"
                    stroke="#e2e8f0"
                    strokeWidth="2"
                    className="cursor-pointer hover:fill-slate-50 transition-colors"
                    onClick={(e) => {
                        // Click center to clear selection...
                        if (!drilledNodeId) onNodeClick?.(null as any);
                    }}
                    onDoubleClick={() => {
                        // Double click center to go back up if drilled
                        if (drilledNodeId) onNodeDoubleClick?.(null as any);
                    }}
                />

                {data.length === 0 ? (
                    <text
                        x={center}
                        y={center}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-sm font-semibold fill-slate-400"
                    >
                        Vazio
                    </text>
                ) : (
                    <text
                        x={center}
                        y={center}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-xs font-bold tracking-widest fill-slate-700 leading-tight"
                    >
                        <tspan x={center} dy="-0.5em">{drilledNodeId && data.length > 0 ? (data[0].name.length > 15 ? data[0].name.slice(0, 15) + '...' : data[0].name) : "MATRIZ"}</tspan>
                        <tspan x={center} dy="1.5em">{drilledNodeId ? "(Voltar)" : "CIRCULAR"}</tspan>
                    </text>
                )}

                {/* Recursive Arcs */}
                {renderArcs(nodesToRender, 0, 0, "#cbd5e1")}
            </svg>
        </div>
    );
}

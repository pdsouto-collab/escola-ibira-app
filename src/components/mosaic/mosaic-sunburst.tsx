"use client";

import React, { useMemo } from "react";
import { MosaicNode, Status } from "@/lib/data";

interface MosaicSunburstProps {
    data: MosaicNode[];
    onSelectNode: (node: MosaicNode) => void;
    editMode?: boolean;
}

// ----------------------------------------------------------------------
// Geometria e Utilitários
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

// Conta quantas "folhas" (nós finais) existem sob um nó
function countLeaves(node: MosaicNode): number {
    if (!node.children || node.children.length === 0) {
        return 1;
    }
    return node.children.reduce((acc, child) => acc + countLeaves(child), 0);
}

// Pega a cor base para um status
const STATUS_OPACITY: Record<Status, number> = {
    "achieved": 1.0,
    "in-progress": 0.6,
    "not-started": 0.2
};

// ----------------------------------------------------------------------
// Componente Recursivo de Setores
// ----------------------------------------------------------------------

export function MosaicSunburst({ data, onSelectNode, editMode }: MosaicSunburstProps) {
    // Configurações do gráfico
    const size = 800; // Tamanho maior para comportar mais níveis
    const center = size / 2;
    const centerHoleRadius = 80;
    const maxRadius = size / 2 - 20;

    // Calcula a profundidade máxima da árvore para distribuir a largura dos anéis
    const getMaxDepth = (nodes: MosaicNode[], currentDepth = 1): number => {
        let max = currentDepth;
        for (const node of nodes) {
            if (node.children) {
                max = Math.max(max, getMaxDepth(node.children, currentDepth + 1));
            }
        }
        return max;
    };
    const maxDepth = useMemo(() => getMaxDepth(data), [data]);

    // Largura de cada anel com base no espaço disponível
    const ringWidth = (maxRadius - centerHoleRadius) / maxDepth;
    const gap = 1.5; // Espaço visual entre fatias

    // Estado total de folhas para dividir os 360 graus
    const totalLeaves = useMemo(() => data.reduce((acc, node) => acc + countLeaves(node), 0), [data]);

    // Função recursiva para renderizar arcos
    const renderArcs = (
        nodes: MosaicNode[],
        startAngle: number,
        depth: number,
        parentColor: string
    ) => {
        let currentStartAngle = startAngle;
        const elements: React.ReactNode[] = [];

        nodes.forEach((node) => {
            const leaves = countLeaves(node);
            const angleSpan = (leaves / totalLeaves) * 360;
            const endAngle = currentStartAngle + angleSpan;

            const innerR = centerHoleRadius + (depth * ringWidth);
            const outerR = innerR + ringWidth;

            // Define cor: Se tiver cor própria usa, senão herda. 
            // Níveis internos são mais claros, níveis externos (folhas) mostram status.
            let fillColor = node.color || parentColor;
            let opacity = 1.0;

            const isLeaf = !node.children || node.children.length === 0;

            if (isLeaf) {
                // Se é folha, usa opacidade baseada no status
                opacity = STATUS_OPACITY[node.status];
            } else {
                // Se é nó intermediário, clareia a cor para dar efeito de camadas
                opacity = 0.2 + (0.15 * depth); // Fica mais forte conforme vai para fora
            }

            const pathData = describeArc(center, center, innerR, outerR, currentStartAngle + gap / 2, endAngle - gap / 2);

            elements.push(
                <g key={node.id}>
                    <path
                        d={pathData}
                        fill={fillColor}
                        fillOpacity={opacity}
                        stroke="white"
                        strokeWidth="1.5"
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelectNode(node);
                        }}
                    >
                        <title>{node.label} ({node.status})</title>
                    </path>

                    {/* Render Label if slice is big enough */}
                    {angleSpan > 12 && (
                        <text
                            x={polarToCartesian(center, center, innerR + (ringWidth / 2), currentStartAngle + angleSpan / 2).x}
                            y={polarToCartesian(center, center, innerR + (ringWidth / 2), currentStartAngle + angleSpan / 2).y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill={isLeaf ? (node.status === 'not-started' ? '#64748b' : 'white') : '#1e293b'}
                            className="text-[10px] font-medium pointer-events-none select-none"
                            style={{
                                textShadow: isLeaf && node.status !== 'not-started' ? '0px 1px 2px rgba(0,0,0,0.3)' : 'none',
                                transformBox: 'fill-box',
                                transformOrigin: 'center',
                                // Rotate text to match angle if needed, simpler to keep horizontal for readability in concentric
                            }}
                        >
                            {leaves > 1 || angleSpan > 20 ? (node.label.length > 15 ? node.label.slice(0, 15) + '...' : node.label) : ''}
                        </text>
                    )}

                    {/* Renderiza filhos recursivamente */}
                    {node.children && renderArcs(node.children, currentStartAngle, depth + 1, fillColor)}
                </g>
            );

            // Se for editável e tiver espaço suficiente, mostra um botão de "add" ou "break" (mock visual)
            if (editMode && angleSpan > 15 && isLeaf) {
                const midAngle = currentStartAngle + angleSpan / 2;
                const btnPos = polarToCartesian(center, center, outerR - 15, midAngle);
                elements.push(
                    <circle
                        key={`add-${node.id}`}
                        cx={btnPos.x}
                        cy={btnPos.y}
                        r="4"
                        fill="white"
                        fillOpacity="0.5"
                        className="pointer-events-none"
                    />
                );
            }

            currentStartAngle += angleSpan;
        });

        return elements;
    };

    return (
        <div className="relative flex justify-center items-center py-4 select-none">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="max-w-full h-auto">
                {/* Center Decoration */}
                <circle cx={center} cy={center} r={centerHoleRadius - 5} fill="var(--background)" stroke="var(--border)" strokeWidth="1" />
                <text x={center} y={center} textAnchor="middle" dy="0.3em" className="font-bold text-xs uppercase fill-slate-400">
                    Mandala
                </text>

                {/* Recursive Arcs */}
                {renderArcs(data, 0, 0, "#cbd5e1")}
            </svg>

            {editMode && (
                <div className="absolute bottom-4 right-4 bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full border border-yellow-200">
                    ✏️ Modo Edição Ativo
                </div>
            )}
        </div>
    );
}

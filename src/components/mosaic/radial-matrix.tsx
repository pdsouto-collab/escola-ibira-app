"use client";

import React, { useMemo } from "react";
import { KnowledgeNode, KnowledgeLevel, Assessment, Project } from "@/lib/data";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LibraryItem } from "@/types/library-item";

interface RadialMatrixProps {
    data: KnowledgeNode[]; // Extracted from Admin Panel Tree
    treeType: "skill" | "content";
    assessments: Assessment[];
    projects: Project[];
    selectedStudentId: string;
    selectedClassId: string;
    selectedProjectId?: string;
    drilledNodeId?: string;
    libraryItems?: LibraryItem[];
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

// Counts how many leaves are under a node to divide the 360 circle proportionally.
// For radially stacked outer rings, all competence nodes (maxDepth - 2) carry a weight of 1.
function countLeavesForRender(node: KnowledgeNode, currentDepth: number, maxDepth: number): number {
    // If the next level is the radially stacked level, we don't count its children for angular width!
    if (currentDepth === maxDepth - 2) {
        return 1;
    }
    if (!node.children || node.children.length === 0 || currentDepth >= maxDepth - 1) {
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

// Helper to get point value from assessment rating
function getPoints(rating: number | undefined): number {
    return rating || 0;
}

// Helper to get saturation level based on Situation 01 (Percentage of points from children)
function getSatLevelSit01(points: number, maxPoints: number): 0 | 1 | 2 | 3 {
    if (maxPoints === 0 || points === 0) return 0;
    const percentage = points / maxPoints;
    if (percentage > 0.80) return 3; // 81% to 100%
    if (percentage > 0.40) return 2; // 41% to 80%
    if (percentage > 0) return 1;    // 1% to 40%
    return 0;
}

// Helper to get saturation level based on Situation 02 (Direct assessment)
function getSatLevelSit02(points: number): 0 | 1 | 2 | 3 {
    if (points >= 5) return 3;
    if (points >= 3) return 2;
    if (points >= 1) return 1;
    return 0;
}

function getNodeData(
    node: KnowledgeNode,
    assessments: Assessment[],
    projects: Project[],
    studentId: string,
    classId: string,
    selectedProjectId: string,
    libraryItems: LibraryItem[] = []
): { points: number; maxPoints: number; sat: number; isTrabalhado: boolean } {
    // 1. Check if node is "Trabalhado" (linked to a relevant project)
    // A node is trabalhado if it is in an ACTIVE project for this student or class
    const relevantProjects = projects.filter(p => {
        const isActive = p.status === 'active';
        const matchesFilter = selectedProjectId === "all" || p.id === selectedProjectId;
        return isActive && matchesFilter;
    });

    let isTrabalhado = false;

    // Check if node itself or any of its children are in a project
    const checkInProject = (n: KnowledgeNode): boolean => {
        const inThisNode = relevantProjects.some(p => {
            // Check student/class context
            const studentMatch = studentId && studentId !== "all" ? p.students.includes(studentId) : true;
            const classMatch = classId && classId !== "all" ? p.classes?.includes(classId) : true;

            if (!studentMatch && !classMatch) return false;

            const isMatch = (p.bnccSkillIds?.includes(n.id) ||
                p.contentIds?.includes(n.id) ||
                (n.libraryItemId && p.bnccSkillIds?.includes(n.libraryItemId)));

            if (isMatch) return true;

            // Name-based fallback for BNCC Fields (Education Infantil)
            // If the node name matches any of the selected skills' names, it's a match.
            const projectBnccSkills = (p.bnccSkillIds || []).map(sid => libraryItems.find(li => li.id === sid)).filter(Boolean);
            const nameMatch = projectBnccSkills.some(skill =>
                skill?.name?.trim().toLowerCase() === n.name.trim().toLowerCase()
            );

            return nameMatch;
        });

        if (inThisNode) return true;
        if (n.children) {
            return n.children.some(child => checkInProject(child));
        }
        return false;
    };

    isTrabalhado = checkInProject(node);

    // 2. Get direct assessment (most recent) for this student and this node
    const studentAssessments = assessments.filter(a =>
        a.knowledgeNodeId === node.id &&
        a.studentId === studentId &&
        a.scope === "student"
    );

    // Sort by date descending
    const latestRating = studentAssessments.length > 0
        ? [...studentAssessments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].rating
        : undefined;

    const directPoints = getPoints(latestRating);
    const directSat = getSatLevelSit02(directPoints);

    // 2. Recursive points from children
    let childPoints = 0;
    let childMaxPoints = 0;
    let childSats: number[] = [];

    if (node.children && node.children.length > 0) {
        node.children.forEach(child => {
            const cData = getNodeData(child, assessments, projects, studentId, classId, selectedProjectId, libraryItems);
            childPoints += cData.points;
            childMaxPoints += cData.maxPoints;
            childSats.push(cData.sat);
            if (cData.isTrabalhado) isTrabalhado = true;
        });
    }

    if (node.level === "micro") {
        // L3: Habilidade ou Conteúdo
        // Can be evaluated Sit 01 (sum of L4 hijos) or Sit 02 (direct)
        const recursiveSat = getSatLevelSit01(childPoints, childMaxPoints);
        const finalSat = Math.max(directSat, recursiveSat);
        return { points: directPoints + childPoints, maxPoints: 5 + childMaxPoints, sat: finalSat, isTrabalhado };
    }

    if (node.level === "atomico") {
        // L4: Habilidade específica ou Evidência
        // Always Sit 02
        return { points: directPoints, maxPoints: 5, sat: directSat, isTrabalhado };
    }

    // L1/L2: Macro/Mesclado
    // Higher levels usually don't have direct assessments in this flow,
    // they reflect the progress of their children.
    // We'll return average saturation of children for visual density.
    const avgSat = childSats.length > 0 ? childSats.reduce((a, b) => a + b, 0) / childSats.length : 0;
    return { points: directPoints + childPoints, maxPoints: 5 + childMaxPoints, sat: Math.ceil(avgSat), isTrabalhado };
}

export function RadialMatrix({
    data,
    treeType,
    assessments,
    projects,
    selectedStudentId,
    selectedClassId,
    selectedProjectId = "all",
    drilledNodeId,
    libraryItems,
    onNodeClick,
    onNodeDoubleClick
}: RadialMatrixProps) {
    const size = 800;
    const center = size / 2;
    const centerHoleRadius = 80;
    const maxRadius = size / 2 - 20;

    // Determine how many rings to draw based on drill down state
    // Default view: Eixo (Anel 1) > Competencia (Anel 2) > Habilidade (Anel 3) = 3 rings max
    // Drilled view: Competencia (Anel 1) > Habilidade (Anel 2) = 2 rings max
    const maxDepth = drilledNodeId ? 2 : 3;

    // Proportional widths for rings
    // 3 rings (default): 15% (Macro), 15% (Mesclado), 70% (Micro)
    // 2 rings (drilled): 25% (Mesclado), 75% (Micro)
    const getRingRadii = (depth: number) => {
        const totalUsableRadius = maxRadius - centerHoleRadius;

        if (maxDepth === 3) {
            const ratios = [0.15, 0.15, 0.70];
            let innerOffset = 0;
            for (let i = 0; i < depth; i++) {
                innerOffset += ratios[i] * totalUsableRadius;
            }
            const innerR = centerHoleRadius + innerOffset;
            const outerR = innerR + (ratios[depth] * totalUsableRadius);
            return { innerR, outerR };
        } else {
            // maxDepth === 2 (Drilled)
            const ratios = [0.25, 0.75];
            let innerOffset = 0;
            for (let i = 0; i < depth; i++) {
                innerOffset += ratios[i] * totalUsableRadius;
            }
            const innerR = centerHoleRadius + innerOffset;
            const outerR = innerR + (ratios[depth] * totalUsableRadius);
            return { innerR, outerR };
        }
    };

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
        parentIndexOffset: number = 0,
        parentAngleSpan?: number,
        studentId?: string,
        classId?: string,
        projectId?: string
    ) => {
        let currentStartAngle = startAngle;
        const elements: React.ReactNode[] = [];
        const stackRadially = depth === maxDepth - 1;

        nodes.forEach((node, idx) => {
            let angleSpan: number;

            if (stackRadially && parentAngleSpan !== undefined) {
                angleSpan = parentAngleSpan;
            } else {
                const leaves = countLeavesForRender(node, depth, maxDepth);
                angleSpan = (leaves / totalLeaves) * 360;
            }

            const endAngle = currentStartAngle + angleSpan;

            const { innerR: baseInnerR, outerR: baseOuterR } = getRingRadii(depth);
            let innerR = baseInnerR;
            let outerR = baseOuterR;

            if (stackRadially) {
                const currentRingWidth = baseOuterR - baseInnerR;
                const stackedWidth = currentRingWidth / Math.max(1, nodes.length);
                innerR = baseInnerR + (idx * stackedWidth);
                outerR = innerR + stackedWidth;
            } else {
                innerR = baseInnerR;
                outerR = baseOuterR;
            }

            let baseColor = parentColor;
            if (depth === 0) {
                baseColor = BASE_COLORS[(parentIndexOffset + idx) % BASE_COLORS.length];
            }

            const isViewingEvaluation = (studentId && studentId !== "all") || (classId && classId !== "all") || (projectId && projectId !== "all");

            const nodeData = isViewingEvaluation
                ? getNodeData(node, assessments, projects, studentId || "all", classId || "all", projectId || "all", libraryItems || [])
                : { points: 0, maxPoints: 0, sat: 0, isTrabalhado: false };
            const satLevel = nodeData.sat;
            const isTrabalhado = nodeData.isTrabalhado;

            const effectiveDepth = drilledNodeId ? depth + 1 : depth;

            // Saturation colors
            let fillColor = baseColor;
            let opacity = 0;
            let strokeColor = "white";
            let strokeWidth = "1.5";

            if (isViewingEvaluation) {
                if (satLevel === 0) {
                    fillColor = isTrabalhado ? "url(#diagonalHatch)" : "white";
                    opacity = 1;
                    strokeColor = baseColor;
                    strokeWidth = "2";
                } else if (satLevel === 1) {
                    opacity = 0.35;
                } else if (satLevel === 2) {
                    opacity = 0.65;
                } else {
                    opacity = 1.0;
                }
            } else {
                // Default view (no student selected)
                opacity = effectiveDepth === 0 ? 0.3 : (effectiveDepth === 1 ? 0.6 : 0.9);
            }

            const rGap = stackRadially && nodes.length > 1 ? 1 : 0;
            const pathData = describeArc(center, center, innerR + rGap, outerR - rGap, currentStartAngle + gap / 2, endAngle - gap / 2);

            elements.push(
                <TooltipProvider key={node.id} delayDuration={300}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <g>
                                <path
                                    d={pathData}
                                    fill={fillColor}
                                    fillOpacity={opacity}
                                    stroke={strokeColor}
                                    strokeWidth={strokeWidth}
                                    className="cursor-pointer hover:opacity-100 hover:stroke-slate-300 transition-all drop-shadow-sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onNodeClick?.(node);
                                    }}
                                    onDoubleClick={(e) => {
                                        e.stopPropagation();
                                        onNodeDoubleClick?.(node);
                                    }}
                                />
                            </g>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs z-[9999] pointer-events-none">
                            <p className="font-semibold text-sm">{node.name}</p>
                            {node.description && <p className="text-xs text-slate-500 line-clamp-2 mt-1">{node.description}</p>}
                            <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-wide">
                                Nível: {node.level === 'macro' ? '1' : node.level === 'mesclado' ? '2' : node.level === 'micro' ? '3' : '4'} • Dê 2 cliques para Focar
                            </p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );

            if (node.children && node.children.length > 0 && depth < maxDepth - 1) {
                const childElements = renderArcs(node.children, currentStartAngle, depth + 1, baseColor, parentIndexOffset + idx, angleSpan, studentId, classId, projectId);
                elements.push(...childElements);
            }

            if (!stackRadially) {
                currentStartAngle += angleSpan;
            }
        });

        return elements;
    };


    return (
        <div className="relative flex justify-center items-center py-4 select-none w-full h-full">
            <svg viewBox={`0 0 ${size} ${size}`} className="max-w-full max-h-full h-auto" preserveAspectRatio="xMidYMid meet">
                <defs>
                    <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="4" height="4" patternTransform="rotate(45 2 2)">
                        <path d="M -1,2 l 6,0" stroke="#94a3b8" strokeWidth="1" />
                    </pattern>
                </defs>

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
                        <tspan x={center} dy={drilledNodeId ? "-0.5em" : "0"}>{drilledNodeId && data.length > 0 ? (data[0].name.length > 15 ? data[0].name.slice(0, 15) + '...' : data[0].name) : "TRILHA"}</tspan>
                        {drilledNodeId && (
                            <tspan x={center} dy="1.5em">(Voltar)</tspan>
                        )}
                    </text>
                )}

                {/* Recursive Arcs */}
                {renderArcs(nodesToRender, 0, 0, "#cbd5e1", 0, undefined, selectedStudentId, selectedClassId, selectedProjectId)}
            </svg>
        </div>
    );
}

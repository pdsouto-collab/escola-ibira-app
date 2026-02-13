"use client";

import React, { useMemo } from "react";
import { MosaicNode } from "@/lib/data";
import { motion } from "framer-motion";

interface TreeMosaicProps {
    data: MosaicNode[];
    onSelectNode: (node: MosaicNode) => void;
    editMode?: boolean;
}

const CONFIG = {
    startX: 400,
    startY: 700, // Top of the trunk in the SVG
};

// Define interactive zones matching the SVG paths
const ZONES = {
    trunkLower: "M355 840 L 445 840 L 440 770 L 360 770 Z",
    trunkUpper: "M360 770 L 440 770 L 435 700 L 365 700 Z",
    rootBlue: "M380 840 Q 340 880, 250 960", // Simplified hit path for stroking transparently
    rootOrange: "M390 840 Q 370 900, 320 980",
    rootPurple: "M410 840 Q 430 900, 480 980",
    rootGreen: "M420 840 Q 460 880, 550 960"
};

const TRUNK_NODES = {
    lower: { id: "trunk-pre", label: "Pré-Escolar", type: "trunk", status: "achieved" } as MosaicNode,
    upper: { id: "trunk-prim", label: "Primeira Infância", type: "trunk", status: "achieved" } as MosaicNode
};

const ROOT_NODES = [
    { id: "root-social", label: "Social", color: "#4299E1", type: "root", status: "achieved" },
    { id: "root-cog", label: "Cognitivo", color: "#E67E22", type: "root", status: "achieved" },
    { id: "root-emo", label: "Emocional", color: "#805AD5", type: "root", status: "achieved" },
    { id: "root-phys", label: "Físico", color: "#48BB78", type: "root", status: "achieved" }
] as MosaicNode[];

export function TreeMosaic({ data, onSelectNode, editMode }: TreeMosaicProps) {

    const treeContent = useMemo(() => {
        const elements: React.ReactNode[] = [];

        // --- 1. DYNAMIC BRANCHES & CANOPY ---
        // Emerging from the top of the trunk (400, 700)

        data.forEach((areaNode, i) => {
            const totalAreas = data.length;
            // Distribute branches in a semi-circle upwards
            // -90 degrees is UP. Spread from -160 to -20
            const spread = 140;
            const startAngle = -160;
            const step = spread / (totalAreas - 1 || 1);
            const angleDeg = startAngle + (i * step);
            const angleRad = (angleDeg * Math.PI) / 180;

            const branchLen = 250;
            // Bezier Control Points for organic curve
            const endX = CONFIG.startX + Math.cos(angleRad) * branchLen;
            const endY = CONFIG.startY + Math.sin(angleRad) * branchLen;

            const cp1x = CONFIG.startX + Math.cos(angleRad - 0.2) * (branchLen * 0.4);
            const cp1y = CONFIG.startY + Math.sin(angleRad - 0.2) * (branchLen * 0.4);

            // 1a. Branch Path
            elements.push(
                <motion.path
                    key={`branch-main-${areaNode.id}`}
                    d={`M${CONFIG.startX} ${CONFIG.startY} Q${cp1x} ${cp1y} ${endX} ${endY}`}
                    stroke={areaNode.color || "#5D4037"}
                    strokeWidth="12"
                    strokeLinecap="round"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.8 }}
                    transition={{ duration: 1, delay: i * 0.2 }}
                    className="cursor-pointer hover:opacity-100"
                    onClick={() => onSelectNode(areaNode)}
                />
            );

            // 1b. Foliage (Canopy Clouds)
            elements.push(
                <motion.circle
                    key={`foliage-${areaNode.id}`}
                    cx={endX} cy={endY}
                    r="45"
                    fill={areaNode.color}
                    opacity="0.2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                />
            );

            // Label
            elements.push(
                <text
                    key={`lbl-${areaNode.id}`}
                    x={endX} y={endY}
                    textAnchor="middle" dy="5"
                    fill="#333" fontSize="12" fontWeight="bold"
                    style={{ textShadow: "0px 0px 3px white", pointerEvents: "none" }}
                >
                    {areaNode.label}
                </text>
            );

            // 1c. Sub-items (Fruits/Leaves)
            if (areaNode.children) {
                areaNode.children.forEach((compNode, j) => {
                    // Randomize position around the main branch end
                    const angle = (Math.random() * 360 * Math.PI) / 180;
                    const dist = 40 + Math.random() * 40;
                    const fx = endX + Math.cos(angle) * dist;
                    const fy = endY + Math.sin(angle) * dist;

                    elements.push(
                        <motion.line
                            key={`stem-${compNode.id}`}
                            x1={endX} y1={endY} x2={fx} y2={fy}
                            stroke={areaNode.color} strokeWidth="2" opacity="0.6"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ delay: 1 + j * 0.1 }}
                        />
                    );

                    elements.push(
                        <motion.circle
                            key={`fruit-${compNode.id}`}
                            cx={fx} cy={fy} r="8"
                            fill={areaNode.color}
                            stroke="white" strokeWidth="2"
                            className="cursor-pointer hover:scale-125 transition-transform"
                            onClick={(e) => { e.stopPropagation(); onSelectNode(compNode); }}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 1.2 + j * 0.1 }}
                        >
                            <title>{compNode.label}</title>
                        </motion.circle>
                    );
                });
            }

        });

        return elements;
    }, [data, onSelectNode]);

    return (
        <div className="relative flex justify-center items-center select-none bg-[#FDFBF7] rounded-xl overflow-hidden min-h-[900px] shadow-inner">
            <svg width="100%" height="1000" viewBox="0 0 800 1000" className="max-w-full h-auto z-10 overflow-visible">

                {/* 1. Base Image */}
                <image href="/escola-ibira-app/mosaico/tree-base.svg" width="800" height="1000" />

                {/* 2. Interactive Root Zones (Invisible Hit Areas) */}
                <path d={ZONES.rootBlue} stroke="transparent" strokeWidth="40" fill="none" className="cursor-pointer" onClick={() => onSelectNode(ROOT_NODES[0])}><title>Raízes Sociais</title></path>
                <path d={ZONES.rootOrange} stroke="transparent" strokeWidth="40" fill="none" className="cursor-pointer" onClick={() => onSelectNode(ROOT_NODES[1])}><title>Raízes Cognitivas</title></path>
                <path d={ZONES.rootPurple} stroke="transparent" strokeWidth="40" fill="none" className="cursor-pointer" onClick={() => onSelectNode(ROOT_NODES[2])}><title>Raízes Emocionais</title></path>
                <path d={ZONES.rootGreen} stroke="transparent" strokeWidth="40" fill="none" className="cursor-pointer" onClick={() => onSelectNode(ROOT_NODES[3])}><title>Raízes Físicas</title></path>

                {/* 3. Interactive Trunk Zones */}
                <path d={ZONES.trunkLower} fill="transparent" className="cursor-pointer hover:fill-white/10" onClick={() => onSelectNode(TRUNK_NODES.lower)}><title>Pré-Escolar</title></path>
                <path d={ZONES.trunkUpper} fill="transparent" className="cursor-pointer hover:fill-white/10" onClick={() => onSelectNode(TRUNK_NODES.upper)}><title>Primeira Infância</title></path>

                {/* 4. Dynamic Content */}
                {treeContent}

            </svg>

            {editMode && (
                <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur text-xs px-3 py-1 rounded-full border shadow-sm">
                    ✨ Edição Visual Ativa
                </div>
            )}
        </div>
    );
}

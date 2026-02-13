"use client";

import React, { useState } from "react";
import { MosaicNode } from "@/lib/data";
import { motion } from "framer-motion";

interface PracticesTreeProps {
    data: MosaicNode[];
    onSelectNode: (node: MosaicNode) => void;
    editMode?: boolean;
}

// Define interactive zones based on the provided image structure
// These paths will need to be adjusted to match the exact "stems" of the new image
const ZONES = {
    // Roots
    rootSocial: "M 200 900 Q 250 850 350 800 L 450 800 Q 550 850 600 900", // Placeholder path
    rootCognitive: "M 300 900 Q 350 850 400 800",
    rootEmotional: "M 400 900 Q 450 850 500 800",
    rootPhysical: "M 500 900 Q 550 850 600 800",

    // Trunk
    trunk: "M 350 800 L 350 600 L 450 600 L 450 800 Z",

    // Branches/Stems (Generic examples, need to be specific to image)
    branchLeft: "M 350 600 Q 200 500 150 400",
    branchRight: "M 450 600 Q 600 500 650 400",
    branchTop: "M 400 600 L 400 300"
};

export function PracticesTree({ data, onSelectNode, editMode }: PracticesTreeProps) {
    const [hoveredZone, setHoveredZone] = useState<string | null>(null);

    // Helper to find nodes (assuming structure matches data.ts)
    // You might need to adjust this matching logic based on how you want to map 
    // the specific stems in the image to the data nodes.
    const findNode = (id: string) => {
        // This is a simple recursive search or flat map could be used if data was flat
        // For now, let's assume we are mapping specific known IDs for the prototype
        return data.find(n => n.id === id);
    };

    return (
        <div className="relative flex justify-center items-center select-none bg-[#FDFBF7] rounded-xl overflow-hidden min-h-[900px] shadow-inner w-full">

            {/* Main Container for Image and Overlay */}
            <div className="relative w-[800px] h-[1000px] max-w-full">

                {/* 1. Base Image */}
                <img
                    src="/mosaico/tree-structure.png"
                    alt="Árvore de Práticas"
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                />

                {/* 2. Interactive SVG Overlay */}
                <svg
                    viewBox="0 0 800 1000"
                    className="absolute inset-0 w-full h-full z-10"
                    style={{ pointerEvents: 'none' }} // Let clicks pass through specific paths only
                >
                    {/* Debug: Visualize zones if in edit mode */}
                    {editMode && (
                        <text x="50" y="50" className="text-red-500 font-bold">Debug Mode: Zones Visible</text>
                    )}

                    {/* Example Root Zones */}
                    <path
                        d="M260 850 C 260 850, 150 900, 100 950 L 200 980 C 250 950, 350 900, 380 850 Z"
                        fill={editMode ? "rgba(66, 153, 225, 0.5)" : "transparent"}
                        className="cursor-pointer transition-opacity hover:fill-blue-500/20 pointer-events-auto"
                        onClick={() => onSelectNode({ id: "root-social", label: "Social", type: "root", status: "achieved" } as any)}
                    />
                    <path
                        d="M400 850 C 400 850, 380 920, 350 980 L 450 980 C 420 920, 420 850, 420 850 Z"
                        fill={editMode ? "rgba(230, 126, 34, 0.5)" : "transparent"}
                        className="cursor-pointer transition-opacity hover:fill-orange-500/20 pointer-events-auto"
                        onClick={() => onSelectNode({ id: "root-cog", label: "Cognitivo", type: "root", status: "achieved" } as any)}
                    />

                    {/* Example Trunk Zone */}
                    <path
                        d="M360 850 L 360 650 Q 350 600 300 550 L 500 550 Q 450 600 440 650 L 440 850 Z"
                        fill={editMode ? "rgba(100, 100, 100, 0.5)" : "transparent"}
                        className="cursor-pointer transition-opacity hover:fill-white/10 pointer-events-auto"
                        onClick={() => onSelectNode({ id: "trunk-main", label: "Tronco Principal", type: "trunk", status: "in-progress" } as any)}
                    />

                    {/* Example Branch Zones (Stems) */}
                    {/* Left Branch - Natureza */}
                    <path
                        d="M300 550 Q 150 500 100 350 L 150 320 Q 200 450 340 520 Z"
                        fill={editMode ? "rgba(72, 187, 120, 0.5)" : "transparent"}
                        className="cursor-pointer transition-opacity hover:fill-green-500/20 pointer-events-auto"
                        onClick={() => onSelectNode({ id: "natureza", label: "Natureza e Sociedade", type: "area", status: "in-progress" } as any)}
                    />

                    {/* Right Branch - Linguagem */}
                    <path
                        d="M500 550 Q 650 500 700 350 L 650 320 Q 600 450 460 520 Z"
                        fill={editMode ? "rgba(128, 90, 213, 0.5)" : "transparent"}
                        className="cursor-pointer transition-opacity hover:fill-purple-500/20 pointer-events-auto"
                        onClick={() => onSelectNode({ id: "linguagem", label: "Linguagem", type: "area", status: "in-progress" } as any)}
                    />

                    {/* Top Branch - Artes */}
                    <path
                        d="M380 500 L 380 300 L 420 300 L 420 500 Z"
                        fill={editMode ? "rgba(41, 128, 185, 0.5)" : "transparent"}
                        className="cursor-pointer transition-opacity hover:fill-blue-500/20 pointer-events-auto"
                        onClick={() => onSelectNode({ id: "artes", label: "Artes", type: "area", status: "in-progress" } as any)}
                    />

                </svg>

                {/* Optional: Add labels or indicators via absolute positioning if needed */}
            </div>

            {/* Helper message if image is missing checking */}
            <div className="absolute top-4 left-4 text-xs text-slate-400 max-w-xs">
                Certifique-se de que a imagem <code>public/mosaico/tree-structure.png</code> existe.
            </div>
        </div>
    );
}

"use client";

import React from "react";
import { MosaicNode } from "@/lib/data";

interface MonalMosaicProps {
    data: MosaicNode[];
    onSelectNode: (node: MosaicNode) => void;
    editMode?: boolean;
}

// Himalayan Monal Palette (9 Colors)
const MONAL_PALETTE = [
    "#2E8B57", // 1. Iridescent Green (Head/Crest)
    "#D2691E", // 2. Copper/Bronze (Neck)
    "#4B0082", // 3. Indigo (Back)
    "#4169E1", // 4. Royal Blue (Wing Coverts)
    "#00CED1", // 5. Turquoise (Eye Skin)
    "#FF8C00", // 6. Dark Orange (Tail)
    "#8B4513", // 7. Saddle Brown (Wing Tips)
    "#000000", // 8. Black (Underparts/Contrast)
    "#FFD700", // 9. Gold (Details)
];

// Simplified Geometric Paths for a Bird (Abstract Monal)
// These indices map to the palette above.
const BIRD_ZONES = [
    { id: "head", path: "M300 100 L340 80 L360 110 L330 140 Z", label: "Crest & Head", colorIdx: 0 },
    { id: "neck", path: "M330 140 L360 110 L400 130 L380 180 Z", label: "Neck", colorIdx: 1 },
    { id: "back", path: "M330 140 L380 180 L320 250 L250 200 Z", label: "Back", colorIdx: 2 },
    { id: "wing_upper", path: "M250 200 L320 250 L300 350 L200 300 Z", label: "Upper Wing", colorIdx: 3 },
    { id: "eye", path: "M320 105 A 5 5 0 1 1 330 105 A 5 5 0 1 1 320 105 Z", label: "Eye", colorIdx: 4 }, // Small eye patch
    { id: "tail", path: "M200 300 L300 350 L250 450 L150 400 Z", label: "Tail", colorIdx: 5 },
    { id: "wing_tip", path: "M150 250 L200 300 L150 400 L100 350 Z", label: "Wing Tip", colorIdx: 6 },
    { id: "body_lower", path: "M250 200 L200 300 L150 250 L180 180 Z", label: "Body", colorIdx: 7 },
    { id: "beak", path: "M360 110 L380 115 L360 120 Z", label: "Beak", colorIdx: 8 },
];

export function MonalMosaic({ data, onSelectNode, editMode }: MonalMosaicProps) {
    // Map data nodes to bird zones sequentially
    // If we have more data than zones, we might need a different strategy,
    // but for now we map the top-level items to the first available zones.
    const mappedZones = BIRD_ZONES.map((zone, index) => {
        const dataNode = data[index]; // Simple 1-to-1 mapping based on order
        return {
            ...zone,
            dataNode
        };
    });

    return (
        <div className="relative flex justify-center items-center py-8 select-none">
            <svg width="500" height="500" viewBox="0 0 500 500" className="max-w-full h-auto drop-shadow-xl">
                <defs>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                {/* Render Bird Zones */}
                {mappedZones.map((zone) => {
                    const isActive = !!zone.dataNode;
                    const fillColor = isActive ? (zone.dataNode.color || MONAL_PALETTE[zone.colorIdx]) : "#e2e8f0"; // Grey if no data found
                    const opacity = isActive ? 0.9 : 0.3;

                    return (
                        <g
                            key={zone.id}
                            className={`transition-all duration-300 ${isActive ? "cursor-pointer hover:filter hover:brightness-110" : "opacity-50"}`}
                            onClick={(e) => {
                                if (isActive) {
                                    e.stopPropagation();
                                    onSelectNode(zone.dataNode);
                                }
                            }}
                        >
                            <path
                                d={zone.path}
                                fill={fillColor}
                                stroke="white"
                                strokeWidth="2"
                                fillOpacity={opacity}
                            />
                            {/* Label (if active) */}
                            {isActive && (
                                <text
                                    x={getCenter(zone.path).x}
                                    y={getCenter(zone.path).y}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fill="white"
                                    className="text-[10px] font-bold pointer-events-none uppercase shadow-black drop-shadow-md"
                                    style={{ textShadow: "0px 1px 2px rgba(0,0,0,0.8)" }}
                                >
                                    {zone.dataNode.label.slice(0, 10)}
                                </text>
                            )}
                        </g>
                    );
                })}

                {/* Decorative Elements / Background Context? (Optional) */}
            </svg>

            {editMode && (
                <div className="absolute bottom-4 right-4 bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full border border-yellow-200">
                    ✏️ Modo Edição (Monal)
                </div>
            )}
        </div>
    );
}

// Helper to find approximate center of a path (for label placement)
function getCenter(pathData: string) {
    // Very crude approximation by averaging coordinates found in the string
    // This expects commands like "M100 100 L200 200..."
    const numbers = pathData.match(/[-+]?[0-9]*\.?[0-9]+/g)?.map(Number) || [];
    let sumX = 0, sumY = 0, count = 0;

    for (let i = 0; i < numbers.length; i += 2) {
        if (numbers[i + 1] !== undefined) {
            sumX += numbers[i];
            sumY += numbers[i + 1];
            count++;
        }
    }

    return { x: sumX / count, y: sumY / count };
}

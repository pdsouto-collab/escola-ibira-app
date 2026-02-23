"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface TreeRatingPickerProps {
    value?: 1 | 2 | 3 | 4 | 5;
    onChange?: (rating: 1 | 2 | 3 | 4 | 5) => void;
    readOnly?: boolean;
    size?: "sm" | "md" | "lg";
}

const labels = ["Muda", "Broto", "Jovem", "Adulta", "Com frutos"];

// Tree SVG Level 1: tiny seedling — just a stem with two leaves
const Tree1 = ({ active }: { active: boolean }) => (
    <svg viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Soil */}
        <ellipse cx="30" cy="74" rx="14" ry="4" fill={active ? "#92400e" : "#d1d5db"} opacity="0.5" />
        {/* Stem */}
        <rect x="28" y="44" width="4" height="30" rx="2" fill={active ? "#92400e" : "#9ca3af"} />
        {/* Single sprout leaf left */}
        <path d="M29 48 Q18 38 22 28 Q30 36 29 48Z" fill={active ? "#16a34a" : "#9ca3af"} />
        {/* Single sprout leaf right */}
        <path d="M31 48 Q42 38 38 28 Q30 36 31 48Z" fill={active ? "#22c55e" : "#d1d5db"} />
    </svg>
);

// Tree Level 2: small plant with 3 leaves
const Tree2 = ({ active }: { active: boolean }) => (
    <svg viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="30" cy="74" rx="16" ry="4" fill={active ? "#92400e" : "#d1d5db"} opacity="0.5" />
        <rect x="27.5" y="38" width="5" height="36" rx="2.5" fill={active ? "#78350f" : "#9ca3af"} />
        {/* Center top */}
        <ellipse cx="30" cy="28" rx="10" ry="13" fill={active ? "#16a34a" : "#9ca3af"} />
        {/* Left leaf */}
        <path d="M27 40 Q10 30 14 16 Q26 26 27 40Z" fill={active ? "#22c55e" : "#d1d5db"} />
        {/* Right leaf */}
        <path d="M33 40 Q50 30 46 16 Q34 26 33 40Z" fill={active ? "#15803d" : "#9ca3af"} />
    </svg>
);

// Tree Level 3: young tree with rounded canopy
const Tree3 = ({ active }: { active: boolean }) => (
    <svg viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Ground */}
        <ellipse cx="30" cy="74" rx="18" ry="4.5" fill={active ? "#92400e" : "#d1d5db"} opacity="0.6" />
        {/* Trunk */}
        <path d="M24 74 Q26 62 27 50 L33 50 Q34 62 36 74Z" fill={active ? "#78350f" : "#9ca3af"} />
        {/* Canopy base */}
        <ellipse cx="30" cy="36" rx="18" ry="20" fill={active ? "#16a34a" : "#c4c4c4"} />
        {/* Canopy highlight */}
        <ellipse cx="26" cy="28" rx="10" ry="12" fill={active ? "#22c55e" : "#d1d5db"} opacity="0.7" />
    </svg>
);

// Tree Level 4: full adult tree, taller and denser
const Tree4 = ({ active }: { active: boolean }) => (
    <svg viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="30" cy="74" rx="20" ry="5" fill={active ? "#78350f" : "#d1d5db"} opacity="0.6" />
        {/* Trunk with roots */}
        <path d="M22 74 Q24 56 26 46 L34 46 Q36 56 38 74Z" fill={active ? "#78350f" : "#9ca3af"} />
        <path d="M22 74 Q16 70 12 73" stroke={active ? "#78350f" : "#9ca3af"} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M38 74 Q44 70 48 73" stroke={active ? "#78350f" : "#9ca3af"} strokeWidth="2.5" strokeLinecap="round" />
        {/* Large canopy */}
        <ellipse cx="30" cy="30" rx="22" ry="22" fill={active ? "#15803d" : "#b0b0b0"} />
        <ellipse cx="25" cy="22" rx="13" ry="14" fill={active ? "#22c55e" : "#d1d5db"} opacity="0.7" />
        <ellipse cx="37" cy="25" rx="10" ry="12" fill={active ? "#16a34a" : "#c4c4c4"} opacity="0.6" />
    </svg>
);

// Tree Level 5: mature tree with visible round fruits
const Tree5 = ({ active }: { active: boolean }) => (
    <svg viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="30" cy="74" rx="22" ry="5" fill={active ? "#78350f" : "#d1d5db"} opacity="0.7" />
        {/* Trunk */}
        <path d="M22 74 Q24 56 26 44 L34 44 Q36 56 38 74Z" fill={active ? "#78350f" : "#9ca3af"} />
        <path d="M22 74 Q14 68 10 72" stroke={active ? "#78350f" : "#9ca3af"} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M38 74 Q46 68 50 72" stroke={active ? "#78350f" : "#9ca3af"} strokeWidth="2.5" strokeLinecap="round" />
        {/* Canopy layers */}
        <ellipse cx="30" cy="28" rx="24" ry="23" fill={active ? "#15803d" : "#b0b0b0"} />
        <ellipse cx="22" cy="20" rx="13" ry="14" fill={active ? "#22c55e" : "#d1d5db"} opacity="0.65" />
        <ellipse cx="39" cy="22" rx="11" ry="13" fill={active ? "#16a34a" : "#c4c4c4"} opacity="0.55" />
        {/* Fruits */}
        <circle cx="19" cy="34" r="4.5" fill={active ? "#dc2626" : "#e5e7eb"} />
        <circle cx="19" cy="34" r="1.5" fill={active ? "#b91c1c" : "#d1d5db"} opacity="0.6" />
        <circle cx="30" cy="12" r="4" fill={active ? "#dc2626" : "#e5e7eb"} />
        <circle cx="30" cy="12" r="1.5" fill={active ? "#b91c1c" : "#d1d5db"} opacity="0.6" />
        <circle cx="41" cy="32" r="4.5" fill={active ? "#dc2626" : "#e5e7eb"} />
        <circle cx="41" cy="32" r="1.5" fill={active ? "#b91c1c" : "#d1d5db"} opacity="0.6" />
        <circle cx="36" cy="42" r="3.5" fill={active ? "#dc2626" : "#e5e7eb"} />
        <circle cx="24" cy="44" r="3" fill={active ? "#f97316" : "#e5e7eb"} />
        {/* Fruit stems */}
        <path d="M19 30 Q19 28 21 26" stroke={active ? "#15803d" : "#d1d5db"} strokeWidth="1" strokeLinecap="round" />
        <path d="M30 8 Q30 6 32 5" stroke={active ? "#15803d" : "#d1d5db"} strokeWidth="1" strokeLinecap="round" />
        <path d="M41 28 Q41 26 43 25" stroke={active ? "#15803d" : "#d1d5db"} strokeWidth="1" strokeLinecap="round" />
    </svg>
);

const TREES = [Tree1, Tree2, Tree3, Tree4, Tree5];

export function TreeRatingPicker({ value, onChange, readOnly = false, size = "md" }: TreeRatingPickerProps) {
    const sizeClasses = {
        sm: "w-10 h-12",
        md: "w-14 h-16",
        lg: "w-20 h-24",
    };
    const containerGap = { sm: "gap-1", md: "gap-2", lg: "gap-3" };

    return (
        <div className="flex flex-col items-center gap-2">
            <div className={cn("flex items-end", containerGap[size])}>
                {TREES.map((TreeComponent, idx) => {
                    const rating = (idx + 1) as 1 | 2 | 3 | 4 | 5;
                    const isSelected = value === rating;
                    const isPast = value !== undefined && rating <= value;

                    return (
                        <button
                            key={rating}
                            type="button"
                            disabled={readOnly}
                            onClick={() => onChange?.(rating)}
                            className={cn(
                                sizeClasses[size],
                                "flex flex-col items-center gap-0.5 rounded-lg p-1 transition-all duration-200",
                                !readOnly && "hover:scale-110 hover:bg-green-50 cursor-pointer",
                                isSelected && "bg-green-100 ring-2 ring-green-500 rounded-lg scale-110",
                                readOnly && "cursor-default"
                            )}
                            title={`${rating} — ${labels[idx]}`}
                            aria-label={`Nota ${rating}: ${labels[idx]}`}
                            aria-pressed={isSelected}
                        >
                            <div className={cn(sizeClasses[size], "flex-1")}>
                                <TreeComponent active={isPast} />
                            </div>
                        </button>
                    );
                })}
            </div>
            {value && (
                <p className="text-xs text-green-700 font-semibold">
                    {value} — {labels[value - 1]}
                </p>
            )}
        </div>
    );
}

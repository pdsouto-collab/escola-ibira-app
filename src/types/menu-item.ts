export interface MenuItem {
    id?: string;
    time?: string; // e.g., "09:30" - legacy/fallback
    timeInfantil?: string;
    timeFundamental?: string;
    title: string; // e.g., "Lanche da Manhã"
    description: string; // e.g., "Frutas da estação e suco."
}

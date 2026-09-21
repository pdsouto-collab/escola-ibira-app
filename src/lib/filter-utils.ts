/**
 * Utility functions for filtering data consistently across all pages by
 * Turma (Class), Aluno (Student), Semestre (Semester) and Ano (Year).
 */

export interface PeriodFilterOptions {
    year?: string;     // "all" | "2024" | "2025" | "2026" | "2027" | etc.
}

/**
 * Checks if a given item (by its stored period string or ISO date) matches the selected semester and year filters.
 */
export function matchesPeriod(
    itemPeriod?: string | null,
    itemDate?: string | Date | null,
    year: string = "all"
): boolean {
    const isYearAll = !year || year === "all";

    // If filter is "all", everything passes
    if (isYearAll) return true;

    let periodMatchesYear = isYearAll;
    let dateMatchesYear = isYearAll;

    // 1. Check against explicit itemPeriod string (e.g. "2026")
    if (itemPeriod && typeof itemPeriod === "string") {
        if (!isYearAll) {
            if (itemPeriod.includes(year)) {
                periodMatchesYear = true;
            }
        }
    }

    // 2. Check against explicit itemDate (e.g. "2026-03-15", ISO string, Date object)
    if (itemDate) {
        try {
            const d = typeof itemDate === "string" ? new Date(itemDate) : itemDate;
            if (!isNaN(d.getTime())) {
                const itemYearStr = d.getFullYear().toString();
                const itemMonth = d.getMonth() + 1; // 1 to 12

                if (!isYearAll) {
                    dateMatchesYear = itemYearStr === year;
                }
            }
        } catch {
            // Ignore date parse errors
        }
    }

    // If item has both or either, return true if either representation matched both criteria
    const matchedByPeriod = Boolean(itemPeriod) && periodMatchesYear;
    const matchedByDate = Boolean(itemDate) && dateMatchesYear;

    if (itemPeriod && itemDate) {
        return matchedByPeriod || matchedByDate;
    }
    if (itemPeriod) return matchedByPeriod;
    if (itemDate) return matchedByDate;

    return false;
}

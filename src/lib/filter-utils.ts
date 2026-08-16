/**
 * Utility functions for filtering data consistently across all pages by
 * Turma (Class), Aluno (Student), Semestre (Semester) and Ano (Year).
 */

export interface PeriodFilterOptions {
    semester?: string; // "all" | "1º Semestre" | "2º Semestre"
    year?: string;     // "all" | "2024" | "2025" | "2026" | "2027" | etc.
}

/**
 * Checks if a given item (by its stored period string or ISO date) matches the selected semester and year filters.
 */
export function matchesPeriod(
    itemPeriod?: string | null,
    itemDate?: string | Date | null,
    semester: string = "all",
    year: string = "all"
): boolean {
    const isSemAll = !semester || semester === "all";
    const isYearAll = !year || year === "all";

    // If both filters are "all", everything passes
    if (isSemAll && isYearAll) return true;

    let periodMatchesSemester = isSemAll;
    let periodMatchesYear = isYearAll;

    let dateMatchesSemester = isSemAll;
    let dateMatchesYear = isYearAll;

    // 1. Check against explicit itemPeriod string (e.g. "1º Semestre / 2026", "1º Semestre", "2026")
    if (itemPeriod && typeof itemPeriod === "string") {
        const lower = itemPeriod.toLowerCase();
        if (!isSemAll) {
            if (semester.includes("1") && (lower.includes("1º") || lower.includes("1o") || lower.includes("primeiro"))) {
                periodMatchesSemester = true;
            } else if (semester.includes("2") && (lower.includes("2º") || lower.includes("2o") || lower.includes("segundo"))) {
                periodMatchesSemester = true;
            }
        }
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
                if (!isSemAll) {
                    if (semester.includes("1") && itemMonth <= 6) {
                        dateMatchesSemester = true;
                    } else if (semester.includes("2") && itemMonth > 6) {
                        dateMatchesSemester = true;
                    }
                }
            }
        } catch {
            // Ignore date parse errors
        }
    }

    // If item has both or either, return true if either representation matched both criteria
    const matchedByPeriod = Boolean(itemPeriod) && periodMatchesSemester && periodMatchesYear;
    const matchedByDate = Boolean(itemDate) && dateMatchesSemester && dateMatchesYear;

    if (itemPeriod && itemDate) {
        return matchedByPeriod || matchedByDate;
    }
    if (itemPeriod) return matchedByPeriod;
    if (itemDate) return matchedByDate;

    return false;
}

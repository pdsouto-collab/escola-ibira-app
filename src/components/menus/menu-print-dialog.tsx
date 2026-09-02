"use client";

import { useState } from "react";
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, eachWeekOfInterval, isSameMonth, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Menu } from "@/types/menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download, Calendar, FileText, ChevronLeft, ChevronRight, Check, CheckCircle2, Info, Sprout, Cake } from "lucide-react";
import { SchoolLogo } from "@/components/ui/school-logo";

export interface MenuGuidelinesData {
    intro: string;
    points: string[];
    glutenNote: string;
    farmNote: string;
    birthdayNote?: string;
    footerNote: string;
}

export const DEFAULT_GUIDELINES: MenuGuidelinesData = {
    intro: "Por meio de nosso cardápio, mantemos o compromisso de uma alimentação equilibrada e variada, respeitando as preferências das crianças e incluindo mais nutrientes às preparações.",
    points: [
        "Não utilizamos açúcar e derivados de leite em nossas preparações;",
        "Temos dois dias sem carne, sempre objetivando ampliar a experiência alimentar das crianças;",
        "Nossas preparações são assadas, grelhadas ou cozidas;",
        "Priorizamos ingredientes da época;"
    ],
    glutenNote: "Obs: o glúten será utilizado pontualmente na preparação dos pães pelas crianças.",
    farmNote: "Os itens marcados com o símbolo (•) são cultivados na escola.",
    birthdayNote: "No dia da comemoração do aniversariante, oferecemos um bolo sem glúten e açúcar, preparado em nossa cozinha.",
    footerNote: "O cardápio está sujeito a alterações devido à disponibilidade e perecibilidade dos alimentos, sempre mantendo a qualidade nutricional."
};

interface MenuPrintDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    menus: Menu[];
    initialDate?: Date;
    guidelines?: MenuGuidelinesData;
}

export function MenuPrintDialog({
    open,
    onOpenChange,
    menus,
    initialDate = new Date(),
    guidelines = DEFAULT_GUIDELINES
}: MenuPrintDialogProps) {
    const [viewMode, setViewMode] = useState<"week" | "undated" | "month">("undated");
    const [selectedDate, setSelectedDate] = useState<Date>(initialDate);

    const handlePrint = () => {
        window.print();
    };

    const getMenuForDate = (date: Date) => {
        const dateStr = format(date, "yyyy-MM-dd");
        return menus.find(m => m.date === dateStr);
    };

    // Calculate Week Days (Monday to Friday)
    const currentWeekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 5 }).map((_, i) => addDays(currentWeekStart, i));

    // Fallback search for a day of week within the month if the current week doesn't have it
    const getMenuForWeekdayInMonth = (dayIndex: number) => {
        // First try the selected week
        const weekMenu = getMenuForDate(weekDays[dayIndex]);
        if (weekMenu && weekMenu.items && weekMenu.items.some(it => it.title || it.description)) {
            return weekMenu;
        }
        // Fallback: search any date in the same month with this weekday (1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex)
        const targetDayOfWeek = dayIndex + 1; // 1 for Monday, 5 for Friday
        const monthStart = startOfMonth(selectedDate);
        const monthEnd = endOfMonth(selectedDate);
        const match = menus.find(m => {
            try {
                const parsed = parseISO(m.date);
                if (isSameMonth(parsed, selectedDate) && parsed.getDay() === targetDayOfWeek) {
                    return m.items && m.items.some(it => it.title || it.description);
                }
            } catch {
                return false;
            }
            return false;
        });
        return match || weekMenu;
    };

    // Calculate Weeks for the Selected Month
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const monthWeeksStarts = eachWeekOfInterval(
        { start: monthStart, end: monthEnd },
        { weekStartsOn: 1 }
    );

    const monthWeeks = monthWeeksStarts.map(wStart => {
        return Array.from({ length: 5 }).map((_, i) => addDays(wStart, i));
    });

    const navigate = (direction: "prev" | "next") => {
        if (viewMode === "week") {
            setSelectedDate(prev => addDays(prev, direction === "next" ? 7 : -7));
        } else {
            const nextMonth = new Date(selectedDate);
            nextMonth.setMonth(nextMonth.getMonth() + (direction === "next" ? 1 : -1));
            setSelectedDate(nextMonth);
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-5xl max-h-[92vh] flex flex-col p-0 overflow-hidden bg-slate-100">
                    <DialogHeader className="p-4 bg-white border-b flex flex-row items-center justify-between no-print">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                                <Printer className="h-5 w-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-bold text-slate-800">
                                    Visualizar e Imprimir Cardápio (A4)
                                </DialogTitle>
                                <p className="text-xs text-slate-500">
                                    Enquadrado para impressão em papel A4 e exportação em PDF com logotipo da Trilha Ibirá.
                                </p>
                            </div>
                        </div>

                        {/* Mode Selector & Controls */}
                        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setViewMode("undated")}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${viewMode === "undated" ? "bg-white text-emerald-700 shadow-sm font-bold" : "text-slate-600 hover:text-slate-900"}`}
                                    title="Cardápio semanal recorrente sem data específica, identificando o mês"
                                >
                                    Semanal Padrão (Sem Datas)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode("week")}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${viewMode === "week" ? "bg-white text-emerald-700 shadow-sm font-bold" : "text-slate-600 hover:text-slate-900"}`}
                                    title="Semana com datas específicas"
                                >
                                    Semana com Datas
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode("month")}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${viewMode === "month" ? "bg-white text-emerald-700 shadow-sm font-bold" : "text-slate-600 hover:text-slate-900"}`}
                                    title="Todas as semanas do mês"
                                >
                                    Mês Inteiro
                                </button>
                            </div>

                            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1">
                                <button type="button" onClick={() => navigate("prev")} className="p-1 hover:bg-slate-100 rounded text-slate-600">
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <span className="text-xs font-bold text-slate-700 min-w-[120px] text-center capitalize">
                                    {viewMode === "week"
                                        ? `${format(currentWeekStart, "dd/MM")} a ${format(addDays(currentWeekStart, 4), "dd/MM/yyyy")}`
                                        : format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR })}
                                </span>
                                <button type="button" onClick={() => navigate("next")} className="p-1 hover:bg-slate-100 rounded text-slate-600">
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </DialogHeader>

                    {/* Scrollable Printable Document Container */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex justify-center">
                        <div id="printable-cardapio" className="w-full max-w-[1000px] space-y-8">
                            {viewMode === "undated" ? (
                                <PrintableWeekPage
                                    weekDays={weekDays}
                                    getMenuForDate={(_, index) => getMenuForWeekdayInMonth(index ?? 0)}
                                    guidelines={guidelines}
                                    weekStart={currentWeekStart}
                                    isUndated={true}
                                    undatedMonthName={format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR })}
                                />
                            ) : viewMode === "week" ? (
                                <PrintableWeekPage
                                    weekDays={weekDays}
                                    getMenuForDate={getMenuForDate}
                                    guidelines={guidelines}
                                    weekStart={currentWeekStart}
                                    isUndated={false}
                                />
                            ) : (
                                monthWeeks.map((mWeekDays, idx) => (
                                    <div key={idx} className="print-page-break mb-8">
                                        <PrintableWeekPage
                                            weekDays={mWeekDays}
                                            getMenuForDate={getMenuForDate}
                                            guidelines={idx === monthWeeks.length - 1 ? guidelines : { ...guidelines, intro: "" }}
                                            weekStart={mWeekDays[0]}
                                            monthContext={format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR })}
                                            weekNumber={idx + 1}
                                            isUndated={false}
                                        />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <DialogFooter className="p-4 bg-white border-t flex flex-row items-center justify-between no-print">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Fechar
                        </Button>
                        <div className="flex gap-2">
                            <Button onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2">
                                <Printer className="h-4 w-4" />
                                Imprimir / Salvar PDF (A4)
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Print specific CSS rules */}
            <style jsx global>{`
                @media print {
                    @page {
                        size: A4 landscape;
                        margin: 6mm;
                    }
                    html, body {
                        background: #ffffff !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }
                    
                    /* Esconder todos os elementos por padrão */
                    body * {
                        visibility: hidden !important;
                    }
                    
                    /* Tornar apenas o cardápio e seus filhos visíveis */
                    #printable-cardapio, #printable-cardapio * {
                        visibility: visible !important;
                    }
                    
                    /* Reposicionar o cardápio no topo da página impressa */
                    #printable-cardapio {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        display: block !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        box-shadow: none !important;
                    }
                    
                    /* Reset all scroll containers and fixed overlays for print so they don't clip */
                    [role="dialog"], [data-radix-portal], [data-radix-dialog-content], div, main, section {
                        position: static !important;
                        overflow: visible !important;
                        max-height: none !important;
                        height: auto !important;
                        transform: none !important;
                        border: none !important;
                        box-shadow: none !important;
                        background: transparent !important;
                    }
                    ::-webkit-scrollbar {
                        display: none !important;
                    }
                    #printable-cardapio {
                        display: block !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        margin: 0 auto !important;
                        padding: 0 !important;
                        box-shadow: none !important;
                    }
                    .print-page-break {
                        page-break-after: always !important;
                        break-after: page !important;
                    }
                    .a4-print-sheet {
                        box-shadow: none !important;
                        border: 1.5px solid #10b981 !important;
                        border-radius: 12px !important;
                        padding: 14px !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        margin: 0 0 16px 0 !important;
                        page-break-inside: avoid !important;
                        background: #ffffff !important;
                    }
                }
            `}</style>
        </>
    );
}

function PrintableWeekPage({
    weekDays,
    getMenuForDate,
    guidelines,
    weekStart,
    monthContext,
    weekNumber,
    isUndated = false,
    undatedMonthName
}: {
    weekDays: Date[];
    getMenuForDate: (date: Date, index?: number) => Menu | undefined;
    guidelines: MenuGuidelinesData;
    weekStart: Date;
    monthContext?: string;
    weekNumber?: number;
    isUndated?: boolean;
    undatedMonthName?: string;
}) {
    const mealTitles = ["Lanche da Manhã", "Almoço", "Lanche da Tarde"];

    const monthDisplay = undatedMonthName || format(weekStart, "MMMM 'de' yyyy", { locale: ptBR });

    return (
        <div className="a4-print-sheet bg-white rounded-xl border border-slate-300 shadow-md p-6 text-slate-900 flex flex-col justify-between">
            {/* Header with Logo */}
            <div className="border-b-2 border-emerald-600 pb-3 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <SchoolLogo className="h-12 w-auto" />
                    <div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            ESCOLA IBIRÁ
                            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase">
                                Nutrição Escolar
                            </span>
                        </h1>
                        <p className="text-xs text-slate-600 font-medium capitalize">
                            Cardápio Semanal • {isUndated ? `Padrão do Mês de ${monthDisplay}` : (monthContext ? `${monthContext} (Semana ${weekNumber})` : "Alimentação Saudável e Consciente")}
                        </p>
                    </div>
                </div>

                <div className="text-right">
                    <span className="text-[11px] font-bold text-slate-400 block uppercase">
                        {isUndated ? "Mês de Referência" : "Período"}
                    </span>
                    <span className="text-sm font-extrabold text-emerald-800 uppercase">
                        {isUndated ? monthDisplay : `${format(weekDays[0], "dd/MM")} a ${format(weekDays[4], "dd/MM/yyyy")}`}
                    </span>
                </div>
            </div>

            {/* Main Menu Grid / Table (5 Days: Seg a Sex) */}
            <div className="grid grid-cols-5 gap-2.5 mb-4">
                {weekDays.map((day, idx) => {
                    const menu = getMenuForDate(day, idx);
                    const isMonFri = format(day, "EEEE", { locale: ptBR });

                    return (
                        <div key={idx} className="border border-slate-200 rounded-lg overflow-hidden bg-white flex flex-col">
                            {/* Day Header */}
                            <div className={`bg-emerald-50 border-b border-emerald-100 px-2 text-center flex flex-col items-center justify-center ${isUndated ? "py-2.5" : "py-1.5"}`}>
                                <span className="text-[11px] font-extrabold text-emerald-900 uppercase block truncate">
                                    {isMonFri}
                                </span>
                                {!isUndated && (
                                    <span className="text-xs font-bold text-emerald-700">
                                        {format(day, "dd/MM")}
                                    </span>
                                )}
                            </div>

                            {/* Meals list */}
                            <div className="p-2 space-y-2.5 flex-1 flex flex-col justify-between text-xs bg-slate-50/40">
                                {mealTitles.map((mealType, mIdx) => {
                                    const item = menu?.items?.find(it => it.title.toLowerCase().includes(mealType.toLowerCase()) || mealType.toLowerCase().includes(it.title.toLowerCase()))
                                        || (menu?.items && menu.items[mIdx]);

                                    return (
                                        <div key={mIdx} className="bg-white p-2 rounded border border-slate-100 shadow-2xs">
                                            <div className="flex items-center justify-between mb-1 pb-0.5 border-b border-slate-100">
                                                <span className="font-extrabold text-[10px] text-emerald-800 uppercase tracking-tight">
                                                    {mealType}
                                                </span>
                                                {item?.time && (
                                                    <span className="text-[9px] font-semibold text-slate-400">
                                                        {item.time}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[10.5px] text-slate-700 leading-snug whitespace-pre-line break-words min-h-[28px]">
                                                {item?.description?.trim() || <span className="text-slate-300 italic">Preparações do dia</span>}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Descriptive Guidelines Footer - Formatação idêntica à visualização */}
            <div className="bg-linear-to-br from-emerald-50/40 via-white to-amber-50/20 border border-emerald-100 rounded-xl p-3 text-slate-800 space-y-2.5 text-[10.5px]">
                {guidelines.intro && (
                    <div className="bg-white/90 border border-emerald-100/80 rounded-lg p-2.5 text-slate-700 font-medium leading-relaxed whitespace-pre-line break-words">
                        {guidelines.intro}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {/* Left: Pilares de Preparo com ícone e bullets estilizados */}
                    <div className="bg-white/80 border border-emerald-100/70 rounded-lg p-2.5 space-y-1.5 flex flex-col justify-start">
                        <h4 className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            Pilares de Preparo
                        </h4>
                        <ul className="space-y-1 text-[10px] text-slate-700">
                            {guidelines.points.map((point, index) => (
                                <li key={index} className="flex items-start gap-1.5">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
                                    <span className="whitespace-pre-line break-words">{point}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Right: Retângulos Coloridos idênticos à visualização */}
                    <div className="space-y-2 flex flex-col justify-between">
                        <div className="space-y-1.5 text-[10px]">
                            {guidelines.glutenNote && (
                                <div className="flex items-start gap-2 bg-amber-50/90 border border-amber-200/70 rounded-lg p-2 text-amber-900">
                                    <Info className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                                    <span className="whitespace-pre-line break-words leading-tight">{guidelines.glutenNote}</span>
                                </div>
                            )}

                            {guidelines.farmNote && (
                                <div className="flex items-start gap-2 bg-emerald-50/90 border border-emerald-200/70 rounded-lg p-2 text-emerald-900">
                                    <Sprout className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                    <span className="whitespace-pre-line break-words leading-tight">{guidelines.farmNote}</span>
                                </div>
                            )}

                            {guidelines.birthdayNote && (
                                <div className="flex items-start gap-2 bg-rose-50/90 border border-rose-200/80 rounded-lg p-2 text-rose-900">
                                    <Cake className="h-3.5 w-3.5 text-rose-600 shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <span className="font-bold text-rose-900 block text-[9.5px] uppercase mb-0.5">Aniversariantes do Mês</span>
                                        <span className="whitespace-pre-line break-words text-rose-800 text-[10px] leading-tight">{guidelines.birthdayNote}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {guidelines.footerNote && (
                            <p className="text-[9.5px] italic text-slate-500 border-t border-slate-100 pt-1.5 whitespace-pre-line break-words">
                                {guidelines.footerNote}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

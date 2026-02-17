import { useAppStore } from "@/lib/store";
import { CalendarDays } from "lucide-react";

export function WeeklyView() {
    const { schedule } = useAppStore();

    // Mocking week days for the view (static for now, but could be dynamic)
    const weekDays = [
        { name: "Segunda", date: "15", active: true },
        { name: "Terça", date: "16", active: false },
        { name: "Quarta", date: "17", active: false },
        { name: "Quinta", date: "18", active: false },
    ];

    const getTypeStyles = (type: string) => {
        switch (type) {
            case "activity": return "bg-white border text-slate-800";
            case "meal": return "bg-emerald-100 text-emerald-800";
            case "care": return "bg-slate-100 text-slate-600";
            default: return "bg-white border text-slate-800";
        }
    };

    return (
        <section>
            <div className="flex items-center gap-2 mb-6">
                <CalendarDays className="w-5 h-5 text-slate-600" />
                <h2 className="text-xl font-bold text-slate-800">Rotina Diária (Modelo)</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Headers - Just showing one column mostly for mobile, but keeping grid for structure */}
                {weekDays.map((day) => (
                    <div key={day.date} className={`text-center mb-4 ${day.active ? 'block' : 'hidden md:block'}`}>
                        <div className="text-sm text-slate-500 uppercase font-medium">{day.name}</div>
                        <div className={`text-2xl font-bold mt-1 inline-flex items-center justify-center w-10 h-10 rounded-full ${day.active ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-700'}`}>
                            {day.date}
                        </div>
                    </div>
                ))}

                {/* Columns - Repeating the schedule for demonstration since we only have one daily schedule model */}
                {weekDays.map((day) => (
                    <div key={`col-${day.date}`} className={`space-y-4 ${day.active ? 'block' : 'hidden md:block opacity-60 grayscale'}`}>
                        {schedule.map((item, idx) => (
                            <div
                                key={idx}
                                className={`p-4 rounded-xl text-sm ${getTypeStyles(item.type)} shadow-sm transition-transform hover:scale-[1.02]`}
                            >
                                <div className="font-bold mb-1 line-clamp-2 leading-tight">
                                    {item.title}
                                </div>
                                <div className="text-xs opacity-70 font-mono">
                                    {item.time}
                                </div>
                                {item.description && (
                                    <div className="text-xs mt-2 opacity-80 border-t pt-2 border-current/10">
                                        {item.description}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </section>
    );
}

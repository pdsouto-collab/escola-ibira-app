import { DailySchedule } from "@/components/agenda/daily-schedule";
import { mockSchedule } from "@/lib/data";

export default function AgendaPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-slate-800">Agenda Digital</h1>
                <p className="text-slate-500">Acompanhe a rotina diária e atividades.</p>
            </div>

            <div className="bg-white rounded-xl border p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-800">Rotina de Hoje</h2>
                    <span className="text-sm text-slate-500 capitalize">
                        {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                </div>

                <DailySchedule items={mockSchedule} />
            </div>
        </div>
    );
}

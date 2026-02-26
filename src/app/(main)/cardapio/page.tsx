import { MenuWeekView } from "@/components/menus/menu-week-view";

export default function CardapioPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-800">Cardápio da Semana</h1>
                <p className="text-slate-500">Acompanhe e configure as refeições servidas aos alunos.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border p-6">
                <MenuWeekView />
            </div>
        </div>
    );
}

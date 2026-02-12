import { Bell } from "lucide-react";

export function Header() {
    return (
        <header className="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
            <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-slate-800">Bem-vindo, Professor</h2>
            </div>
            <div className="flex items-center gap-4">
                <button className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 transition-colors">
                    <Bell className="h-5 w-5" />
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                </button>
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    JD
                </div>
            </div>
        </header>
    );
}

import { BNCCSelector } from "@/components/bncc/bncc-selector";
import { Sidebar } from "@/components/layout/sidebar";

export default function BNCCPage() {
    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar />
            <main className="flex-1 p-8 overflow-y-auto">
                <BNCCSelector />
            </main>
        </div>
    );
}

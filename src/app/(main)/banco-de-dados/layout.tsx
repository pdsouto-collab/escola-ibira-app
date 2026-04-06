import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function DatabaseLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);

    // Server-side guard: Only allow "admin" to access any route under /banco-de-dados
    if (!session || (session.user as any).role !== "admin") {
        redirect("/");
    }

    return <>{children}</>;
}

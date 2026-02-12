
import { notFound } from "next/navigation";
import { mockStudents, getStudentCurriculum, Student } from "@/lib/data";
import { MosaicGrid } from "@/components/mosaic/mosaic-grid";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface StudentProfilePageProps {
    params: Promise<{ id: string }>;
}

export default async function StudentProfilePage({ params }: StudentProfilePageProps) {
    // Await params in Next.js 15+
    const { id } = await params;
    const student = mockStudents.find(s => s.id === id);

    if (!student) {
        notFound();
    }

    const studentCurriculum = getStudentCurriculum(id);

    return (
        <div className="space-y-6">
            <Link
                href="/alunos"
                className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para lista
            </Link>

            <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Student Header Info */}
                <div className="flex items-center gap-6 bg-white p-6 rounded-xl border shadow-sm w-full md:w-auto">
                    <Avatar className="h-20 w-20 border-4 border-slate-50">
                        <AvatarImage src={student.photo} alt={student.name} />
                        <AvatarFallback className="text-xl bg-primary/10 text-primary font-bold">
                            {student.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                        </AvatarFallback>
                    </Avatar>

                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold text-slate-800">{student.name}</h1>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Badge variant="secondary" className="font-normal">
                                {student.class}
                            </Badge>
                            <span>| {student.age} anos</span>
                        </div>
                        <p className="text-xs text-slate-400">Responsável: {student.parentName}</p>
                    </div>
                </div>

                {/* Quick Stats (Mock) */}
                <div className="grid grid-cols-2 gap-4 flex-1 w-full">
                    <Card className="h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Presença</CardTitle>
                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">92%</div>
                            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
                        </CardContent>
                    </Card>
                    <Card className="h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Relatórios</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">3</div>
                            <p className="text-xs text-muted-foreground">Disponíveis</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Tabs defaultValue="mosaico" className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                    <TabsTrigger value="mosaico">Mosaico</TabsTrigger>
                    <TabsTrigger value="diario" disabled>Diário</TabsTrigger>
                    <TabsTrigger value="dados" disabled>Dados</TabsTrigger>
                </TabsList>

                <TabsContent value="mosaico" className="mt-6">
                    <div className="bg-white p-6 rounded-xl border shadow-sm">
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-slate-800">Desenvolvimento Individual</h2>
                            <p className="text-sm text-slate-500">Progressão nas competências e habilidades.</p>
                        </div>
                        <MosaicGrid themes={studentCurriculum} />
                    </div>
                </TabsContent>

                <TabsContent value="diario">
                    <div className="py-10 text-center text-slate-500">
                        Funcionalidade em desenvolvimento.
                    </div>
                </TabsContent>

                <TabsContent value="dados">
                    <div className="py-10 text-center text-slate-500">
                        Funcionalidade em desenvolvimento.
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

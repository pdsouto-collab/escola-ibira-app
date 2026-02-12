"use client";

import { Student } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import Link from "next/link";

interface StudentCardProps {
    student: Student;
}

export function StudentCard({ student }: StudentCardProps) {
    return (
        <Link href={`/alunos/${student.id}`}>
            <Card className="overflow-hidden transition-all hover:shadow-md cursor-pointer hover:border-primary/50">
                <CardContent className="p-0">
                    <div className="flex items-center gap-4 p-4">
                        <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                            <AvatarImage src={student.photo} alt={student.name} />
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                {student.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900 truncate">{student.name}</h3>
                            <p className="text-sm text-slate-500 truncate">{student.class}</p>
                        </div>

                        <div className={cn(
                            "h-2.5 w-2.5 rounded-full ring-2 ring-white",
                            student.status === "presente" ? "bg-green-500" : "bg-slate-300"
                        )} title={student.status === "presente" ? "Presente" : "Ausente"} />
                    </div>

                    <div className="bg-slate-50 px-4 py-3 border-t flex items-center justify-between">
                        <div className="text-xs text-slate-500">
                            <span className="font-medium text-slate-700">Responsável:</span> {student.parentName.split(' ')[0]}
                        </div>
                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal">
                            {student.age} anos
                        </Badge>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}

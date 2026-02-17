"use client";

import { Student } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import Link from "next/link";

import { MoreVertical, Pencil, Trash } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface StudentCardProps {
    student: Student;
    onEdit?: (student: Student) => void;
    onDelete?: (student: Student) => void;
}

export function StudentCard({ student, onEdit, onDelete }: StudentCardProps) {
    return (
        <div className="relative group">
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

            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/50 hover:bg-white rounded-full">
                            <MoreVertical className="h-4 w-4 text-slate-500" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.(student); }}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete?.(student); }} className="text-red-600 focus:text-red-600">
                            <Trash className="mr-2 h-4 w-4" />
                            Excluir
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}

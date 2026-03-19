"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Wallet,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    Clock,
    Search,
    Filter,
    Download,
    CreditCard,
    ArrowUpRight,
    QrCode,
    FileText,
    MoreHorizontal
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export default function FinanceiroPage() {
    const { invoices, students } = useAppStore();
    const [searchTerm, setSearchTerm] = useState("");

    const totalPaid = invoices.filter(i => i.status === "pago").reduce((acc, curr) => acc + curr.amount, 0);
    const totalPending = invoices.filter(i => i.status === "pendente").reduce((acc, curr) => acc + curr.amount, 0);
    const totalOverdue = invoices.filter(i => i.status === "atrasado").reduce((acc, curr) => acc + curr.amount, 0);

    const filteredInvoices = invoices.filter(inv => {
        const student = students.find(s => s.id === inv.studentId);
        return (
            student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    return (
        <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Financeiro</h1>
                    <p className="text-slate-500">Gestão de mensalidades e cobranças via Itaú API</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="bg-white">
                        <Download className="mr-2 h-4 w-4" />
                        Exportar Relatório
                    </Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                        <CreditCard className="mr-2 h-4 w-4" />
                        Gerar Cobrança Individual
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-sm bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium opacity-80 uppercase tracking-wider flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            Total Recebido
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">R$ {totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                        <p className="text-xs opacity-70 mt-1 font-medium flex items-center">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            +12% em relação ao mês anterior
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white border-l-4 border-l-amber-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <Clock className="h-4 w-4 text-amber-500" />
                            Pendente / Em Aberto
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">R$ {totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                        <p className="text-xs text-slate-500 mt-1 font-medium">Faturas com vencimento este mês</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white border-l-4 border-l-red-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            Inadimplência
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">R$ {totalOverdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                        <p className="text-xs text-slate-500 mt-1 font-medium italic">Ações de cobrança automática ativas</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Buscar por aluno ou descrição..."
                        className="pl-10 bg-white border-slate-200"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="bg-white">
                    <Filter className="mr-2 h-4 w-4" />
                    Filtros Avançados
                </Button>
            </div>

            {/* Invoices Table */}
            <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-white border-b border-slate-100">
                    <CardTitle className="text-lg">Faturas / Boletos (Itaú API)</CardTitle>
                    <CardDescription>Acompanhe o status dos registros e pagamentos em tempo real</CardDescription>
                </CardHeader>
                <CardContent className="p-0 bg-white">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow>
                                <TableHead className="font-bold">Aluno</TableHead>
                                <TableHead className="font-bold">Vencimento</TableHead>
                                <TableHead className="font-bold">Descrição</TableHead>
                                <TableHead className="font-bold text-right">Valor</TableHead>
                                <TableHead className="font-bold text-center">Status</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredInvoices.map((inv) => {
                                const student = students.find(s => s.id === inv.studentId);
                                return (
                                    <TableRow key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="font-medium text-slate-900">
                                            {student?.name || "Aluno não encontrado"}
                                        </TableCell>
                                        <TableCell className="text-slate-600">
                                            {new Date(inv.dueDate + "T12:00:00").toLocaleDateString('pt-BR')}
                                        </TableCell>
                                        <TableCell className="text-slate-600 max-w-[200px] truncate">
                                            {inv.description}
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-slate-900">
                                            R$ {inv.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge
                                                className={
                                                    inv.status === "pago" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-2.5 py-0.5" :
                                                        inv.status === "pendente" ? "bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-2.5 py-0.5" :
                                                            "bg-red-100 text-red-700 hover:bg-red-100 border-none px-2.5 py-0.5"
                                                }
                                            >
                                                {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-56">
                                                    <DropdownMenuLabel>Ações de Fatura</DropdownMenuLabel>
                                                    <DropdownMenuItem className="cursor-pointer">
                                                        <FileText className="mr-2 h-4 w-4" /> Ver PDF do Boleto
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="cursor-pointer">
                                                        <QrCode className="mr-2 h-4 w-4" /> Copiar PIX / Linha
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-indigo-600 focus:text-indigo-600 focus:bg-indigo-50 cursor-pointer"
                                                        onClick={() => toast.info(`Sincronizando fatura ${inv.id} com Itaú API...`)}
                                                    >
                                                        <TrendingUp className="mr-2 h-4 w-4" /> Sincronizar com Itaú
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-red-500 focus:text-red-500 focus:bg-red-50 cursor-pointer">
                                                        Cancelar Fatura
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                    {filteredInvoices.length === 0 && (
                        <div className="py-20 text-center text-slate-500">
                            Nenhuma fatura encontrada com os filtros atuais.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Database, Play, Terminal, Code2 } from "lucide-react";
import { toast } from "sonner";
import { executeDatabaseCommand } from "@/services/system.service";

export default function DatabasePage() {
    const [migrationName, setMigrationName] = useState("");
    const [isExecuting, setIsExecuting] = useState(false);
    const [terminalOutput, setTerminalOutput] = useState<string>("Bem-vindo ao terminal Prisma da Escola Ibirá.\n\nNenhum comando executado recentemente.");

    const [isMounted, setIsMounted] = useState(false);
    const [isLocalhost, setIsLocalhost] = useState(false);

    useEffect(() => {
        setIsLocalhost(typeof window !== 'undefined' && window.location.href.includes('localhost'));
        setIsMounted(true);
    }, []);

    const runCommand = async (type: 'migrate-dev' | 'seed') => {
        if (type === 'migrate-dev' && !migrationName.trim()) {
            toast.error("Por favor, informe o nome da migração.");
            return;
        }

        setIsExecuting(true);
        const toastId = toast.loading(`Executando comando ${type}...`);

        let cmdDisplay = `npx prisma ${type}`;
        if (type === 'migrate-dev') cmdDisplay += ` --name "${migrationName}"`;

        setTerminalOutput(prev => prev + `\n\n$ ${cmdDisplay}\nCarregando...`);

        try {
            const result = await executeDatabaseCommand(type, { migrationName });
            toast.success("Comando executado com sucesso!", { id: toastId });
            setTerminalOutput(prev => prev.replace('Carregando...', result.output));
            if (type === 'migrate-dev') setMigrationName("");
        } catch (error: any) {
            toast.error("Erro ao executar comando. Verifique o terminal.", { id: toastId });
            setTerminalOutput(prev => prev.replace('Carregando...', `\n[ERRO]\n${error.message}`));
        } finally {
            setIsExecuting(false);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-3">
                <Database className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold text-slate-800">Banco de Dados</h1>
            </div>

            <p className="text-slate-500">
                Execute comandos essenciais de banco de dados diretamente pelo painel. Mantenha os modelos sincronizados com o banco de dados.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    {isMounted && isLocalhost && (
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                            <div className="flex items-center gap-2 text-indigo-600 font-semibold text-lg">
                                <Code2 className="h-5 w-5" />
                                Migrate Dev
                            </div>
                            <p className="text-sm text-slate-500">
                                Cria uma nova migração do banco de dados de desenvolvimento.
                            </p>
                            <div className="flex gap-2 pt-2">
                                <Input
                                    placeholder="Nome (ex: Adicionando tabela de Turmas)"
                                    value={migrationName}
                                    onChange={(e) => setMigrationName(e.target.value)}
                                    disabled={isExecuting}
                                />
                                <Button onClick={() => runCommand('migrate-dev')} disabled={isExecuting} className="bg-indigo-600 hover:bg-indigo-700">
                                    <Play className="h-4 w-4 mr-2" /> Executar
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                        <div className="flex items-center gap-2 text-orange-600 font-semibold text-lg">
                            <Database className="h-5 w-5" />
                            Resetar Dados (Seed)
                        </div>
                        <p className="text-sm text-slate-500">
                            Apaga todos os dados e popula o banco com dados de teste iniciais. Recomendado apenas para ambientes seguros.
                        </p>
                        <div className="pt-2">
                            <Button onClick={() => runCommand('seed')} disabled={isExecuting} className="w-full bg-orange-600 hover:bg-orange-700">
                                <Play className="h-4 w-4 mr-2" /> Executar Seed
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Terminal Window */}
                <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[500px]">
                    <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center gap-2">
                        <Terminal className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-mono text-slate-400">Terminal Output</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        <pre className="text-emerald-400 font-mono text-[13px] whitespace-pre-wrap break-words">
                            {terminalOutput}
                        </pre>
                    </div>
                </div>

            </div>
        </div>
    );
}

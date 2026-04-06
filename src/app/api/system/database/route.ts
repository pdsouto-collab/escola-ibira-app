import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const execAsync = promisify(exec);

export async function POST(req: Request) {
    try {
        // Security session validation
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ success: false, error: "Não autorizado - É necessário ter privilégios de administrador." }, { status: 403 });
        }

        const body = await req.json();
        const { commandType, migrationName } = body;

        const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || req.url || '';
        const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1') || process.env.NODE_ENV === 'development';

        console.log("Validador Localhost:", { host, isLocalhost, env: process.env.NODE_ENV });

        if (commandType === 'migrate-dev' && !isLocalhost) {
            return NextResponse.json({ success: false, error: "Operação inválida: Migrate Dev só pode ser executado localmente (localhost)." }, { status: 403 });
        }
        if (commandType === 'migrate-deploy' && (isLocalhost || process.env.NEXT_PUBLIC_APP_ENV === 'development')) {
            return NextResponse.json({ success: false, error: "Operação inválida: Deploy não pode ser executado no ambiente de desenvolvimento." }, { status: 403 });
        }

        let finalOutput = '';

        if (commandType === 'migrate-dev') {
            let nameParam = '';
            if (migrationName) {
                const safeName = migrationName
                    .trim()
                    .toLowerCase()
                    .normalize('NFD').replace(/[\u0300-\u036f]/g, "") // Remove acentos
                    .replace(/[\s\-]+/g, '_') // Substitui espaços e hífens por underscore
                    .replace(/[^a-z0-9_]/g, '') // Remove caracteres especiais
                    .replace(/_+/g, '_'); // Evita underscores duplicados
                nameParam = `--name "${safeName}"`;
            }

            const migrateCmd = `npx prisma migrate dev ${nameParam}`;
            const { stdout } = await execAsync(migrateCmd);

            if (stdout.includes('Already in sync')) {
                finalOutput = "O banco de dados já está sincronizado localmente! Nenhuma nova alteração de tabelas detectada.";
            } else {
                await execAsync('npx prisma generate');
                finalOutput = "Migração executada com sucesso! Tabelas atualizadas localmente e Prisma Client regenerado para os tipos do código.";
            }

        } else if (commandType === 'migrate-deploy') {
            const cmd = `npx prisma migrate deploy`;
            const { stdout } = await execAsync(cmd);

            if (stdout.includes('No pending migrations to apply') || stdout.includes('Already in sync')) {
                finalOutput = "O banco de dados oficial já está na versão original. Nenhuma migração pendente precisou ser executada.";
            } else {
                finalOutput = "Deploy executado! Todas as migrações oficiais pendentes foram aplicadas com sucesso no banco principal.";
            }
        } else {
            return NextResponse.json({ success: false, error: 'Comando inválido' }, { status: 400 });
        }

        return NextResponse.json({ success: true, output: finalOutput });

    } catch (error: any) {
        console.error('Database command error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || String(error),
            output: error.stdout ? error.stdout + '\n' + error.stderr : undefined
        }, { status: 500 });
    }
}

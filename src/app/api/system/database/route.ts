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

        const isDev = process.env.NEXT_PUBLIC_APP_ENV === 'development';

        if (commandType === 'migrate-dev' && !isDev) {
            return NextResponse.json({ success: false, error: "Operação inválida: Migrate Dev só pode ser executado em ambiente de desenvolvimento." }, { status: 403 });
        }
        if (commandType === 'migrate-deploy' && isDev) {
            return NextResponse.json({ success: false, error: "Operação inválida: Deploy só pode ser executado em Homologação ou Produção." }, { status: 403 });
        }

        let cmd = '';

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
            cmd = `npx prisma migrate dev ${nameParam} && npx prisma generate`;
        } else if (commandType === 'migrate-deploy') {
            cmd = `npx prisma migrate deploy && npx prisma generate`;
        } else {
            return NextResponse.json({ success: false, error: 'Comando inválido' }, { status: 400 });
        }

        const { stdout, stderr } = await execAsync(cmd);

        const output = stdout + (stderr ? '\n[STDERR]\n' + stderr : '');

        return NextResponse.json({ success: true, output });

    } catch (error: any) {
        console.error('Database command error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || String(error),
            output: error.stdout ? error.stdout + '\n' + error.stderr : undefined
        }, { status: 500 });
    }
}

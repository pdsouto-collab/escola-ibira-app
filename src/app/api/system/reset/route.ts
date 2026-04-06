import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST() {
    try {
        // Evitar que o processo filho pegue carona nas configurações de NodeJS do Next.js
        const customEnv = { ...process.env };
        delete customEnv.NODE_OPTIONS;

        const { stdout, stderr } = await execAsync('npm run seed', { env: customEnv });
        console.log('Seed executed:', stdout);
        if (stderr) console.error('Seed stderr:', stderr);
        return NextResponse.json({ success: true, message: 'Banco de dados resetado com sucesso' });
    } catch (error: any) {
        console.error('Seed error:', error);
        return NextResponse.json({ success: false, error: error.message || String(error) }, { status: 500 });
    }
}

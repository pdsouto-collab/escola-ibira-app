import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    await prisma.projectType.createMany({
        data: [
            { id: 'projeto', name: 'Projeto' },
            { id: 'oficina', name: 'Oficina' }
        ],
        skipDuplicates: true,
    });
    console.log('Project types seeded!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

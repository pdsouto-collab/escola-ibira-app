const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkNodes() {
    const nodes = await prisma.knowledgeNode.findMany({
        where: { level: 'macro' },
        select: { name: true, period: true }
    });
    console.log(nodes);
}

checkNodes().then(() => prisma.$disconnect()).catch(console.error);

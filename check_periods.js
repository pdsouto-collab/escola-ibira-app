const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPeriods() {
    console.log("--- KnowledgeNode Periods ---");
    const nodePeriods = await prisma.knowledgeNode.groupBy({
        by: ['period'],
        _count: { period: true }
    });
    console.log(nodePeriods);

    console.log("\n--- Project Periods ---");
    const projPeriods = await prisma.project.groupBy({
        by: ['period'],
        _count: { period: true }
    });
    console.log(projPeriods);

    console.log("\n--- Assessment Periods ---");
    const assPeriods = await prisma.assessment.groupBy({
        by: ['period'],
        _count: { period: true }
    });
    console.log(assPeriods);

    console.log("\n--- Student Periods ---");
    const studentPeriods = await prisma.student.groupBy({
        by: ['period'],
        _count: { period: true }
    });
    console.log(studentPeriods);
}

checkPeriods().then(() => prisma.$disconnect()).catch(console.error);

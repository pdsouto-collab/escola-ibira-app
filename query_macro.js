const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
prisma.knowledgeNode.findMany({where:{level:'macro'}}).then(n => console.log(n)).finally(() => prisma.$disconnect());

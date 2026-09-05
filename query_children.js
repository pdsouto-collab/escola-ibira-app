const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const nodes = await prisma.knowledgeNode.findMany({
    where: { level: 'macro' },
    include: { children: true }
  });
  
  // Just print the macro nodes and if they have children
  console.log(nodes.map(n => ({
    name: n.name,
    classId: n.classId,
    period: n.period,
    childrenCount: n.children.length
  })));
}

main().finally(() => prisma.$disconnect());

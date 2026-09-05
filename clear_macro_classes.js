const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Updating all macro nodes that belong to jardim-i to have null classId (Geral)...");
  
  const result = await prisma.knowledgeNode.updateMany({
    where: { 
      level: "macro",
      classId: "jardim-i"
    },
    data: {
      classId: null
    }
  });
  
  console.log("Update result:", result);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

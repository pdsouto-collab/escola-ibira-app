const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function matchesPeriod(itemPeriod, itemDate, semester = "all", year = "all") {
    const isSemAll = !semester || semester === "all";
    const isYearAll = !year || year === "all";
    if (isSemAll && isYearAll) return true;
    let periodMatchesSemester = isSemAll;
    let periodMatchesYear = isYearAll;
    if (itemPeriod && typeof itemPeriod === "string") {
        const lower = itemPeriod.toLowerCase();
        if (!isSemAll) {
            if (semester.includes("1") && (lower.includes("1º") || lower.includes("1o") || lower.includes("primeiro"))) {
                periodMatchesSemester = true;
            } else if (semester.includes("2") && (lower.includes("2º") || lower.includes("2o") || lower.includes("segundo"))) {
                periodMatchesSemester = true;
            }
        }
        if (!isYearAll) {
            if (itemPeriod.includes(year)) {
                periodMatchesYear = true;
            }
        }
    }
    return Boolean(itemPeriod) && periodMatchesSemester && periodMatchesYear;
}

async function main() {
  const currentData = await prisma.knowledgeNode.findMany({
    where: { level: 'macro', type: 'content' }
  });
  
  console.log("Total content macros:", currentData.length);
  
  const selectedClassId = "cl_diamantes2_id"; // Fake ID for Diamantes 2
  const selectedStudentId = "all";
  const selectedSemester = "all";
  const selectedYear = "all";

  const filteredTreeData = currentData.filter(node => {
      let activeClassId = selectedClassId;
      const periodMatch = !node.period || node.period === "all" || matchesPeriod(node.period, null, selectedSemester, selectedYear);
      const classMatch = (activeClassId === "all" || !node.classId || node.classId === "all" || node.classId === activeClassId);
      
      if (!classMatch || !periodMatch) {
          console.log(`Node excluded: ${node.name} | classId: ${node.classId} | period: ${node.period} | classMatch: ${classMatch} | periodMatch: ${periodMatch}`);
      }
      
      return classMatch && periodMatch;
  });

  console.log("Filtered count:", filteredTreeData.length);
}

main().finally(() => prisma.$disconnect());

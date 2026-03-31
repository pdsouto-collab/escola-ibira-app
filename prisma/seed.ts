import { PrismaClient } from "@prisma/client"
import { bnccDataSeed } from "../src/lib/seed/bncc-data-seed"
import { competenciasGeraisDataSeed } from "../src/lib/seed/competencias-gerais-data-seed"
import { customCategoryExamplesDataSeed } from "../src/lib/seed/custom-category-examples-data-seed"
import { usersDataSeed } from "@/lib/seed/users-data-seed"
import { schoolClassesDataSeed } from "@/lib/seed/school-class-seed"
import { User } from "@/types/user"
import { SchoolClass } from "@/types/school-class"
import { Student } from "@/types/student"
import { studentsDataSeed } from "@/lib/seed/students-seed"
import { muralEventsDataSeed, muralCommentsDataSeed } from "@/lib/seed/mural-seed"
import { pegadasDataSeed, pegadasInteractionsDataSeed } from "@/lib/seed/pegadas-seed"
import { portfolioDataSeed } from "@/lib/seed/portfolio-seed"

const prisma = new PrismaClient()

async function main() {

  console.log("Limpando banco de dados...")

  // Ordem correta de exclusão: Filhos antes dos Pais
  await prisma.muralComment.deleteMany()
  await prisma.muralEvent.deleteMany()
  await prisma.portfolioEntry.deleteMany()
  await prisma.student.deleteMany()
  await prisma.schoolClass.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()
  await prisma.bncc.deleteMany()
  await prisma.pegadaInteraction.deleteMany()
  await prisma.pegadaPost.deleteMany()

  // BNCC
  console.log("Importando BNCC...")
  await prisma.bncc.createMany({
    data: bnccDataSeed as any,
    skipDuplicates: true
  })

  // Competências gerais
  console.log("Importando Competências Gerais...")
  await prisma.bncc.createMany({
    data: competenciasGeraisDataSeed.map((item) => ({
      ...item,
      code: item.code ?? ""
    })),
    skipDuplicates: false
  })

  // Custom Category Examples
  console.log("Importando Custom Category Examples...")
  await prisma.bncc.createMany({
    data: customCategoryExamplesDataSeed.map((item) => ({
      ...item,
      code: item.code ?? ""
    })),
    skipDuplicates: false
  })

  // Users
  console.log("Importando Users...")
  await prisma.user.createMany({
    data: usersDataSeed as any,
    skipDuplicates: false
  })

  // Turmas
  console.log("Importando Turmas...")
  await prisma.schoolClass.createMany({
    data: schoolClassesDataSeed as SchoolClass[],
    skipDuplicates: false
  })

  // Estudantes
  console.log("Importando Estudantes...")
  await prisma.student.createMany({
    data: studentsDataSeed as any[],
    skipDuplicates: false
  })

  // Mural Events
  console.log("Importando Eventos do Mural...")
  await prisma.muralEvent.createMany({
    data: muralEventsDataSeed,
    skipDuplicates: true
  })

  // Mural Comments
  console.log("Importando Comentários do Mural...")
  await prisma.muralComment.createMany({
    data: muralCommentsDataSeed,
    skipDuplicates: true
  })

  // Pegadas
  console.log("Importando Pegadas...")
  await prisma.pegadaPost.createMany({
    data: pegadasDataSeed as any,
    skipDuplicates: true
  })

  // Pegadas Interactions
  console.log("Importando Interações das Pegadas...")
  await prisma.pegadaInteraction.createMany({
    data: pegadasInteractionsDataSeed as any,
    skipDuplicates: true
  })

  // Portfolio
  console.log("Importando Portfolio Entries...")
  await prisma.portfolioEntry.createMany({
    data: portfolioDataSeed,
    skipDuplicates: true
  })

  console.log("Seed finalizado com sucesso!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

// npm run seed
// Ele vai inserir todos os registros do array no banco.
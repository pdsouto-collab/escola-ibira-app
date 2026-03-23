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

const prisma = new PrismaClient()

async function main() {

  // await prisma.bncc.deleteMany();
  // await prisma.user.deleteMany();
  // await prisma.schoolClass.deleteMany();
  await prisma.student.deleteMany();

  // // BNCC
  // console.log("Importando BNCC...");
  // await prisma.bncc.createMany({
  //   data: bnccDataSeed as any, // Mascarando o problema de tipagem. Evitar erro: Types of property 'code' are incompatible.
  //   skipDuplicates: true
  // })
  // console.log("BNCC importada com sucesso!")

  // // Competênias gerais
  // console.log("Importando Competências Gerais...");
  // await prisma.bncc.createMany({
  //   data: competenciasGeraisDataSeed.map((item) => ({
  //     ...item,
  //     code: item.code ?? "" // Garantir code na hora de salvar, pois não pode ser nulo
  //   })),
  //   skipDuplicates: false
  // })
  // console.log("Competências Gerais importada com sucesso!")

  // // Custom Category Examples
  // console.log("Importando Custom Category Examples...");
  // await prisma.bncc.createMany({
  //   data: customCategoryExamplesDataSeed.map((item) => ({
  //     ...item,
  //     code: item.code ?? "" // Garantir code na hora de salvar, pois não pode ser nulo
  //   })),
  //   skipDuplicates: false
  // })
  // console.log("Custom Category Examples importada com sucesso!")

  // // Users
  // console.log("Importando Users...");
  // await prisma.user.createMany({
  //   data: usersDataSeed as any,
  //   skipDuplicates: false
  // })
  // console.log("Users importados com sucesso!")

  // // Turmas
  // console.log("Importando Turmas...");
  // await prisma.schoolClass.createMany({
  //   data: schoolClassesDataSeed as SchoolClass[],
  //   skipDuplicates: false
  // })
  // console.log("Turmas importados com sucesso!")

  // Estudantes
  console.log("Importando Estudantes...");
  await prisma.student.createMany({
    data: studentsDataSeed as any[],
    skipDuplicates: false
  })
  console.log("Estudantes importados com sucesso!")

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
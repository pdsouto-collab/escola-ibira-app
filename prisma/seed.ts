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
import { projectsDataSeed } from "@/lib/seed/projects-seed"
import { scheduleDataSeed } from "../src/lib/seed/schedule-seed"
import { notificationsDataSeed } from "@/lib/seed/notifications"
import { tasksDataSeed } from "@/lib/seed/tasks.seed"
import { invoicesDataSeed } from "@/lib/seed/invoices-seed"
import { dailyLogsDataSeed } from "@/lib/seed/daily-logs-seed"
import { finalProductTypesDataSeed } from "@/lib/seed/final-product-types-seed"
import { assessmentsDataSeed, assessmentsAttachmentsDataSeed } from "../src/lib/seed/assessments-seed"
import { classBoardPostsDataSeed } from "../src/lib/seed/class-board-posts-seed"
import { classBoardPostInteractionsDataSeed } from "../src/lib/seed/class-board-post-interactions-seed"
import { menusDataSeed, menuItemsDataSeed } from "@/lib/seed/menus-seed"
import { skillsTreeDataSeed } from "../src/lib/seed/skills-tree-data-seed"
import { contentsTreeDataSeed } from "../src/lib/seed/contents-tree-data-seed"
import { mosaicSkillsDataSeed } from "../src/lib/seed/mosaic-skills-data-seed"
import { mosaicContentsDataSeed } from "../src/lib/seed/mosaic-contents-data-seed"

const prisma = new PrismaClient()

async function seedKnowledgeTree(nodes: any[], parentId: string | null = null) {
  for (const node of nodes) {
    const created = await prisma.knowledgeNode.create({
      data: {
        id: node.id,
        level: node.level,
        type: node.type,
        name: node.name,
        description: node.description,
        libraryItemId: node.libraryItemId,
        classId: node.classId,
        period: node.period,
        parentId: parentId,
      }
    });
    if (node.children && node.children.length > 0) {
      await seedKnowledgeTree(node.children, created.id);
    }
  }
}

async function seedMosaicTree(nodes: any[], parentId: string | null = null) {
  for (const node of nodes) {
    const created = await prisma.mosaicNode.create({
      data: {
        id: node.id,
        label: node.label,
        type: node.type,
        color: node.color,
        weight: node.weight,
        parentId: parentId,
      }
    });
    if (node.children && node.children.length > 0) {
      await seedMosaicTree(node.children, created.id);
    }
  }
}

export async function runSeed(): Promise<string[]> {
  const logs: string[] = [];
  const log = (msg: string) => {
    console.log(msg);
    logs.push(msg);
  };

  log("Limpando banco de dados...")

  // Ordem correta de exclusão: Filhos antes dos Pais
  await prisma.knowledgeNode.deleteMany()
  await prisma.mosaicNode.deleteMany()
  await prisma.bnccProgress.deleteMany()
  await prisma.classBoardPostInteraction.deleteMany()
  await prisma.classBoardPost.deleteMany()
  await prisma.assessmentAttachment.deleteMany()
  await prisma.assessment.deleteMany()
  await prisma.chatMessage.deleteMany()
  await prisma.chatGroup.deleteMany()
  await prisma.muralComment.deleteMany()
  await prisma.muralEvent.deleteMany()
  await prisma.portfolioEntry.deleteMany()
  await prisma.dailyLog.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.task.deleteMany()
  await prisma.scheduleItem.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.student.deleteMany()
  await prisma.schoolClass.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()
  await prisma.bncc.deleteMany()
  await prisma.pegadaInteraction.deleteMany()
  await prisma.pegadaPost.deleteMany()
  await prisma.project.deleteMany()
  await prisma.finalProductType.deleteMany()
  await prisma.menuItem.deleteMany()
  await prisma.menu.deleteMany()

  // BNCC
  log("Importando BNCC...")
  await prisma.bncc.createMany({
    data: bnccDataSeed as any,
    skipDuplicates: true
  })

  // Competências gerais
  log("Importando Competências Gerais...")
  await prisma.bncc.createMany({
    data: competenciasGeraisDataSeed.map((item) => ({
      ...item,
      code: item.code ?? ""
    })),
    skipDuplicates: false
  })

  // Custom Category Examples
  log("Importando Custom Category Examples...")
  await prisma.bncc.createMany({
    data: customCategoryExamplesDataSeed.map((item) => ({
      ...item,
      code: item.code ?? ""
    })),
    skipDuplicates: false
  })

  // Users
  log("Importando Users...")
  await prisma.user.createMany({
    data: usersDataSeed as any,
    skipDuplicates: false
  })

  // Turmas
  log("Importando Turmas...")
  await prisma.schoolClass.createMany({
    data: schoolClassesDataSeed as SchoolClass[],
    skipDuplicates: false
  })

  // Estudantes
  log("Importando Estudantes...")
  await prisma.student.createMany({
    data: studentsDataSeed as any[],
    skipDuplicates: false
  })

  // Mural Events
  log("Importando Eventos do Mural...")
  await prisma.muralEvent.createMany({
    data: muralEventsDataSeed,
    skipDuplicates: true
  })

  // Mural Comments
  log("Importando Comentários do Mural...")
  await prisma.muralComment.createMany({
    data: muralCommentsDataSeed,
    skipDuplicates: true
  })

  // Pegadas
  log("Importando Pegadas...")
  await prisma.pegadaPost.createMany({
    data: pegadasDataSeed as any,
    skipDuplicates: true
  })

  // Pegadas Interactions
  log("Importando Interações das Pegadas...")
  await prisma.pegadaInteraction.createMany({
    data: pegadasInteractionsDataSeed as any,
    skipDuplicates: true
  })

  // Portfolio
  log("Importando Portfolio Entries...")
  await prisma.portfolioEntry.createMany({
    data: portfolioDataSeed,
    skipDuplicates: true
  })

  // Projects
  log("Importando Projetos...")
  await prisma.project.createMany({
    data: projectsDataSeed as any,
    skipDuplicates: true
  })

  // ScheduleItems
  log("Importando Agendas...")
  await prisma.scheduleItem.createMany({
    data: scheduleDataSeed as any,
    skipDuplicates: true
  })

  // Notifications
  log("Importando Notificações...")
  await prisma.notification.createMany({
    data: notificationsDataSeed.map(n => ({
      ...n,
      createdAt: new Date(n.createdAt)
    })),
    skipDuplicates: true
  })

  // Tasks
  log("Importando Tarefas Globais...")
  await prisma.task.createMany({
    data: tasksDataSeed as any,
    skipDuplicates: true
  })

  // Faturas/Invoices
  log("Importando Faturas...")
  await prisma.invoice.createMany({
    data: invoicesDataSeed as any,
    skipDuplicates: true
  })

  // Daily Logs
  log("Importando Diários de Bordo...")
  await prisma.dailyLog.createMany({
    data: dailyLogsDataSeed as any,
    skipDuplicates: true
  })

  // Final Product Types
  log("Importando Tipos de Produto Final...")
  await prisma.finalProductType.createMany({
    data: finalProductTypesDataSeed as any,
    skipDuplicates: true
  })

  // Assessments
  log("Importando Avaliações (Assessments)...")
  await prisma.assessment.createMany({
    data: assessmentsDataSeed.map(a => ({
      ...a,
      createdAt: new Date(a.createdAt)
    })) as any,
    skipDuplicates: true
  })

  log("Importando Anexos das Avaliações...")
  await prisma.assessmentAttachment.createMany({
    data: assessmentsAttachmentsDataSeed as any,
    skipDuplicates: true
  })

  // Class Board Posts
  log("Importando Class Board Posts...")
  await prisma.classBoardPost.createMany({
    data: classBoardPostsDataSeed.map(post => ({
      ...post,
      createdAt: new Date(post.createdAt)
    })) as any,
    skipDuplicates: true
  })

  // Class Board Post Interactions
  log("Importando Interações de Class Board Posts...")
  await prisma.classBoardPostInteraction.createMany({
    data: classBoardPostInteractionsDataSeed.map(interaction => ({
      ...interaction,
      createdAt: new Date(interaction.createdAt)
    })) as any,
    skipDuplicates: true
  })

  // Menus
  log("Importando Menus...")
  await prisma.menu.createMany({
    data: menusDataSeed.map(m => ({
      ...m,
      createdAt: new Date(),
      updatedAt: new Date()
    })) as any,
    skipDuplicates: true
  })

  log("Importando Itens do Menu...")
  await prisma.menuItem.createMany({
    data: menuItemsDataSeed.map(m => ({
      ...m,
      createdAt: new Date(),
      updatedAt: new Date()
    })) as any,
    skipDuplicates: true
  })

  // Árvores de Conhecimento e Mosaicos
  log("Importando Knowledge Trees...")
  await seedKnowledgeTree(skillsTreeDataSeed)
  await seedKnowledgeTree(contentsTreeDataSeed)

  log("Importando Mosaic Trees...")
  await seedMosaicTree(mosaicSkillsDataSeed)
  await seedMosaicTree(mosaicContentsDataSeed)

  log("Seed finalizado com sucesso!")
  return logs;
}


// Se executado diretamente via CLI (npx prisma db seed / npm run seed)
if (require.main === module || process.argv[1].includes('seed.ts')) {
  runSeed()
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}

// npm run seed
// Ele vai inserir todos os registros do array no banco.
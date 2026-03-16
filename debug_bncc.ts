
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const items = await prisma.bncc.findMany({
        where: {
            name: {
                contains: 'teste',
                mode: 'insensitive'
            }
        }
    })
    console.log(JSON.stringify(items, null, 2))
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())

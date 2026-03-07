import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const uniqueAreas = await prisma.spot.groupBy({
        by: ['area'],
        _count: {
            area: true
        }
    })
    console.log('Unique areas in DB:', JSON.stringify(uniqueAreas, null, 2))
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

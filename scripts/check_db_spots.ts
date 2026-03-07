import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const spotCount = await prisma.spot.count()
    console.log(`Total count in Spot table: ${spotCount}`)

    const sampleSpots = await prisma.spot.findMany({
        take: 5
    })
    console.log('Sample spots:', JSON.stringify(sampleSpots, null, 2))
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

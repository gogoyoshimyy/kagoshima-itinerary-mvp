// Quick test of local DB search
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // Test search
    const queries = ['仙巌園', '桜島', '霧島神宮', '砂むし', '唐船峡']

    for (const q of queries) {
        const spots = await prisma.spot.findMany({
            where: { name: { contains: q } },
            take: 3,
            select: { name: true, area: true, address: true, phone: true }
        })
        console.log(`\n🔍 "${q}" → ${spots.length} hits:`)
        spots.forEach(s => console.log(`  - ${s.name} [${s.area}]`))
    }

    // Area count
    const areaCounts = await prisma.spot.groupBy({
        by: ['area'],
        _count: true,
        orderBy: { _count: { id: 'desc' } }
    })
    console.log('\n📊 Spots by area:')
    areaCounts.forEach(a => console.log(`  ${a.area}: ${a._count}件`))
}

main().finally(() => prisma.$disconnect())

import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

const scrapedSpotsPath = path.join(process.cwd(), 'src/data/scraped_spots.json')
const outputPath = path.join(process.cwd(), 'src/data/spots_full_with_regions.json')

async function main() {
    const scrapedSpots = JSON.parse(fs.readFileSync(scrapedSpotsPath, 'utf8'))
    const dbSpots = await prisma.spot.findMany()

    console.log(`DB Spots: ${dbSpots.length}, Scraped Spots: ${scrapedSpots.length}`)

    // Create a map for easy coordinate lookup
    const coordMap = new Map()
    scrapedSpots.forEach((s: any) => {
        coordMap.set(s.spot_name, { lat: s.lat, lng: s.lng, place_id: s.place_id })
    })

    // Mapping DB area string to RegionId
    const areaMapping: Record<string, string> = {
        '大隅半島': 'osumi',
        '奄美・離島': 'amami',
        '屋久島・種子島': 'islands_north',
        '薩摩半島': 'nansatsu',
        '薩摩川内・出水': 'hokusatsu',
        '霧島・姶良': 'kirishima_aira',
        '鹿児島市・桜島': 'chusatsu'
    }

    const integratedSpots = dbSpots.map(s => {
        const coords = coordMap.get(s.name) || { lat: s.lat || 0, lng: s.lng || 0, place_id: s.placeId || null }
        return {
            id: s.id,
            name: s.name,
            description: s.address || '',
            category: s.area || '観光スポット',
            region: areaMapping[s.area || ''] || 'unknown',
            lat: coords.lat,
            lng: coords.lng,
            place_id: coords.place_id,
            image_url: s.url ? `https://picsum.photos/seed/${s.id}/400/300` : ''
        }
    })

    fs.writeFileSync(outputPath, JSON.stringify(integratedSpots, null, 2))
    console.log(`Integrated ${integratedSpots.length} spots and saved to ${outputPath}`)
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

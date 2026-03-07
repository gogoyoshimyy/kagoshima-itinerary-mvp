/**
 * Seed script: Import scraped Kagoshima spots into the Spot table
 * Run with: npx tsx ./scripts/seed-spots.ts
 */
import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

// Simple area detection based on keywords in address
function detectArea(address: string, name: string): string {
    const text = address + ' ' + name
    if (text.includes('指宿') || text.includes('南九州') || text.includes('枕崎') || text.includes('南さつま') || text.includes('坊津') || text.includes('笠沙') || text.includes('大浦')) return '薩摩半島'
    if (text.includes('霧島') || text.includes('姶良') || text.includes('湧水') || text.includes('伊佐')) return '霧島・姶良'
    if (text.includes('鹿屋') || text.includes('垂水') || text.includes('大隅') || text.includes('志布志') || text.includes('錦江') || text.includes('東串良') || text.includes('曽于') || text.includes('串良') || text.includes('肝付') || text.includes('南大隅') || text.includes('佐多')) return '大隅半島'
    if (text.includes('出水') || text.includes('阿久根') || text.includes('薩摩川内') || text.includes('さつま') || text.includes('長島')) return '薩摩川内・出水'
    if (text.includes('奄美') || text.includes('瀬戸内') || text.includes('龍郷') || text.includes('大和') || text.includes('宇検') || text.includes('喜界') || text.includes('徳之島') || text.includes('与論') || text.includes('和泊') || text.includes('知名') || text.includes('天城') || text.includes('伊仙')) return '奄美・離島'
    if (text.includes('屋久') || text.includes('種子島') || text.includes('中種子') || text.includes('南種子')) return '屋久島・種子島'
    if (text.includes('鹿児島市') || text.includes('桜島')) return '鹿児島市・桜島'
    return '鹿児島市・桜島' // default
}

// Clean up name field (remove noise like "登録済み 解除する 行きたい" and kana appended with space)
function cleanName(raw: string): string {
    // Remove trailing kana/noise patterns
    return raw
        .replace(/\s*登録済み\s*解除する\s*行きたい\s*/g, '')
        .replace(/\s*解除する\s*行きたい\s*/g, '')
        .replace(/\s*行きたい\s*/g, '')
        .trim()
}

async function main() {
    const jsonPath = path.join(process.cwd(), 'scripts', 'kagoshima_kankou_spots.json')
    const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8')) as Array<Record<string, string>>

    console.log(`📂 Loaded ${rawData.length} spots from JSON`)

    let created = 0
    let skipped = 0

    for (const spot of rawData) {
        const name = cleanName(spot.name || '')
        if (!name) { skipped++; continue }

        const area = detectArea(spot.address || '', name)

        // Extract nameKana: often appended in brackets "（ナマエカナ）"
        const kanaMatch = name.match(/（([ァ-ンヴー\s・]+)）/)
        const nameKana = kanaMatch ? kanaMatch[1].trim() : null
        // Clean name further: remove （ナマエ） from the tail if present
        const cleanedName = name.replace(/\s*（[ァ-ンヴー\s・]+）$/, '').trim()

        try {
            await prisma.spot.upsert({
                where: { externalId: spot.id },
                update: {
                    name: cleanedName,
                    nameKana,
                    url: spot.url || null,
                    address: spot.address || null,
                    phone: spot.phone || null,
                    hours: spot.hours || null,
                    closed: spot.closed || null,
                    fee: spot.fee || null,
                    access: spot.access || null,
                    parking: spot.parking || null,
                    website: spot.website || null,
                    area,
                },
                create: {
                    externalId: spot.id,
                    name: cleanedName,
                    nameKana,
                    url: spot.url || null,
                    address: spot.address || null,
                    phone: spot.phone || null,
                    hours: spot.hours || null,
                    closed: spot.closed || null,
                    fee: spot.fee || null,
                    access: spot.access || null,
                    parking: spot.parking || null,
                    website: spot.website || null,
                    area,
                }
            })
            created++
        } catch (err) {
            console.warn(`  ⚠ Skip ${spot.id}: ${err}`)
            skipped++
        }
    }

    const total = await prisma.spot.count()
    console.log(`\n✅ Done! Created/Updated: ${created}, Skipped: ${skipped}`)
    console.log(`📊 Total spots in DB: ${total}`)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())

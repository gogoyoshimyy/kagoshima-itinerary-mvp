/**
 * 鹿児島観光ナビ スポットスクレイパー（全5ページ対応）
 * https://www.kagoshima-yokanavi.jp/spot
 */

import * as cheerio from 'cheerio'
import * as fs from 'fs'

const BASE_URL = 'https://www.kagoshima-yokanavi.jp'
const LIST_URL = `${BASE_URL}/spot`
const OUTPUT_JSON = './scripts/kagoshima_spots.json'
const OUTPUT_CSV = './scripts/kagoshima_spots.csv'
const DELAY_MS = 800
const TOTAL_PAGES = 5

interface Spot {
    id: string
    url: string
    name: string
    kana: string
    description: string
    phone: string
    address: string
    hours: string
    closed: string
    fee: string
    access: string
    parking: string
    website: string
}

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function fetchHTML(url: string): Promise<string> {
    const res = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'ja,en-US;q=0.9',
        }
    })
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
    return res.text()
}

async function scrapeList(): Promise<string[]> {
    const urls = new Set<string>()

    for (let p = 1; p <= TOTAL_PAGES; p++) {
        const pageUrl = p === 1 ? LIST_URL : `${LIST_URL}?page=${p}`
        console.log(`📋 ページ ${p}/${TOTAL_PAGES} 取得中...`)
        const html = await fetchHTML(pageUrl)
        const $ = cheerio.load(html)
        let count = 0

        $('a').each((_, el) => {
            const href = $(el).attr('href') || ''
            if (/^https:\/\/www\.kagoshima-yokanavi\.jp\/spot\/\d+$/.test(href)) {
                if (!urls.has(href)) { urls.add(href); count++ }
            }
            if (/^\/spot\/\d+$/.test(href)) {
                const full = BASE_URL + href
                if (!urls.has(full)) { urls.add(full); count++ }
            }
        })

        console.log(`  → ${count} 件追加 (累計: ${urls.size})`)
        if (p < TOTAL_PAGES) await sleep(DELAY_MS)
    }

    const list = Array.from(urls)
    console.log(`✅ 合計 ${list.length} 件のスポットURLを取得\n`)
    return list
}

async function scrapeDetail(url: string): Promise<Partial<Spot>> {
    const html = await fetchHTML(url)
    const $ = cheerio.load(html)

    const name = $('h1').first().text().replace(/\s+/g, ' ').trim()
    const kana = $('h1').next().text().trim().replace(/\s+/g, '')

    let description = ''
    $('p').each((_, el) => {
        const txt = $(el).text().trim()
        if (txt.length >= 60 && !description && !txt.startsWith('http')) {
            description = txt.replace(/\s+/g, ' ')
        }
    })

    const info: Record<string, string> = {}
    $('table tr').each((_, row) => {
        const th = $(row).find('th').text().trim().replace(/\s+/g, '')
        const td = $(row).find('td').text().trim().replace(/\s+/g, ' ')
        if (th && td) info[th] = td
    })
    $('dl > dt').each((_, dt) => {
        const key = $(dt).text().trim().replace(/\s+/g, '')
        const val = $(dt).next('dd').text().trim().replace(/\s+/g, ' ')
        if (key && val) info[key] = val
    })

    const phone = $('a[href^="tel:"]').first().attr('href')?.replace('tel:', '') || info['電話番号'] || info['TEL'] || ''
    const address = info['住所'] || info['所在地'] || ''
    const hours = info['営業時間'] || info['開館時間'] || info['開園時間'] || info['利用時間'] || ''
    const closed = info['定休日'] || info['休業日'] || info['休館日'] || info['休園日'] || ''
    const fee = info['料金'] || info['入場料'] || info['入園料'] || info['拝観料'] || ''
    const access = info['アクセス'] || info['交通'] || ''
    const parking = info['駐車場'] || ''

    const website = $('a[href^="http"]')
        .filter((_, el) => {
            const href = $(el).attr('href') || ''
            return !href.includes('kagoshima-yokanavi') && !href.includes('twitter.com') && !href.includes('facebook.com') && !href.includes('city.kagoshima')
        })
        .first().attr('href') || ''

    return { name, kana, description, phone, address, hours, closed, fee, access, parking, website }
}

async function main() {
    const urls = await scrapeList()
    const spots: Spot[] = []
    let success = 0, failed = 0

    for (let i = 0; i < urls.length; i++) {
        const url = urls[i]
        const id = url.match(/\/(\d+)$/)?.[1] || ''
        process.stdout.write(`[${String(i + 1).padStart(3)}/${urls.length}] ID=${id} `)

        try {
            const d = await scrapeDetail(url)
            spots.push({ id, url, name: d.name || '', kana: d.kana || '', description: d.description || '', phone: d.phone || '', address: d.address || '', hours: d.hours || '', closed: d.closed || '', fee: d.fee || '', access: d.access || '', parking: d.parking || '', website: d.website || '' })
            console.log(`✅ ${(d.name || '').slice(0, 20)}`)
            success++
        } catch (err) {
            console.log(`❌ ${err}`)
            spots.push({ id, url, name: '', kana: '', description: '', phone: '', address: '', hours: '', closed: '', fee: '', access: '', parking: '', website: '' })
            failed++
        }

        if (i < urls.length - 1) await sleep(DELAY_MS)
    }

    fs.writeFileSync(OUTPUT_JSON, JSON.stringify(spots, null, 2), 'utf-8')
    console.log(`\n📄 JSON: ${OUTPUT_JSON}`)

    const keys: (keyof Spot)[] = ['id', 'name', 'kana', 'url', 'description', 'phone', 'address', 'hours', 'closed', 'fee', 'access', 'parking', 'website']
    const csv = [keys.join(','), ...spots.map(s => keys.map(k => `"${(s[k] || '').replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`).join(','))].join('\n')
    fs.writeFileSync(OUTPUT_CSV, '\uFEFF' + csv, 'utf-8')
    console.log(`📊 CSV: ${OUTPUT_CSV}`)
    console.log(`\n✅ 完了: 成功 ${success} / 失敗 ${failed} / 合計 ${spots.length}`)
}

main().catch(console.error)

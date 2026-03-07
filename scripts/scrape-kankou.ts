/**
 * かごしまの旅（鹿児島県公式観光サイト）スポットスクレイパー
 * https://www.kagoshima-kankou.com/guide
 */

import * as cheerio from 'cheerio'
import * as fs from 'fs'

const BASE_URL = 'https://www.kagoshima-kankou.com'
const LIST_URL = `${BASE_URL}/guide`
const OUTPUT_JSON = './scripts/kagoshima_kankou_spots.json'
const OUTPUT_CSV = './scripts/kagoshima_kankou_spots.csv'
const DELAY_MS = 800

// 1406件 / 20件 = 約71ページ
const START_PAGE = 1
const MAX_PAGES = 75 // 少し余裕を持たせる

interface Spot {
    id: string
    url: string
    name: string
    category: string
    area: string
    description: string
    address: string
    phone: string
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

async function fetchHTML(url: string, retries = 3): Promise<string> {
    for (let i = 0; i < retries; i++) {
        try {
            const res = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)',
                    'Accept-Language': 'ja,en-US;q=0.9',
                }
            })
            if (!res.ok) {
                if (res.status === 404) return '' // ページ終端
                throw new Error(`HTTP ${res.status}`)
            }
            return await res.text()
        } catch (err) {
            if (i === retries - 1) throw err
            await sleep(2000)
        }
    }
    return ''
}

async function scrapeList(): Promise<string[]> {
    const urls = new Set<string>()
    let consecutiveEmptyPages = 0

    for (let p = START_PAGE; p <= MAX_PAGES; p++) {
        const pageUrl = p === 1 ? LIST_URL : `${LIST_URL}?page=${p}`
        // console.log(`📋 ページ ${p} 取得中...`)
        const html = await fetchHTML(pageUrl)
        if (!html) break

        const $ = cheerio.load(html)
        let addedOnPage = 0

        $('a').each((_, el) => {
            const href = $(el).attr('href') || ''
            // https://www.kagoshima-kankou.com/guide/数字 形式
            const match = href.match(/(?:\/guide\/|^https:\/\/www\.kagoshima-kankou\.com\/guide\/)(\d+)\/?$/)
            if (match) {
                const full = BASE_URL + '/guide/' + match[1] + '/'
                if (!urls.has(full)) {
                    urls.add(full)
                    addedOnPage++
                }
            }
        })

        console.log(`📋 ページ ${p}: ${addedOnPage} 件追加 (累計: ${urls.size})`)

        if (addedOnPage === 0) {
            consecutiveEmptyPages++
            if (consecutiveEmptyPages >= 2) {
                console.log('これ以上新しいスポットが見つからないため一覧取得を終了します。')
                break
            }
        } else {
            consecutiveEmptyPages = 0
        }

        // 最終ページ番号（ページネーションリンク）をチェックして、それを越えたら終了判定など
        const activePage = $('.o-paging__anchor[aria-current="page"]').text().trim()
        const nextLinks = $('.o-paging__anchor')
        const maxListedPage = Math.max(...nextLinks.map((_, el) => parseInt($(el).text())).get().filter(n => !isNaN(n)))

        if (activePage && parseInt(activePage) > maxListedPage && p > 1) {
            // 表示上の最終ページを超えた（保険）
        }

        await sleep(DELAY_MS)
    }

    const list = Array.from(urls)
    console.log(`✅ 合計 ${list.length} 件のスポットURLを取得\n`)
    return list
}

async function scrapeDetail(url: string): Promise<Partial<Spot>> {
    const html = await fetchHTML(url)
    const $ = cheerio.load(html)

    const name = $('h1.c-heading--page__title, h1').first().text().replace(/\s+/g, ' ').trim()

    // カテゴリやエリア
    const tags: string[] = []
    $('.c-tag, .c-category, .m-detail-header__tag').each((_, el) => {
        tags.push($(el).text().trim())
    })
    const category = tags[0] || ''
    const area = tags[1] || ''

    // 説明文
    let description = ''
    $('.m-detail-intro__text, .p-spot-detail__text, .c-text').each((_, el) => {
        const txt = $(el).text().trim()
        if (txt.length >= 20 && !description) description = txt.replace(/\s+/g, ' ')
    })

    // 基本情報テーブル (th/td)
    const info: Record<string, string> = {}
    $('table tr, .c-table tr').each((_, row) => {
        const th = $(row).find('th').text().trim().replace(/\s+/g, '')
        // 複数のpタグなどがある場合は結合
        const tdText = $(row).find('td').text().replace(/\s+/g, ' ').trim()
        if (th && tdText) info[th] = tdText
    })

    // dl/dt/dd 形式の場合 (よくあるパターン)
    $('dl.c-definition').each((_, dl) => {
        $(dl).children('dt').each((i, dt) => {
            const key = $(dt).text().trim().replace(/\s+/g, '')
            const val = $(dt).next('dd').text().trim().replace(/\s+/g, ' ')
            if (key && val) info[key] = val
        })
    })

    const phone = info['電話番号'] || info['TEL'] || info['お問い合わせ先'] || ''
    const address = info['住所'] || info['所在地'] || ''
    const hours = info['営業時間'] || info['開館時間'] || info['開園時間'] || info['利用時間'] || ''
    const closed = info['定休日'] || info['休業日'] || info['休館日'] || info['休園日'] || info['休日'] || ''
    const fee = info['料金'] || info['入場料'] || info['入園料'] || info['拝観料'] || ''
    const access = info['アクセス'] || info['交通'] || info['交通アクセス'] || ''
    const parking = info['駐車場'] || info['駐車'] || ''

    const website = $('a[href^="http"]')
        .filter((_, el) => {
            const txt = $(el).text().trim()
            return txt.includes('公式') || txt.includes('HP') || $(el).closest('td, dd').length > 0
        })
        .first().attr('href') || info['ホームページ'] || info['公式サイト'] || info['WEBサイト'] || ''

    // リンクがテーブル内にある場合 (info['ホームページ'] がテキストだけになっているのを補正)
    if (!website.startsWith('http')) {
        const hpLink = $('th:contains("ホームページ"), th:contains("公式サイト")').next('td').find('a').attr('href')
        const hpVal = website || hpLink || ''
    }

    return { name, category, area, description, phone, address, hours, closed, fee, access, parking, website }
}

async function main() {
    const urls = await scrapeList()
    const spots: Spot[] = []
    let success = 0, failed = 0

    for (let i = 0; i < urls.length; i++) {
        const url = urls[i]
        const id = url.match(/\/guide\/(\d+)\/?$/)?.[1] || ''
        process.stdout.write(`[${String(i + 1).padStart(4)}/${urls.length}] ID=${id} `)

        try {
            const d = await scrapeDetail(url)
            spots.push({
                id, url,
                name: d.name || '',
                category: d.category || '',
                area: d.area || '',
                description: d.description || '',
                phone: d.phone || '',
                address: d.address || '',
                hours: d.hours || '',
                closed: d.closed || '',
                fee: d.fee || '',
                access: d.access || '',
                parking: d.parking || '',
                website: d.website || ''
            })
            console.log(`✅ ${(d.name || '').slice(0, 30)}`)
            success++
        } catch (err) {
            console.log(`❌ ${err}`)
            spots.push({ id, url, name: '', category: '', area: '', description: '', phone: '', address: '', hours: '', closed: '', fee: '', access: '', parking: '', website: '' })
            failed++
        }

        if (i < urls.length - 1) await sleep(DELAY_MS)
    }

    fs.writeFileSync(OUTPUT_JSON, JSON.stringify(spots, null, 2), 'utf-8')
    console.log(`\n📄 JSON: ${OUTPUT_JSON}`)

    const keys: (keyof Spot)[] = ['id', 'name', 'category', 'area', 'url', 'description', 'phone', 'address', 'hours', 'closed', 'fee', 'access', 'parking', 'website']
    const csv = [keys.join(','), ...spots.map(s => keys.map(k => `"${(s[k] || '').replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`).join(','))].join('\n')
    fs.writeFileSync(OUTPUT_CSV, '\uFEFF' + csv, 'utf-8')
    console.log(`📊 CSV: ${OUTPUT_CSV}`)
    console.log(`\n✅ 完了: 成功 ${success} / 失敗 ${failed} / 合計 ${spots.length}`)
}

main().catch(console.error)

/**
 * HTML構造確認スクリプト
 */
import * as cheerio from 'cheerio'

const BASE_URL = 'https://www.kagoshima-yokanavi.jp'
const LIST_URL = `${BASE_URL}/spot`

async function main() {
    const res = await fetch(LIST_URL, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'ja,en-US;q=0.9',
        }
    })
    const html = await res.text()
    const $ = cheerio.load(html)

    // すべての /spot/ リンクを確認
    const allSpotLinks: string[] = []
    $('a').each((_, el) => {
        const href = $(el).attr('href') || ''
        if (href.includes('/spot/')) {
            allSpotLinks.push(href)
        }
    })
    console.log('All /spot/ links (first 20):')
    console.log([...new Set(allSpotLinks)].slice(0, 20))

    // HTMLの形 (最初の2000文字だけ)
    console.log('\n--- HTML snippet (first 3000 chars) ---')
    console.log(html.slice(0, 3000))
}

main().catch(console.error)

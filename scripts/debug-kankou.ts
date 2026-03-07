import * as cheerio from 'cheerio'

async function main() {
    const res = await fetch('https://www.kagoshima-kankou.com/guide', {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)',
        }
    })
    const html = await res.text()
    const $ = cheerio.load(html)

    const links = new Set<string>()
    $('a').each((_, el) => {
        const href = $(el).attr('href') || ''
        if (href.includes('/guide/')) links.add(href)
    })

    console.log('--- Found /guide/ links ---')
    console.log(Array.from(links).slice(0, 20))

    console.log('\n--- Pagination or API indicators ---')
    const apiLines = html.split('\n').filter(line => line.includes('page') || line.includes('api') || line.includes('ajax'))
    console.log(apiLines.slice(0, 10).join('\n').substring(0, 1000))
}

main()

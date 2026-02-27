import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

if (!API_KEY) {
    console.error("GOOGLE_MAPS_API_KEY is not defined in .env.local");
    process.exit(1);
}

export type ScrapedSpot = {
    spot_name: string;
    description: string;
    url: string;
    image_url: string;
    place_id: string | null;
    lat: number;
    lng: number;
};

async function getPlaceInfo(spotName: string) {
    try {
        const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": API_KEY as string,
                "X-Goog-FieldMask": "places.id,places.location",
            },
            body: JSON.stringify({
                textQuery: `${spotName} 鹿児島`,
                languageCode: "ja"
            })
        });

        if (!res.ok) {
            console.error(`Places API Error for ${spotName}:`, await res.text());
            return { place_id: null, lat: 0, lng: 0 };
        }

        const data = await res.json();
        if (data.places && data.places.length > 0) {
            return {
                place_id: data.places[0].id,
                lat: data.places[0].location.latitude,
                lng: data.places[0].location.longitude
            };
        }
    } catch (err) {
        console.error(`Failed to fetch place info for ${spotName}`, err);
    }

    return { place_id: null, lat: 0, lng: 0 };
}

async function scrapeTop100() {
    console.log("Starting scrape...");
    const allSpots: ScrapedSpot[] = [];

    // The site has ~20 spots per page. 5 pages = 100 spots.
    for (let page = 1; page <= 5; page++) {
        console.log(`\n--- Fetching Page ${page} ---`);
        const url = `https://www.kagoshima-kankou.com/guide?page=${page}`;

        try {
            const res = await fetch(url);
            const html = await res.text();
            const $ = cheerio.load(html);

            const items = $('.o-digest--tile__item').toArray();
            let pageSpots = 0;

            for (const el of items) {
                const $el = $(el);

                const anchor = $el.find('a.o-digest--tile__anchor');
                let href = anchor.attr('href') || '';
                if (href && href.startsWith('/')) {
                    href = `https://www.kagoshima-kankou.com${href}`;
                }

                const spot_name = $el.find('.o-digest--tile__title').text().trim();
                const description = $el.find('.o-digest--tile__description').text().trim();

                let image_url = $el.find('img').attr('src') || '';
                if (image_url && image_url.startsWith('/')) {
                    image_url = `https://www.kagoshima-kankou.com${image_url}`;
                }

                if (!spot_name) continue;

                pageSpots++;
                console.log(`Processing: ${spot_name}`);

                // Fetch GPS and Place ID
                const geo = await getPlaceInfo(spot_name);

                allSpots.push({
                    spot_name,
                    description,
                    url: href,
                    image_url,
                    ...geo
                });

                // Gentle delay to avoid hammering Google / Kagoshima-kankou APIs
                await new Promise(r => setTimeout(r, 600));
            }
            console.log(`Page ${page} yielded ${pageSpots} spots.`);
        } catch (err) {
            console.error(`Error fetching page ${page}:`, err);
        }
    }

    // Save to a local JSON file to act as our dataset
    const outputDir = path.join(process.cwd(), 'src', 'data');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'scraped_spots.json');
    fs.writeFileSync(outputPath, JSON.stringify(allSpots, null, 2));

    console.log(`\n✅ Scrape complete! Saved ${allSpots.length} spots to ${outputPath}`);
}

scrapeTop100();

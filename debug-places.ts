import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

const search = async (q: string) => {
    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY as string,
            'X-Goog-FieldMask': 'places.id,places.displayName,places.location'
        },
        body: JSON.stringify({ textQuery: q })
    })
    const data = await res.json()
    const p = data.places?.[0]
    if (p) {
        console.log(`{ id: "${Date.now() + Math.floor(Math.random() * 1000)}", name: "${p.displayName?.text}", lat: ${p.location?.latitude || 0}, lng: ${p.location?.longitude || 0}, placeId: "${p.id}" },`)
    } else {
        console.log(`// Not found: ${q}`)
    }
}
const run = async () => {
    const queries = [
        'たまて箱温泉 鹿児島',
        '雄川の滝',
        '荒平天神',
        '佐多岬',
        '西郷隆盛銅像',
        '西大山駅',
        '池田湖',
        '唐船峡そうめん流し',
    ];
    for (const q of queries) {
        await search(q);
        await new Promise(r => setTimeout(r, 500));
    }
}
run();

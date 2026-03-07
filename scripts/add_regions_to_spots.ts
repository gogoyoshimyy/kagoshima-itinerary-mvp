import fs from 'fs';
import path from 'path';

const inputPath = path.join(process.cwd(), 'src/data/scraped_spots.json');
const outputPath = path.join(process.cwd(), 'src/data/spots_with_regions.json');

const spots = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

export type RegionId = 'hokusatsu' | 'kirishima_aira' | 'chusatsu' | 'nansatsu' | 'osumi' | 'islands_north' | 'amami';

function getRegion(lat: number, lng: number): RegionId | 'unknown' {
    if (lat === 0 || lng === 0) return 'unknown';

    // Amami (approx N < 29)
    if (lat < 29.0) return 'amami';

    // Islands North (Yakushima/Tanegashima approx 29 < N < 30.9)
    if (lat < 30.9) return 'islands_north';

    // Mainland
    // Osumi (East of 130.7-ish)
    if (lng > 130.78) return 'osumi';

    // North Satsuma (North of 31.8, West of 130.5)
    if (lat > 31.8) {
        if (lng < 130.55) return 'hokusatsu';
        return 'kirishima_aira';
    }

    // South Satsuma (South of 31.5)
    if (lat < 31.42) return 'nansatsu';

    // Chusatsu (Between Nansatsu and Hokusatsu)
    return 'chusatsu';
}

const taggedSpots = spots.map((spot: any) => ({
    ...spot,
    region: getRegion(spot.lat, spot.lng)
}));

fs.writeFileSync(outputPath, JSON.stringify(taggedSpots, null, 2));

console.log(`Tagged ${taggedSpots.length} spots and saved to ${outputPath}`);

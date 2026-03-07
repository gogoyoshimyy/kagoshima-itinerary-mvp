import * as fs from 'fs';
import * as path from 'path';

const INPUT_FILE = path.join(__dirname, 'kagoshima_kankou_spots.json');
const OUTPUT_FILE = path.join(__dirname, 'kagoshima_spots_categorized_v2.json');

interface Spot {
    id: string;
    url: string;
    name: string;
    description: string;
    address?: string;
    hours?: string;
    closed?: string;
    fee?: string;
    access?: string;
    parking?: string;
    [key: string]: any;
}

interface CategorizedSpot extends Spot {
    category: string;
    tags: string[];
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
    scenic: ['絶景', '自然', '展望', '海', '山', '滝', '風景', '景色', '公園', 'ビーチ', '海岸', '岬', '溶岩', '桜島', '半島', '池', '湖', '島', '岳', '森', '林', '原', '畑', '浜', '潮', '渓谷', '大自然'],
    history: ['歴史', '文化', '史跡', '神社', '寺', '銅像', '博物館', '美術館', '資料館', '遺跡', '藩', '幕末', '西郷', '島津', '城', '跡', '武家屋敷', '集成館', '南洲', '古墳', '墓'],
    food: ['グルメ', '料理', '食べ歩き', 'ランチ', 'ディナー', 'レストラン', 'カフェ', 'スイーツ', '黒豚', '焼酎', 'ラーメン', 'カレー', '寿司', '屋台', '酒', '蔵', 'そうめん', 'とんかつ', '菓子', '市場', '肉', '鰻', 'そば'],
    relax: ['温泉', '足湯', '露天風呂', '癒やし', '銭湯', 'サウナ', 'リラックス', 'スパ', 'マッサージ', '砂むし', '湯', '宿', 'ホテル'],
    family: ['家族', '子供', '遊園地', '動物園', '水族館', '体験', '遊び', 'レジャー', '芝生', '滑り台', '広場', 'ポケモン', 'マンホール', '乗り物', 'フェリー', '工場見学', 'キャンプ'],
    rain_ok: ['屋内', '室内', '博物館', '水族館', '美術館', 'ショッピング', 'デパート', 'モール', 'アーケード', 'センター', '資料館', '案内所', '展示', '図書', '駅', 'ビル']
};

const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
    scenic: '絶景・自然',
    history: '歴史・文化',
    food: '名物グルメ',
    relax: '癒やし・温泉',
    family: 'ファミリー',
    rain_ok: '雨でもOK'
};

function main() {
    if (!fs.existsSync(INPUT_FILE)) {
        console.error(`Input file not found: ${INPUT_FILE}`);
        process.exit(1);
    }

    const rawData = fs.readFileSync(INPUT_FILE, 'utf8');
    const spots: Spot[] = JSON.parse(rawData);

    const categorizedSpots: CategorizedSpot[] = spots.map(spot => {
        const cleanName = spot.name.replace(/登録済み 解除する 行きたい$/, '').trim();

        const searchFields = [
            cleanName,
            spot.description || '',
            spot.fee || '',
            spot.access || '',
            spot.category || '',
            spot.area || ''
        ];
        const searchText = searchFields.join(' ').toLowerCase();

        const foundTags: string[] = [];
        const matchCounts: Record<string, number> = {};

        for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
            let count = 0;
            for (const keyword of keywords) {
                if (searchText.includes(keyword.toLowerCase())) {
                    foundTags.push(category);
                    count++;
                }
            }
            if (count > 0) {
                matchCounts[category] = count * (category === 'rain_ok' ? 0.8 : 1.0); // Bias slightly away from rain_ok if others match
            }
        }

        const uniqueTags = Array.from(new Set(foundTags));

        let primaryCategoryKey = 'others';
        let maxMatches = 0;

        for (const [key, count] of Object.entries(matchCounts)) {
            if (count > maxMatches) {
                maxMatches = count;
                primaryCategoryKey = key;
            }
        }

        if (primaryCategoryKey === 'others' && uniqueTags.length > 0) {
            primaryCategoryKey = uniqueTags[0];
        }

        return {
            ...spot,
            name: cleanName,
            category: CATEGORY_DISPLAY_NAMES[primaryCategoryKey] || 'その他',
            tags: uniqueTags
        };
    });

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(categorizedSpots, null, 2), 'utf8');
    console.log(`Successfully categorized ${categorizedSpots.length} spots.`);

    const summary: Record<string, number> = {};
    const othersList: string[] = [];
    categorizedSpots.forEach(s => {
        summary[s.category] = (summary[s.category] || 0) + 1;
        if (s.category === 'その他' && othersList.length < 10) othersList.push(s.name);
    });
    console.log('Category distribution:', summary);
    console.log('Sample of "Others":', othersList);
}

main();

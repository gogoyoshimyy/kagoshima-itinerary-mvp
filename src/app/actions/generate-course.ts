"use server"

import { GoogleGenerativeAI } from "@google/generative-ai"
import spotsData from "@/data/spots_full_with_regions.json"

export interface CourseRequest {
    themes: string[]           // 絶景, 温泉, グルメ, 歴史, アクティビティ, ファミリー
    days: number               // 旅行日数
    arrival: string            // 到着地点
    transport: 'car' | 'public'
    pace: 'packed' | 'relaxed' | 'balanced'
    companion: string          // ひとり, カップル, ファミリー, シニア
    mustVisit?: string         // 絶対行きたい場所
    excludeTypes?: string[]    // 除外したいジャンル
}

export interface GeneratedSpot {
    id: string
    name: string
    description: string
    lat: number
    lng: number
    place_id: string | null
    stay_minutes: number
    reason: string
    region: string
}

export interface GeneratedDay {
    day: number
    theme: string
    spots: GeneratedSpot[]
}

export interface GeneratedCourse {
    days: GeneratedDay[]
    total_message: string
}

const THEME_TO_CATEGORIES: Record<string, string[]> = {
    '絶景・自然': ['霧島・姶良', '大隅半島', '薩摩川内・出水', '薩摩半島', '屋久島・種子島', '奄美・離島'],
    '温泉・癒やし': ['霧島・姶良', '薩摩半島', '鹿児島市・桜島'],
    'グルメ': ['鹿児島市・桜島', '薩摩半島', '霧島・姶良', '大隅半島'],
    '歴史・文化': ['鹿児島市・桜島', '薩摩半島', '大隅半島', '霧島・姶良'],
    'アクティビティ': ['屋久島・種子島', '奄美・離島', '霧島・姶良', '大隅半島'],
    'ファミリー': ['鹿児島市・桜島', '薩摩半島', '霧島・姶良', '大隅半島'],
}

const REGION_BY_TRANSPORT: Record<string, string[]> = {
    car: ['hokusatsu', 'kirishima_aira', 'chusatsu', 'nansatsu', 'osumi', 'islands_north', 'amami'],
    public: ['chusatsu', 'kirishima_aira', 'nansatsu'], // 公共交通は本土中心のみ
}

export async function generateCourseAction(req: CourseRequest): Promise<{ success: boolean; course?: GeneratedCourse; error?: string }> {
    try {
        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) {
            return { success: false, error: 'GEMINI_API_KEY が設定されていません' }
        }

        // スポット候補を絞り込む
        const allowedRegions = REGION_BY_TRANSPORT[req.transport]
        const allowedCategories = req.themes.flatMap(t => THEME_TO_CATEGORIES[t] || [])

        let candidates = spotsData.filter(spot => {
            const regionOk = allowedRegions.includes(spot.region)
            const categoryOk = allowedCategories.length === 0 || allowedCategories.includes(spot.category)
            return regionOk && categoryOk
        })

        // 座標があるスポットのみをAIに渡す（座標なしは経路計算できないため除外）
        candidates = candidates.filter(s => s.lat !== 0 && s.lng !== 0).slice(0, 80)

        // mustVisitがある場合は候補の先頭に追加
        if (req.mustVisit) {
            const mustSpot = spotsData.find(s => s.name.includes(req.mustVisit!))
            if (mustSpot && !candidates.find(c => c.id === mustSpot.id)) {
                candidates.unshift(mustSpot)
            }
        }

        const spotsForPrompt = candidates.map(s => ({
            id: s.id,
            name: s.name,
            description: s.description,
            category: s.category,
            region: s.region,
            hasCoords: s.lat !== 0,
        }))

        const spotsPerDay = req.pace === 'packed' ? 6 : req.pace === 'relaxed' ? 3 : 4
        const totalSpots = req.days * spotsPerDay + 1 // +1 for arrival/departure day

        const prompt = `
あなたは鹿児島旅行の専門ガイドです。
以下の旅行者の条件と候補スポットリストから、最適な${req.days}泊${req.days + 1}日の旅程を日本語で作成してください。

【旅行者の条件】
- テーマ: ${req.themes.join('、')}
- 到着地: ${req.arrival}
- 移動手段: ${req.transport === 'car' ? 'レンタカー' : '公共交通機関'}
- ペース: ${req.pace === 'packed' ? 'ガッツリ詰め込み（1日${spotsPerDay}スポット程度）' : req.pace === 'relaxed' ? 'ゆっくりのんびり（1日${spotsPerDay}スポット程度）' : '程よいバランス（1日${spotsPerDay}スポット程度）'}
- 同行者: ${req.companion}
${req.mustVisit ? `- 絶対含めてほしいスポット: ${req.mustVisit}` : ''}

【重要なルール】
1. 各日のスポットは地理的に近いエリアにまとめること（1日に鹿児島市と屋久島を入れるのはNG）
2. Day1は${req.arrival}近くのスポットから始めること
3. 最終日は空港や駅に近いスポットで締めること
4. 同行者に合わせたスポットを選ぶこと（ファミリーなら子供向け、シニアならバリアフリーを考慮）
5. 【必須】各日の最後のスポットは宿泊地（温泉旅館、ホテル、山荘など）にすること。翌日は地理的にその宿泊地の近くのスポットから始めること

【候補スポット一覧】
${JSON.stringify(spotsForPrompt, null, 2)}

【出力形式（必ずこのJSON形式で出力してください）】
{
  "days": [
    {
      "day": 1,
      "theme": "この日のテーマ（20字以内）",
      "spots": [
        {
          "id": "スポットのid",
          "stay_minutes": 90,
          "reason": "このスポットを選んだ理由（30字以内）"
        }
      ]
    }
  ],
  "total_message": "このコースの全体的な魅力を伝えるひとこと（60字以内）"
}

JSONのみ出力してください。説明文は不要です。
`

        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

        const result = await model.generateContent(prompt)
        const responseText = result.response.text()

        // JSONを抽出（```json ... ``` の場合も対応）
        const jsonMatch = responseText.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
            return { success: false, error: 'AIの応答をパースできませんでした' }
        }

        const parsed = JSON.parse(jsonMatch[0])

        // スポット情報をDBから引いてマージ
        const course: GeneratedCourse = {
            days: parsed.days.map((day: any) => ({
                day: day.day,
                theme: day.theme,
                spots: day.spots.map((s: any) => {
                    const spot = spotsData.find(sp => sp.id === s.id)
                    if (!spot) return null
                    return {
                        id: spot.id,
                        name: spot.name,
                        description: spot.description,
                        lat: spot.lat,
                        lng: spot.lng,
                        place_id: spot.place_id,
                        stay_minutes: s.stay_minutes || 60,
                        reason: s.reason,
                        region: spot.region,
                    }
                }).filter(Boolean) as GeneratedSpot[]
            })),
            total_message: parsed.total_message,
        }

        return { success: true, course }
    } catch (e: any) {
        console.error('generateCourseAction error:', e)
        return { success: false, error: e.message || 'コース生成に失敗しました' }
    }
}

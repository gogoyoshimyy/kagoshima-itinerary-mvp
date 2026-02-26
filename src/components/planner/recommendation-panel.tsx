import { useState } from "react"
import { Plus, Umbrella, Users, Coffee, Camera, BookOpen, Sparkles, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

import { TripItem } from "@/types/planner"

interface RecommendationPanelProps {
    onAddSpot?: (spotName: string, lat?: number, lng?: number, placeId?: string) => void;
    onItemClick?: (placeId: string, lat: number, lng: number, name: string) => void;
    mode?: string;
    items?: TripItem[];
}

const TAG_MAP = {
    "family": { label: "ファミリー", icon: Users, color: "text-orange-600 bg-orange-50", activeColor: "bg-orange-600 text-white" },
    "rain_ok": { label: "雨でもOK", icon: Umbrella, color: "text-blue-600 bg-blue-50", activeColor: "bg-blue-600 text-white" },
    "scenic": { label: "絶景・自然", icon: Camera, color: "text-green-600 bg-green-50", activeColor: "bg-green-600 text-white" },
    "food": { label: "名物グルメ", icon: Coffee, color: "text-red-600 bg-red-50", activeColor: "bg-red-600 text-white" },
    "history": { label: "歴史・文化", icon: BookOpen, color: "text-purple-600 bg-purple-50", activeColor: "bg-purple-600 text-white" },
    "relax": { label: "癒やし・温泉", icon: Sparkles, color: "text-teal-600 bg-teal-50", activeColor: "bg-teal-600 text-white" },
}

export function RecommendationPanel({ onAddSpot, onItemClick, mode = 'discover', items = [] }: RecommendationPanelProps) {
    const [activeTag, setActiveTag] = useState<string | null>(null)

    const allRecommendations = [
        {
            id: "r1", name: "霧島神宮", category: "歴史",
            tags: ["history", "relax", "family"],
            desc: "神聖な空気が漂う南九州屈指のパワースポット。",
            lat: 31.8590, lng: 130.8711, placeId: "ChIJTYc1w1D8PjURjMzQ3_QGddM"
        },
        {
            id: "r2", name: "天文館むじゃき 本店", category: "グルメ",
            tags: ["food", "family"],
            desc: "名物「白くま」発祥の店。天文館での休憩に。",
            lat: 31.5905, lng: 130.5534, placeId: "ChIJW32vWKpgPjURchzAaVmH_-E"
        },
        {
            id: "r3", name: "いおワールドかごしま水族館", category: "レジャー",
            tags: ["family", "rain_ok"],
            desc: "ジンベエザメが泳ぐ黒潮大水槽は必見。",
            lat: 31.5966, lng: 130.5630, placeId: "ChIJT98JvRpePjURoAs7WvwOIlg"
        },
        {
            id: "r4", name: "桜島", category: "絶景",
            tags: ["scenic", "family"],
            desc: "鹿児島のシンボル。フェリーで手軽に上陸できる活火山。",
            lat: 31.5907, lng: 130.5941, placeId: "ChIJI8iMUstfPjURfTYO6nIOUxg"
        },
        {
            id: "r5", name: "仙巌園", category: "歴史",
            tags: ["scenic", "history"],
            desc: "桜島を築山に見立てた広大な大名庭園。",
            lat: 31.6174, lng: 130.5772, placeId: "ChIJ4X7e7l5ePjURPwj6UsWmblk"
        },
        {
            id: "r6", name: "城山展望台", category: "絶景",
            tags: ["scenic"],
            desc: "鹿児島市街地と桜島を一望できる定番スポット。",
            lat: 31.5962, lng: 130.5500, placeId: "ChIJQ6cuZ-RdPjURn0RJrwC_iIw"
        },
        {
            id: "r7", name: "砂むし会館 砂楽", category: "温泉",
            tags: ["relax", "rain_ok"],
            desc: "世界でも珍しい天然砂むし温泉でデトックス。",
            lat: 31.2298, lng: 130.6519, placeId: "ChIJjz6hhMAqPDURGnJJVwAJKWI"
        },
        {
            id: "r8", name: "知覧特攻平和会館", category: "歴史",
            tags: ["history", "rain_ok"],
            desc: "平和の尊さを深く学べる重要な歴史資料館。",
            lat: 31.3636, lng: 130.4343, placeId: "ChIJlwQAW6x3PjURUosLknKAha4"
        },
        {
            id: "r9", name: "黒豚料理 寿庵", category: "グルメ",
            tags: ["food", "rain_ok"],
            desc: "鹿児島名物の極上黒豚しゃぶしゃぶ・とんかつを堪能。",
            lat: 31.5845, lng: 130.5395, placeId: "ChIJ-SNuUURnPjURcnvgO9Ju7L8"
        },
        {
            id: "r10", name: "丸尾滝", category: "絶景",
            tags: ["scenic", "relax"],
            desc: "温泉水が流れ落ちる乳青色の珍しい滝。",
            lat: 31.8931, lng: 130.8320, placeId: "ChIJfyl9_AUbPzUR3u2DeZehPoM"
        },
        {
            id: "r11", name: "長崎鼻", category: "絶景",
            tags: ["scenic"],
            desc: "薩摩半島最南端。開聞岳と海が織りなす絶景。",
            lat: 31.1567, lng: 130.5874, placeId: "ChIJmVjdIKLTPTURQLXw2iTjKx0"
        },
        {
            id: "r12", name: "たまて箱温泉", category: "温泉",
            tags: ["relax", "scenic"],
            desc: "開聞岳と海を望む和風・洋風の絶景露天風呂。",
            lat: 31.1831, lng: 130.6172, placeId: "ChIJzZg4PQXTPTURpEqx8xMATsU"
        },
        {
            id: "r13", name: "雄川の滝", category: "絶景",
            tags: ["scenic", "relax"],
            desc: "エメラルドグリーンの滝つぼが作り出す神秘的な空間。",
            lat: 31.2000, lng: 130.8257, placeId: "ChIJaSXODW2dPjURpPBziYj-K38"
        },
        {
            id: "r14", name: "荒平天神（菅原神社）", category: "歴史",
            tags: ["history", "scenic"],
            desc: "海に突き出た砂州にポツンと建つ美しい神社。",
            lat: 31.3795, lng: 130.7774, placeId: "ChIJ0w4xd8ePPjURkNQPgKYTGGw"
        },
        {
            id: "r15", name: "佐多岬", category: "絶景",
            tags: ["scenic"],
            desc: "本土最南端の岬。展望台からの太平洋のパノラマ絶景。",
            lat: 30.9972, lng: 130.6591, placeId: "ChIJbx70cew0PDURiqdr_lk_k7k"
        },
        {
            id: "r16", name: "西郷隆盛銅像", category: "歴史",
            tags: ["history"],
            desc: "城山を背景に堂々と立つ、鹿児島の象徴。",
            lat: 31.5952, lng: 130.5535, placeId: "ChIJQ6cuZ-RdPjURmQ0SME4xPOM"
        },
        {
            id: "r17", name: "JR西大山駅", category: "絶景",
            tags: ["scenic"],
            desc: "JR日本最南端の駅。幸せを届ける黄色いポストが人気。",
            lat: 31.1903, lng: 130.5765, placeId: "ChIJeXntV5LTPTURn-ltkib2Wgg"
        },
        {
            id: "r18", name: "唐船峡そうめん流し", category: "グルメ",
            tags: ["food", "family", "relax"],
            desc: "回転式そうめん流し発祥の地。涼しげな峡谷で味わう名物。",
            lat: 31.2201, lng: 130.5427, placeId: "ChIJgxIf5LHWPTUR-vZOpvgUoc0"
        }
    ]

    // Simple Haversine distance for sorting
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    let filteredRecommendations = activeTag
        ? allRecommendations.filter(spot => spot.tags.includes(activeTag))
        : allRecommendations

    // If must_visit mode and a base spot exists, sort by distance
    let baseSpot: TripItem | undefined = undefined;
    if (mode === 'must_visit' && items.length > 0) {
        baseSpot = items[0]; // The first item is the anchor
        filteredRecommendations = [...filteredRecommendations].sort((a, b) => {
            const distA = calculateDistance(baseSpot!.lat, baseSpot!.lng, a.lat, a.lng);
            const distB = calculateDistance(baseSpot!.lat, baseSpot!.lng, b.lat, b.lng);
            return distA - distB;
        });
    }

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-800">今の気分から探す</h3>
                <div className="flex flex-wrap gap-2 pb-2">
                    {Object.entries(TAG_MAP).map(([key, data]) => {
                        const Icon = data.icon
                        const isActive = activeTag === key
                        return (
                            <button
                                key={key}
                                onClick={() => setActiveTag(isActive ? null : key)}
                                className={cn(
                                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border",
                                    isActive
                                        ? `${data.activeColor} border-transparent shadow-sm scale-105`
                                        : `${data.color} border-transparent hover:border-slate-300 opacity-80 hover:opacity-100`
                                )}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {data.label}
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="space-y-3">
                {mode === 'must_visit' && items.length > 0 && (
                    <div className="bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg text-xs flex gap-2 items-center mb-4">
                        <MapPin className="w-4 h-4 shrink-0" />
                        <div>
                            <span className="font-bold">{items[0].spot_name}</span> を軸に、近い順に提案しています。
                        </div>
                    </div>
                )}
                {filteredRecommendations.map((spot) => {
                    const isNearby = baseSpot && calculateDistance(baseSpot.lat, baseSpot.lng, spot.lat, spot.lng) < 15;
                    // Dont show base spot in recommendations
                    if (baseSpot && spot.name === baseSpot.spot_name) return null;

                    return (
                        <div
                            key={spot.id}
                            className={cn("bg-white border rounded-xl p-3 shadow-sm hover:border-blue-300 transition-all hover:-translate-y-0.5 group cursor-pointer",
                                isNearby ? "border-emerald-200" : "border-slate-200"
                            )}
                            onClick={() => onItemClick?.(spot.placeId, spot.lat, spot.lng, spot.name)}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="font-bold text-slate-800 text-sm leading-tight flex items-center gap-1.5">
                                    {spot.name}
                                    {isNearby && <span className="text-[10px] font-medium px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-sm">近くにあり</span>}
                                </h4>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAddSpot?.(spot.name, spot.lat, spot.lng, spot.placeId)
                                    }}
                                    className="w-7 h-7 rounded-full bg-slate-50 flex flex-shrink-0 items-center justify-center text-slate-400 hover:bg-blue-500 hover:text-white transition-colors border border-slate-100 shadow-sm"
                                    title="旅程に追加"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-2 mb-2">{spot.desc}</p>

                            <div className="flex gap-1.5 flex-wrap">
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-sm font-medium">
                                    {spot.category}
                                </span>
                                {spot.tags.slice(0, 3).map(tagKey => {
                                    const tagData = TAG_MAP[tagKey as keyof typeof TAG_MAP]
                                    if (!tagData) return null
                                    const TagIcon = tagData.icon
                                    return (
                                        <span key={tagKey} className={cn("text-[10px] px-1.5 py-0.5 rounded-sm flex items-center gap-0.5", tagData.color)}>
                                            <TagIcon className="w-2.5 h-2.5" /> {tagData.label}
                                        </span>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
                {filteredRecommendations.length === 0 && (
                    <div className="py-8 text-center text-slate-500 text-sm">
                        条件に合うスポットが見つかりませんでした。
                    </div>
                )}
            </div>
        </div>
    )
}

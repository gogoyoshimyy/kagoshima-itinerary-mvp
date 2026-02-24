import { Plus, Umbrella, Users, Coffee } from "lucide-react"

export function RecommendationPanel() {
    const recommendations = [
        {
            id: "r1",
            name: "霧島神宮",
            category: "歴史",
            tags: ["family", "rain_ok"],
            desc: "神聖な空気が漂う南九州屈指のパワースポット。"
        },
        {
            id: "r2",
            name: "むじゃき 本店",
            category: "グルメ",
            tags: ["family"],
            desc: "名物「白くま」発祥の店。天文館での休憩に。"
        },
        {
            id: "r3",
            name: "いおワールドかごしま水族館",
            category: "レジャー",
            tags: ["family", "rain_ok"],
            desc: "ジンベエザメが泳ぐ黒潮大水槽は必見。"
        },
    ]

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-500">おすすめスポット</h3>

            <div className="space-y-3">
                {recommendations.map((spot) => (
                    <div key={spot.id} className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:border-blue-300 transition-colors group">
                        <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-slate-800 text-sm leading-tight">{spot.name}</h4>
                            <button
                                className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-blue-500 hover:text-white transition-colors"
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
                            {spot.tags.includes('rain_ok') && (
                                <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-sm flex items-center gap-0.5">
                                    <Umbrella className="w-3 h-3" /> 雨でもOK
                                </span>
                            )}
                            {spot.tags.includes('family') && (
                                <span className="text-[10px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded-sm flex items-center gap-0.5">
                                    <Users className="w-3 h-3" /> ファミリー
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

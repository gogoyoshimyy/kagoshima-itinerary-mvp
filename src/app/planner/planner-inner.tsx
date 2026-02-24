"use client"

import { useSearchParams } from "next/navigation"
import { MapPin, Navigation, Compass } from "lucide-react"
import { TripTimeline } from "@/components/planner/timeline/trip-timeline"
import { ItineraryScoreMeter } from "@/components/planner/itinerary-score-meter"
import { RecommendationPanel } from "@/components/planner/recommendation-panel"
import { ProgressConsultationCTA } from "@/components/planner/progress-cta"
import { PlannerMap } from "@/components/planner/planner-map"

export function PlannerInner() {
    const searchParams = useSearchParams()
    const days = searchParams.get('days') || '2'
    const mobility = searchParams.get('mobility') || 'car'

    return (
        <main className="flex-1 flex overflow-hidden">
            {/* Left Panel: Search & Recommendations */}
            <aside className="w-80 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
                <div className="p-4 border-b border-slate-200">
                    <h2 className="font-semibold flex items-center gap-2">
                        <Compass className="w-5 h-5 text-blue-500" />
                        スポットを探す
                    </h2>
                    {/* TODO: Search input */}
                    <div className="mt-4 h-10 bg-slate-100 rounded-md border border-slate-200 flex items-center px-3 text-sm text-slate-400">
                        検索バー (実装予定)
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <RecommendationPanel />
                </div>
            </aside>

            {/* Center Panel: Timeline & Builder */}
            <section className="flex-1 max-w-lg bg-slate-50 flex flex-col border-r border-slate-200">
                <header className="p-4 bg-white border-b border-slate-200 shadow-sm z-10">
                    <h1 className="text-xl font-bold text-slate-800">旅程ビルダー</h1>
                    <p className="text-sm text-slate-500">{days}日間 • {mobility === 'car' ? '車中心' : '公共交通中心'}</p>
                </header>

                <div className="flex-1 overflow-y-auto p-4 pb-32">
                    <TripTimeline />
                </div>

                {/* Bottom CTA Area */}
                <ProgressConsultationCTA />
            </section>

            {/* Right Panel: Map */}
            <section className="flex-1 bg-slate-200 hidden lg:block relative">
                <div className="absolute inset-0">
                    {/* Passing dummy items to the map for testing rendering */}
                    <PlannerMap items={[
                        { id: "1", day_index: 0, sort_order: 0, spot_name: "鹿児島中央駅 (出発)", lat: 31.5833, lng: 130.5417, stay_minutes: 0, travel_mode: 'car' },
                        { id: "2", day_index: 0, sort_order: 1, spot_name: "仙巌園", lat: 31.6178, lng: 130.5828, stay_minutes: 90, travel_mode: 'car' },
                    ]} />
                </div>

                {/* Floating Indicator / Score */}
                <div className="absolute top-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-sm border border-slate-200 z-10">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <span className="text-xs font-medium text-slate-500 block">総移動時間</span>
                            <span className="font-bold text-slate-800">1h 30m</span>
                        </div>
                        <div className="w-px h-8 bg-slate-200"></div>
                        <div>
                            <span className="text-xs font-medium text-slate-500 block">概算費用</span>
                            <span className="font-bold text-slate-800">¥ 1,500 ~ ¥ 3,000</span>
                        </div>
                    </div>

                    <ItineraryScoreMeter />
                </div>
            </section>
        </main>
    )
}

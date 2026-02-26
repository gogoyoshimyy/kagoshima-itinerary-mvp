"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { MapPin, Navigation, Compass, Plus, Search, Save, Clock } from "lucide-react"
import { TripTimeline } from "@/components/planner/timeline/trip-timeline"
import { ItineraryScoreMeter } from "@/components/planner/itinerary-score-meter"
import { RecommendationPanel } from "@/components/planner/recommendation-panel"
import { ProgressConsultationCTA } from "@/components/planner/progress-cta"
import { PlannerMap } from "@/components/planner/planner-map"
import { SpotDetailModal } from "@/components/planner/spot-detail-modal"
import { TripItem } from "@/types/planner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { saveTripAction } from "@/app/actions/trip"

const INITIAL_ITEMS: TripItem[] = [
    // Leave empty for now, let DB load or start blank.
]

export function PlannerInner({ initialTripId, initialItems }: { initialTripId?: string, initialItems?: TripItem[] }) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const days = searchParams.get('days') || '2'
    const mobility = searchParams.get('mobility') || 'car'
    const mode = searchParams.get('mode') || 'discover' // default to discover if none provided

    const [tripId, setTripId] = useState<string | null>(initialTripId || null)
    const [items, setItems] = useState<TripItem[]>(initialItems || INITIAL_ITEMS)
    const [isSaving, setIsSaving] = useState(false)
    const isInitialMount = useRef(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<Partial<TripItem>[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [selectedSpot, setSelectedSpot] = useState<{ placeId: string, lat: number, lng: number, spot_name: string } | null>(null)
    const [selectedInspirationSpots, setSelectedInspirationSpots] = useState<string[]>([])
    const [showDiscoverStartPoint, setShowDiscoverStartPoint] = useState(false)
    const [isSheetExpanded, setIsSheetExpanded] = useState(false)

    // Hardcoded inspiration spots for MVP Discovery Mode (with reliable picsum images)
    const INSPIRATION_SPOTS = useMemo(() => [
        { id: "spot1", name: "仙巌園", lat: 31.6183, lng: 130.5791, place_id: "ChIJWz9Bw7hnPjUReS_nJ2vC_7I", image: "https://picsum.photos/seed/sengan/400/300", tags: ["絶景", "歴史"] },
        { id: "spot2", name: "指宿砂むし温泉", lat: 31.2386, lng: 130.6432, place_id: "ChIJOwWjJk2DPPURx8_3XWvF-3g", image: "https://picsum.photos/seed/ibusuki/400/300", tags: ["リラックス", "ユニーク"] },
        { id: "spot3", name: "桜島", lat: 31.5833, lng: 130.6500, place_id: "ChIJk2hZ8nRnPjURmN_GWeI49u24", image: "https://picsum.photos/seed/sakura/400/300", tags: ["大自然", "絶景"] },
        { id: "spot4", name: "霧島神宮", lat: 31.8596, lng: 130.8703, place_id: "ChIJx23Fq8-KPzURX_GWeI49u24", image: "https://picsum.photos/seed/kirishima/400/300", tags: ["歴史", "パワースポット"] },
        { id: "spot5", name: "奄美大島", lat: 28.3734, lng: 129.4941, place_id: null, image: "https://picsum.photos/seed/amami/400/300", tags: ["海", "世界遺産"] },
        { id: "spot6", name: "屋久島", lat: 30.3396, lng: 130.5284, place_id: null, image: "https://picsum.photos/seed/yakushima/400/300", tags: ["森", "世界遺産"] },
        { id: "spot7", name: "知覧特攻平和会館", lat: 31.3653, lng: 130.4502, place_id: "ChIJEW9R3c6LPzURW_GWeI49u24", image: "https://picsum.photos/seed/chiran/400/300", tags: ["歴史", "学び"] },
        { id: "spot8", name: "城山展望台", lat: 31.5977, lng: 130.5516, place_id: null, image: "https://picsum.photos/seed/shiroyama/400/300", tags: ["絶景", "夜景"] },
        { id: "spot9", name: "長崎鼻", lat: 31.1578, lng: 130.5841, place_id: "ChIJ61vjG1R3PPURX_GWeI49u24", image: "https://picsum.photos/seed/nagasakibana/400/300", tags: ["絶景", "海"] },
        { id: "spot10", name: "池田湖", lat: 31.2294, lng: 130.5471, place_id: "ChIJbY4nC4J8PPURX_GWeI49u24", image: "https://picsum.photos/seed/ikedako/400/300", tags: ["湖", "自然"] },
    ], [])

    // DB Auto-save effect
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false
            return
        }

        const autoSave = async () => {
            setIsSaving(true)
            const res = await saveTripAction(tripId, items)
            if (res.success && res.tripId && res.tripId !== tripId) {
                setTripId(res.tripId)
                // Update URL silently
                router.replace(`/planner/${res.tripId}`)
            }
            setIsSaving(false)
        }

        const timeout = setTimeout(autoSave, 1500) // Debounce save by 1.5s
        return () => clearTimeout(timeout)
    }, [items, tripId, router])

    const handleAddSpot = (spotName: string, lat?: number, lng?: number, placeId?: string | null, insertAtStart: boolean = false) => {
        const newItem: TripItem = {
            id: `spot-${Date.now()}`,
            day_index: 0,
            sort_order: insertAtStart ? 0 : items.length,
            spot_name: spotName,
            lat: lat || 31.5969, // Fallback to Kagoshima center
            lng: lng || 130.5571,
            stay_minutes: 60,
            travel_mode: 'car',
            place_id: placeId || null
        }
        setItems(prev => {
            if (insertAtStart) {
                return [newItem, ...prev.map((item, i) => ({ ...item, sort_order: i + 1 }))]
            }
            return [...prev, newItem]
        })
        // Clear search state after adding
        setSearchQuery("")
        setSearchResults([])
    }

    const addPlaceholder = (type: 'lunch_placeholder' | 'dinner_placeholder') => {
        const title = type === 'lunch_placeholder' ? '🍽️ ランチのおすすめを追加...' : '🍻 夕食のおすすめを追加...'
        const newItem: TripItem = {
            id: `placeholder-${Date.now()}`,
            day_index: 0,
            sort_order: items.length,
            spot_name: title,
            lat: 31.5969, // Default Kagoshima center
            lng: 130.5571,
            stay_minutes: 60,
            travel_mode: 'car',
            type: type
        }
        setItems(prev => [...prev, newItem])
    }

    const handleSearchAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!searchQuery.trim()) return

        setIsSearching(true)
        try {
            // Call the server action to search Google Places
            const { searchPlaces } = await import('@/app/actions/places')
            const results = await searchPlaces(searchQuery)
            setSearchResults(results)

            // If no results, maybe just add it manually or show a message?
            if (results.length === 0) {
                handleAddSpot(searchQuery)
            }
        } catch (error) {
            console.error("Search failed, falling back to manual add", error)
            handleAddSpot(searchQuery)
        } finally {
            setIsSearching(false)
        }
    }

    const handleRemoveSpot = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id))
    }

    return (
        <main className="flex-1 flex flex-col lg:flex-row overflow-hidden h-full">
            {/* Left Panel: Search & Recommendations */}
            <aside className="w-80 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col hidden lg:flex">
                <div className="p-4 border-b border-slate-200">
                    <h2 className="font-semibold flex items-center gap-2">
                        <Compass className="w-5 h-5 text-blue-500" />
                        スポットを探す
                    </h2>
                    {/* Search Input */}
                    <div className="relative mt-4">
                        <form onSubmit={handleSearchAdd} className="flex gap-2">
                            <Input
                                placeholder="スポット名で検索"
                                className="text-sm bg-slate-50"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                disabled={isSearching}
                            />
                            <Button disabled={isSearching} type="submit" size="icon" variant="secondary" className="shrink-0 bg-blue-50 text-blue-600 hover:bg-blue-100">
                                {isSearching ? <span className="animate-spin text-lg block border-2 border-blue-600 border-t-transparent rounded-full w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            </Button>
                        </form>

                        {/* Search Results Dropdown */}
                        {searchResults.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-auto">
                                {searchResults.map((result) => (
                                    <button
                                        key={result.id}
                                        onClick={() => handleAddSpot(result.spot_name!, result.lat, result.lng, result.place_id)}
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 border-b border-slate-100 last:border-0"
                                    >
                                        <p className="font-medium text-slate-800">{result.spot_name}</p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <RecommendationPanel
                        onAddSpot={handleAddSpot}
                        onItemClick={(placeId, lat, lng, name) => setSelectedSpot({ placeId, lat, lng, spot_name: name })}
                        mode={mode}
                        items={items}
                    />
                </div>
            </aside>

            <SpotDetailModal
                placeId={selectedSpot?.placeId || null}
                onClose={() => setSelectedSpot(null)}
            />

            {/* Center Panel: Timeline & Builder */}
            <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden relative">
                <section className={`lg:flex-[2] lg:max-w-lg bg-slate-50 flex flex-col border-r border-slate-200 transition-all duration-300 ease-in-out ${items.length > 0 ? (isSheetExpanded ? 'flex-none h-[85%] z-20 shadow-[0_-8px_30px_rgb(0,0,0,0.12)]' : 'flex-none h-[50%] z-0') : 'flex-1 h-full'} lg:h-full order-2 lg:order-1 overflow-hidden`}>
                    {items.length > 0 && (
                        /* Mobile Drag Handle */
                        <div
                            className="lg:hidden w-full flex flex-col items-center pt-2 pb-1 bg-white border-b border-slate-100 flex-shrink-0 cursor-pointer hover:bg-slate-50 active:bg-slate-100 transition-colors"
                            onClick={() => setIsSheetExpanded(!isSheetExpanded)}
                        >
                            <div className="w-10 h-1 bg-slate-200 rounded-full mb-1"></div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{isSheetExpanded ? '閉じる' : '旅程を見る'}</span>
                        </div>
                    )}
                    <div className="flex-1 overflow-y-auto flex flex-col">
                        {items.length === 0 ? (
                            mode === 'schedule' ? (
                                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8 overflow-y-auto bg-white/40 backdrop-blur-sm">
                                    <div className="space-y-4">
                                        <div className="w-20 h-20 bg-blue-600 text-white rounded-3xl flex items-center justify-center shadow-xl mx-auto rotate-3 group-hover:rotate-0 transition-transform">
                                            <Clock className="w-10 h-10" />
                                        </div>
                                        <div className="space-y-2">
                                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">スケジュールを埋める</h2>
                                            <p className="text-slate-500 text-base max-w-sm mx-auto font-medium">
                                                旅の「枠組み」から始めましょう。<br />出発と到着の場所・時間を教えてください。
                                            </p>
                                        </div>
                                    </div>

                                    <form onSubmit={async (e) => {
                                        e.preventDefault()
                                        const form = e.currentTarget as HTMLFormElement
                                        const startSpotStr = (form.elements.namedItem('start_spot') as HTMLInputElement).value
                                        const endSpotStr = (form.elements.namedItem('end_spot') as HTMLInputElement).value

                                        if (startSpotStr.trim() && endSpotStr.trim()) {
                                            setIsSearching(true)
                                            try {
                                                const { searchPlaces } = await import('@/app/actions/places')

                                                // Search for start spot
                                                const startResults = await searchPlaces(startSpotStr)
                                                const startData = startResults.length > 0 ? startResults[0] : null
                                                const startLat = startData?.lat || 31.8020
                                                const startLng = startData?.lng || 130.7194
                                                const startPlaceId = startData?.place_id || null

                                                // Search for end spot
                                                const endResults = await searchPlaces(endSpotStr)
                                                const endData = endResults.length > 0 ? endResults[0] : null
                                                const endLat = endData?.lat || 31.5969
                                                const endLng = endData?.lng || 130.5571
                                                const endPlaceId = endData?.place_id || null

                                                // Ensure standard order execution
                                                handleAddSpot(startData?.spot_name || startSpotStr, startLat, startLng, startPlaceId, true)

                                                setTimeout(() => {
                                                    setItems(prev => {
                                                        const endItem: TripItem = {
                                                            id: `spot-${Date.now()}`,
                                                            day_index: 0,
                                                            sort_order: prev.length,
                                                            spot_name: endData?.spot_name || endSpotStr,
                                                            lat: endLat,
                                                            lng: endLng,
                                                            stay_minutes: 60,
                                                            travel_mode: 'car',
                                                            place_id: endPlaceId
                                                        };
                                                        return [...prev, endItem];
                                                    });
                                                }, 10);
                                            } catch (error) {
                                                console.error("Failed to search start/end spots", error)
                                            } finally {
                                                setIsSearching(false)
                                            }
                                        }
                                    }} className="w-full max-w-md bg-white shadow-md p-6 rounded-2xl border border-slate-100 mt-4 text-left space-y-4">

                                        <div className="space-y-3 relative p-4 bg-slate-50 rounded-xl border border-slate-200">
                                            <div className="absolute top-8 bottom-8 left-[1.1rem] w-0.5 bg-slate-300 border-l border-dashed border-slate-400"></div>

                                            <div className="relative z-10">
                                                <label className="text-xs font-bold text-slate-700 mb-1.5 block flex items-center gap-1.5">
                                                    <div className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px]">A</div>
                                                    出発（スタート地点）
                                                </label>
                                                <div className="flex gap-2">
                                                    <Input name="start_time" type="time" defaultValue="10:00" className="w-28 bg-white" required />
                                                    <Input name="start_spot" placeholder="例：鹿児島空港" className="flex-1 bg-white" required />
                                                </div>
                                            </div>

                                            <div className="py-2 pl-7">
                                                <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200 shadow-sm shadow-slate-100">この間のルートを作成</span>
                                            </div>

                                            <div className="relative z-10">
                                                <label className="text-xs font-bold text-slate-700 mb-1.5 block flex items-center gap-1.5">
                                                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">B</div>
                                                    到着（ゴール地点）
                                                </label>
                                                <div className="flex gap-2">
                                                    <Input name="end_time" type="time" defaultValue="18:00" className="w-28 bg-white" required />
                                                    <Input name="end_spot" placeholder="例：指宿のホテル" className="flex-1 bg-white" required />
                                                </div>
                                            </div>
                                        </div>

                                        <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold mt-2">
                                            ルート作成を始める
                                        </Button>
                                    </form>
                                </div>
                            ) : mode === 'must_visit' ? (
                                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8 bg-white/40 backdrop-blur-sm">
                                    <div className="space-y-4">
                                        <div className="w-20 h-20 bg-emerald-600 text-white rounded-3xl flex items-center justify-center shadow-xl mx-auto -rotate-3 group-hover:rotate-0 transition-transform">
                                            <MapPin className="w-10 h-10" />
                                        </div>
                                        <div className="space-y-2">
                                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">絶対行きたい場所から</h2>
                                            <p className="text-slate-500 text-base max-w-sm mx-auto font-medium">
                                                今回の旅の「主役」を教えてください。<br />そこを中心にAIがルートを組み立てます。
                                            </p>
                                        </div>
                                    </div>

                                    <form onSubmit={(e) => {
                                        e.preventDefault()
                                        if (searchQuery.trim()) {
                                            handleSearchAdd(e)
                                        }
                                    }} className="w-full max-w-md bg-white shadow-md p-4 rounded-2xl border border-slate-100 mt-4 text-left">
                                        <div className="flex gap-2 relative">
                                            <Input
                                                name="must_visit_search"
                                                placeholder="例：仙巌園、砂むし温泉..."
                                                className="h-12 text-base bg-slate-50 border-slate-200"
                                                disabled={isSearching}
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                            <Button disabled={isSearching} type="submit" size="icon" className="h-12 w-12 shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                                                {isSearching ? <span className="animate-spin text-lg block border-2 border-white border-t-transparent rounded-full w-5 h-5" /> : <Search className="w-5 h-5" />}
                                            </Button>

                                            {/* Search Results Dropdown */}
                                            {searchResults.length > 0 && (
                                                <div className="absolute top-full left-0 mt-2 w-[calc(100%-3.5rem)] bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-auto z-50">
                                                    {searchResults.map((result) => (
                                                        <button
                                                            key={result.id}
                                                            type="button"
                                                            onClick={() => handleAddSpot(result.spot_name!, result.lat, result.lng, result.place_id)}
                                                            className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors"
                                                        >
                                                            <p className="font-semibold text-slate-800">{result.spot_name}</p>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-4 text-xs text-left text-slate-500 flex items-center gap-1.5">
                                            <div className="w-4 h-4 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-[10px] shrink-0">✨</div>
                                            スポットを追加すると、その周辺のルート候補が提案されます
                                        </div>
                                    </form>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col p-8 overflow-y-auto">
                                    <div className="text-center space-y-4 mb-10 mt-6">
                                        <div className="w-20 h-20 bg-rose-600 text-white rounded-3xl flex items-center justify-center shadow-xl mx-auto rotate-6 group-hover:rotate-0 transition-transform">
                                            <Compass className="w-10 h-10" />
                                        </div>
                                        <div className="space-y-2">
                                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">インスピレーションから</h2>
                                            <p className="text-slate-500 text-base max-w-sm mx-auto font-medium">
                                                直感で行きたい場所を選んでください。<br />AIがあなただけの物語（ルート）を紡ぎます。
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-20">
                                        {INSPIRATION_SPOTS.map((spot) => {
                                            const isSelected = selectedInspirationSpots.includes(spot.id)
                                            return (
                                                <button
                                                    key={spot.id}
                                                    onClick={() => {
                                                        setSelectedInspirationSpots(prev =>
                                                            prev.includes(spot.id)
                                                                ? prev.filter(id => id !== spot.id)
                                                                : [...prev, spot.id]
                                                        )
                                                    }}
                                                    className={`relative flex flex-col items-start rounded-2xl border-2 transition-all shadow-sm text-left overflow-hidden h-48 w-full
                                                ${isSelected
                                                            ? 'border-blue-500 shadow-lg transform scale-95'
                                                            : 'border-slate-100 bg-white hover:border-blue-200 hover:shadow-md'
                                                        }`}
                                                >
                                                    <div className="absolute inset-0 w-full h-full">
                                                        <img src={spot.image} alt={spot.name} className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                                                    </div>

                                                    {isSelected && (
                                                        <div className="absolute top-3 right-3 w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-md z-10">
                                                            <span className="text-sm font-bold">✓</span>
                                                        </div>
                                                    )}

                                                    <div className="relative z-10 mt-auto p-4 w-full">
                                                        <h3 className="font-bold text-white mb-2 leading-tight drop-shadow-md text-lg">{spot.name}</h3>
                                                        <div className="flex flex-wrap gap-1">
                                                            {spot.tags.map(tag => (
                                                                <span key={tag} className="text-[10px] px-2 py-0.5 bg-black/40 text-white/90 backdrop-blur-sm rounded-full border border-white/20">
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </button>
                                            )
                                        })}
                                    </div>

                                    {/* Floating Generate Button */}
                                    {selectedInspirationSpots.length > 0 && !showDiscoverStartPoint && (
                                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-4rem)] max-w-md animate-in slide-in-from-bottom-5 fade-in duration-200 z-10">
                                            <button
                                                onClick={() => {
                                                    setShowDiscoverStartPoint(true)
                                                }}
                                                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-6 rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95"
                                            >
                                                <div className="bg-white/20 px-2 py-0.5 rounded-md text-sm">
                                                    {selectedInspirationSpots.length}
                                                </div>
                                                <span>次へ（出発地点を決める） ✨</span>
                                            </button>
                                        </div>
                                    )}

                                    {/* Start Point Selection Block (Slide over) */}
                                    {showDiscoverStartPoint && (
                                        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in-95 duration-200">
                                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-6">
                                                <Compass className="w-8 h-8" />
                                            </div>
                                            <h2 className="text-xl font-bold text-slate-800 mb-2">どこから出発しますか？</h2>
                                            <p className="text-slate-500 text-sm max-w-xs mx-auto mb-8">
                                                出発地を決めると、選んだスポットを巡る最適なルートが生成されます。
                                            </p>

                                            <form onSubmit={async (e) => {
                                                e.preventDefault()
                                                const form = e.currentTarget as HTMLFormElement
                                                const startSpotStr = (form.elements.namedItem('start_spot') as HTMLInputElement).value

                                                if (startSpotStr.trim()) {
                                                    setIsSearching(true)
                                                    try {
                                                        const { searchPlaces } = await import('@/app/actions/places')
                                                        const startResults = await searchPlaces(startSpotStr)
                                                        const startData = startResults.length > 0 ? startResults[0] : null

                                                        const startLat = startData?.lat || 31.8020
                                                        const startLng = startData?.lng || 130.7194
                                                        const startPlaceId = startData?.place_id || null

                                                        const spotsToAdd = INSPIRATION_SPOTS.filter(s => selectedInspirationSpots.includes(s.id))

                                                        setItems(prev => {
                                                            const startItem: TripItem = {
                                                                id: `spot-${Date.now()}-start`,
                                                                day_index: 0,
                                                                sort_order: 0,
                                                                spot_name: startData?.spot_name || startSpotStr,
                                                                lat: startLat,
                                                                lng: startLng,
                                                                stay_minutes: 0,
                                                                travel_mode: 'car' as const,
                                                                place_id: startPlaceId
                                                            }

                                                            const newItems = spotsToAdd.map((spot, index) => ({
                                                                id: `spot-${Date.now()}-${index}`,
                                                                day_index: 0,
                                                                sort_order: index + 1,
                                                                spot_name: spot.name,
                                                                lat: spot.lat,
                                                                lng: spot.lng,
                                                                stay_minutes: 60,
                                                                travel_mode: 'car' as const,
                                                                place_id: spot.place_id
                                                            }))

                                                            return [startItem, ...newItems]
                                                        })
                                                        setShowDiscoverStartPoint(false)
                                                    } catch (error) {
                                                        console.error("Failed to set discover start spot", error)
                                                    } finally {
                                                        setIsSearching(false)
                                                    }
                                                }
                                            }} className="w-full max-w-sm">
                                                <div className="space-y-4">
                                                    <Input
                                                        name="start_spot"
                                                        placeholder="例：鹿児島空港、鹿児島中央駅..."
                                                        className="h-12 text-center bg-white border-slate-200 text-base"
                                                        required
                                                        disabled={isSearching}
                                                        autoFocus
                                                    />
                                                    <div className="flex gap-2">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            className="flex-1 h-12"
                                                            onClick={() => setShowDiscoverStartPoint(false)}
                                                            disabled={isSearching}
                                                        >
                                                            戻る
                                                        </Button>
                                                        <Button type="submit" className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold" disabled={isSearching}>
                                                            {isSearching ? <span className="animate-spin text-lg block border-2 border-white border-t-transparent rounded-full w-5 h-5 mx-auto" /> : "ルート生成"}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                    )}
                                </div>
                            )
                        ) : mode === 'must_visit' && items.length === 1 ? (
                            // In must_visit mode, after adding the first spot, ask for the starting point
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
                                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
                                    <Compass className="w-8 h-8" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-xl font-bold text-slate-800">どこから旅を始めますか？</h2>
                                    <p className="text-slate-500 text-sm max-w-xs mx-auto">
                                        出発地点を選ぶとスケジュール作成がスタートします。
                                    </p>
                                </div>
                                <div className="w-full max-w-sm space-y-3">
                                    <button
                                        onClick={() => handleAddSpot("鹿児島空港", 31.8020, 130.7194, "ChIJHzoFvM1uPjURFbQ5_n3F3W0", true)}
                                        className="w-full bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-700 font-medium py-3 px-4 rounded-xl flex items-center justify-between transition-colors shadow-sm"
                                    >
                                        <span className="flex items-center gap-2">🛫 鹿児島空港から出発</span>
                                        <Plus className="w-4 h-4 text-slate-400" />
                                    </button>
                                    <button
                                        onClick={() => handleAddSpot("鹿児島中央駅", 31.5838, 130.5414, "ChIJsYyI0VhnPjUR1_GWeI49u24", true)}
                                        className="w-full bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-700 font-medium py-3 px-4 rounded-xl flex items-center justify-between transition-colors shadow-sm"
                                    >
                                        <span className="flex items-center gap-2">🚄 鹿児島中央駅から出発</span>
                                        <Plus className="w-4 h-4 text-slate-400" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            // Focus search input or just prompt user
                                            const searchInput = document.querySelector('input[placeholder="スポット名で検索"]') as HTMLInputElement;
                                            if (searchInput) searchInput.focus();
                                        }}
                                        className="w-full bg-slate-50 border border-transparent hover:bg-slate-100 text-slate-600 font-medium py-3 px-4 rounded-xl flex items-center justify-center transition-colors"
                                    >
                                        その他の場所から出発（検索）
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <header className="p-4 bg-white border-b border-slate-200 shadow-sm z-10 flex justify-between items-center">
                                    <h1 className="text-xl font-bold text-slate-800">旅程ビルダー</h1>
                                    {isSaving ? (
                                        <div className="flex items-center gap-1 text-xs text-slate-400">
                                            <span className="animate-spin border-2 border-slate-400 border-t-transparent rounded-full w-3 h-3 block" />
                                            保存中...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 text-xs text-slate-400">
                                            <Save className="w-3 h-3" />
                                            保存済み
                                        </div>
                                    )}
                                </header>
                                <p className="px-4 pt-4 text-sm text-slate-500">{days}日間 • {mobility === 'car' ? '車中心' : '公共交通中心'}</p>

                                <div className="flex-1 overflow-y-auto p-4 pb-32">
                                    <TripTimeline
                                        items={items}
                                        setItems={setItems}
                                        onRemoveItem={handleRemoveSpot}
                                        onItemClick={(placeId, lat, lng, name) => setSelectedSpot({ placeId, lat, lng, spot_name: name })}
                                    />

                                    {/* Dining Options Insertion Buttons */}
                                    <div className="mt-8 mb-4 flex gap-3 px-2">
                                        <button
                                            className="flex-1 flex items-center justify-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 py-3 rounded-xl font-medium transition-colors"
                                            onClick={() => addPlaceholder('lunch_placeholder')}
                                        >
                                            <span className="text-lg">🍽️</span> ランチを追加
                                        </button>
                                        <button
                                            className="flex-1 flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 py-3 rounded-xl font-medium transition-colors"
                                            onClick={() => addPlaceholder('dinner_placeholder')}
                                        >
                                            <span className="text-lg">🍻</span> 夕食を追加
                                        </button>
                                    </div>
                                </div>

                                <ProgressConsultationCTA />
                            </>
                        )}
                    </div>
                </section>

                {/* Right Panel: Map */}
                <section className={`flex-1 lg:flex-[3] relative bg-slate-200 transition-all duration-300 ${items.length > 0 ? 'block lg:h-full' : 'hidden lg:block'} order-1 lg:order-2`}>
                    <div className="absolute inset-0">
                        <PlannerMap items={items} previewSpot={selectedSpot} />
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
            </div>
        </main>
    )
}

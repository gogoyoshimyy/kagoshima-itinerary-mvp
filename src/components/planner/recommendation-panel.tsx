"use client"

import { useState, useMemo } from "react"
import { Plus, Umbrella, Users, Coffee, Camera, BookOpen, Sparkles, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

import { TripItem } from "@/types/planner"
import { RegionId } from "@/components/planner/area-selector"
import spotsData from "@/data/spots_full_with_regions.json"

interface RecommendationPanelProps {
    onAddSpot?: (spotName: string, lat?: number, lng?: number, placeId?: string) => void;
    onItemClick?: (placeId: string, lat: number, lng: number, name: string) => void;
    mode?: string;
    items?: TripItem[];
    selectedArea?: RegionId;
}

const TAG_MAP = {
    "family": { label: "ファミリー", icon: Users, color: "text-orange-600 bg-orange-50", activeColor: "bg-orange-600 text-white" },
    "rain_ok": { label: "雨でもOK", icon: Umbrella, color: "text-blue-600 bg-blue-50", activeColor: "bg-blue-600 text-white" },
    "scenic": { label: "絶景・自然", icon: Camera, color: "text-green-600 bg-green-50", activeColor: "bg-green-600 text-white" },
    "food": { label: "名物グルメ", icon: Coffee, color: "text-red-600 bg-red-50", activeColor: "bg-red-600 text-white" },
    "history": { label: "歴史・文化", icon: BookOpen, color: "text-purple-600 bg-purple-50", activeColor: "bg-purple-600 text-white" },
    "relax": { label: "癒やし・温泉", icon: Sparkles, color: "text-teal-600 bg-teal-50", activeColor: "bg-teal-600 text-white" },
}

export function RecommendationPanel({ onAddSpot, onItemClick, mode = 'discover', items = [], selectedArea = 'all' }: RecommendationPanelProps) {
    const [activeTag, setActiveTag] = useState<string | null>(null)

    // Filter by area first, then we can take a subset for performance
    const filteredByArea = useMemo(() => {
        if (selectedArea === 'all') return spotsData;
        return spotsData.filter(spot => spot.region === (selectedArea as string));
    }, [selectedArea]);

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

    const finalRecommendations = useMemo(() => {
        let sorted = [...filteredByArea];

        // If must_visit mode and a base spot exists, sort by distance
        if (mode === 'must_visit' && items.length > 0) {
            const baseSpot = items[0];
            sorted.sort((a, b) => {
                if (a.lat === 0 || b.lat === 0) return 0;
                const distA = calculateDistance(baseSpot.lat, baseSpot.lng, a.lat, a.lng);
                const distB = calculateDistance(baseSpot.lat, baseSpot.lng, b.lat, b.lng);
                return distA - distB;
            });
        }

        // Limit to reasonable amount
        return sorted.slice(0, 30);
    }, [filteredByArea, mode, items]);

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-800">おすすめスポット</h3>
                <p className="text-[10px] text-slate-400">
                    {selectedArea === 'all' ? '鹿児島全域' : `エリア: ${selectedArea}`} から表示中
                </p>
            </div>

            <div className="space-y-3">
                {finalRecommendations.map((spot) => (
                    <div
                        key={spot.id}
                        className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:border-blue-300 transition-all hover:-translate-y-0.5 group cursor-pointer"
                        onClick={() => onItemClick?.(spot.place_id || '', spot.lat, spot.lng, spot.name)}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-slate-800 text-sm leading-tight flex items-center gap-1.5">
                                {spot.name}
                                {spot.lat !== 0 && <span className="text-[10px] font-medium px-1.5 py-0.5 bg-blue-50 text-blue-500 rounded-sm">MAP可</span>}
                            </h4>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAddSpot?.(spot.name, spot.lat, spot.lng, spot.place_id || undefined)
                                }}
                                className="w-7 h-7 rounded-full bg-slate-50 flex flex-shrink-0 items-center justify-center text-slate-400 hover:bg-blue-500 hover:text-white transition-colors border border-slate-100 shadow-sm"
                                title="旅程に追加"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 mb-2">{spot.description}</p>

                        <div className="flex gap-1.5 flex-wrap">
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-sm font-medium">
                                {spot.category}
                            </span>
                        </div>
                    </div>
                ))}
                {finalRecommendations.length === 0 && (
                    <div className="py-8 text-center text-slate-500 text-sm">
                        条件に合うスポットが見つかりませんでした。
                    </div>
                )}
            </div>
        </div>
    )
}

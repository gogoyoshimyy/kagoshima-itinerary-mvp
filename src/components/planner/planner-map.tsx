"use client"

import dynamic from 'next/dynamic'
import { TripItem, TripSegment } from "@/types/planner"
import { MapPin } from "lucide-react"

const PlannerMapClient = dynamic(() => import('./planner-map-client'), {
    ssr: false,
    loading: () => (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-200 text-slate-400 flex-col gap-2">
            <MapPin className="w-8 h-8 opacity-50" />
            <span>Loading Map...</span>
        </div>
    )
})

interface PlannerMapProps {
    items: TripItem[]
    segments?: TripSegment[]
    polylines?: string[] // unused in leaflet MVP
    previewSpot?: { lat: number, lng: number, spot_name: string } | null
}

export function PlannerMap({ items, segments, polylines, previewSpot }: PlannerMapProps) {
    return <PlannerMapClient items={items} segments={segments} polylines={polylines} previewSpot={previewSpot} />
}

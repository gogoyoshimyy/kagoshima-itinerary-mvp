"use client"

import { useState } from "react"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from "@dnd-kit/core"
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy
} from "@dnd-kit/sortable"
import { SortableItem } from "./sortable-item"
import { TripItem } from "@/types/planner"
import { Clock, MapPin, X } from "lucide-react"

interface TripTimelineProps {
    items: TripItem[]
    setItems: React.Dispatch<React.SetStateAction<TripItem[]>>
    onRemoveItem: (id: string) => void
    onItemClick?: (id: string, lat: number, lng: number, name: string) => void
}

export function TripTimeline({ items, setItems, onRemoveItem, onItemClick }: TripTimelineProps) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // minimum drag distance before activation
            }
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const [isUpdating, setIsUpdating] = useState<string | null>(null)

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.findIndex(i => i.id === active.id)
                const newIndex = items.findIndex(i => i.id === over.id)
                return arrayMove(items, oldIndex, newIndex).map((item, idx) => ({
                    ...item,
                    sort_order: idx
                }))
            })
        }
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={items.map(i => i.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="space-y-4">
                    <div className="p-4 bg-white shadow-sm rounded-xl border border-slate-200">
                        <h3 className="font-semibold text-slate-800 mb-4 sticky top-0 bg-white z-10 py-2 border-b border-slate-100">1日目</h3>

                        <div className="space-y-0 relative">
                            {/* Vertical Timeline Line */}
                            <div className="absolute left-4 top-4 bottom-4 w-px bg-slate-200 -z-10 h-[calc(100%-2rem)]" />

                            {items.map((item, index) => {
                                // Calculate distance and time to the NEXT item
                                let segmentInfo = null;
                                if (index < items.length - 1) {
                                    const nextItem = items[index + 1]

                                    // Haversine formula for rough distance calculation
                                    const R = 6371 // Radius of the earth in km
                                    const dLat = (nextItem.lat - item.lat) * Math.PI / 180
                                    const dLon = (nextItem.lng - item.lng) * Math.PI / 180
                                    const a =
                                        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                                        Math.cos(item.lat * Math.PI / 180) * Math.cos(nextItem.lat * Math.PI / 180) *
                                        Math.sin(dLon / 2) * Math.sin(dLon / 2)
                                    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
                                    const distanceStraight = R * c // Distance in km

                                    // Rough real-world estimation: multiply by 1.4 for road curvature
                                    const distanceKm = distanceStraight * 1.4

                                    // Assume average speed of 40km/h (city/local driving)
                                    const timeMinutes = Math.round((distanceKm / 40) * 60)

                                    segmentInfo = {
                                        distance: distanceKm.toFixed(1),
                                        time: timeMinutes
                                    }
                                }

                                return (
                                    <div key={item.id} className="relative group/item">

                                        <SortableItem id={item.id}>
                                            <div
                                                className={`flex justify-between items-start pr-6 p-2 -ml-2 rounded-md transition-colors cursor-pointer ${item.type === 'lunch_placeholder' ? 'bg-orange-50 hover:bg-orange-100 border border-orange-200' :
                                                    item.type === 'dinner_placeholder' ? 'bg-indigo-50 hover:bg-indigo-100 border border-indigo-200' :
                                                        'hover:bg-slate-50'
                                                    }`}
                                                onClick={() => {
                                                    if (item.type === 'lunch_placeholder' || item.type === 'dinner_placeholder') {
                                                        // Placeholder logic opens a budget modal or just alerts for now
                                                        alert("予算を入力してAIにおすすめを提案させます（プロトタイプ準備中）")
                                                    } else if (onItemClick && item.place_id) {
                                                        onItemClick(item.place_id, item.lat, item.lng, item.spot_name)
                                                    }
                                                }}
                                            >
                                                <div className="w-full">
                                                    <h4 className={`font-medium text-sm flex items-center gap-1.5 transition-colors ${item.type === 'lunch_placeholder' ? 'text-orange-700' :
                                                        item.type === 'dinner_placeholder' ? 'text-indigo-700' :
                                                            'text-slate-800 hover:text-blue-600'
                                                        }`}>
                                                        {item.type === 'lunch_placeholder' ? <span className="text-base">🍽️</span> :
                                                            item.type === 'dinner_placeholder' ? <span className="text-base">🍻</span> :
                                                                <MapPin className="w-3.5 h-3.5 text-blue-500" />}
                                                        {item.spot_name}
                                                    </h4>

                                                    {(item.type === 'lunch_placeholder' || item.type === 'dinner_placeholder') && (
                                                        <div className="mt-2 flex gap-2 w-full">
                                                            <input
                                                                type="text"
                                                                placeholder="例: 1000円〜"
                                                                className="text-xs px-2 py-1 rounded border min-w-0 flex-1 focus:outline-none focus:ring-1"
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                            <button
                                                                disabled={isUpdating === item.id}
                                                                className={`text-xs px-2 py-1 rounded text-white font-medium flex items-center gap-1 ${item.type === 'lunch_placeholder' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-indigo-500 hover:bg-indigo-600'} disabled:opacity-50`}
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    setIsUpdating(item.id)

                                                                    // Mock AI recommendation logic
                                                                    setTimeout(() => {
                                                                        setItems(prev => prev.map(i => {
                                                                            if (i.id === item.id) {
                                                                                // Replace placeholder with a mock restaurant
                                                                                return {
                                                                                    ...i,
                                                                                    type: 'spot', // change back to standard spot
                                                                                    spot_name: i.type === 'lunch_placeholder' ? "黒豚料理 寿庵 (AI提案)" : "しろくま むじゃき (AI提案)",
                                                                                    lat: i.type === 'lunch_placeholder' ? 31.5842 : 31.5881,
                                                                                    lng: i.type === 'lunch_placeholder' ? 130.5428 : 130.5555,
                                                                                    stay_minutes: i.type === 'lunch_placeholder' ? 60 : 90,
                                                                                }
                                                                            }
                                                                            return i
                                                                        }))
                                                                        setIsUpdating(null)
                                                                    }, 1500)
                                                                }}
                                                            >
                                                                {isUpdating === item.id ? (
                                                                    <span className="animate-spin text-lg block border-2 border-white border-t-transparent rounded-full w-3 h-3" />
                                                                ) : null}
                                                                おすすめを検索
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                                {item.type !== 'lunch_placeholder' && item.type !== 'dinner_placeholder' && (
                                                    item.stay_minutes > 0 ? (
                                                        <div className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0 ml-2">
                                                            <Clock className="w-3 h-3 inline pb-[1px]" />
                                                            {item.stay_minutes}分滞在
                                                        </div>
                                                    ) : (
                                                        <div className="text-xs font-medium text-slate-400 shrink-0 ml-2">出発地点</div>
                                                    )
                                                )}
                                            </div>
                                        </SortableItem>

                                        {/* Delete Button */}
                                        <button
                                            onClick={() => onRemoveItem(item.id)}
                                            className="absolute right-2 top-3 p-1.5 text-slate-400 opacity-0 group-hover/item:opacity-100 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                                            title="スポットを削除"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>

                                        {/* Distance & Time Segment Info */}
                                        {segmentInfo && (
                                            <div className="pl-6 py-2 flex flex-col gap-1 items-start text-xs text-slate-500 ml-4 mb-3 border-l-2 border-dashed border-blue-200">
                                                <div className="bg-slate-50 px-2 py-1 flex items-center gap-2 rounded-md shadow-sm border border-slate-100 ml-2">
                                                    <span className="font-semibold text-slate-600">約{segmentInfo.time}分</span>
                                                    <span className="text-slate-400">•</span>
                                                    <span>{segmentInfo.distance}km</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>

                        {/* Drop placeholder text if empty */}
                        {items.length === 0 && (
                            <div className="text-center py-8 text-sm text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
                                スポットがありません。<br />検索やおすすめから追加してください。
                            </div>
                        )}

                    </div>
                </div>
            </SortableContext>
        </DndContext>
    )
}

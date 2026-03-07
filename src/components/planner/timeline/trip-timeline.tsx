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
import { TripItem, TripSegment } from "@/types/planner"
import { Clock, MapPin, X } from "lucide-react"

interface TripTimelineProps {
    items: TripItem[]
    segments: TripSegment[]
    setItems: React.Dispatch<React.SetStateAction<TripItem[]>>
    onRemoveItem: (id: string) => void
    onItemClick?: (id: string, lat: number, lng: number, name: string) => void
}

const DAY_LABELS = ['1日目', '2日目', '3日目', '4日目', '5日目', '6日目', '7日目']
const DAY_COLORS = [
    'from-blue-500 to-indigo-500',
    'from-emerald-500 to-teal-500',
    'from-orange-500 to-amber-500',
    'from-purple-500 to-pink-500',
    'from-rose-500 to-red-500',
]

export function TripTimeline({ items, segments, setItems, onRemoveItem, onItemClick }: TripTimelineProps) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
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

    // Group items by day_index
    const dayGroups = items.reduce((acc, item) => {
        const dayIdx = item.day_index ?? 0
        if (!acc[dayIdx]) acc[dayIdx] = []
        acc[dayIdx].push(item)
        return acc
    }, {} as Record<number, TripItem[]>)

    const sortedDayKeys = Object.keys(dayGroups).map(Number).sort((a, b) => a - b)

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
                    {sortedDayKeys.length === 0 && (
                        <div className="p-4 bg-white shadow-sm rounded-xl border border-slate-200">
                            <div className="text-center py-8 text-sm text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
                                スポットがありません。<br />検索やおすすめから追加してください。
                            </div>
                        </div>
                    )}

                    {sortedDayKeys.map((dayIdx) => {
                        const dayItems = dayGroups[dayIdx]
                        const colorClass = DAY_COLORS[dayIdx % DAY_COLORS.length]
                        const dayLabel = DAY_LABELS[dayIdx] ?? `${dayIdx + 1}日目`

                        // Calculate total time for the day (stay + travel)
                        const totalStayMin = dayItems.reduce((sum, item) => sum + (item.stay_minutes || 0), 0)
                        const totalTravelMin = dayItems.reduce((sum, item, idx) => {
                            if (idx >= dayItems.length - 1) return sum
                            const nextItem = dayItems[idx + 1]
                            const segment = segments.find(s => s.from_item_id === item.id && s.to_item_id === nextItem.id)
                            return sum + (segment ? Math.round(segment.duration_seconds / 60) : 0)
                        }, 0)
                        const totalMin = totalStayMin + totalTravelMin
                        const totalHours = Math.floor(totalMin / 60)
                        const totalMins = totalMin % 60
                        const totalTimeStr = totalMin > 0
                            ? totalHours > 0
                                ? `${totalHours}時間${totalMins > 0 ? totalMins + '分' : ''}`
                                : `${totalMin}分`
                            : null

                        return (
                            <div key={dayIdx} className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
                                {/* Day Header */}
                                <div className={`bg-gradient-to-r ${colorClass} px-4 py-3 flex items-center gap-2`}>
                                    <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                                        <span className="text-white font-black text-sm">{dayIdx + 1}</span>
                                    </div>
                                    <h3 className="font-bold text-white text-base">{dayLabel}</h3>
                                    <div className="ml-auto flex items-center gap-3">
                                        {totalTimeStr && (
                                            <span className="text-white/90 text-xs font-semibold bg-white/20 px-2.5 py-1 rounded-full">
                                                ⏱ {totalTimeStr}
                                            </span>
                                        )}
                                        <span className="text-white/70 text-xs font-medium">{dayItems.length}スポット</span>
                                    </div>
                                </div>

                                <div className="p-4">
                                    <div className="space-y-0 relative">
                                        {/* Vertical Timeline Line */}
                                        <div className="absolute left-4 top-4 bottom-4 w-px bg-slate-200 -z-10 h-[calc(100%-2rem)]" />

                                        {dayItems.map((item) => {
                                            const globalIndex = items.findIndex(i => i.id === item.id)
                                            let segmentInfo = null
                                            if (globalIndex < items.length - 1) {
                                                const nextItem = items[globalIndex + 1]
                                                if (nextItem.day_index === item.day_index) {
                                                    const segment = segments.find(s => s.from_item_id === item.id && s.to_item_id === nextItem.id)
                                                    if (segment) {
                                                        segmentInfo = {
                                                            distance: (segment.distance_meters / 1000).toFixed(1),
                                                            time: Math.round(segment.duration_seconds / 60)
                                                        }
                                                    }
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
                                                                if (item.type !== 'lunch_placeholder' && item.type !== 'dinner_placeholder' && onItemClick && item.place_id) {
                                                                    onItemClick(item.place_id, item.lat, item.lng, item.spot_name)
                                                                }
                                                            }}
                                                        >
                                                            <div className="w-full flex sm:items-center justify-between gap-3">
                                                                <h4 className={`font-medium text-sm flex items-start gap-1.5 transition-colors ${item.type === 'lunch_placeholder' ? 'text-orange-700' :
                                                                    item.type === 'dinner_placeholder' ? 'text-indigo-700' :
                                                                        'text-slate-800 hover:text-blue-600'
                                                                    }`}>
                                                                    <div className="mt-0.5 shrink-0">
                                                                        {item.type === 'lunch_placeholder' ? <span className="text-base leading-none">🍽️</span> :
                                                                            item.type === 'dinner_placeholder' ? <span className="text-base leading-none">🍻</span> :
                                                                                <MapPin className="w-4 h-4 text-blue-500" />}
                                                                    </div>
                                                                    <span className="leading-snug break-words">
                                                                        {item.type === 'lunch_placeholder' || item.type === 'dinner_placeholder' ? (
                                                                            <span>{item.type === 'lunch_placeholder' ? 'ランチ' : '夕食'} <span className="text-xs text-slate-500 opacity-70 ml-1">(相談予定)</span></span>
                                                                        ) : item.spot_name}
                                                                    </span>
                                                                </h4>

                                                                {item.type !== 'lunch_placeholder' && item.type !== 'dinner_placeholder' && (
                                                                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                                                                        <div className="flex items-center gap-1.5 bg-slate-50/80 border border-slate-200 rounded-lg px-2.5 py-1.5 focus-within:border-blue-300 focus-within:ring-1 focus-within:ring-blue-100">
                                                                            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">入場料等:</span>
                                                                            <input
                                                                                type="number"
                                                                                placeholder="0"
                                                                                min="0"
                                                                                step="100"
                                                                                value={item.estimated_fee || ''}
                                                                                onChange={(e) => {
                                                                                    const val = parseInt(e.target.value) || 0
                                                                                    setItems(prev => prev.map(i => i.id === item.id ? { ...i, estimated_fee: val > 0 ? val : undefined } : i))
                                                                                }}
                                                                                className="text-sm font-medium bg-transparent w-16 focus:outline-none text-right text-slate-700 placeholder-slate-300"
                                                                                onClick={(e) => e.stopPropagation()}
                                                                            />
                                                                            <span className="text-xs text-slate-500">円</span>
                                                                        </div>

                                                                        {item.stay_minutes > 0 ? (
                                                                            <div className="flex items-center bg-slate-100/80 border border-slate-200 rounded-lg px-2.5 py-1.5 hover:bg-slate-200/50 transition-colors w-full justify-between">
                                                                                <div className="flex items-center">
                                                                                    <Clock className="w-3.5 h-3.5 text-slate-500 mr-1.5 shrink-0" />
                                                                                    <span className="text-xs text-slate-500 font-medium mr-2">滞在:</span>
                                                                                </div>
                                                                                <div className="flex items-center">
                                                                                    <select
                                                                                        className="text-sm font-medium text-slate-700 bg-transparent focus:outline-none cursor-pointer appearance-none text-right min-w-[30px]"
                                                                                        value={item.stay_minutes}
                                                                                        onChange={(e) => {
                                                                                            const val = parseInt(e.target.value) || 60
                                                                                            setItems(prev => prev.map(i => i.id === item.id ? { ...i, stay_minutes: val } : i))
                                                                                        }}
                                                                                        onClick={(e) => e.stopPropagation()}
                                                                                    >
                                                                                        <option value={15}>15</option>
                                                                                        <option value={30}>30</option>
                                                                                        <option value={45}>45</option>
                                                                                        <option value={60}>60</option>
                                                                                        <option value={90}>90</option>
                                                                                        <option value={120}>120</option>
                                                                                        <option value={150}>150</option>
                                                                                        <option value={180}>180</option>
                                                                                    </select>
                                                                                    <span className="text-xs text-slate-500 ml-0.5">分</span>
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="text-xs font-medium text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 w-full text-center">出発地点</div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
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
                                </div>
                            </div>
                        )
                    })}
                </div>
            </SortableContext>
        </DndContext>
    )
}

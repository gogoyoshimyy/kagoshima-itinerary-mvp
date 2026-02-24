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
import { Clock, MapPin } from "lucide-react"

// Dummy Initial Data
const INITIAL_ITEMS: TripItem[] = [
    { id: "1", day_index: 0, sort_order: 0, spot_name: "鹿児島中央駅 (出発)", lat: 31.5833, lng: 130.5417, stay_minutes: 0, travel_mode: 'car' },
    { id: "2", day_index: 0, sort_order: 1, spot_name: "仙巌園", lat: 31.6178, lng: 130.5828, stay_minutes: 90, travel_mode: 'car' },
    { id: "3", day_index: 0, sort_order: 2, spot_name: "桜島ビジターセンター", lat: 31.5878, lng: 130.5985, stay_minutes: 60, travel_mode: 'car' },
    { id: "4", day_index: 0, sort_order: 3, spot_name: "黒豚料理 あぢもり (昼食)", lat: 31.5865, lng: 130.5516, stay_minutes: 60, travel_mode: 'car' },
]

export function TripTimeline() {
    const [items, setItems] = useState<TripItem[]>(INITIAL_ITEMS)

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

                            {items.map((item, index) => (
                                <div key={item.id} className="relative">

                                    <SortableItem id={item.id}>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-medium text-slate-800 text-sm flex items-center gap-1.5">
                                                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                                                    {item.spot_name}
                                                </h4>
                                            </div>
                                            {item.stay_minutes > 0 ? (
                                                <div className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md flexItems-center gap-1">
                                                    <Clock className="w-3 h-3 inline pb-[1px]" />
                                                    {item.stay_minutes}分滞在
                                                </div>
                                            ) : (
                                                <div className="text-xs font-medium text-slate-400">出発地点</div>
                                            )}
                                        </div>
                                    </SortableItem>

                                    {/* Dummy Segment Info (Not Sortable) between items */}
                                    {index < items.length - 1 && (
                                        <div className="pl-6 py-2 flex flex-col gap-1 items-start text-xs text-slate-500 ml-4 mb-3 border-l-2 border-dashed border-blue-200">
                                            <div className="bg-slate-50 px-2 py-1 flex items-center gap-2 rounded-md shadow-sm border border-slate-100 ml-2">
                                                <span className="font-semibold text-slate-600">約30分</span>
                                                <span className="text-slate-400">•</span>
                                                <span>12km</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button className="w-full mt-4 h-10 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-sm font-medium hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-colors">
                            + スポットを追加
                        </button>
                    </div>
                </div>
            </SortableContext>
        </DndContext>
    )
}

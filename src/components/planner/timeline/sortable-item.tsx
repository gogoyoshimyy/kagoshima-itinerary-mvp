"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"

interface SortableItemProps {
    id: string
    children: React.ReactNode
}

export function SortableItem({ id, children }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 999 : "auto"
    }

    return (
        <div ref={setNodeRef} style={style} className="relative group bg-white border border-slate-200 rounded-xl shadow-sm mb-3">
            {/* Drag Handle */}
            <div
                {...attributes}
                {...listeners}
                className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-slate-50 rounded-l-xl transition-colors text-slate-400 group-hover:text-slate-600"
            >
                <GripVertical className="w-4 h-4" />
            </div>

            {/* Content Area */}
            <div className="pl-8 p-3">
                {children}
            </div>
        </div>
    )
}

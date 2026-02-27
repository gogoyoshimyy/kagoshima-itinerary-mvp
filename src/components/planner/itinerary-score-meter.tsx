"use client"

import { Progress } from "@/components/ui/progress"
import { AlertTriangle, Info, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { TripSegment } from "@/types/planner"

export function ItineraryScoreMeter({ segments = [] }: { segments?: TripSegment[] }) {
    // Dynamic values based on segments array
    const totalTravelSeconds = segments.reduce((acc, seg) => acc + seg.duration_seconds, 0)

    const warnings: { type: string, msg: string }[] = []

    // Simple MVP condition: If total driving time is > 3 hours, add warning. If single segment > 1.5h, add warning.
    if (totalTravelSeconds > 3 * 3600) {
        warnings.push({ type: 'too_much_drive', msg: '1日の移動時間が3時間を超えています' })
    }

    segments.forEach(seg => {
        if (seg.duration_seconds > 1.5 * 3600) {
            warnings.push({ type: 'long_transfer', msg: '1時間半以上の長距離移動が含まれています' })
        }
    })

    // Deduplicate warnings
    const uniqueWarnings = Array.from(new Map(warnings.map(w => [w.msg, w])).values())

    // Score deduction mock logic
    let progressValue = 90
    if (uniqueWarnings.length === 1) progressValue = 50
    if (uniqueWarnings.length >= 2) progressValue = 20

    let scoreColor = "bg-emerald-500"
    let scoreText = "良好"
    let Icon = CheckCircle2

    if (uniqueWarnings.length > 0) {
        scoreColor = "bg-amber-500"
        scoreText = "要確認事項あり"
        Icon = Info
    }

    if (uniqueWarnings.length > 1) {
        scoreColor = "bg-rose-500"
        scoreText = "要注意"
        Icon = AlertTriangle
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                    <Icon className={cn("w-4 h-4", scoreColor.replace('bg-', 'text-'))} />
                    旅程の評価
                </span>
                <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full text-white", scoreColor)}>
                    {scoreText}
                </span>
            </div>

            <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-500">
                    <span>ゆとり</span>
                    <span className="font-medium text-slate-700">{progressValue >= 80 ? 'ちょうどよい (密度: 中)' : '移動時間が長め (ゆとり減)'}</span>
                </div>
                <Progress value={progressValue} className={cn("h-1.5 [&>div]:transition-all", `[&>div]:${scoreColor}`)} />
            </div>

            {uniqueWarnings.length > 0 && (
                <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-2.5 space-y-1.5">
                    {uniqueWarnings.map((w, i) => (
                        <div key={i} className="flex gap-2 text-amber-800 text-xs items-start">
                            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                            <span>{w.msg}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

"use client"

import { Progress } from "@/components/ui/progress"
import { AlertTriangle, Info, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function ItineraryScoreMeter() {
    // Dummy values for Phase 1
    const density = 'just-right' // 'loose' | 'just-right' | 'tight'
    const warnings = [
        { type: 'long_transfer', msg: '仙巌園への移動距離が長めです' }
    ]

    let scoreColor = "bg-emerald-500"
    let scoreText = "良好"
    let Icon = CheckCircle2

    if (warnings.length > 0) {
        scoreColor = "bg-amber-500"
        scoreText = "要確認事項あり"
        Icon = Info
    }

    if (warnings.length > 2) {
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
                    <span className="font-medium text-slate-700">ちょうどよい (密度: 中)</span>
                </div>
                <Progress value={50} className="h-1.5 [&>div]:bg-emerald-500" />
            </div>

            {warnings.length > 0 && (
                <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-2.5 space-y-1.5">
                    {warnings.map((w, i) => (
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

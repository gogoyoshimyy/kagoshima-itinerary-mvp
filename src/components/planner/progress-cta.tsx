"use client"

import { useRouter } from "next/navigation"
import { CheckCircle2, AlertTriangle, ChevronRight } from "lucide-react"

export function ProgressConsultationCTA() {
    const router = useRouter()
    // MVP Dummy calculated progress
    const progressPercent = 68

    const handleConsult = () => {
        // Phase 2: Actual routing
        router.push('/planner/dummy-trip-id/consult')
    }

    return (
        <div className="w-full bg-white border-t border-slate-200 shadow-[0_-8px_16px_-4px_rgba(0,0,0,0.05)] z-20">
            <div className="p-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold text-slate-600">旅程の完成度</span>
                        <span className="text-sm font-bold text-slate-800">{progressPercent}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 transition-all duration-500 ease-in-out"
                            style={{ width: `${progressPercent}%` }}
                        ></div>
                    </div>
                    <div className="mt-2 text-[10px] sm:text-xs text-slate-500 flex flex-wrap gap-x-3 gap-y-1">
                        <span className="flex items-center gap-1 text-emerald-600 font-medium whitespace-nowrap">
                            <CheckCircle2 className="w-3 h-3 shrink-0" /> 行き先選定
                        </span>
                        <span className="flex items-center gap-1 text-amber-600 font-medium whitespace-nowrap">
                            <AlertTriangle className="w-3 h-3 shrink-0" /> 移動時間の再確認
                        </span>
                    </div>
                </div>

                <button
                    onClick={handleConsult}
                    className="px-5 py-2.5 bg-slate-900 text-white font-medium rounded-xl text-sm hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-1 shrink-0"
                >
                    プロに相談する
                    <ChevronRight className="w-4 h-4 opacity-70" />
                </button>
            </div>
        </div>
    )
}

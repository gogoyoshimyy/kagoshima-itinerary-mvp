import { Suspense } from "react"
import { PlannerInner } from "@/app/planner/planner-inner"

export default function PlannerPage() {
    // We use Suspense here because we will read searchParams
    return (
        <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
            <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading planner...</div>}>
                <PlannerInner />
            </Suspense>
        </div>
    )
}

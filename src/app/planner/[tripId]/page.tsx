import { Suspense } from "react"
import { PlannerInner } from "@/app/planner/planner-inner"
import { getTripAction } from "@/app/actions/trip"

interface PageProps {
    params: Promise<{ tripId: string }>
}

export default async function PlannerTripPage({ params }: PageProps) {
    const { tripId } = await params;
    const items = await getTripAction(tripId)

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
            <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading planner...</div>}>
                <PlannerInner initialTripId={tripId} initialItems={items} />
            </Suspense>
        </div>
    )
}

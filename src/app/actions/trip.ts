"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { TripItem } from "@/types/planner"

// In MVP, we might create a temporary trip ID or insert a draft row immediately on start
export async function createTripPlan(formData: {
    session_id: string,
    start_date: string,
    days: number,
    start_point_label: string,
    mobility_preference: string,
    party_type: string,
    budget_range: string
}) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('trip_plans')
        .insert([formData])
        .select()
        .single()

    if (error) {
        console.error("createTripPlan error:", error)
        return { success: false, error: error.message }
    }

    return { success: true, tripId: data.id }
}

export async function fetchTripPlan(tripId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('trip_plans')
        .select('*')
        .eq('id', tripId)
        .single()

    return { data, error }
}

export async function updateTripItems(tripId: string, items: TripItem[]) {
    const supabase = await createClient()

    // Basic MVP implementation: Delete all and re-insert for the tripId
    // (In a real app, you'd want more granular updates or upserts)
    const { error: deleteError } = await supabase
        .from('trip_plan_items')
        .delete()
        .eq('trip_plan_id', tripId)

    if (deleteError) return { success: false, error: deleteError.message }

    const insertPayload = items.map(item => ({
        trip_plan_id: tripId,
        day_index: item.day_index,
        sort_order: item.sort_order,
        spot_source: 'custom',
        spot_name: item.spot_name,
        lat: item.lat,
        lng: item.lng,
        stay_minutes: item.stay_minutes,
        travel_mode: item.travel_mode
    }))

    const { error: insertError } = await supabase
        .from('trip_plan_items')
        .insert(insertPayload)

    if (insertError) return { success: false, error: insertError.message }

    revalidatePath(`/planner/${tripId}`)
    return { success: true }
}

"use server"

import { createClient } from "@/lib/supabase/server"

interface RecommendParams {
    party_type?: string
    current_lat?: number
    current_lng?: number
}

export async function getRecommendations(params: RecommendParams) {
    const supabase = await createClient()

    // MVP: Fetch active spots, order by recommendation_score natively
    // In a real app we'd filter by distance using PostGIS or math if lat/lng provided,
    // and prioritize by tags (e.g., if party_type === 'family', boost 'family' tag)

    let query = supabase
        .from('spots')
        .select('*')
        .eq('is_active', true)

    if (params.party_type) {
        // A simple text search in the array for MVP
        // Real Postgres array query: .contains('tags', [params.party_type])
        query = query.contains('tags', [params.party_type])
    }

    // Fallback if no specific tags match
    const { data, error } = await query.order('recommendation_score', { ascending: false }).limit(5)

    if (error || !data || data.length === 0) {
        // Fetch generic top spots if specific query fails or returns 0
        const { data: genericData } = await supabase
            .from('spots')
            .select('*')
            .eq('is_active', true)
            .order('recommendation_score', { ascending: false })
            .limit(5)

        return { success: true, data: genericData || [] }
    }

    return { success: true, data }
}

export async function evaluateItinerary(tripItems: any[], segments: any[]) {
    // MVP Scoring logic
    let score = 100
    const warnings: { type: string, msg: string }[] = []

    let totalDurationSec = 0
    let totalDistanceMeters = 0
    let longTransfers = 0

    segments.forEach(seg => {
        totalDurationSec += seg.duration_seconds
        totalDistanceMeters += seg.distance_meters

        // Warn if single transfer is over 90 mins (5400s)
        if (seg.duration_seconds > 5400) {
            longTransfers++
        }
    })

    if (longTransfers > 0) {
        score -= 15 * longTransfers
        warnings.push({ type: 'long_transfer', msg: `${longTransfers}区間で長時間の移動（90分以上）があります。` })
    }

    const spotsCount = tripItems.filter(i => i.stay_minutes > 0).length
    if (spotsCount > 4) {
        // Too many spots in one day (assuming this evaluates 1 day for MVP, or average)
        score -= 20
        warnings.push({ type: 'too_many_stops', msg: '1日の立ち寄りスポット数が多すぎます。' })
    } else if (spotsCount < 2) {
        warnings.push({ type: 'sparse_schedule', msg: '旅程に余裕があります。おすすめスポットを追加してみませんか？' })
    }

    let density = 'just-right'
    if (score < 70) density = 'tight'
    if (score > 90 && spotsCount < 3) density = 'loose'

    return {
        score: Math.max(0, score),
        density,
        warnings
    }
}

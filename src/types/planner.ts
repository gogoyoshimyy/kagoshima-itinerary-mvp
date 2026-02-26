export type TravelMode = 'car' | 'transit' | 'walk'

export interface TripItem {
    id: string
    day_index: number
    sort_order: number
    spot_name: string
    lat: number
    lng: number
    stay_minutes: number
    travel_mode: TravelMode
    place_id?: string | null
    type?: 'spot' | 'lunch_placeholder' | 'dinner_placeholder'
    budget?: string
}

export interface TripSegment {
    id: string
    from_item_id: string
    to_item_id: string
    route_mode: TravelMode
    distance_meters: number
    duration_seconds: number
    estimated_cost_min: number | null
    estimated_cost_max: number | null
    warning_flags: string[]
}

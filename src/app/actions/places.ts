"use server"

import { PrismaClient } from "@prisma/client"
import { TripItem } from "@/types/planner"

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY

const prisma = new PrismaClient()

// ─────────────────────────────────────────────
// Local DB search
// ─────────────────────────────────────────────
async function searchLocalSpots(query: string): Promise<Partial<TripItem>[]> {
    // Full-text-like search: name contains query (case-insensitive via SQLite)
    const spots = await prisma.spot.findMany({
        where: {
            name: { contains: query }
        },
        take: 10,
    })

    if (spots.length === 0) return []

    // Return spots that already have lat/lng, or enrich with Google Places on the fly
    const results: Partial<TripItem>[] = []

    for (const spot of spots) {
        if (spot.lat && spot.lng) {
            // Lat/lng already cached in DB
            results.push({
                id: `local-${spot.id}`,
                place_id: spot.placeId ?? undefined,
                spot_name: spot.name,
                lat: spot.lat,
                lng: spot.lng,
                stay_minutes: 60,
                travel_mode: 'car',
            })
        } else if (GOOGLE_MAPS_API_KEY) {
            // Fetch lat/lng from Google Places and cache it
            const geoResult = await geocodeSpot(spot.name, spot.address)
            if (geoResult) {
                // Cache in DB
                await prisma.spot.update({
                    where: { id: spot.id },
                    data: {
                        lat: geoResult.lat,
                        lng: geoResult.lng,
                        placeId: geoResult.placeId ?? undefined,
                    }
                })
                results.push({
                    id: `local-${spot.id}`,
                    place_id: geoResult.placeId ?? undefined,
                    spot_name: spot.name,
                    lat: geoResult.lat,
                    lng: geoResult.lng,
                    stay_minutes: 60,
                    travel_mode: 'car',
                })
            } else {
                // No geocoding result: still return with 0,0 so the user can see it
                results.push({
                    id: `local-${spot.id}`,
                    spot_name: spot.name,
                    lat: 31.5966,
                    lng: 130.5571,
                    stay_minutes: 60,
                    travel_mode: 'car',
                })
            }
        }
    }

    return results
}

async function geocodeSpot(name: string, address?: string | null): Promise<{ lat: number; lng: number; placeId?: string } | null> {
    if (!GOOGLE_MAPS_API_KEY) return null

    const textQuery = address ? `${name} ${address}` : `${name} 鹿児島`

    try {
        const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
                'X-Goog-FieldMask': 'places.id,places.location',
            },
            body: JSON.stringify({
                textQuery,
                languageCode: "ja",
                locationBias: {
                    circle: {
                        center: { latitude: 31.5969, longitude: 130.5571 },
                        radius: 300000.0  // 300km (covers all of Kagoshima pref)
                    }
                }
            })
        })
        if (!response.ok) return null
        const data = await response.json()
        const place = data.places?.[0]
        if (!place) return null
        return {
            lat: place.location.latitude,
            lng: place.location.longitude,
            placeId: place.id,
        }
    } catch {
        return null
    }
}

// ─────────────────────────────────────────────
// Google Places text search (fallback)
// ─────────────────────────────────────────────
async function searchGooglePlaces(query: string): Promise<Partial<TripItem>[]> {
    if (!GOOGLE_MAPS_API_KEY) return []

    try {
        const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
                'X-Goog-FieldMask': 'places.id,places.displayName,places.location'
            },
            body: JSON.stringify({
                textQuery: query,
                languageCode: "ja",
                locationBias: {
                    circle: {
                        center: { latitude: 31.5969, longitude: 130.5571 },
                        radius: 300000.0
                    }
                }
            })
        })
        if (!response.ok) return []
        const data = await response.json()
        if (!data.places?.length) return []

        return data.places.map((place: any) => ({
            id: `spot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            place_id: place.id,
            spot_name: place.displayName.text,
            lat: place.location.latitude,
            lng: place.location.longitude,
            stay_minutes: 60,
            travel_mode: 'car',
        }))
    } catch {
        return []
    }
}

// ─────────────────────────────────────────────
// Combined search: DB first, Google as fallback
// ─────────────────────────────────────────────
export async function searchPlaces(query: string): Promise<Partial<TripItem>[]> {
    if (!query || query.trim() === "") return []

    const localResults = await searchLocalSpots(query.trim())

    if (localResults.length > 0) {
        // Local results found → optionally fill up with Google
        if (localResults.length < 5 && GOOGLE_MAPS_API_KEY) {
            const googleResults = await searchGooglePlaces(query)
            // Merge, dedup by spot_name
            const names = new Set(localResults.map(r => r.spot_name))
            const extra = googleResults.filter(r => !names.has(r.spot_name))
            return [...localResults, ...extra].slice(0, 10)
        }
        return localResults
    }

    // No local results → fall back to Google
    if (GOOGLE_MAPS_API_KEY) {
        return searchGooglePlaces(query)
    }
    return []
}

// ─────────────────────────────────────────────
// Place details (unchanged from original)
// ─────────────────────────────────────────────
export interface PlaceDetails {
    id: string
    name: string
    address?: string
    rating?: number
    userRatingCount?: number
    websiteUri?: string
    phoneNumber?: string
    photoUris?: string[]
    openNow?: boolean
    weekdayDescriptions?: string[]
}

export async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
    if (!GOOGLE_MAPS_API_KEY) return null
    if (!placeId) return null

    const formattedId = placeId.startsWith('places/') ? placeId : `places/${placeId}`

    try {
        const response = await fetch(`https://places.googleapis.com/v1/${formattedId}?languageCode=ja`, {
            method: 'GET',
            headers: {
                'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
                'X-Goog-FieldMask': 'id,displayName,formattedAddress,rating,userRatingCount,websiteUri,internationalPhoneNumber,photos,regularOpeningHours'
            }
        })
        if (!response.ok) return null
        const data = await response.json()

        const photoUris = data.photos?.slice(0, 5).map((photo: any) =>
            `https://places.googleapis.com/v1/${photo.name}/media?maxHeightPx=800&maxWidthPx=800&key=${GOOGLE_MAPS_API_KEY}`
        ) || []

        return {
            id: data.id,
            name: data.displayName?.text || "",
            address: data.formattedAddress,
            rating: data.rating,
            userRatingCount: data.userRatingCount,
            websiteUri: data.websiteUri,
            phoneNumber: data.internationalPhoneNumber,
            photoUris,
            openNow: data.regularOpeningHours?.openNow,
            weekdayDescriptions: data.regularOpeningHours?.weekdayDescriptions,
        }
    } catch {
        return null
    }
}

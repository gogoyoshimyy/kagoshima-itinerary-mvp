"use server"

import { TripItem } from "@/types/planner"

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY

export async function searchPlaces(query: string): Promise<Partial<TripItem>[]> {
    if (!GOOGLE_MAPS_API_KEY) {
        throw new Error("Google Maps API Key is not configured")
    }

    if (!query || query.trim() === "") {
        return []
    }

    try {
        const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
                // We only need basic fields for now to save cost and time: id, name, location
                'X-Goog-FieldMask': 'places.id,places.displayName,places.location'
            },
            body: JSON.stringify({
                textQuery: query,
                languageCode: "ja", // Force Japanese results
                // Bias results slightly towards Kagoshima region
                locationBias: {
                    circle: {
                        center: {
                            latitude: 31.5969,
                            longitude: 130.5571
                        },
                        radius: 50000.0 // 50km radius
                    }
                }
            })
        })

        if (!response.ok) {
            const errorData = await response.json()
            console.error("Places API Error:", errorData)
            throw new Error(`Google Places API returned ${response.status}`)
        }

        const data = await response.json()

        if (!data.places || data.places.length === 0) {
            return []
        }

        // Map the Google Places response to our Partial<TripItem> format
        return data.places.map((place: any) => ({
            id: `spot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Use a random ID for the UI list to avoid collisions
            place_id: place.id, // Store the actual Google Places ID here
            spot_name: place.displayName.text,
            lat: place.location.latitude,
            lng: place.location.longitude,
            stay_minutes: 60, // Default stay time
            travel_mode: 'car' // Default travel mode
        }))

    } catch (error) {
        console.error("Failed to search places:", error)
        throw error
    }
}

export interface PlaceDetails {
    id: string
    name: string
    address?: string
    rating?: number
    userRatingCount?: number
    websiteUri?: string
    phoneNumber?: string
    photoUris?: string[] // We will map the photo names to actual URLs in the action
    openNow?: boolean
    weekdayDescriptions?: string[]
}

export async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
    if (!GOOGLE_MAPS_API_KEY) {
        throw new Error("Google Maps API Key is not configured")
    }

    if (!placeId) return null;

    // Use string manipulation to ensure we don't pass places/places/id
    const formattedId = placeId.startsWith('places/') ? placeId : `places/${placeId}`;

    try {
        const response = await fetch(`https://places.googleapis.com/v1/${formattedId}?languageCode=ja`, {
            method: 'GET',
            headers: {
                'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
                // Request specific fields to manage cost
                'X-Goog-FieldMask': 'id,displayName,formattedAddress,rating,userRatingCount,websiteUri,internationalPhoneNumber,photos,regularOpeningHours'
            }
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error(`Places API Details Error for ${placeId} [Status: ${response.status}]:`, errText)
            return null;
        }

        const data = await response.json();

        // Convert photo references to actual image URLs
        // Max width 800px to keep loading fast
        const photoUris = data.photos?.slice(0, 5).map((photo: any) =>
            `https://places.googleapis.com/v1/${photo.name}/media?maxHeightPx=800&maxWidthPx=800&key=${GOOGLE_MAPS_API_KEY}`
        ) || [];

        return {
            id: data.id,
            name: data.displayName?.text || "",
            address: data.formattedAddress,
            rating: data.rating,
            userRatingCount: data.userRatingCount,
            websiteUri: data.websiteUri,
            phoneNumber: data.internationalPhoneNumber,
            photoUris: photoUris,
            openNow: data.regularOpeningHours?.openNow,
            weekdayDescriptions: data.regularOpeningHours?.weekdayDescriptions
        }
    } catch (error) {
        console.error("Failed to fetch place details:", error);
        return null;
    }
}

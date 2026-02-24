"use server"

// MVP Google Maps Server Actions (Places & Routes API wrappers)

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY

export async function searchPlaces(query: string, location?: { lat: number, lng: number }) {
    if (!GOOGLE_API_KEY) return { success: false, error: "API Key missing" }
    if (!query) return { success: true, results: [] }

    try {
        let url = `https://places.googleapis.com/v1/places:searchText`

        // MVP: simple text search using the modern Places API
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": GOOGLE_API_KEY,
                "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.location,places.id,places.primaryType",
            },
            body: JSON.stringify({
                textQuery: query,
                languageCode: "ja",
                locationBias: location ? {
                    circle: {
                        center: { latitude: location.lat, longitude: location.lng },
                        radius: 50000.0 // 50km radius
                    }
                } : undefined
            }),
        })

        if (!response.ok) {
            console.error("Places API error:", await response.text())
            return { success: false, error: "Maps API Error" }
        }

        const data = await response.json()
        const places = data.places || []

        const results = places.map((p: any) => ({
            id: p.id,
            name: p.displayName?.text || "",
            address: p.formattedAddress || "",
            lat: p.location?.latitude || 0,
            lng: p.location?.longitude || 0,
            category: p.primaryType || "point_of_interest"
        }))

        return { success: true, results }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

export async function computeRoute(origin: { lat: number, lng: number }, dest: { lat: number, lng: number }, mode: 'car' | 'transit' = 'car') {
    if (!GOOGLE_API_KEY) return { success: false, error: "API Key missing" }

    // Note: For MVP 'transit' via Routes API v2 is complex. We will default to basic driving routing if not fully supported,
    // or use the old Directions API if needed. Here we use Routes API basic DRIVE.
    const routeMode = mode === 'transit' ? 'TRANSIT' : 'DRIVE'

    try {
        const response = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": GOOGLE_API_KEY,
                "X-Goog-FieldMask": "routes.duration,routes.distanceMeters,routes.polyline.encodedPath",
            },
            body: JSON.stringify({
                origin: { location: { latLng: { latitude: origin.lat, longitude: origin.lng } } },
                destination: { location: { latLng: { latitude: dest.lat, longitude: dest.lng } } },
                travelMode: routeMode,
                routingPreference: routeMode === 'DRIVE' ? "TRAFFIC_AWARE" : undefined,
                languageCode: "ja-JP",
                units: "METRIC"
            })
        })

        if (!response.ok) {
            console.error("Routes API error:", await response.text())
            return { success: false, error: "Routes API Error" }
        }

        const data = await response.json()
        const route = data.routes?.[0]

        if (!route) {
            return { success: false, error: "No route found" }
        }

        // Convert "1234s" to integer 1234
        const durationSeconds = parseInt(route.duration.replace('s', ''), 10)

        // Rough MVP Cost Estimation (Car: Distance * 20~45 yen depending on highways etc)
        const distanceKm = route.distanceMeters / 1000
        const estimated_cost_min = Math.round(distanceKm * 20)
        const estimated_cost_max = Math.round(distanceKm * 45)

        return {
            success: true,
            distance_meters: route.distanceMeters,
            duration_seconds: durationSeconds,
            polyline: route.polyline?.encodedPath,
            estimated_cost_min,
            estimated_cost_max
        }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

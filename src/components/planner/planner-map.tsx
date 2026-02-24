"use client"

import { useMemo, useCallback, useState } from "react"
import { GoogleMap, useJsApiLoader, Marker, Polyline } from "@react-google-maps/api"
import { TripItem } from "@/types/planner"
import { MapPin } from "lucide-react"

const containerStyle = {
    width: '100%',
    height: '100%'
}

interface PlannerMapProps {
    items: TripItem[]
    // Encoded polyline strings from Routes API
    polylines?: string[]
}

export function PlannerMap({ items, polylines = [] }: PlannerMapProps) {
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        // MVP: Must be set in .env.local
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
    })

    const [map, setMap] = useState<google.maps.Map | null>(null)

    // Default to Kagoshima center if no items exist
    const center = useMemo(() => {
        if (items.length > 0) {
            return { lat: items[0].lat, lng: items[0].lng }
        }
        return { lat: 31.5969, lng: 130.5571 } // Kagoshima City
    }, [items])

    const onLoad = useCallback((map: google.maps.Map) => {
        setMap(map)
        // Fit bounds if we have multiple items
        if (items.length > 1) {
            const bounds = new window.google.maps.LatLngBounds()
            items.forEach(item => bounds.extend({ lat: item.lat, lng: item.lng }))
            map.fitBounds(bounds)
        }
    }, [items])

    const onUnmount = useCallback(() => {
        setMap(null)
    }, [])

    if (loadError) {
        return (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-200 text-slate-500 flex-col gap-2">
                <MapPin className="w-12 h-12 text-rose-300" />
                <p>Map loading failed. Check API Key.</p>
            </div>
        )
    }

    if (!isLoaded) {
        return (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-200 text-slate-400">
                Loading Map...
            </div>
        )
    }

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={11}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
                disableDefaultUI: true,
                zoomControl: true,
            }}
        >
            {/* Markers for Spots */}
            {items.map((item, index) => (
                <Marker
                    key={item.id}
                    position={{ lat: item.lat, lng: item.lng }}
                    label={{
                        text: (index + 1).toString(),
                        color: 'white',
                        className: 'font-bold'
                    }}
                />
            ))}

            {/* Basic Polyline fallback if we decoded it, or if using google.maps.geometry.encoding */}
            {/* Since @react-google-maps/api Polyline takes path array, we'll need geometry library to decode. 
          For MVP, we will only draw markers unless we decode the polyline paths beforehand. */}
        </GoogleMap>
    )
}

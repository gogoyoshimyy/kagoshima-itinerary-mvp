"use client"

import { useMemo, useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet"
import { TripItem, TripSegment } from "@/types/planner"
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix Leaflet icon issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface PlannerMapClientProps {
    items: TripItem[]
    segments?: TripSegment[]
    polylines?: string[] // unused in leaflet MVP
    previewSpot?: { lat: number, lng: number, spot_name: string } | null
}

// Helper to fit bounds when items change
function MapController({ items, previewSpot }: { items: TripItem[], previewSpot?: { lat: number, lng: number } | null }) {
    const map = useMap()
    const prevItemsLength = useRef(items.length)

    useEffect(() => {
        // Robust coordinate check helper
        const isValid = (lat: any, lng: any) => {
            const l1 = Number(lat);
            const l2 = Number(lng);
            return !isNaN(l1) && !isNaN(l2) && isFinite(l1) && isFinite(l2);
        };

        try {
            if (previewSpot && isValid(previewSpot.lat, previewSpot.lng)) {
                // Fly to preview spot
                const lat = Number(previewSpot.lat);
                const lng = Number(previewSpot.lng);
                map.flyTo([lat, lng], 14, { duration: 1.5 });
            } else if (items.length > prevItemsLength.current) {
                // A new item was added, fly to it
                const newestItem = items[items.length - 1];
                if (newestItem && isValid(newestItem.lat, newestItem.lng)) {
                    const lat = Number(newestItem.lat);
                    const lng = Number(newestItem.lng);
                    console.log(`MapController: flying to [${lat}, ${lng}] for ${newestItem.spot_name}`);
                    map.flyTo([lat, lng], 14, { duration: 1.5 });
                }
            } else if (items.length > 1 && items.length === prevItemsLength.current) {
                // Fit bounds
                const validPoints = items
                    .filter(i => isValid(i.lat, i.lng))
                    .map(i => [Number(i.lat), Number(i.lng)] as [number, number]);

                if (validPoints.length > 0) {
                    const bounds = L.latLngBounds(validPoints);
                    map.fitBounds(bounds, { padding: [50, 50] });
                }
            } else if (items.length === 1 && prevItemsLength.current === 0) {
                // First item
                if (isValid(items[0].lat, items[0].lng)) {
                    map.flyTo([Number(items[0].lat), Number(items[0].lng)], 13);
                }
            }
        } catch (e) {
            console.error("MapController Error:", e);
        }

        prevItemsLength.current = items.length;
    }, [items, map, previewSpot])

    return null
}

export default function PlannerMapClient({ items, previewSpot }: PlannerMapClientProps) {
    // Default to Kagoshima center if no items exist
    const center = useMemo<[number, number]>(() => {
        const firstValid = items.find(i => {
            const lat = Number(i.lat);
            const lng = Number(i.lng);
            return !isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng);
        });
        if (firstValid) {
            return [Number(firstValid.lat), Number(firstValid.lng)]
        }
        return [31.5969, 130.5571] // Kagoshima City
    }, [items])

    return (
        <MapContainer
            center={center}
            zoom={11}
            style={{ width: '100%', height: '100%', zIndex: 0 }}
            zoomControl={false}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapController items={items} previewSpot={previewSpot} />

            {/* Preview Spot Marker */}
            {previewSpot && !isNaN(Number(previewSpot.lat)) && !isNaN(Number(previewSpot.lng)) && (
                <Marker
                    position={[Number(previewSpot.lat), Number(previewSpot.lng)]}
                    icon={L.divIcon({
                        html: `<div style="background-color: #ef4444; color: white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); animation: bounce 1s infinite alternate;">📍</div>`,
                        className: 'custom-div-icon preview-icon',
                        iconSize: [28, 28],
                        iconAnchor: [14, 14]
                    })}
                    zIndexOffset={1000}
                />
            )}

            {/* Markers for Spots */}
            {items.map((item, index) => {
                const lat = Number(item.lat);
                const lng = Number(item.lng);
                if (isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng)) return null;

                // Create a custom numbered icon
                const icon = L.divIcon({
                    html: `<div style="background-color: #3b82f6; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">${index + 1}</div>`,
                    className: 'custom-div-icon',
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                })

                return (
                    <Marker
                        key={item.id}
                        position={[lat, lng]}
                        icon={icon}
                    />
                )
            })}
        </MapContainer>
    )
}

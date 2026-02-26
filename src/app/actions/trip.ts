"use server"

import prisma from "@/lib/prisma"
import { TripItem, TravelMode } from "@/types/planner"
import { revalidatePath } from "next/cache"

export async function saveTripAction(tripId: string | null, items: TripItem[]) {
    try {
        let currentTripId = tripId;

        // 1. Create a new trip if we don't have one
        if (!currentTripId) {
            const newTrip = await prisma.trip.create({
                data: { title: "鹿児島旅行プラン" },
            });
            currentTripId = newTrip.id;
        }

        // 2. Perform a transaction to replace the old items with new items
        // This is simpler than computing diffs and handles reordering naturally.
        await prisma.$transaction(async (tx) => {
            // Delete existing items for this trip
            await tx.tripItem.deleteMany({
                where: { tripId: currentTripId! }
            });

            // Insert new items
            if (items.length > 0) {
                await tx.tripItem.createMany({
                    data: items.map((item, index) => ({
                        tripId: currentTripId!,
                        // Do not use the generated temporary client-side IDs to avoid collisions 
                        // Let Prisma auto-generate the DB IDs for the new rows.
                        dayIndex: item.day_index || 0,
                        sortOrder: index, // Enforce order by array position
                        spotName: item.spot_name,
                        lat: item.lat,
                        lng: item.lng,
                        stayMinutes: item.stay_minutes || 60,
                        travelMode: item.travel_mode || 'car',
                        placeId: item.place_id || null
                    }))
                });
            }
        });

        // Revalidate the path so that fetching it again gets fresh data.
        revalidatePath(`/planner`);
        if (currentTripId) {
            revalidatePath(`/planner/${currentTripId}`);
        }

        return { success: true, tripId: currentTripId };
    } catch (error) {
        console.error("Failed to save trip:", error);
        return { success: false, error: "Failed to save trip data." };
    }
}

export async function getTripAction(tripId: string): Promise<TripItem[]> {
    try {
        const trip = await prisma.trip.findUnique({
            where: { id: tripId },
            include: {
                items: {
                    orderBy: { sortOrder: 'asc' }
                }
            }
        });

        if (!trip) return [];

        // Map Prisma model back to the UI TripItem interface
        return trip.items.map(item => ({
            id: item.id,
            day_index: item.dayIndex,
            sort_order: item.sortOrder,
            spot_name: item.spotName,
            lat: item.lat,
            lng: item.lng,
            stay_minutes: item.stayMinutes,
            travel_mode: item.travelMode as TravelMode,
            place_id: item.placeId
        }));
    } catch (error) {
        console.error("Failed to fetch trip:", error);
        return [];
    }
}

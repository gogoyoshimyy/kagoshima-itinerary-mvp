"use server"

import { createClient } from "@/lib/supabase/server"

export async function submitConsultationLead(formData: {
    trip_plan_id: string,
    name: string,
    email: string,
    phone: string,
    preferred_contact_method: string,
    concerns_text: string
}) {
    const supabase = await createClient()

    // 1. Insert lead
    const { error: insertError } = await supabase
        .from('consultation_leads')
        .insert([formData])

    if (insertError) {
        console.error("Failed to insert lead:", insertError)
        return { success: false, error: insertError.message }
    }

    // 2. Update trip_plans status to 'submitted'
    const { error: updateError } = await supabase
        .from('trip_plans')
        .update({ status: 'submitted' })
        .eq('id', formData.trip_plan_id)

    if (updateError) {
        console.warn("Failed to update trip_plan status, but lead was saved:", updateError)
        // Non-fatal, return success anyway for the MVP
    }

    return { success: true }
}

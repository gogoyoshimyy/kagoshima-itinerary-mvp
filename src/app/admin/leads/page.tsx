import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default async function AdminLeadsPage() {
    const supabase = await createClient()

    const { data: leads, error } = await supabase
        .from('consultation_leads')
        .select('*, trip_plans(days, mobility_preference)')
        .order('created_at', { ascending: false })

    if (error) {
        return <div className="p-8 text-red-500">Error loading leads: {error.message}</div>
    }

    return (
        <div className="max-w-6xl mx-auto p-8">
            <h1 className="text-3xl font-bold mb-8">お問合せ管理 (MVP)</h1>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                        <tr>
                            <th className="px-6 py-3 font-medium">日時</th>
                            <th className="px-6 py-3 font-medium">お名前</th>
                            <th className="px-6 py-3 font-medium">旅行日数/移動</th>
                            <th className="px-6 py-3 font-medium">ステータス</th>
                            <th className="px-6 py-3 font-medium">アクション</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {leads?.map(lead => (
                            <tr key={lead.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 text-slate-500">
                                    {new Date(lead.created_at).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 font-medium text-slate-900">
                                    {lead.name}
                                    <div className="text-xs text-slate-500 mt-1">{lead.preferred_contact_method}希望</div>
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                    {lead.trip_plans?.days}日間 / {lead.trip_plans?.mobility_preference}
                                </td>
                                <td className="px-6 py-4">
                                    <Badge variant={lead.status === 'new' ? 'default' : lead.status === 'in_progress' ? 'secondary' : 'outline'}>
                                        {lead.status === 'new' ? '新規' : lead.status === 'in_progress' ? '対応中' : '完了'}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4">
                                    <Link
                                        href={`/admin/leads/${lead.id}`}
                                        className="text-blue-600 hover:underline font-medium"
                                    >
                                        詳細を見る
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {leads?.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                    まだお問合せはありません
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

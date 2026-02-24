import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export default async function AdminLeadDetailPage(props: { params: Promise<{ leadId: string }> }) {
    const params = await props.params;
    const supabase = await createClient()

    const { data: lead, error } = await supabase
        .from('consultation_leads')
        .select(`
      *,
      trip_plans (
        *,
        trip_plan_items (
          *
        )
      )
    `)
        .eq('id', params.leadId)
        .single()

    if (error || !lead) {
        if (error?.code === 'PGRST116') return notFound()
        return <div className="p-8 text-red-500">Error loading lead details.</div>
    }

    // Basic sorting for items
    const sortedItems = lead.trip_plans.trip_plan_items.sort((a: any, b: any) =>
        (a.day_index - b.day_index) || (a.sort_order - b.sort_order)
    )

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
            <Link href="/admin/leads" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800">
                <ChevronLeft className="w-4 h-4 mr-1" />
                一覧へ戻る
            </Link>

            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">{lead.name} 様のお問合せ</h1>
                    <p className="text-slate-500 mt-2">受信日時: {new Date(lead.created_at).toLocaleString()}</p>
                </div>
                <div className="text-xl font-bold px-4 py-2 bg-slate-100 rounded-lg">
                    ステータス: {lead.status}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h2 className="text-lg font-bold mb-4 border-b pb-2">お客様情報</h2>
                    <dl className="space-y-3 text-sm">
                        <div><dt className="text-slate-500">メールアドレス</dt><dd className="font-medium">{lead.email}</dd></div>
                        <div><dt className="text-slate-500">電話番号</dt><dd className="font-medium">{lead.phone || '未入力'}</dd></div>
                        <div><dt className="text-slate-500">希望連絡方法</dt><dd className="font-medium">{lead.preferred_contact_method || '未入力'}</dd></div>
                        <div>
                            <dt className="text-slate-500">ご要望・お困りごと</dt>
                            <dd className="font-medium mt-1 p-3 bg-slate-50 rounded-md whitespace-pre-wrap">
                                {lead.concerns_text || '特になし'}
                            </dd>
                        </div>
                    </dl>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h2 className="text-lg font-bold mb-4 border-b pb-2">旅程概要</h2>
                    <dl className="space-y-3 text-sm">
                        <div><dt className="text-slate-500">出発日</dt><dd className="font-medium">{lead.trip_plans.start_date}</dd></div>
                        <div><dt className="text-slate-500">日数</dt><dd className="font-medium">{lead.trip_plans.days}日間</dd></div>
                        <div><dt className="text-slate-500">出発地</dt><dd className="font-medium">{lead.trip_plans.start_point_label}</dd></div>
                        <div><dt className="text-slate-500">移動手段</dt><dd className="font-medium">{lead.trip_plans.mobility_preference}</dd></div>
                        <div><dt className="text-slate-500">同行者</dt><dd className="font-medium">{lead.trip_plans.party_type}</dd></div>
                        <div>
                            <dt className="text-slate-500">自動判定評価</dt>
                            <dd className="font-bold text-amber-600 mt-1">Score: {lead.consultation_score}</dd>
                        </div>
                    </dl>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold mb-4 border-b pb-2">作成された旅程（たたき台）</h2>
                {sortedItems.length > 0 ? (
                    <div className="space-y-2">
                        {sortedItems.map((item: any) => (
                            <div key={item.id} className="flex gap-4 p-3 bg-slate-50 rounded-lg">
                                <div className="font-bold text-slate-500 w-12 shrink-0">Day {item.day_index + 1}</div>
                                <div>
                                    <div className="font-bold text-slate-900">{item.spot_name}</div>
                                    <div className="text-xs text-slate-500 mt-1">
                                        滞在: {item.stay_minutes}分 / 【{item.travel_mode}】で移動
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-500 text-sm">旅程アイテムが登録されていません。</p>
                )}
            </div>

        </div>
    )
}

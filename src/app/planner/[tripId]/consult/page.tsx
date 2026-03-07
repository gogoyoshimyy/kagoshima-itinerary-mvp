"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { submitConsultationLead } from "@/app/actions/consult"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, Send, CheckCircle2 } from "lucide-react"

export default function ConsultPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        preferred_contact_method: "email",
        hotel_arrangement: "none", // 'none' | 'request'
        hotel_budget_per_night: "",
        hotel_requests: "",
        meal_arrangement: "none", // 'none' | 'lunch_only' | 'dinner_only' | 'both'
        lunch_budget: "",
        dinner_budget: "",
        meal_requests: "",
        concerns_text: ""
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        // In Phase 2, tripId is still dummy
        const tripId = "dummy-trip-id"

        // Build a comprehensive concerns string holding the hotel/meal budget info if requested
        let finalConcerns = formData.concerns_text;

        // Append Meal requests
        if (formData.meal_arrangement !== 'none') {
            let mealText = "【お食事手配を希望】\n";
            if (formData.meal_arrangement === 'lunch_only' || formData.meal_arrangement === 'both') {
                mealText += ` - ランチ予算: 1名あたり ${formData.lunch_budget || '設定なし'}円程度\n`;
            }
            if (formData.meal_arrangement === 'dinner_only' || formData.meal_arrangement === 'both') {
                mealText += ` - 夕食予算: 1名あたり ${formData.dinner_budget || '設定なし'}円程度\n`;
            }
            if (formData.meal_requests.trim() !== '') {
                mealText += ` - ご要望: ${formData.meal_requests}\n`;
            }
            finalConcerns = mealText + "\n" + finalConcerns;
        }

        // Append Hotel requests
        if (formData.hotel_arrangement === 'request') {
            let hotelText = `【宿泊先手配を希望】予算: 1名1泊あたり ${formData.hotel_budget_per_night || '設定なし'}円程度\n`;
            if (formData.hotel_requests.trim() !== '') {
                hotelText += ` - ご要望: ${formData.hotel_requests}\n`;
            }
            finalConcerns = hotelText + "\n" + finalConcerns;
        }

        const res = await submitConsultationLead({
            trip_plan_id: tripId, // Normally this comes from URL params
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            preferred_contact_method: formData.preferred_contact_method,
            concerns_text: finalConcerns
        })

        setIsSubmitting(false)
        if (res.success) {
            setIsSuccess(true)
        } else {
            alert("エラーが発生しました: " + res.error)
        }
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <div className="max-w-md w-full text-center space-y-6">
                    <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
                    <h1 className="text-2xl font-bold">送信完了しました</h1>
                    <p className="text-slate-600">
                        旅行会社（さくらツアー）の担当者より、折り返しご連絡いたします。<br />
                        旅程のたたき台をもとに、素敵な鹿児島旅行にしましょう！
                    </p>
                    <Button onClick={() => router.push('/')} variant="outline" className="mt-4">
                        トップへ戻る
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-2xl mx-auto space-y-6">
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    旅程ビルダーに戻る
                </button>

                <Card className="shadow-lg border-slate-200">
                    <form onSubmit={handleSubmit}>
                        <CardHeader className="bg-slate-900 text-white rounded-t-xl">
                            <CardTitle className="text-2xl">プロに相談する</CardTitle>
                            <CardDescription className="text-slate-300">
                                作成した旅程をベースに、現地の旅行会社が最適にアレンジします。
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">

                            {/* Dummy Trip Summary */}
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                                <h3 className="font-bold text-blue-900 mb-2 text-sm">現在の旅程情報（自動添付されます）</h3>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li>・2泊3日 / 車中心 / カップル</li>
                                    <li>・追加スポット: 4件</li>
                                    <li>・AI判定: ゆったり旅程</li>
                                </ul>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">お名前 <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        placeholder="鹿児島 太郎"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">メールアドレス <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        required
                                        placeholder="taro@example.com"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">電話番号</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="090-1234-5678"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contact_method">希望のご連絡方法</Label>
                                    <Select
                                        value={formData.preferred_contact_method}
                                        onValueChange={v => setFormData({ ...formData, preferred_contact_method: v })}
                                    >
                                        <SelectTrigger id="contact_method">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="email">メール</SelectItem>
                                            <SelectItem value="phone">電話</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="border border-slate-200 rounded-lg p-5 space-y-4 bg-white/50">
                                <h4 className="font-semibold text-slate-800 border-b pb-2">宿泊先の手配について</h4>
                                <div className="space-y-2">
                                    <Label htmlFor="hotel_arrangement">旅行会社での手配を希望しますか？</Label>
                                    <Select
                                        value={formData.hotel_arrangement}
                                        onValueChange={v => setFormData({ ...formData, hotel_arrangement: v })}
                                    >
                                        <SelectTrigger id="hotel_arrangement" className="bg-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">自分で手配する・不要</SelectItem>
                                            <SelectItem value="request">手配を希望する（予算を指定）</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {formData.hotel_arrangement === 'request' && (
                                    <div className="space-y-4 pt-4 border-t mt-4 border-slate-100 animate-in fade-in slide-in-from-top-1 duration-200">
                                        <div className="space-y-2">
                                            <Label htmlFor="hotel_budget">1名1泊あたりのご予算</Label>
                                            <div className="flex gap-2 items-center">
                                                <Input
                                                    id="hotel_budget"
                                                    type="number"
                                                    className="bg-white max-w-[200px]"
                                                    value={formData.hotel_budget_per_night}
                                                    onChange={e => setFormData({ ...formData, hotel_budget_per_night: e.target.value })}
                                                    placeholder="例: 15000"
                                                    min="0"
                                                    step="1000"
                                                />
                                                <span className="text-sm font-medium text-slate-600">円 程度</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="hotel_requests">宿泊に関するご要望（任意）</Label>
                                            <Textarea
                                                id="hotel_requests"
                                                className="min-h-[80px]"
                                                value={formData.hotel_requests}
                                                onChange={e => setFormData({ ...formData, hotel_requests: e.target.value })}
                                                placeholder="例: オーシャンビューの部屋が希望、温泉付き、和室が良い、朝食付き など"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="border border-slate-200 rounded-lg p-5 space-y-4 bg-white/50">
                                <h4 className="font-semibold text-slate-800 border-b pb-2">お食事のリクエスト</h4>
                                <div className="space-y-2">
                                    <Label htmlFor="meal_arrangement">旅行会社での事前手配（予約・提案）を希望しますか？</Label>
                                    <Select
                                        value={formData.meal_arrangement}
                                        onValueChange={v => setFormData({ ...formData, meal_arrangement: v, lunch_budget: "", dinner_budget: "" })}
                                    >
                                        <SelectTrigger id="meal_arrangement" className="bg-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">自分で探す・不要</SelectItem>
                                            <SelectItem value="both">ランチ・夕食ともに希望</SelectItem>
                                            <SelectItem value="lunch_only">ランチのみ希望</SelectItem>
                                            <SelectItem value="dinner_only">夕食のみ希望</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {formData.meal_arrangement !== 'none' && (
                                    <div className="space-y-4 pt-4 border-t mt-4 border-slate-100 animate-in fade-in slide-in-from-top-1 duration-200">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {(formData.meal_arrangement === 'lunch_only' || formData.meal_arrangement === 'both') && (
                                                <div className="space-y-2">
                                                    <Label htmlFor="lunch_budget">ランチのご予算（1名あたり）</Label>
                                                    <div className="flex gap-2 items-center">
                                                        <Input
                                                            id="lunch_budget"
                                                            type="number"
                                                            className="bg-white max-w-[200px]"
                                                            value={formData.lunch_budget}
                                                            onChange={e => setFormData({ ...formData, lunch_budget: e.target.value })}
                                                            placeholder="例: 2000"
                                                            min="0"
                                                            step="500"
                                                        />
                                                        <span className="text-sm font-medium text-slate-600">円 程度</span>
                                                    </div>
                                                </div>
                                            )}

                                            {(formData.meal_arrangement === 'dinner_only' || formData.meal_arrangement === 'both') && (
                                                <div className="space-y-2">
                                                    <Label htmlFor="dinner_budget">夕食のご予算（1名あたり）</Label>
                                                    <div className="flex gap-2 items-center">
                                                        <Input
                                                            id="dinner_budget"
                                                            type="number"
                                                            className="bg-white max-w-[200px]"
                                                            value={formData.dinner_budget}
                                                            onChange={e => setFormData({ ...formData, dinner_budget: e.target.value })}
                                                            placeholder="例: 5000"
                                                            min="0"
                                                            step="1000"
                                                        />
                                                        <span className="text-sm font-medium text-slate-600">円 程度</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="meal_requests">お食事に関するご要望・アレルギー等（任意）</Label>
                                            <Textarea
                                                id="meal_requests"
                                                className="min-h-[80px]"
                                                value={formData.meal_requests}
                                                onChange={e => setFormData({ ...formData, meal_requests: e.target.value })}
                                                placeholder="例: 海鮮系の美味しいお店、甲殻類アレルギー1名あり、個室希望 など"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="concerns">ご要望・お悩み</Label>
                                <Textarea
                                    id="concerns"
                                    className="min-h-[120px]"
                                    value={formData.concerns_text}
                                    onChange={e => setFormData({ ...formData, concerns_text: e.target.value })}
                                    placeholder="例：2日目の昼食でおすすめがあれば知りたいです。また、雨の日でも楽しめる場所を入れておきたいです。"
                                />
                            </div>

                        </CardContent>
                        <CardFooter className="bg-slate-50 border-t rounded-b-xl flex justify-between">
                            <p className="text-xs text-slate-500">入力内容は安全に送信されます。</p>
                            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 w-32">
                                {isSubmitting ? "送信中..." : (
                                    <>送信する <Send className="w-4 h-4 ml-2" /></>
                                )}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    )
}

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
        concerns_text: ""
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        // In Phase 2, tripId is still dummy
        const tripId = "dummy-trip-id"

        const res = await submitConsultationLead({
            trip_plan_id: tripId, // Normally this comes from URL params
            ...formData
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

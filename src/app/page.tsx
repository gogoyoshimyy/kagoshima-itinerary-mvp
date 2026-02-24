"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Map, Plane, Train, Car, Users, Calendar, Coins } from "lucide-react"

export default function Home() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    startDate: new Date().toISOString().split('T')[0],
    days: "2",
    startPoint: "kagoshima_chuo",
    mobility: "car",
    party: "couple",
    budget: "medium"
  })

  // MVP approach: pass state via query params for simplicity before Supabase trip_plans record creation.
  // In Phase 2, this will hit a Server Action to create `trip_plans` row and redirect to `/planner/[tripId]`
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const query = new URLSearchParams(formData).toString()
    router.push(`/planner?${query}`)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        
        {/* Marketing / Value Prop Side */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
            <Map className="w-4 h-4" />
            鹿児島旅行をもっとスマートに
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            プロに相談できる<br />
            <span className="text-blue-600">旅程ビルダー</span>
          </h1>
          <p className="text-lg text-slate-600">
            行きたい場所を並べるだけで、移動時間や概算費用を自動計算。
            無理のない旅行計画のたたき台を作り、そのまま地元の旅行会社に相談・アレンジ依頼が可能です。
          </p>
          <ul className="space-y-3 pt-4">
            <li className="flex items-center gap-3 text-slate-700">
              <div className="bg-white p-2 rounded-full shadow-sm text-blue-500"><Car className="w-5 h-5" /></div>
              <span>区間ごとの移動時間・距離・費用目安を自動算出</span>
            </li>
            <li className="flex items-center gap-3 text-slate-700">
              <div className="bg-white p-2 rounded-full shadow-sm text-rose-500"><Users className="w-5 h-5" /></div>
              <span>旅程の「無理」を可視化して警告</span>
            </li>
            <li className="flex items-center gap-3 text-slate-700">
              <div className="bg-white p-2 rounded-full shadow-sm text-green-500"><map className="w-5 h-5" /></div>
              <span>地元オススメスポットからアイデアを追加</span>
            </li>
          </ul>
        </div>

        {/* Input Form Side */}
        <Card className="w-full shadow-xl border-slate-200">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>旅行プランの条件を入力</CardTitle>
              <CardDescription>まずは枠組みを決めて旅程を作り始めましょう</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">出発日</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input 
                      id="startDate" 
                      type="date" 
                      className="pl-9"
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="days">日数</Label>
                  <Select value={formData.days} onValueChange={(val) => setFormData({...formData, days: val})}>
                    <SelectTrigger id="days">
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">日帰り</SelectItem>
                      <SelectItem value="2">1泊2日</SelectItem>
                      <SelectItem value="3">2泊3日</SelectItem>
                      <SelectItem value="4">3泊4日</SelectItem>
                      <SelectItem value="5">4泊5日以上</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startPoint">出発地点 (レンタカー・交通機関の起点)</Label>
                <Select value={formData.startPoint} onValueChange={(val) => setFormData({...formData, startPoint: val})}>
                  <SelectTrigger id="startPoint">
                    <SelectValue placeholder="出発地点を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kagoshima_chuo">鹿児島中央駅</SelectItem>
                    <SelectItem value="kagoshima_airport">鹿児島空港</SelectItem>
                    <SelectItem value="port">鹿児島港 (フェリー乗り場)</SelectItem>
                    <SelectItem value="other">その他・未定</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mobility">優先する移動手段</Label>
                  <Select value={formData.mobility} onValueChange={(val) => setFormData({...formData, mobility: val})}>
                    <SelectTrigger id="mobility">
                      <SelectValue placeholder="手段を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="car">
                        <div className="flex items-center gap-2"><Car className="w-4 h-4" /> 車・レンタカー</div>
                      </SelectItem>
                      <SelectItem value="transit">
                        <div className="flex items-center gap-2"><Train className="w-4 h-4" /> 公共交通機関</div>
                      </SelectItem>
                      <SelectItem value="balanced">
                        <div className="flex items-center gap-2"><Map className="w-4 h-4" /> バランスよく</div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>誰と行きますか？</Label>
                  <Select value={formData.party} onValueChange={(val) => setFormData({...formData, party: val})}>
                    <SelectTrigger>
                      <SelectValue placeholder="選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solo">ひとり旅</SelectItem>
                      <SelectItem value="couple">カップル・夫婦</SelectItem>
                      <SelectItem value="family">家族（子連れ）</SelectItem>
                      <SelectItem value="senior">家族（シニア含む）</SelectItem>
                      <SelectItem value="group">友人グループ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full text-lg h-12 bg-blue-600 hover:bg-blue-700">
                旅程を作り始める
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}

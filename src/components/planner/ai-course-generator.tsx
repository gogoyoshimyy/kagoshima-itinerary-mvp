"use client"

import { useState } from "react"
import { Loader2, ChevronRight, ChevronLeft, Sparkles, Mountain, Bath, Utensils, BookOpen, Activity, Baby, RotateCcw, CheckCircle2 } from "lucide-react"
import { generateCourseAction, type CourseRequest, type GeneratedCourse } from "@/app/actions/generate-course"
import { TripItem } from "@/types/planner"

interface AICourseGeneratorProps {
    onCourseReady: (items: TripItem[]) => void
    onClose: () => void
}

const THEMES = [
    { id: '絶景・自然', label: '絶景・自然', icon: Mountain, color: 'text-emerald-600 bg-emerald-50 border-emerald-200', activeColor: 'bg-emerald-500 text-white border-emerald-500' },
    { id: '温泉・癒やし', label: '温泉・癒やし', icon: Bath, color: 'text-blue-600 bg-blue-50 border-blue-200', activeColor: 'bg-blue-500 text-white border-blue-500' },
    { id: 'グルメ', label: 'グルメ', icon: Utensils, color: 'text-orange-600 bg-orange-50 border-orange-200', activeColor: 'bg-orange-500 text-white border-orange-500' },
    { id: '歴史・文化', label: '歴史・文化', icon: BookOpen, color: 'text-purple-600 bg-purple-50 border-purple-200', activeColor: 'bg-purple-500 text-white border-purple-500' },
    { id: 'アクティビティ', label: 'アクティビティ', icon: Activity, color: 'text-red-600 bg-red-50 border-red-200', activeColor: 'bg-red-500 text-white border-red-500' },
    { id: 'ファミリー', label: 'ファミリー向け', icon: Baby, color: 'text-pink-600 bg-pink-50 border-pink-200', activeColor: 'bg-pink-500 text-white border-pink-500' },
]

const ARRIVALS = ['鹿児島空港', '鹿児島中央駅', '指宿温泉', '霧島温泉', 'その他']
const COMPANIONS = [
    { id: 'ひとり旅', emoji: '🧍', label: 'ひとり旅' },
    { id: 'カップル', emoji: '👫', label: 'カップル' },
    { id: 'ファミリー（子供あり）', emoji: '👨‍👩‍👧', label: '家族（子供あり）' },
    { id: '友人グループ', emoji: '👥', label: '友人グループ' },
    { id: 'シニア', emoji: '👴', label: 'シニア' },
]

export function AICourseGenerator({ onCourseReady, onClose }: AICourseGeneratorProps) {
    const [step, setStep] = useState(1)
    const [themes, setThemes] = useState<string[]>([])
    const [days, setDays] = useState(2)
    const [arrival, setArrival] = useState('鹿児島空港')
    const [transport, setTransport] = useState<'car' | 'public'>('car')
    const [pace, setPace] = useState<'packed' | 'relaxed' | 'balanced'>('balanced')
    const [companion, setCompanion] = useState('カップル')
    const [mustVisit, setMustVisit] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedCourse, setGeneratedCourse] = useState<GeneratedCourse | null>(null)
    const [error, setError] = useState<string | null>(null)

    const toggleTheme = (id: string) => {
        setThemes(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id])
    }

    const handleGenerate = async () => {
        setIsGenerating(true)
        setError(null)

        const req: CourseRequest = {
            themes: themes.length > 0 ? themes : ['絶景・自然'],
            days,
            arrival,
            transport,
            pace,
            companion,
            mustVisit: mustVisit.trim() || undefined,
        }

        const result = await generateCourseAction(req)
        setIsGenerating(false)

        if (result.success && result.course) {
            setGeneratedCourse(result.course)
            setStep(5)
        } else {
            setError(result.error || 'コース生成に失敗しました')
        }
    }

    const handleAcceptCourse = () => {
        if (!generatedCourse) return
        const items: TripItem[] = []
        let sortOrder = 0
        let lastSpotOfPrevDay: { id: string; name: string; lat: number; lng: number; place_id: string | null } | null = null

        generatedCourse.days.forEach(day => {
            // 前日の最後のスポット（宿泊地）を翌日の出発地点として先頭に追加
            if (lastSpotOfPrevDay) {
                items.push({
                    id: `ai-carry-${lastSpotOfPrevDay.id}-day${day.day}-${Date.now()}`,
                    day_index: day.day - 1,
                    sort_order: sortOrder++,
                    spot_name: `${lastSpotOfPrevDay.name}（出発）`,
                    lat: lastSpotOfPrevDay.lat,
                    lng: lastSpotOfPrevDay.lng,
                    stay_minutes: 0,
                    travel_mode: 'car',
                    place_id: lastSpotOfPrevDay.place_id,
                })
            }

            day.spots.forEach(spot => {
                items.push({
                    id: `ai-${spot.id}-${Date.now()}-${sortOrder}`,
                    day_index: day.day - 1,
                    sort_order: sortOrder++,
                    spot_name: spot.name,
                    lat: spot.lat,
                    lng: spot.lng,
                    stay_minutes: spot.stay_minutes,
                    travel_mode: 'car',
                    place_id: spot.place_id,
                })
            })

            // この日の最後のスポットを記録（翌日の出発地に使う）
            const lastSpot = day.spots[day.spots.length - 1]
            if (lastSpot) {
                lastSpotOfPrevDay = {
                    id: lastSpot.id,
                    name: lastSpot.name,
                    lat: lastSpot.lat,
                    lng: lastSpot.lng,
                    place_id: lastSpot.place_id,
                }
            }
        })
        onCourseReady(items)
    }

    // ---- Step 4: Generating ----
    if (isGenerating) {
        return (
            <div className="flex flex-col items-center justify-center py-16 space-y-6">
                <div className="relative w-24 h-24">
                    <div className="absolute inset-0 rounded-full bg-indigo-100 animate-ping" />
                    <div className="relative w-24 h-24 rounded-full bg-indigo-500 flex items-center justify-center">
                        <Sparkles className="w-10 h-10 text-white animate-pulse" />
                    </div>
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold text-slate-800">AIがコースを設計中...</h3>
                    <p className="text-slate-500 text-sm">1,400件のスポットから最適な旅程を組み立てています</p>
                </div>
                <div className="flex gap-1.5 justify-center">
                    {['霧島', '桜島', '指宿', '奄美'].map((place, i) => (
                        <span key={place} className="text-xs px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.3}s` }}>
                            {place}を確認中
                        </span>
                    ))}
                </div>
            </div>
        )
    }

    // ---- Step 5: Result ----
    if (step === 5 && generatedCourse) {
        return (
            <div className="space-y-4">
                <div className="text-center space-y-1 mb-6">
                    <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-bold border border-green-200">
                        <CheckCircle2 className="w-4 h-4" />
                        コース生成完了！
                    </div>
                    <p className="text-slate-600 text-sm mt-3 italic px-4">「{generatedCourse.total_message}」</p>
                </div>

                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                    {generatedCourse.days.map(day => (
                        <div key={day.day} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="bg-gradient-to-r from-indigo-500 to-blue-500 px-4 py-3">
                                <span className="text-white font-bold text-sm">Day {day.day}：{day.theme}</span>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {day.spots.map((spot, i) => (
                                    <div key={spot.id} className="flex items-start gap-3 px-4 py-3">
                                        <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800 text-sm">{spot.name}</p>
                                            <p className="text-xs text-slate-500">{spot.reason}</p>
                                            <p className="text-[10px] text-slate-400 mt-0.5">滞在 {spot.stay_minutes}分</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        onClick={() => { setStep(4); setGeneratedCourse(null); handleGenerate() }}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors text-sm"
                    >
                        <RotateCcw className="w-4 h-4" />
                        作り直す
                    </button>
                    <button
                        onClick={handleAcceptCourse}
                        className="flex-2 flex-grow flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors text-sm shadow-md"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        このコースで決定！
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Progress */}
            <div className="flex gap-1.5">
                {[1, 2, 3, 4].map(s => (
                    <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? 'bg-indigo-500' : 'bg-slate-200'}`} />
                ))}
            </div>

            {/* Step 1: テーマ */}
            {step === 1 && (
                <div className="space-y-5">
                    <div>
                        <h3 className="font-bold text-slate-800 text-base">どんな旅にしたいですか？</h3>
                        <p className="text-slate-500 text-xs mt-0.5">複数選択できます</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {THEMES.map(theme => {
                            const Icon = theme.icon
                            const isActive = themes.includes(theme.id)
                            return (
                                <button
                                    key={theme.id}
                                    onClick={() => toggleTheme(theme.id)}
                                    className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all font-medium text-sm ${isActive ? theme.activeColor : theme.color}`}
                                >
                                    <Icon className="w-4 h-4 flex-shrink-0" />
                                    {theme.label}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Step 2: 基本情報 */}
            {step === 2 && (
                <div className="space-y-5">
                    <h3 className="font-bold text-slate-800 text-base">旅の基本情報を教えてください</h3>

                    <div>
                        <label className="text-xs font-bold text-slate-600 block mb-2">📅 日程</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map(d => (
                                <button
                                    key={d}
                                    onClick={() => setDays(d)}
                                    className={`flex-1 py-2.5 rounded-xl border-2 font-bold text-sm transition-all ${days === d ? 'bg-indigo-500 text-white border-indigo-500' : 'border-slate-200 text-slate-600 hover:border-indigo-300'}`}
                                >
                                    {d}泊{d + 1}日
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-600 block mb-2">✈️ 到着地点</label>
                        <div className="flex flex-wrap gap-2">
                            {ARRIVALS.map(a => (
                                <button
                                    key={a}
                                    onClick={() => setArrival(a)}
                                    className={`px-3 py-2 rounded-xl border-2 font-medium text-sm transition-all ${arrival === a ? 'bg-indigo-500 text-white border-indigo-500' : 'border-slate-200 text-slate-600 hover:border-indigo-300'}`}
                                >
                                    {a}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-600 block mb-2">🚗 移動手段</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setTransport('car')}
                                className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all ${transport === 'car' ? 'bg-indigo-500 text-white border-indigo-500' : 'border-slate-200 text-slate-600'}`}
                            >
                                🚗 レンタカー
                            </button>
                            <button
                                onClick={() => setTransport('public')}
                                className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all ${transport === 'public' ? 'bg-indigo-500 text-white border-indigo-500' : 'border-slate-200 text-slate-600'}`}
                            >
                                🚌 公共交通
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 3: スタイル / こだわり */}
            {step === 3 && (
                <div className="space-y-5">
                    <h3 className="font-bold text-slate-800 text-base">旅のスタイルを教えてください</h3>

                    <div>
                        <label className="text-xs font-bold text-slate-600 block mb-2">⚡ 旅のペース</label>
                        <div className="flex gap-2">
                            {[
                                { id: 'packed', label: '詰め込み派', emoji: '🏃' },
                                { id: 'balanced', label: 'バランス', emoji: '😊' },
                                { id: 'relaxed', label: 'のんびり派', emoji: '🐢' },
                            ].map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => setPace(p.id as any)}
                                    className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all flex flex-col items-center gap-1 ${pace === p.id ? 'bg-indigo-500 text-white border-indigo-500' : 'border-slate-200 text-slate-600'}`}
                                >
                                    <span className="text-xl">{p.emoji}</span>
                                    <span>{p.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-600 block mb-2">👥 同行者</label>
                        <div className="grid grid-cols-2 gap-2">
                            {COMPANIONS.map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => setCompanion(c.id)}
                                    className={`flex items-center gap-2 py-2.5 px-3 rounded-xl border-2 font-medium text-sm transition-all ${companion === c.id ? 'bg-indigo-500 text-white border-indigo-500' : 'border-slate-200 text-slate-600'}`}
                                >
                                    <span>{c.emoji}</span>
                                    {c.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-600 block mb-2">✨ 絶対行きたい場所（任意）</label>
                        <input
                            type="text"
                            value={mustVisit}
                            onChange={e => setMustVisit(e.target.value)}
                            placeholder="例: 砂むし温泉、縄文杉..."
                            className="w-full border-2 border-slate-200 rounded-xl py-2.5 px-3 text-sm focus:border-indigo-400 focus:outline-none"
                        />
                    </div>
                </div>
            )}

            {/* Step 4: 確認 */}
            {step === 4 && (
                <div className="space-y-4">
                    <h3 className="font-bold text-slate-800 text-base">この条件でコースを作成します</h3>
                    <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
                        <div className="flex gap-2 flex-wrap">{themes.length ? themes.map(t => <span key={t} className="bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full text-xs font-bold">{t}</span>) : <span className="text-slate-500">テーマ未選択（おまかせ）</span>}</div>
                        <div className="text-slate-700">📅 {days}泊{days + 1}日 / {arrival}発・着</div>
                        <div className="text-slate-700">🚗 {transport === 'car' ? 'レンタカー' : '公共交通機関'} / {pace === 'packed' ? '詰め込み' : pace === 'relaxed' ? 'のんびり' : 'バランス'}</div>
                        <div className="text-slate-700">👥 {companion}</div>
                        {mustVisit && <div className="text-slate-700">✨ こだわり: {mustVisit}</div>}
                    </div>
                    {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>}
                    <button
                        onClick={handleGenerate}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-bold rounded-xl shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5 text-base"
                    >
                        <Sparkles className="w-5 h-5" />
                        AIにコースを作ってもらう✨
                    </button>
                </div>
            )}

            {/* Navigation */}
            {step < 5 && !isGenerating && (
                <div className="flex gap-3 pt-2">
                    {step > 1 && (
                        <button
                            onClick={() => setStep(s => s - 1)}
                            className="flex items-center gap-1 px-4 py-2.5 border-2 border-slate-200 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" /> 戻る
                        </button>
                    )}
                    {step < 4 && (
                        <button
                            onClick={() => setStep(s => s + 1)}
                            disabled={step === 1 && themes.length === 0}
                            className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-40"
                        >
                            次へ <ChevronRight className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

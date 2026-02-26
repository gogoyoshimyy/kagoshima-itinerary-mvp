"use client"

import { useRouter } from "next/navigation"
import { Compass, Clock, MapPin, ArrowRight } from "lucide-react"

export default function Home() {
  const router = useRouter()

  const handleSelectMode = (mode: string) => {
    // For now, they all go to the same planner page with a query param
    // In the future, we can route them to different initial screens like /planner/inspiration
    router.push(`/planner?mode=${mode}`)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full">

        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
            <MapPin className="w-4 h-4" />
            鹿児島旅行をもっとスマートに
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            どういう風にプランを作りますか？
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            旅行の決まり具合や、あなたのスタイルに合わせて最適な作り方を選んでください。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Mode A: Discovery / Inspiration */}
          <button
            onClick={() => handleSelectMode('discover')}
            className="group bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-400 transition-all text-left flex flex-col h-full"
          >
            <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Compass className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">気になる場所から探す</h3>
            <p className="text-slate-500 mb-6 flex-1 text-sm leading-relaxed">
              行き先はまだ未定。魅力的な写真から「ここ行きたい！」を選んで、AIにおまかせで効率的なルートを作ってもらいたい方に。
            </p>
            <div className="flex items-center text-blue-600 font-medium text-sm">
              おまかせでプラン作成 <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Mode B: Schedule / Time-filling */}
          <button
            onClick={() => handleSelectMode('schedule')}
            className="group bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-400 transition-all text-left flex flex-col h-full relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
              おすすめ
            </div>
            <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Clock className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">空き時間を埋める</h3>
            <p className="text-slate-500 mb-6 flex-1 text-sm leading-relaxed">
              到着時間と宿泊ホテルなど、確定している予定を入力。システムがその経路上の「無理なく行ける良い場所」をサジェストしてくれます。
            </p>
            <div className="flex items-center text-blue-600 font-medium text-sm">
              スケジュールから作る <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Mode C: Must-visit / Core spot */}
          <button
            onClick={() => handleSelectMode('must_visit')}
            className="group bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-400 transition-all text-left flex flex-col h-full"
          >
            <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <MapPin className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">絶対行きたい場所を軸に</h3>
            <p className="text-slate-500 mb-6 flex-1 text-sm leading-relaxed">
              「砂むし温泉だけは絶対外せない！」など、旅のメインとなるスポットを軸に、無駄のない周遊ルートを組みたい方に。
            </p>
            <div className="flex items-center text-blue-600 font-medium text-sm">
              スポット検索から始める <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

        </div>
      </div>
    </div>
  )
}

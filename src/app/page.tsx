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
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background Hero Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/sakurajima_hero.png"
          alt="Sakurajima"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-all duration-700" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/20 to-slate-900/80" />
      </div>

      <div className="max-w-5xl w-full relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 text-blue-100 text-sm font-semibold backdrop-blur-md border border-white/20">
            <MapPin className="w-4 h-4 text-blue-400" />
            鹿児島をデザインする
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white leading-tight drop-shadow-2xl">
            最高の鹿児島、<br />
            どう楽しみますか？
          </h1>
          <p className="text-xl text-slate-200 max-w-2xl mx-auto font-medium drop-shadow-lg">
            あなたの気分や予定に合わせて、<br className="md:hidden" />最適なプラン作成の入り口を選んでください。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Mode A: Discovery / Inspiration */}
          <button
            onClick={() => handleSelectMode('discover')}
            className="group relative bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 shadow-2xl hover:bg-white/20 hover:scale-[1.03] transition-all duration-300 text-left flex flex-col h-full overflow-hidden"
          >
            <div className="w-16 h-16 bg-rose-500/20 text-rose-300 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-rose-500/30">
              <Compass className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">気になる場所から探す</h3>
            <p className="text-slate-300 mb-8 flex-1 text-base leading-relaxed">
              魅力的な景色やグルメの写真から「ここ行きたい！」を直感でチョイス。AIが最適なルートを組み上げます。
            </p>
            <div className="flex items-center text-rose-300 font-bold text-sm tracking-wide">
              インスピレーションから作る <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
            </div>
          </button>

          {/* Mode B: Schedule / Time-filling */}
          <button
            onClick={() => handleSelectMode('schedule')}
            className="group relative bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/30 shadow-2xl hover:bg-white/20 hover:scale-[1.03] transition-all duration-300 text-left flex flex-col h-full overflow-hidden ring-2 ring-blue-500/50"
          >
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-black px-4 py-1.5 rounded-bl-2xl tracking-widest">
              RECOMMENDED
            </div>
            <div className="w-16 h-16 bg-blue-500/20 text-blue-300 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-blue-500/30">
              <Clock className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">空き時間を埋める</h3>
            <p className="text-slate-300 mb-8 flex-1 text-base leading-relaxed">
              到着・出発時刻や宿泊先など、決まっている予定を入力。その隙間を「移動のついで」で賢く埋めるプランを提案。
            </p>
            <div className="flex items-center text-blue-300 font-bold text-sm tracking-wide">
              スケジュールから作る <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
            </div>
          </button>

          {/* Mode C: Must-visit / Core spot */}
          <button
            onClick={() => handleSelectMode('must_visit')}
            className="group relative bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 shadow-2xl hover:bg-white/20 hover:scale-[1.03] transition-all duration-300 text-left flex flex-col h-full overflow-hidden"
          >
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-300 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-emerald-500/30">
              <MapPin className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">絶対行きたい場所を軸に</h3>
            <p className="text-slate-300 mb-8 flex-1 text-base leading-relaxed">
              「これだけは外せない！」という目的地を検索。それを中心に、周辺の厳選スポットを組み合わせたルートを作成。
            </p>
            <div className="flex items-center text-emerald-300 font-bold text-sm tracking-wide">
              こだわりスポットから作る <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}


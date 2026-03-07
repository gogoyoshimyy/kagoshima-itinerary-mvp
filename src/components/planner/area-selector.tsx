"use client"

import React from "react"
import { MapPin, MountainSnow, Bath, Waves, Ship, Palmtree, Landmark, Map as MapIcon } from "lucide-react"

export type RegionId = 'all' | 'hokusatsu' | 'kirishima_aira' | 'chusatsu' | 'nansatsu' | 'osumi' | 'islands_north' | 'amami'

interface RegionInfo {
    id: RegionId
    name: string
    description: string
    subAreas: string
    icon: React.ReactNode
    color: string
    activeColor: string
}

const REGIONS: RegionInfo[] = [
    {
        id: 'hokusatsu',
        name: '北薩摩',
        description: '出水・阿久根・薩摩川内',
        subAreas: '鶴の渡来地、川内高城温泉',
        icon: <Landmark className="w-5 h-5" />,
        color: 'text-cyan-600 bg-cyan-50 border-cyan-200',
        activeColor: 'bg-cyan-500 border-cyan-600',
    },
    {
        id: 'kirishima_aira',
        name: '霧島・姶良',
        description: '霧島・伊佐・姶良',
        subAreas: '霧島神宮、高千穂牧場',
        icon: <MountainSnow className="w-5 h-5" />,
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        activeColor: 'bg-emerald-500 border-emerald-600',
    },
    {
        id: 'chusatsu',
        name: '中薩摩',
        description: '鹿児島市・日置・いちき串木野',
        subAreas: '桜島、仙巌園、天文館',
        icon: <MapPin className="w-5 h-5" />,
        color: 'text-blue-700 bg-blue-50 border-blue-200',
        activeColor: 'bg-blue-500 border-blue-600',
    },
    {
        id: 'nansatsu',
        name: '南薩摩',
        description: '指宿・知覧・枕崎・南さつま',
        subAreas: '砂むし温泉、武家屋敷',
        icon: <Bath className="w-5 h-5" />,
        color: 'text-orange-700 bg-orange-50 border-orange-200',
        activeColor: 'bg-orange-500 border-orange-600',
    },
    {
        id: 'osumi',
        name: '大隅',
        description: '鹿屋・垂水・志布志・南大隅',
        subAreas: '雄川の滝、佐多岬',
        icon: <Waves className="w-5 h-5" />,
        color: 'text-teal-700 bg-teal-50 border-teal-200',
        activeColor: 'bg-teal-500 border-teal-600',
    },
    {
        id: 'islands_north',
        name: '種子屋久・十島三島',
        description: '西之表・屋久島・十島など',
        subAreas: '縄文杉、ロケット基地',
        icon: <Ship className="w-5 h-5" />,
        color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
        activeColor: 'bg-indigo-500 border-indigo-600',
    },
    {
        id: 'amami',
        name: '奄美',
        description: '奄美・徳之島・与論など',
        subAreas: 'マングローブ、加計呂麻島',
        icon: <Palmtree className="w-5 h-5" />,
        color: 'text-pink-700 bg-pink-50 border-pink-200',
        activeColor: 'bg-pink-500 border-pink-600',
    }
]

interface AreaSelectorProps {
    selectedArea: RegionId
    onAreaChange: (area: RegionId) => void
}

export function AreaSelector({ selectedArea, onAreaChange }: AreaSelectorProps) {

    return (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 overflow-hidden">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <MapIcon className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-bold text-slate-800 text-base">
                        エリアから探す
                    </h3>
                </div>
                {selectedArea !== 'all' && (
                    <button
                        onClick={() => onAreaChange('all')}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50 px-2 py-1 rounded-full transition-colors"
                    >
                        クリア
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-2">
                {REGIONS.map((region) => {
                    const isSelected = selectedArea === region.id;
                    return (
                        <button
                            key={region.id}
                            onClick={() => onAreaChange(region.id)}
                            className={`
                                group flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 text-left
                                ${isSelected
                                    ? `${region.activeColor} text-white shadow-md border-transparent`
                                    : `bg-white border-slate-100 text-slate-700 hover:border-slate-300 hover:bg-slate-50`
                                }
                            `}
                        >
                            <div className={`
                                flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg transition-colors
                                ${isSelected ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-white'}
                            `}>
                                {region.icon}
                            </div>
                            <div className="flex-grow">
                                <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-sm leading-tight">{region.name}</span>
                                    {!isSelected && (
                                        <div className={`w-1.5 h-1.5 rounded-full ${region.activeColor.split(' ')[0]}`} />
                                    )}
                                </div>
                                <div className={`text-[11px] leading-snug mt-0.5 ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                                    {region.description}
                                </div>
                            </div>
                            <div className={`text-[10px] hidden sm:block ${isSelected ? 'text-white/60' : 'text-slate-400 group-hover:text-indigo-500'}`}>
                                {region.subAreas}
                            </div>
                        </button>
                    )
                })}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-[11px] text-slate-500 flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg">
                    <span className="text-indigo-500 font-bold">Tips:</span>
                    初日・最終日は霧島・姶良（空港近く）や中薩摩（市内）がおすすめ。大隅↔南薩の同日移動は非常に時間がかかります。
                </p>
            </div>
        </div>
    )
}

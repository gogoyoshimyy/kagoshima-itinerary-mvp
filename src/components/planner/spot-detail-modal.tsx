"use client"

import { useEffect, useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { getPlaceDetails, PlaceDetails } from "@/app/actions/places"
import { MapPin, Phone, Globe, Clock, Star, Loader2 } from "lucide-react"

interface SpotDetailModalProps {
    placeId: string | null
    onClose: () => void
}

export function SpotDetailModal({ placeId, onClose }: SpotDetailModalProps) {
    const [details, setDetails] = useState<PlaceDetails | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!placeId) {
            setDetails(null)
            setError(null)
            return
        }

        let isMounted = true

        const fetchDetails = async () => {
            setLoading(true)
            setError(null)
            try {
                const data = await getPlaceDetails(placeId)
                if (isMounted) {
                    if (data) {
                        setDetails(data)
                    } else {
                        setError("詳細情報を取得できませんでした。")
                    }
                }
            } catch (err) {
                if (isMounted) {
                    setError("通信エラーが発生しました。")
                }
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        fetchDetails()

        return () => {
            isMounted = false
        }
    }, [placeId])

    return (
        <Dialog open={!!placeId} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden bg-white">
                {loading && (
                    <div className="flex flex-col items-center justify-center p-12 text-slate-500">
                        <Loader2 className="h-8 w-8 animate-spin mb-4 text-blue-500" />
                        <p className="text-sm">詳細情報を読み込み中...</p>
                    </div>
                )}

                {error && !loading && (
                    <div className="p-6 text-center text-red-500">
                        <p>{error}</p>
                    </div>
                )}

                {details && !loading && (
                    <div className="flex flex-col max-h-[85vh] overflow-y-auto">
                        {/* Header Image Area */}
                        {details.photoUris && details.photoUris.length > 0 ? (
                            <div className="w-full h-48 relative bg-slate-100">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={details.photoUris[0]}
                                    alt={details.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="w-full h-32 bg-slate-100 flex items-center justify-center text-slate-400">
                                <span className="text-sm">No Image Available</span>
                            </div>
                        )}

                        <div className="p-6 space-y-6">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold text-slate-800">
                                    {details.name}
                                </DialogTitle>
                                {details.rating && (
                                    <div className="flex items-center gap-1 mt-1">
                                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-500" />
                                        <span className="font-semibold text-slate-700">{details.rating}</span>
                                        <span className="text-xs text-slate-500">({details.userRatingCount?.toLocaleString()}件のレビュー)</span>
                                    </div>
                                )}
                            </DialogHeader>

                            <div className="space-y-3 text-sm text-slate-600">
                                {details.address && (
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                        <span>{details.address.replace('日本、', '')}</span>
                                    </div>
                                )}

                                {details.phoneNumber && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                                        <a href={`tel:${details.phoneNumber}`} className="text-blue-600 hover:underline">
                                            {details.phoneNumber}
                                        </a>
                                    </div>
                                )}

                                {details.websiteUri && (
                                    <div className="flex items-start gap-2">
                                        <Globe className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                        <a href={details.websiteUri} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                                            {details.websiteUri}
                                        </a>
                                    </div>
                                )}

                                {details.weekdayDescriptions && details.weekdayDescriptions.length > 0 && (
                                    <div className="flex items-start gap-2">
                                        <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                        <div className="flex flex-col gap-1">
                                            {details.openNow !== undefined && (
                                                <span className={`font-semibold ${details.openNow ? 'text-green-600' : 'text-red-500'}`}>
                                                    {details.openNow ? '営業中' : '営業時間外'}
                                                </span>
                                            )}
                                            <details className="cursor-pointer group">
                                                <summary className="text-slate-500 hover:text-slate-800 transition-colors">営業時間を表示</summary>
                                                <ul className="mt-2 text-xs space-y-1 text-slate-500 pb-2">
                                                    {details.weekdayDescriptions.map((desc, i) => (
                                                        <li key={i}>{desc}</li>
                                                    ))}
                                                </ul>
                                            </details>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

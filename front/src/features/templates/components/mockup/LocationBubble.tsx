import { MapIcon, MapPin } from "lucide-react"
import type { Template } from "../../types"
import { getLocation } from "../../bodyParsers"
import { Bubble } from "./Bubble"

interface LocationBubbleProps {
  template: Template
}

export function LocationBubble({ template }: LocationBubbleProps) {
  const { latitude, longitude, label, address } = getLocation(template)
  const coordText =
    typeof latitude === "number" && typeof longitude === "number"
      ? `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
      : null

  return (
    <Bubble noPadding>
      <div className="w-full h-32 bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center relative">
        <MapIcon className="w-8 h-8 text-emerald-300 dark:text-emerald-700" />
        <div className="absolute inset-0 flex items-center justify-center">
          <MapPin className="w-6 h-6 text-emerald-600 dark:text-emerald-400 fill-emerald-100 dark:fill-emerald-900/50" />
        </div>
      </div>
      <div className="p-3">
        {label && <p className="font-bold text-sm">{label}</p>}
        {address && (
          <p className="text-xs text-gray-600 dark:text-slate-400 whitespace-pre-wrap">
            {address}
          </p>
        )}
        {coordText ? (
          <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1 font-mono">
            {coordText}
          </p>
        ) : (
          !label &&
          !address && (
            <p className="text-gray-400 dark:text-slate-500 italic text-xs">
              Coordenadas ausentes
            </p>
          )
        )}
        <div className="text-right text-[10px] text-gray-400 dark:text-slate-400 mt-1">
          10:00
        </div>
      </div>
    </Bubble>
  )
}

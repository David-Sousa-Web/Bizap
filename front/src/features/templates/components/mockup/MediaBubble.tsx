import { useState } from "react"
import { FileText, ImageIcon, Music, Video } from "lucide-react"
import type { Template } from "../../types"
import { detectMediaKind, getBodyText, getMedia } from "../../bodyParsers"
import { Bubble } from "./Bubble"
import { VariableChips } from "./VariableChips"

interface MediaBubbleProps {
  template: Template
}

function MediaIcon({ kind }: { kind: ReturnType<typeof detectMediaKind> }) {
  if (kind === "image") return <ImageIcon className="w-8 h-8 text-blue-400 dark:text-blue-500" />
  if (kind === "video") return <Video className="w-8 h-8 text-blue-400 dark:text-blue-500" />
  if (kind === "audio") return <Music className="w-8 h-8 text-blue-400 dark:text-blue-500" />
  return <FileText className="w-8 h-8 text-blue-400 dark:text-blue-500" />
}

export function MediaBubble({ template }: MediaBubbleProps) {
  const media = getMedia(template)
  const text = getBodyText(template)
  const url = media[0]
  const kind = url ? detectMediaKind(url) : "image"
  const [imgFailed, setImgFailed] = useState(false)

  return (
    <Bubble noPadding>
      <div className="w-full h-32 bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center overflow-hidden">
        {url && kind === "image" && !imgFailed ? (
          <img
            src={url}
            alt="Mídia do template"
            className="w-full h-full object-cover"
            onError={() => setImgFailed(true)}
          />
        ) : url && kind === "video" && !imgFailed ? (
          <video
            src={url}
            className="w-full h-full object-cover"
            muted
            playsInline
            onError={() => setImgFailed(true)}
          />
        ) : (
          <MediaIcon kind={kind} />
        )}
      </div>
      <div className="p-3">
        {text ? (
          <VariableChips text={text} />
        ) : (
          <p className="text-gray-400 dark:text-slate-500 italic">
            {url ? "Mídia" : "Mídia sem URL disponível"}
          </p>
        )}
        {url && (
          <p className="text-[9px] text-gray-400 dark:text-slate-500 mt-1 truncate">
            {url}
          </p>
        )}
        <div className="text-right text-[10px] text-gray-400 dark:text-slate-400 mt-1">
          10:00
        </div>
      </div>
    </Bubble>
  )
}

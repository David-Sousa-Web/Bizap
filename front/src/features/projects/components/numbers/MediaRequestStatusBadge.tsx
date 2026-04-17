import { memo } from "react"

import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { MediaRequestStatus } from "@/features/projects/types"
import { getMediaRequestStatusDisplay } from "@/features/projects/utils/mediaRequestStatus"

interface MediaRequestStatusBadgeProps {
  status: MediaRequestStatus | null
  className?: string
}

export const MediaRequestStatusBadge = memo(function MediaRequestStatusBadge({
  status,
  className,
}: MediaRequestStatusBadgeProps) {
  const { label, description, icon: Icon, tone } = getMediaRequestStatusDisplay(status)

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant="outline"
          aria-label={label}
          className={cn(tone, className)}
        >
          <Icon aria-hidden="true" />
          {label}
        </Badge>
      </TooltipTrigger>
      <TooltipContent side="top">{description}</TooltipContent>
    </Tooltip>
  )
})

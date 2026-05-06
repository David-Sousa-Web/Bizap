import type { ReactNode } from "react"
import type { Template } from "@/features/templates/types"
import { getTypeKey } from "../bodyParsers"
import { MockupChassis } from "./mockup/MockupChassis"
import { TextBubble } from "./mockup/TextBubble"
import { MediaBubble } from "./mockup/MediaBubble"
import { QuickReplyBubble } from "./mockup/QuickReplyBubble"
import { CtaBubble } from "./mockup/CtaBubble"
import { ListPickerBubble } from "./mockup/ListPickerBubble"
import { CardBubble } from "./mockup/CardBubble"
import { CarouselBubble } from "./mockup/CarouselBubble"
import { LocationBubble } from "./mockup/LocationBubble"
import { AuthBubble } from "./mockup/AuthBubble"
import { FlowBubble } from "./mockup/FlowBubble"
import { CatalogBubble } from "./mockup/CatalogBubble"
import { FallbackBubble } from "./mockup/FallbackBubble"

interface TemplateMockupProps {
  template: Template
  children?: ReactNode
}

const exactMap: Record<string, (t: Template) => ReactNode> = {
  "twilio/text": (t) => <TextBubble template={t} />,
  "twilio/media": (t) => <MediaBubble template={t} />,
  "twilio/quick-reply": (t) => <QuickReplyBubble template={t} />,
  "twilio/call-to-action": (t) => <CtaBubble template={t} />,
  "twilio/list-picker": (t) => <ListPickerBubble template={t} />,
  "twilio/card": (t) => <CardBubble template={t} />,
  "twilio/carousel": (t) => <CarouselBubble template={t} />,
  "twilio/location": (t) => <LocationBubble template={t} />,
  "twilio/authentication": (t) => <AuthBubble template={t} />,
  "twilio/catalog": (t) => <CatalogBubble template={t} />,
  "whatsapp/flow": (t) => <FlowBubble template={t} />,
  "whatsapp/card": (t) => <CardBubble template={t} />,
}

const containsMatchers: Array<{
  keyword: string
  render: (t: Template) => ReactNode
}> = [
  { keyword: "carousel", render: (t) => <CarouselBubble template={t} /> },
  { keyword: "list", render: (t) => <ListPickerBubble template={t} /> },
  { keyword: "quick", render: (t) => <QuickReplyBubble template={t} /> },
  { keyword: "reply", render: (t) => <QuickReplyBubble template={t} /> },
  { keyword: "call-to-action", render: (t) => <CtaBubble template={t} /> },
  { keyword: "cta", render: (t) => <CtaBubble template={t} /> },
  { keyword: "location", render: (t) => <LocationBubble template={t} /> },
  { keyword: "auth", render: (t) => <AuthBubble template={t} /> },
  { keyword: "flow", render: (t) => <FlowBubble template={t} /> },
  { keyword: "catalog", render: (t) => <CatalogBubble template={t} /> },
  { keyword: "card", render: (t) => <CardBubble template={t} /> },
  { keyword: "media", render: (t) => <MediaBubble template={t} /> },
  { keyword: "text", render: (t) => <TextBubble template={t} /> },
]

function renderBubble(template: Template): ReactNode {
  const key = getTypeKey(template)
  const exact = exactMap[key]
  if (exact) return exact(template)
  const match = containsMatchers.find((m) => key.includes(m.keyword))
  return match ? match.render(template) : <FallbackBubble template={template} />
}

export function TemplateMockup({ template, children }: TemplateMockupProps) {
  return (
    <MockupChassis>
      {renderBubble(template)}
      {children}
    </MockupChassis>
  )
}

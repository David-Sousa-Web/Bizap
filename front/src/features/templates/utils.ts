import {
  Type,
  Layers,
  ThumbsUp,
  ShieldCheck,
  List,
  ShoppingCart,
  IdCard,
  CreditCard,
  ImageIcon,
  MousePointerClick,
  GalleryHorizontal,
  HelpCircle,
  MapPin,
} from "lucide-react"

export function getTypeConfig(type: string) {
  const t = type?.toLowerCase() || ""
  if (t.includes("text")) return { icon: Type, label: type }
  if (t.includes("flow")) return { icon: Layers, label: type }
  if (t.includes("quick") || t.includes("reply"))
    return { icon: ThumbsUp, label: type }
  if (t.includes("auth")) return { icon: ShieldCheck, label: type }
  if (t.includes("list")) return { icon: List, label: type }
  if (t.includes("catalog")) return { icon: ShoppingCart, label: type }
  if (t.includes("whatsapp card")) return { icon: IdCard, label: type }
  if (t.includes("card")) return { icon: CreditCard, label: type }
  if (t.includes("media")) return { icon: ImageIcon, label: type }
  if (t.includes("call-to-action") || t.includes("cta"))
    return { icon: MousePointerClick, label: type }
  if (t.includes("carousel")) return { icon: GalleryHorizontal, label: type }
  if (t.includes("location")) return { icon: MapPin, label: type }
  return { icon: HelpCircle, label: type }
}

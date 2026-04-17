import type { Template } from "@/features/templates/types"
import { 
  ImageIcon, 
  Menu, 
  Globe, 
  MapIcon, 
  MapPin, 
  Copy, 
  ShoppingBag, 
  Smartphone, 
  Laptop, 
  ChevronRight, 
  ChevronLeft, 
  Settings 
} from "lucide-react"

import type { ReactNode } from "react"

interface TemplateMockupProps {
  template: Template
  children?: ReactNode
}

export function TemplateMockup({ template, children }: TemplateMockupProps) {
  // Safe extraction of body
  let bodyContent = ""
  let components: Record<string, unknown>[] = []
  
  if (template.body) {
    if (typeof template.body.body === "string") {
      bodyContent = template.body.body
    } else {
      bodyContent = JSON.stringify(template.body)
    }
  }

  // Se o backend retorna os "components" (ex: buttons) na variavel body
  if (template.body && Array.isArray((template.body as Record<string, unknown>).components)) {
    components = (template.body as Record<string, unknown>).components as Record<string, unknown>[]
  } else if (template.body && Array.isArray((template.body as Record<string, unknown>).buttons)) {
    components = (template.body as Record<string, unknown>).buttons as Record<string, unknown>[]
  }

  // Apenas para evitar lint error enquanto não usamos components ativamente no mockup dummy
  void components;

  const renderContent = () => {
    const type = template.type.toLowerCase()

    // Render baseado no tipo, similar ao HTML de referência
    if (type.includes("text")) {
      return (
        <div className="bg-white dark:bg-slate-800 dark:text-slate-100 p-3 rounded-t-lg rounded-br-lg rounded-bl-none shadow-sm max-w-[90%] text-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
          <p className="whitespace-pre-wrap">{bodyContent || "Texto sem conteúdo"}</p>
          <div className="text-right text-[10px] text-gray-400 dark:text-slate-400 mt-1">10:00</div>
        </div>
      )
    }

    if (type.includes("media")) {
      return (
        <div className="bg-white dark:bg-slate-800 dark:text-slate-100 rounded-t-lg rounded-br-lg rounded-bl-none shadow-sm max-w-[90%] text-sm animate-in fade-in slide-in-from-bottom-2 duration-300 overflow-hidden">
          <div className="w-full h-32 bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-blue-400 dark:text-blue-500" />
          </div>
          <div className="p-3">
            <p className="whitespace-pre-wrap">{bodyContent || "Mídia"}</p>
            <div className="text-right text-[10px] text-gray-400 dark:text-slate-400 mt-1">10:00</div>
          </div>
        </div>
      )
    }

    if (type.includes("list")) {
      return (
        <div className="bg-white dark:bg-slate-800 dark:text-slate-100 p-3 rounded-t-lg rounded-br-lg rounded-bl-none shadow-sm max-w-[90%] text-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="font-bold mb-1">Menu de Lista</div>
          <p className="whitespace-pre-wrap">{bodyContent}</p>
          <div className="mt-3 border-t dark:border-slate-700 pt-2 flex items-center justify-center text-blue-500 dark:text-blue-400 font-bold cursor-pointer hover:dark:text-blue-300">
            <Menu className="w-4 h-4 mr-2" /> Ver Opções
          </div>
        </div>
      )
    }

    if (type.includes("reply") || type.includes("quick")) {
      return (
        <div className="flex flex-col gap-1 w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-white dark:bg-slate-800 dark:text-slate-100 p-3 rounded-t-lg rounded-br-lg rounded-bl-none shadow-sm max-w-[90%] text-sm">
            <p className="whitespace-pre-wrap">{bodyContent}</p>
          </div>
          <div className="flex flex-col gap-1 w-[90%] mt-1">
            <div className="bg-white dark:bg-slate-800 text-blue-500 dark:text-blue-400 font-bold p-2 text-center rounded-lg shadow-sm cursor-pointer border border-gray-100 dark:border-slate-700 hover:dark:bg-slate-700">
              Resposta 1
            </div>
            <div className="bg-white dark:bg-slate-800 text-blue-500 dark:text-blue-400 font-bold p-2 text-center rounded-lg shadow-sm cursor-pointer border border-gray-100 dark:border-slate-700 hover:dark:bg-slate-700">
              Resposta 2
            </div>
          </div>
        </div>
      )
    }

    if (type.includes("call-to-action") || type.includes("cta")) {
      return (
        <div className="flex flex-col gap-1 w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-white dark:bg-slate-800 dark:text-slate-100 p-3 rounded-t-lg rounded-br-lg rounded-bl-none shadow-sm max-w-[90%] text-sm">
            <p className="whitespace-pre-wrap">{bodyContent}</p>
          </div>
          <div className="flex flex-col gap-1 w-[90%] mt-1">
            <div className="bg-white dark:bg-slate-800 text-blue-500 dark:text-blue-400 font-bold p-2 text-center rounded-lg shadow-sm cursor-pointer border border-gray-100 dark:border-slate-700 flex justify-center items-center gap-2 hover:dark:bg-slate-700">
              <Globe className="w-4 h-4" /> Acessar Link
            </div>
          </div>
        </div>
      )
    }

    if (type.includes("location")) {
      return (
        <div className="bg-white dark:bg-slate-800 dark:text-slate-100 rounded-t-lg rounded-br-lg rounded-bl-none shadow-sm max-w-[90%] text-sm animate-in fade-in slide-in-from-bottom-2 duration-300 overflow-hidden">
          <div className="w-full h-32 bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center relative">
            <MapIcon className="w-8 h-8 text-emerald-300 dark:text-emerald-700" />
            <div className="absolute inset-0 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-emerald-600 dark:text-emerald-400 fill-emerald-100 dark:fill-emerald-900/50" />
            </div>
          </div>
          <div className="p-3">
            <p className="whitespace-pre-wrap p-1">{bodyContent || "Localização"}</p>
            <div className="text-right text-[10px] text-gray-400 dark:text-slate-400 mt-1">10:00</div>
          </div>
        </div>
      )
    }

    if (type.includes("card")) {
      return (
        <div className="bg-white dark:bg-slate-800 dark:text-slate-100 rounded-t-lg rounded-br-lg rounded-bl-none shadow-sm w-[90%] text-sm animate-in fade-in slide-in-from-bottom-2 duration-300 overflow-hidden border border-gray-200 dark:border-slate-700">
          <div className="h-24 bg-gray-100 dark:bg-slate-700/50 flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-gray-400 dark:text-slate-500" />
          </div>
          <div className="p-3">
            <p className="font-bold text-base mb-1">Título do Card</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 whitespace-pre-wrap">{bodyContent}</p>
          </div>
          <div className="border-t border-gray-100 dark:border-slate-700 flex flex-col">
            <div className="p-2 text-center text-blue-500 dark:text-blue-400 font-bold text-sm cursor-pointer border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 hover:dark:bg-slate-700">
              Ação 1
            </div>
          </div>
        </div>
      )
    }

    if (type.includes("auth")) {
      return (
        <div className="flex flex-col gap-1 w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-white dark:bg-slate-800 dark:text-slate-100 p-3 rounded-t-lg rounded-br-lg rounded-bl-none shadow-sm max-w-[90%] text-sm">
            <div className="font-bold mb-1">Código de Segurança</div>
            <p className="whitespace-pre-wrap">{bodyContent}</p>
          </div>
          <div className="w-[90%] bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700 mt-1 text-center hover:bg-gray-50 hover:dark:bg-slate-700">
            <div className="p-2 text-blue-500 dark:text-blue-400 font-bold text-sm flex justify-center items-center gap-2 cursor-pointer">
              <Copy className="w-4 h-4" /> Copiar Código
            </div>
          </div>
        </div>
      )
    }

    if (type.includes("catalog")) {
      return (
        <div className="flex flex-col gap-1 w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-white dark:bg-slate-800 dark:text-slate-100 p-3 rounded-t-lg rounded-br-lg rounded-bl-none shadow-sm max-w-[90%] text-sm">
            <div className="font-bold mb-1">Catálogo</div>
            <p className="whitespace-pre-wrap">{bodyContent || "Veja nosso catálogo"}</p>
          </div>
          <div className="w-[90%] bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700 mt-1 flex items-center p-2 cursor-pointer hover:bg-gray-50 hover:dark:bg-slate-700">
            <div className="h-10 w-10 bg-gray-100 dark:bg-slate-700 rounded flex items-center justify-center mr-3">
              <ShoppingBag className="w-5 h-5 text-gray-500 dark:text-slate-400" />
            </div>
            <div className="grow">
              <div className="font-bold text-sm text-blue-500 dark:text-blue-400">Ver Catálogo</div>
            </div>
            <div className="text-gray-400 dark:text-slate-500 font-bold">
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>
        </div>
      )
    }

    if (type.includes("carousel")) {
      return (
        <div className="flex gap-2 overflow-x-auto w-full custom-scrollbar pb-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-white dark:bg-slate-800 dark:text-slate-100 rounded-lg shadow-sm min-w-[80%] shrink-0 border border-gray-200 dark:border-slate-700 overflow-hidden">
            <div className="h-20 bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
               <Smartphone className="w-6 h-6 text-blue-400 dark:text-blue-500" />
            </div>
            <div className="p-3">
              <p className="whitespace-pre-wrap text-sm">{bodyContent || "Item do carrossel"}</p>
            </div>
            <div className="border-t dark:border-slate-700 text-center text-blue-500 dark:text-blue-400 font-bold text-xs p-2 hover:bg-gray-50 hover:dark:bg-slate-700 cursor-pointer">
              Opção
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 dark:text-slate-100 rounded-lg shadow-sm min-w-[80%] shrink-0 border border-gray-200 dark:border-slate-700 overflow-hidden opacity-60">
            <div className="h-20 bg-gray-50 dark:bg-slate-700/50 flex items-center justify-center">
               <Laptop className="w-6 h-6 text-gray-400 dark:text-slate-500" />
            </div>
            <div className="p-3">
              <p className="text-sm">Outro item...</p>
            </div>
          </div>
        </div>
      )
    }

    // Fallback default
    return (
      <div className="bg-white dark:bg-slate-800 dark:text-slate-100 p-3 rounded-t-lg rounded-br-lg rounded-bl-none shadow-sm max-w-[90%] text-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
        <p className="whitespace-pre-wrap">{bodyContent || "Conteúdo não especificado"}</p>
        <div className="text-right text-[10px] text-gray-400 dark:text-slate-400 mt-1">10:00</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="w-[280px] h-[500px] border-8 border-slate-900 dark:border-slate-950 rounded-[36px] bg-[#e5e5ea] dark:bg-slate-900 relative overflow-hidden shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)]">
        {/* Mockup Header */}
        <div className="bg-slate-800 dark:bg-slate-950 text-white p-3 text-center text-xs font-semibold flex justify-between items-center h-[60px] border-b border-transparent dark:border-slate-800">
          <span className="text-slate-300 flex items-center cursor-pointer hover:text-white transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
          </span>
          <span className="truncate max-w-[120px]">Sua Empresa</span>
          <span className="text-slate-300"><Settings className="w-4 h-4" /></span>
        </div>
        
        {/* Mockup Screen */}
        <div className="h-[calc(100%-60px)] overflow-y-auto p-4 flex flex-col gap-3 bg-[radial-gradient(#d1d5db_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] bg-size-[10px_10px]">
          {renderContent()}
          {children}
        </div>
      </div>
    </div>
  )
}

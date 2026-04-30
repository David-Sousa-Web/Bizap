import { ChevronLeft, Settings } from "lucide-react"
import type { ReactNode } from "react"

interface MockupChassisProps {
  children?: ReactNode
}

export function MockupChassis({ children }: MockupChassisProps) {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="w-[280px] h-[500px] border-8 border-slate-900 dark:border-slate-950 rounded-[36px] bg-[#e5e5ea] dark:bg-slate-900 relative overflow-hidden shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)]">
        <div className="bg-slate-800 dark:bg-slate-950 text-white p-3 text-center text-xs font-semibold flex justify-between items-center h-[60px] border-b border-transparent dark:border-slate-800">
          <span className="text-slate-300 flex items-center cursor-pointer hover:text-white transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
          </span>
          <span className="truncate max-w-[120px]">Sua Empresa</span>
          <span className="text-slate-300">
            <Settings className="w-4 h-4" />
          </span>
        </div>

        <div className="h-[calc(100%-60px)] overflow-y-auto p-4 flex flex-col gap-3 bg-[radial-gradient(#d1d5db_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] bg-size-[10px_10px]">
          {children}
        </div>
      </div>
    </div>
  )
}

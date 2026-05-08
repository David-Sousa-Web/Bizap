import { useMemo, useState } from "react"
import type { DateRange } from "react-day-picker"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"
import { CalendarRange, FolderKanban, RefreshCw, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useProjects } from "@/features/projects/hooks/useProjects"
import { dashboardPresets } from "@/features/dashboard/utils/dashboardPresets"

const ALL_PROJECTS_VALUE = "__all__"

interface DashboardFiltersProps {
  projectId?: string
  from?: string
  to?: string
  isFetching?: boolean
  onProjectChange: (projectId: string | undefined) => void
  onPeriodChange: (from: string | undefined, to: string | undefined) => void
  onRefresh: () => void
}

function formatRangeLabel(from?: string, to?: string): string {
  if (!from && !to) return "Todo o período"
  const fromDate = from ? new Date(from) : undefined
  const toDate = to ? new Date(to) : undefined

  if (fromDate && toDate) {
    return `${format(fromDate, "dd MMM", { locale: ptBR })} – ${format(
      toDate,
      "dd MMM, yyyy",
      { locale: ptBR },
    )}`
  }

  if (fromDate) return `A partir de ${format(fromDate, "dd MMM, yyyy", { locale: ptBR })}`
  if (toDate) return `Até ${format(toDate, "dd MMM, yyyy", { locale: ptBR })}`
  return "Todo o período"
}

export function DashboardFilters({
  projectId,
  from,
  to,
  isFetching = false,
  onProjectChange,
  onPeriodChange,
  onRefresh,
}: DashboardFiltersProps) {
  const [popoverOpen, setPopoverOpen] = useState(false)

  const { data: projectsResponse, isLoading: isLoadingProjects } = useProjects({
    page: 1,
    limit: 100,
  })

  const projects = projectsResponse?.data ?? []

  const selectedRange = useMemo<DateRange | undefined>(() => {
    if (!from && !to) return undefined
    return {
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    }
  }, [from, to])

  const periodLabel = formatRangeLabel(from, to)
  const hasPeriod = Boolean(from || to)

  function handleProjectSelect(value: string) {
    onProjectChange(value === ALL_PROJECTS_VALUE ? undefined : value)
  }

  function handleRangeSelect(range: DateRange | undefined) {
    onPeriodChange(
      range?.from ? range.from.toISOString() : undefined,
      range?.to ? range.to.toISOString() : undefined,
    )
  }

  function handlePresetClick(presetId: string) {
    const preset = dashboardPresets.find((p) => p.id === presetId)
    if (!preset) return
    const { from: f, to: t } = preset.resolve()
    onPeriodChange(f.toISOString(), t.toISOString())
    setPopoverOpen(false)
  }

  function handleClearPeriod() {
    onPeriodChange(undefined, undefined)
    setPopoverOpen(false)
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
      {isLoadingProjects ? (
        <Skeleton className="h-9 w-full sm:w-56" />
      ) : (
        <Select
          value={projectId ?? ALL_PROJECTS_VALUE}
          onValueChange={handleProjectSelect}
        >
          <SelectTrigger className="w-full sm:w-56" aria-label="Filtrar por projeto">
            <FolderKanban className="size-4 text-muted-foreground" />
            <SelectValue placeholder="Todos os projetos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_PROJECTS_VALUE}>
              Todos os projetos
            </SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start sm:w-auto",
              !hasPeriod && "text-muted-foreground",
            )}
            aria-label="Filtrar por período"
          >
            <CalendarRange className="size-4" />
            <span className="truncate">{periodLabel}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 gap-0" align="end">
          <div className="flex flex-col gap-1 border-b p-3 sm:flex-row sm:flex-wrap">
            {dashboardPresets.map((preset) => (
              <Button
                key={preset.id}
                size="sm"
                variant="ghost"
                onClick={() => handlePresetClick(preset.id)}
                className="justify-start"
              >
                {preset.label}
              </Button>
            ))}
          </div>

          <Calendar
            mode="range"
            selected={selectedRange}
            onSelect={handleRangeSelect}
            numberOfMonths={2}
            locale={ptBR}
            className="p-3"
          />

          <div className="flex justify-between gap-2 border-t p-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearPeriod}
              disabled={!hasPeriod}
            >
              <X className="size-4" />
              Limpar
            </Button>
            <Button size="sm" onClick={() => setPopoverOpen(false)}>
              Aplicar
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Button
        variant="outline"
        size="icon"
        onClick={onRefresh}
        disabled={isFetching}
        aria-label="Atualizar dashboard"
        title="Atualizar"
      >
        <RefreshCw className={cn("size-4", isFetching && "animate-spin")} />
      </Button>
    </div>
  )
}

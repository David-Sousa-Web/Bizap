import { Filter, X } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { mediaRequestStatusMap } from "@/features/projects/utils/mediaRequestStatus";
import { MediaRequestStatusBadge } from "@/features/projects/components/numbers/MediaRequestStatusBadge";
import type { MediaRequestStatus } from "@/features/projects/types";
import { Badge } from "@/components/ui/badge";

export interface NumbersFiltersState {
  lastMediaRequestStatus?: string;
  hasMedia?: "true" | "false" | "all";
  createdAt?: DateRange;
  updatedAt?: DateRange;
}

interface NumbersFiltersProps {
  filters: NumbersFiltersState;
  onFiltersChange: (filters: NumbersFiltersState) => void;
  onClearFilters: () => void;
}

export function NumbersFilters({
  filters,
  onFiltersChange,
  onClearFilters,
}: NumbersFiltersProps) {
  const activeFiltersCount = Object.values(filters).filter((val) => {
    if (val === "all") return false;
    if (val === undefined) return false;
    return true;
  }).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="relative h-9">
          <Filter className="h-4 w-4" />
          {/* Filtros */}
          {activeFiltersCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-2 rounded-sm px-1 font-normal lg:hidden"
            >
              {activeFiltersCount}
            </Badge>
          )}
          {activeFiltersCount > 0 && (
            <div className="hidden space-x-1 lg:flex ml-2">
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal"
              >
                {activeFiltersCount} ativo(s)
              </Badge>
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Filtros Avançados</h4>
            <p className="text-sm text-muted-foreground">
              Refine a busca de números no projeto.
            </p>
          </div>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Status do Último Envio</Label>
              <Select
                value={filters.lastMediaRequestStatus || "all"}
                onValueChange={(val) =>
                  onFiltersChange({
                    ...filters,
                    lastMediaRequestStatus: val === "all" ? undefined : val,
                  })
                }
              >
                <SelectTrigger className="cursor-pointer">
                  <SelectValue placeholder="Selecione um status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem className="cursor-pointer" value="all">
                    Todos
                  </SelectItem>
                  <SelectItem className="cursor-pointer" value="NONE">
                    <MediaRequestStatusBadge
                      status={null}
                      className="pointer-events-none"
                    />
                  </SelectItem>
                  {Object.entries(mediaRequestStatusMap).map(([key]) => (
                    <SelectItem
                      className="cursor-pointer"
                      key={key}
                      value={key}
                    >
                      <MediaRequestStatusBadge
                        status={key as MediaRequestStatus}
                        className="pointer-events-none"
                      />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Possui Mídia?</Label>
              <Select
                value={filters.hasMedia || "all"}
                onValueChange={(val: "true" | "false" | "all") =>
                  onFiltersChange({
                    ...filters,
                    hasMedia: val === "all" ? undefined : val,
                  })
                }
              >
                <SelectTrigger className="cursor-pointer">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem className="cursor-pointer" value="all">
                    Todos
                  </SelectItem>
                  <SelectItem className="cursor-pointer" value="true">
                    Apenas com Mídia
                  </SelectItem>
                  <SelectItem className="cursor-pointer" value="false">
                    Sem Mídia
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 flex flex-col">
              <Label>Data de Criação</Label>
              <DatePickerWithRange
                date={filters.createdAt}
                onDateChange={(date) =>
                  onFiltersChange({ ...filters, createdAt: date })
                }
                className="w-full"
              />
            </div>

            <div className="space-y-2 flex flex-col">
              <Label>Data de Atualização</Label>
              <DatePickerWithRange
                date={filters.updatedAt}
                onDateChange={(date) =>
                  onFiltersChange({ ...filters, updatedAt: date })
                }
                className="w-full"
              />
            </div>
          </div>

          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              className="w-full mt-2"
              onClick={onClearFilters}
            >
              <X className="mr-2 h-4 w-4" />
              Limpar Filtros
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

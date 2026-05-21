import { useState } from "react";
import { Filter } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
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
  const [open, setOpen] = useState(false);
  const [localFilters, setLocalFilters] =
    useState<NumbersFiltersState>(filters);

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setLocalFilters(filters);
    }
    setOpen(newOpen);
  };

  const activeFiltersCount = Object.values(filters).filter((val) => {
    if (val === "all") return false;
    if (val === undefined) return false;
    return true;
  }).length;

  const handleApply = () => {
    onFiltersChange(localFilters);
    setOpen(false);
  };

  const handleClear = () => {
    onClearFilters();
    setLocalFilters({});
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
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
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filtros Avançados</DialogTitle>
          <DialogDescription>
            Refine a busca de números no projeto.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Status do Último Envio</Label>
            <Select
              value={localFilters.lastMediaRequestStatus || "all"}
              onValueChange={(val) =>
                setLocalFilters({
                  ...localFilters,
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
                  <SelectItem className="cursor-pointer" key={key} value={key}>
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
              value={localFilters.hasMedia || "all"}
              onValueChange={(val: "true" | "false" | "all") =>
                setLocalFilters({
                  ...localFilters,
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
              date={localFilters.createdAt}
              onDateChange={(date) =>
                setLocalFilters({ ...localFilters, createdAt: date })
              }
              className="w-full"
            />
          </div>

          <div className="space-y-2 flex flex-col">
            <Label>Data de Atualização</Label>
            <DatePickerWithRange
              date={localFilters.updatedAt}
              onDateChange={(date) =>
                setLocalFilters({ ...localFilters, updatedAt: date })
              }
              className="w-full"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={handleClear}>
            Limpar Filtros
          </Button>
          <Button onClick={handleApply}>Aplicar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

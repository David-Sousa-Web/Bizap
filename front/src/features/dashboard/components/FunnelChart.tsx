import { Bar, BarChart, Cell, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import type { MediaRequestStatus } from "@/features/projects/types"
import { mediaRequestStatusMap } from "@/features/projects/utils/mediaRequestStatus"
import type { DashboardMediaStatus } from "@/features/dashboard/types"
import { formatNumber } from "@/features/dashboard/utils/dashboardFormatters"

const STATUS_ORDER: MediaRequestStatus[] = [
  "PENDING",
  "TEMPLATE_SENT",
  "RECONFIRMATION_SENT",
  "CONFIRMED",
  "MEDIA_SENT",
  "DECLINED",
  "INVALID_RESPONSE_LIMIT",
  "FAILED",
]

const STATUS_COLORS: Record<MediaRequestStatus, string> = {
  PENDING: "#f59e0b",
  TEMPLATE_SENT: "#0ea5e9",
  RECONFIRMATION_SENT: "#f59e0b",
  CONFIRMED: "#10b981",
  MEDIA_SENT: "#059669",
  DECLINED: "#71717a",
  INVALID_RESPONSE_LIMIT: "#ef4444",
  FAILED: "#ef4444",
}

const chartConfig: ChartConfig = {
  count: {
    label: "Solicitações",
  },
}

interface FunnelChartProps {
  mediaStatus?: DashboardMediaStatus
  isLoading?: boolean
}

export function FunnelChart({
  mediaStatus,
  isLoading = false,
}: FunnelChartProps) {
  const data = STATUS_ORDER.map((status) => ({
    status,
    label: mediaRequestStatusMap[status].label,
    count: mediaStatus?.[status] ?? 0,
    color: STATUS_COLORS[status],
  }))

  const total = data.reduce((acc, item) => acc + item.count, 0)

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Funil do fluxo</CardTitle>
        <CardDescription>
          Distribuição das solicitações por etapa do fluxo de envio.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[280px] w-full" />
        ) : total === 0 ? (
          <div className="flex h-[280px] items-center justify-center text-muted-foreground text-sm">
            Sem solicitações no período selecionado.
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[280px] w-full"
          >
            <BarChart
              accessibilityLayer
              data={data}
              layout="vertical"
              margin={{ top: 4, right: 24, left: 4, bottom: 4 }}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="label"
                tickLine={false}
                axisLine={false}
                width={140}
                tick={{ fontSize: 12 }}
              />
              <ChartTooltip
                cursor={{ fill: "rgba(0,0,0,0.04)" }}
                content={
                  <ChartTooltipContent
                    hideIndicator={false}
                    formatter={(value, _name, item) => (
                      <div className="flex w-full items-center justify-between gap-3">
                        <span className="flex items-center gap-2">
                          <span
                            className="size-2 rounded-sm"
                            style={{
                              backgroundColor: item.payload.color,
                            }}
                          />
                          <span className="text-muted-foreground">
                            {item.payload.label}
                          </span>
                        </span>
                        <span className="font-mono font-medium tabular-nums">
                          {formatNumber(Number(value))}
                        </span>
                      </div>
                    )}
                  />
                }
              />
              <Bar
                dataKey="count"
                radius={[0, 6, 6, 0]}
                label={{
                  position: "right",
                  fontSize: 11,
                  fill: "currentColor",
                  className: "fill-foreground tabular-nums",
                  formatter: (value: number) => formatNumber(value),
                }}
              >
                {data.map((entry) => (
                  <Cell key={entry.status} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

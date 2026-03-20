"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export const description = "An interactive area chart"

const chartConfig = {
  vendors: {
    label: "Total Selected",
  },
  approved: {
    label: "Approved",
    color: "var(--chart-1)",
  },
  pending: {
    label: "Pending",
    color: "var(--chart-2)",
  },
}

export function ChartAreaInteractive({ vendors = [] }) {
  const [timeRange, setTimeRange] = React.useState("90d")

  const chartData = React.useMemo(() => {
    const countsByDate = {};
    
    vendors.forEach(v => {
      const date = new Date(v.createdAt).toISOString().split('T')[0];
      if (!countsByDate[date]) countsByDate[date] = { approved: 0, pending: 0 };
      
      if (v.approvalStatus === 'APPROVED') {
        countsByDate[date].approved += 1;
      } else {
        countsByDate[date].pending += 1;
      }
    });

    const last90 = [];
    const today = new Date();
    
    let currApproved = vendors.filter(v => {
      const diff = (today - new Date(v.createdAt)) / (1000 * 60 * 60 * 24);
      return diff > 90 && v.approvalStatus === 'APPROVED';
    }).length;
    
    let currPending = vendors.filter(v => {
      const diff = (today - new Date(v.createdAt)) / (1000 * 60 * 60 * 24);
      return diff > 90 && v.approvalStatus !== 'APPROVED';
    }).length;

    for (let i = 90; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      if (countsByDate[dateStr]) {
        currApproved += countsByDate[dateStr].approved;
        currPending += countsByDate[dateStr].pending;
      }
      last90.push({ date: dateStr, approved: currApproved, pending: currPending });
    }
    
    return last90;
  }, [vendors]);

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date()
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <Card className="pt-0 shadow-lg border-stone-100 mb-8 overflow-hidden rounded-[2rem]">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b border-stone-100 py-6 sm:flex-row px-8 bg-stone-50/50">
        <div className="grid flex-1 gap-1">
          <CardTitle className="text-2xl font-black text-stone-900 tracking-tighter uppercase">Vendor Growth Overview</CardTitle>
          <CardDescription className="text-stone-500 font-medium">
            Showing total active and onboarding vendors for the last 3 months
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="hidden w-[160px] rounded-xl font-bold bg-white shadow-sm sm:ml-auto sm:flex h-12"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl font-bold">
            <SelectItem value="90d" className="rounded-lg">
              Last 3 months
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-6 pb-6 sm:px-8 sm:pt-10">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[320px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="#3B82F6"
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor="#3B82F6"
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="#10B981"
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor="#10B981"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
              className="text-xs font-bold font-mono tracking-widest text-stone-400"
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                  className="rounded-xl shadow-xl border-none font-bold"
                />
              }
            />
            <Area
              dataKey="pending"
              type="monotone"
              fill="url(#fillMobile)"
              stroke="#10B981"
              strokeWidth={3}
              stackId="a"
            />
            <Area
              dataKey="approved"
              type="monotone"
              fill="url(#fillDesktop)"
              stroke="#3B82F6"
              strokeWidth={3}
              stackId="a"
            />
            <ChartLegend className="mt-4 font-bold uppercase tracking-widest text-[10px]" content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

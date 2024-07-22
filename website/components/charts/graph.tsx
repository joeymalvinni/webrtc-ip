"use client"

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"

import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
    { name: "WebRTC", time: 30 },
    { name: "IPIFY", time: 120 },
    { name: "IPRegistry", time: 230 },
    { name: "JSONIP", time: 150 },
]

const chartConfig = {
    time: {
        label: "Time (ms)",
        color: "#504EC2",
    },
    // mobile: {
    //     label: "Mobile",
    //     color: "#60a5fa",
    // },
} satisfies ChartConfig

interface ComponentProps {
    data: { name: string; time: number }[];
}

export default function Component({ data }: ComponentProps) {
    return (
        <ChartContainer config={chartConfig} className="dark w-full" >
            <BarChart
                accessibilityLayer
                data={data}
                margin={{
                    top: 10,
                }}
            >
                <XAxis
                    dataKey="name"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 6)}
                />
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                />
                <Bar dataKey="time" fill="var(--color-time)" radius={2}>
                </Bar>
            </BarChart>
        </ChartContainer>
    )
}

"use client"

import { Bar, BarChart, Cell, LabelList, XAxis } from "recharts"

import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
    time: {
        label: "ms",
        color: "#D8FF4A",
    },
} satisfies ChartConfig

interface ComponentProps {
    data: { name: string; time: number }[];
}

export default function Component({ data }: ComponentProps) {
    return (
        <ChartContainer config={chartConfig} className="dark w-full h-[220px]">
            <BarChart
                accessibilityLayer
                data={data}
                margin={{ top: 24, left: 0, right: 0, bottom: 0 }}
                barCategoryGap="24%"
            >
                <XAxis
                    dataKey="name"
                    tickLine={false}
                    tickMargin={12}
                    axisLine={false}
                    tick={{ fill: "rgba(232,232,227,0.5)", fontSize: 11, fontFamily: "var(--font-ibm)", letterSpacing: "0.1em" }}
                    tickFormatter={(value) => value.toUpperCase()}
                />
                <ChartTooltip
                    cursor={{ fill: "rgba(216,255,74,0.05)" }}
                    content={<ChartTooltipContent />}
                />
                <Bar dataKey="time" radius={[3, 3, 0, 0]}>
                    {data.map((entry, index) => (
                        <Cell
                            key={entry.name}
                            fill={entry.name === "WebRTC-IP" ? "#D8FF4A" : "rgba(232,232,227,0.18)"}
                        />
                    ))}
                    <LabelList
                        dataKey="time"
                        position="top"
                        offset={8}
                        formatter={(v: number) => `${v.toFixed(0)}ms`}
                        style={{ fill: "rgba(232,232,227,0.55)", fontSize: 10, fontFamily: "var(--font-ibm)", letterSpacing: "0.06em" }}
                    />
                </Bar>
            </BarChart>
        </ChartContainer>
    )
}

"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/utils";

interface DonutChartProps {
    data: {
        name: string;
        value: number;
        color: string;
    }[];
}

export function DonutChartComponent({ data }: DonutChartProps) {
    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "var(--bg-card)",
                            border: "1px solid var(--border-color)",
                            borderRadius: "8px",
                            color: "var(--text-primary)",
                        }}
                        formatter={(value: number) => [formatCurrency(value), ""]}
                    />
                </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
                {data.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm text-[var(--text-secondary)]">
                                {item.name}
                            </span>
                        </div>
                        <span className="text-sm font-medium text-[var(--text-primary)]">
                            {((item.value / total) * 100).toFixed(1)}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

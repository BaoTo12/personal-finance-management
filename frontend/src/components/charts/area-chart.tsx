"use client";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface AreaChartProps {
    data: {
        month: string;
        income: number;
        expenses: number;
    }[];
}

export function AreaChartComponent({ data }: AreaChartProps) {
    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--border-color)"
                        vertical={false}
                    />
                    <XAxis
                        dataKey="month"
                        stroke="var(--text-muted)"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="var(--text-muted)"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value / 1000}k`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "var(--bg-card)",
                            border: "1px solid var(--border-color)",
                            borderRadius: "8px",
                            color: "var(--text-primary)",
                        }}
                        formatter={(value: number) => [formatCurrency(value), ""]}
                        labelStyle={{ color: "var(--text-secondary)" }}
                    />
                    <Legend
                        wrapperStyle={{
                            paddingTop: "20px",
                        }}
                        formatter={(value) => (
                            <span style={{ color: "var(--text-secondary)", fontSize: "12px" }}>
                                {value}
                            </span>
                        )}
                    />
                    <Area
                        type="monotone"
                        dataKey="income"
                        name="Income"
                        stroke="#10B981"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#incomeGradient)"
                    />
                    <Area
                        type="monotone"
                        dataKey="expenses"
                        name="Expenses"
                        stroke="#EF4444"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#expenseGradient)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

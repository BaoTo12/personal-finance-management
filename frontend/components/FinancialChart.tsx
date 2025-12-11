import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MOCK_CHART_DATA } from '../constants';

interface FinancialChartProps {
  timePeriod?: 'Weekly' | 'Monthly' | 'Yearly';
}

export const FinancialChart: React.FC<FinancialChartProps> = ({ timePeriod = 'Monthly' }) => {
  // Filter or transform data based on timePeriod
  const chartData = MOCK_CHART_DATA; // For now using same data, can be enhanced later
  
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#9ca3af', fontSize: 12 }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#9ca3af', fontSize: 12 }} 
            tickFormatter={(value) => `$${value/1000}k`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1e293b', 
              borderColor: 'rgba(255,255,255,0.1)', 
              borderRadius: '12px',
              color: 'white'
            }}
            itemStyle={{ color: 'white' }}
          />
          <Area 
            type="monotone" 
            dataKey="income" 
            stroke="#6366f1" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorIncome)" 
          />
          <Area 
            type="monotone" 
            dataKey="expense" 
            stroke="#f43f5e" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorExpense)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
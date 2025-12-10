import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MOCK_CHART_DATA } from '../constants';

export const FinancialChart: React.FC = () => {
  return (
    <div className="w-full h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={MOCK_CHART_DATA}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary--color)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="var(--primary--color)" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--secondary--color)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="var(--secondary--color)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'var(--text--color---text-2)', fontSize: 12 }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'var(--text--color---text-2)', fontSize: 12 }} 
            tickFormatter={(value) => `$${value/1000}k`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--darkish--color---dark-1)', 
              borderColor: 'rgba(255,255,255,0.1)', 
              borderRadius: '12px',
              color: 'white'
            }}
            itemStyle={{ color: 'white' }}
          />
          <Area 
            type="monotone" 
            dataKey="income" 
            stroke="var(--primary--color)" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorIncome)" 
          />
          <Area 
            type="monotone" 
            dataKey="expense" 
            stroke="var(--secondary--color)" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorExpense)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock Data (Nanti diganti data Supabase)
const data = [
  { name: 'Sen', stitch: 4000 },
  { name: 'Sel', stitch: 3000 },
  { name: 'Rab', stitch: 5000 },
  { name: 'Kam', stitch: 2780 },
  { name: 'Jum', stitch: 6890 },
  { name: 'Sab', stitch: 2390 },
  { name: 'Min', stitch: 3490 },
];

export const ProductionChart = () => {
  return (
    <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl shadow-lg col-span-2">
      <h3 className="text-lg font-bold text-white mb-6">📈 Tren Output Produksi (7 Hari)</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorStitch" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
              itemStyle={{ color: '#10B981' }}
            />
            <Area type="monotone" dataKey="stitch" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorStitch)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useList } from "@refinedev/core"; // ✅ Import wajib untuk ambil data

export const ProductionChart = () => {
  // 1. Fetch Data Real-time dari Supabase View
  const { data, isLoading } = useList({
    resource: "view_dashboard_daily_trend", // Nama view di database
    sorters: [
      { field: "date", order: "asc" } // Urutkan dari tanggal lama ke baru
    ],
    pagination: { mode: "off" } // Ambil semua data rekap
  });

  // 2. Transformasi Data: Format DB -> Format Grafik
  const chartData = data?.data?.map((item: any) => ({
    // Ubah tanggal (2023-10-25) jadi nama hari (Sen, Sel)
    name: new Date(item.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }), 
    // Mapping kolom total_output ke 'stitch'
    stitch: Number(item.total_output || 0) 
  })) || [];

  // 3. Tampilan saat Loading
  if (isLoading) {
    return (
      <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl shadow-lg col-span-2 flex items-center justify-center h-[300px]">
        <span className="text-emerald-500 animate-pulse font-mono">Sedang memuat data grafik...</span>
      </div>
    );
  }

  // 4. Render Grafik
  return (
    <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl shadow-lg col-span-2">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-white">📈 Tren Output Produksi</h3>
        <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded">
            Live Data
        </span>
      </div>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorStitch" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#94a3b8" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} // Format ribuan (10k)
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
              itemStyle={{ color: '#10B981' }}
              formatter={(value: any) => [`${Number(value).toLocaleString()} Pcs`, 'Total Output']}
              labelStyle={{ color: '#94a3b8' }}
            />
            <Area 
              type="monotone" 
              dataKey="stitch" 
              stroke="#10B981" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorStitch)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
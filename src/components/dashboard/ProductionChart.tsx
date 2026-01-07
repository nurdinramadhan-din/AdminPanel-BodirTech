import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useList } from "@refinedev/core";

export const ProductionChart = () => {
  // 1. Fetch Data Real-time dari Supabase View
  // View: view_dashboard_daily_trend (kolom: date, total_output, total_reject)
  const { data, isLoading } = useList({
    resource: "view_dashboard_daily_trend",
    sorters: [
      { field: "date", order: "asc" } // Urutkan: Terlama -> Terbaru
    ],
    pagination: { mode: "off" }, // Ambil semua data periode ini
    liveMode: "auto", // Update jika ada data baru masuk
  });

  // 2. Transformasi Data: Format DB -> Format Grafik Recharts
  const chartData = data?.data?.map((item: any) => ({
    // Ubah tanggal (2023-10-25) jadi nama hari (Sen, 25)
    name: new Date(item.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }), 
    // Data Utama
    stitch: Number(item.total_output || 0),
    // Data Reject (Opsional, bisa ditampilkan di tooltip)
    reject: Number(item.total_reject || 0)
  })) || [];

  // 3. Loading State (Skeleton)
  if (isLoading) {
    return (
      <div className="h-[300px] w-full bg-slate-50 rounded-xl animate-pulse flex items-center justify-center text-slate-400">
        Memuat Data Grafik...
      </div>
    );
  }

  return (
    <div className="w-full h-[350px]">
      <div className="mb-4 px-2">
        <h3 className="text-lg font-bold text-gray-800">📈 Tren Produksi Harian</h3>
        <p className="text-sm text-gray-500">Total output jahitan (Pcs) dalam 7 hari terakhir.</p>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            {/* Gradasi Warna Hijau Emerald */}
            <linearGradient id="colorStitch" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          
          <XAxis 
            dataKey="name" 
            stroke="#94a3b8" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            tickMargin={10} 
          />
          
          <YAxis 
            stroke="#94a3b8" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value} 
          />
          
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            itemStyle={{ color: '#10B981', fontWeight: 'bold' }}
            formatter={(value: any) => [`${Number(value).toLocaleString('id-ID')} Pcs`, 'Output']}
            labelStyle={{ color: '#64748b', marginBottom: '0.5rem' }}
          />
          
          <Area 
            type="monotone" 
            dataKey="stitch" 
            stroke="#10B981" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorStitch)" 
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
import React, { useState, useMemo } from "react";
import { useList } from "@refinedev/core";
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import { Card, Select, Spin, Radio, ConfigProvider, theme } from "antd";
import { DollarOutlined, RiseOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import 'dayjs/locale/id'; // Opsional jika ingin format Indo

export const PayrollTrendChart = ({ refreshTrigger }: { refreshTrigger: number }) => {
    const { darkAlgorithm } = theme;
    const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');

    // Ambil Data dari View SQL
    const { data: payoutData, isLoading } = useList({
        resource: "view_daily_payouts",
        pagination: { mode: "off" },
        liveMode: "off",
        sorters: [{ field: "date", order: "asc" }],
        meta: { trigger: refreshTrigger } // Auto-refresh saat trigger berubah
    });

    // LOGIKA FILTER WAKTU (Minggu Ini vs Bulan Ini)
    const chartData = useMemo(() => {
        const rawData = payoutData?.data || [];
        const now = dayjs();
        const startDate = timeRange === 'week' 
            ? now.subtract(7, 'day') 
            : now.subtract(30, 'day');

        // 1. Generate tanggal kosong agar grafik tidak bolong
        const filledData = [];
        for (let i = 0; i <= (timeRange === 'week' ? 7 : 30); i++) {
            const dateCursor = startDate.add(i, 'day');
            const dateStr = dateCursor.format('YYYY-MM-DD');
            
            // Cari apakah ada transaksi di tanggal ini
            const found = rawData.find((d: any) => d.date === dateStr);
            
            filledData.push({
                date: dateCursor.format('DD MMM'), // Format label: 12 Jan
                fullDate: dateStr,
                total: found ? Number(found.total_payout) : 0
            });
        }
        return filledData;
    }, [payoutData, timeRange]);

    // Hitung Total Pengeluaran Periode Ini
    const totalExpense = chartData.reduce((acc, curr) => acc + curr.total, 0);

    return (
        <ConfigProvider theme={{ algorithm: darkAlgorithm }}>
            <Card 
                className="bg-slate-800 border-slate-700 shadow-xl h-full"
                bodyStyle={{ padding: "24px", height: "100%" }}
            >
                {/* HEADER CHART */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">
                            <DollarOutlined /> Arus Kas Keluar (Gaji)
                        </p>
                        <h2 className="text-3xl font-bold text-white font-mono m-0">
                            Rp {totalExpense.toLocaleString('id-ID')}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                             <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                             </span>
                             <span className="text-emerald-400 text-xs">Live Update</span>
                        </div>
                    </div>

                    {/* FILTER DROPDOWN / RADIO */}
                    <Radio.Group 
                        value={timeRange} 
                        onChange={(e) => setTimeRange(e.target.value)}
                        buttonStyle="solid"
                        size="small"
                    >
                        <Radio.Button value="week">Minggu Ini</Radio.Button>
                        <Radio.Button value="month">Bulan Ini</Radio.Button>
                    </Radio.Group>
                </div>

                {/* AREA CHART (TRADING STYLE) */}
                <div className="h-[250px] w-full">
                    {isLoading ? (
                        <div className="h-full flex items-center justify-center"><Spin /></div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis 
                                    dataKey="date" 
                                    stroke="#94a3b8" 
                                    tick={{fontSize: 10}} 
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis 
                                    stroke="#94a3b8" 
                                    tick={{fontSize: 10}} 
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(val) => `Rp ${(val/1000000).toFixed(1)}jt`}
                                />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                    itemStyle={{ color: '#34d399' }}
                                    formatter={(value: number | any) => [`Rp ${value.toLocaleString()}`, 'Total Gaji']}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="total" 
                                    stroke="#10b981" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorTotal)" 
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </Card>
        </ConfigProvider>
    );
};
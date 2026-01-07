import React from "react";
import { useList } from "@refinedev/core";
import { Activity, Layers, Users, TrendingUp } from 'lucide-react';

// Import Komponen Existing Akang
import { StatsCard } from '../../components/dashboard/StatsCard';
import { ProductionChart } from '../../components/dashboard/ProductionChart';
import { MiniFloorMap } from '../../components/dashboard/MiniFloorMap';

// Import Widget AI Baru
import { AIInsightWidget } from "../../components/dashboard/AIInsightWidget";

export const DashboardPage = () => {
    // 1. Ambil Data Tren
    const { data: trendData, isLoading: loadingTrend } = useList({
        resource: "view_dashboard_daily_trend",
        pagination: { mode: "off" },
        sorters: [{ field: "date", order: "desc" }]
    });

    // 2. Ambil Data Mesin (Realtime)
    const { data: machineData, isLoading: loadingMachine } = useList({
        resource: "view_live_machine_status",
        pagination: { mode: "off" },
        liveMode: "auto"
    });

    // 3. Ambil Data Karyawan
    const { data: profileData, isLoading: loadingProfile } = useList({
        resource: "profiles",
        pagination: { mode: "off" } 
    });

    // --- LOGIKA HITUNGAN ---
    const todayStr = new Date().toLocaleDateString('en-CA'); 
    const todayStats = trendData?.data.find((d: any) => d.date === todayStr);
    const todayOutput = todayStats?.total_output || 0;

    const totalMachines = machineData?.total || 0;
    const activeMachines = machineData?.data.filter(
        (m: any) => m.current_status === 'RUNNING'
    ).length || 0;

    const totalEmployees = profileData?.total || 0;
    const completedSPK = 0; // Nanti ganti dengan real data

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            
            {/* HEADER */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">🏭 Command Center</h1>
                    <p className="text-slate-500 mt-1">Real-time monitoring & AI Analysis.</p>
                </div>
                <div className="text-right hidden md:block">
                    <div className="flex items-center gap-2 justify-end bg-white px-3 py-1 rounded-full shadow-sm border">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <p className="text-emerald-600 font-mono text-xs font-bold">SYSTEM ONLINE</p>
                    </div>
                </div>
            </div>

            {/* --- BAGIAN 1: OTAK AI (Letakkan Paling Atas) --- */}
            <AIInsightWidget />

            {/* --- BAGIAN 2: STATISTIK KARTU --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard 
                    title="Output Hari Ini" 
                    value={loadingTrend ? "..." : todayOutput.toLocaleString()} 
                    trend={todayOutput > 0 ? "Produksi Jalan" : "Menunggu"} 
                    trendUp={todayOutput > 0} 
                    icon={Activity} 
                />
                <StatsCard 
                    title="Mesin Aktif" 
                    value={loadingMachine ? "..." : `${activeMachines} / ${totalMachines}`} 
                    trend={activeMachines > 0 ? `${Math.round((activeMachines/totalMachines)*100)}% Utilization` : "No Activity"} 
                    trendUp={activeMachines > 0} 
                    icon={Layers} 
                />
                <StatsCard 
                    title="SPK Selesai" 
                    value={completedSPK.toString()} 
                    trend="Minggu Ini" 
                    trendUp={true} 
                    icon={TrendingUp} 
                />
                <StatsCard 
                    title="Total Karyawan" 
                    value={loadingProfile ? "..." : totalEmployees.toString()} 
                    icon={Users} 
                />
            </div>

            {/* --- BAGIAN 3: GRAFIK & PETA --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                <div className="lg:col-span-2">
                     <ProductionChart />
                </div>
                <div className="lg:col-span-1">
                    <MiniFloorMap />
                </div>
            </div>
        </div>
    );
};
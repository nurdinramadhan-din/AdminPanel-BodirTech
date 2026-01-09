import React, { useState } from "react";
import { useList, useSubscription } from "@refinedev/core";
import { Activity, Layers, Users, TrendingUp, RefreshCw } from 'lucide-react';
import { Button, Tooltip, Row, Col } from "antd";

// Import Komponen
import { StatsCard } from '../../components/dashboard/StatsCard';
import { ProductionChart } from '../../components/dashboard/ProductionChart'; 
import { MiniFloorMap } from '../../components/dashboard/MiniFloorMap';
import { AIInsightWidget } from "../../components/dashboard/AIInsightWidget";
import { PayrollTrendChart } from "../../components/dashboard/PayrollTrendChart"; // Import Baru

export const DashboardPage = () => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // --- DATA FETCHING (Sama seperti sebelumnya) ---
    const { data: trendData, isLoading: loadingTrend, refetch: refetchTrend } = useList({
        resource: "view_dashboard_daily_trend",
        pagination: { mode: "off" },
        sorters: [{ field: "date", order: "desc" }],
        meta: { trigger: refreshTrigger }
    });

    const { data: machineData, isLoading: loadingMachine, refetch: refetchMachine } = useList({
        resource: "view_live_machine_status",
        pagination: { mode: "off" }
    });

    const { data: profileData } = useList({
        resource: "profiles",
        pagination: { mode: "off" },
    });

    const { data: bundlesData, refetch: refetchBundles } = useList({
        resource: "spk_bundles",
        filters: [{ field: "status", operator: "eq", value: "DONE" }],
        pagination: { mode: "off" }
    });

    // --- REALTIME LISTENERS ---
    
    // 1. Listen Produksi (SPK)
    useSubscription({
        channel: "resources/spk_bundles",
        onLiveEvent: () => {
            refetchBundles();
            refetchTrend();
            setRefreshTrigger(prev => prev + 1);
        }
    });

    // 2. Listen Mesin (Logs)
    useSubscription({
        channel: "resources/production_logs",
        onLiveEvent: () => refetchMachine()
    });

    // 3. 🔥 LISTEN KEUANGAN (NEW)
    // Ini yang bikin grafik gaji gerak saat Admin klik "Bayar"
    useSubscription({
        channel: "resources/wallet_transactions", 
        onLiveEvent: () => {
            console.log("💰 Transaksi Keuangan Terdeteksi!");
            setRefreshTrigger(prev => prev + 1); // Refresh grafik
        }
    });

    // --- KALKULASI ---
    const todayStr = new Date().toLocaleDateString('en-CA'); 
    const todayStats = trendData?.data?.find((d: any) => d.date === todayStr);
    const todayOutput = todayStats?.total_output || 0;

    const totalMachines = machineData?.total || 0;
    const activeMachines = machineData?.data?.filter((m: any) => m.current_status === 'RUNNING').length || 0;
    const totalEmployees = profileData?.total || 0;
    const completedBundlesCount = bundlesData?.total || 0; 

    const handleRefresh = () => {
        refetchTrend(); 
        refetchMachine(); 
        refetchBundles();
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10 min-h-screen bg-slate-900 text-slate-100 p-6">
            
            {/* HEADER */}
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white">🏭 Command Center</h1>
                    <p className="text-slate-400 mt-1">Real-time monitoring & Financial Analytics.</p>
                </div>
                <div className="flex items-center gap-4">
                     <Tooltip title="Paksa Refresh Data">
                        <Button 
                            icon={<RefreshCw size={16} className={loadingTrend ? "animate-spin" : ""} />} 
                            onClick={handleRefresh}
                            className="bg-slate-800 text-slate-300 border-slate-700 hover:text-white"
                        />
                     </Tooltip>

                    <div className="hidden md:flex items-center gap-2 justify-end bg-slate-800 px-3 py-1 rounded-full shadow-sm border border-slate-700">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <p className="text-emerald-400 font-mono text-xs font-bold">LIVE STREAM</p>
                    </div>
                </div>
            </div>

            {/* BARIS 1: STATISTIK ANGKA */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard 
                    title="Output Hari Ini" 
                    value={loadingTrend ? "..." : todayOutput.toLocaleString()} 
                    trend={todayOutput > 0 ? "Sedang Produksi" : "Menunggu"} 
                    trendUp={todayOutput > 0} 
                    icon={Activity} 
                />
                <StatsCard 
                    title="Mesin Aktif" 
                    value={loadingMachine ? "..." : `${activeMachines} / ${totalMachines}`} 
                    trend={activeMachines > 0 ? `${Math.round((activeMachines/totalMachines)*100)}% Util` : "Idle"} 
                    trendUp={activeMachines > 0} 
                    icon={Layers} 
                />
                <StatsCard 
                    title="Total Produksi (QC OK)" 
                    value={completedBundlesCount.toLocaleString()} 
                    trend="Lifetime" 
                    trendUp={true} 
                    icon={TrendingUp} 
                />
                <StatsCard 
                    title="Total Pegawai" 
                    value={totalEmployees.toString()} 
                    icon={Users} 
                />
            </div>

            {/* BARIS 2: ANALYTICS UTAMA (Produksi vs Keuangan) */}
            <Row gutter={[24, 24]}>
                {/* Grafik Produksi */}
                <Col xs={24} lg={14}>
                    <div className="bg-slate-800 p-1 rounded-xl shadow-lg border border-slate-700 overflow-hidden h-full min-h-[350px]">
                         <ProductionChart key={refreshTrigger} /> 
                    </div>
                </Col>

                {/* Grafik Keuangan (NEW TRADING STYLE) */}
                <Col xs={24} lg={10}>
                     <PayrollTrendChart refreshTrigger={refreshTrigger} />
                </Col>
            </Row>

            {/* BARIS 3: PETA LANTAI (Full Width now) */}
            <div>
                 <MiniFloorMap />
            </div>

            {/* BARIS 4: OTAK AI */}
            <div className="mt-8">
                 <div className="flex items-center gap-2 mb-4">
                    <div className="h-px bg-slate-700 flex-1"></div>
                    <span className="text-slate-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                        🤖 AI Production Analysis
                    </span>
                    <div className="h-px bg-slate-700 flex-1"></div>
                 </div>
                 <AIInsightWidget />
            </div>
        </div>
    );
};
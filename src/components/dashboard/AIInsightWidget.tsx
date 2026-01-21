import React, { useState, useEffect } from "react";
import { useList, useGetIdentity } from "@refinedev/core";
import { Card, Button, Badge, Spin, Tag, App, Progress, Tooltip, Divider } from "antd"; 
import { 
    RobotOutlined, ThunderboltFilled, WarningFilled, 
    InfoCircleFilled, DashboardOutlined, CheckCircleFilled, 
    TrophyFilled, AlertOutlined, ReloadOutlined,
    SafetyCertificateFilled, FireFilled
} from "@ant-design/icons";
import { supabaseClient } from "../../utility/supabaseClient"; 

// Interface User Identity
type IUserIdentity = {
 id: string;
};

// --- KOMPONEN INTERNAL ---
const InnerAIWidget = () => {
    const { message } = App.useApp();
    const { data: user } = useGetIdentity();
    const [isGenerating, setIsGenerating] = useState(false);

    // ==========================================
    // 1. DATA GEMINI (AI BRAIN)
    // ==========================================
    const { data: insights, isLoading: loadingAI, refetch: refetchAI } = useList<{ message: string; severity: string; metadata: any }>({
        resource: "ai_insights",
        pagination: { pageSize: 1 },
        sorters: [{ field: "created_at", order: "desc" }],
        // AI Insights adalah TABEL, jadi liveMode auto bisa jalan disini
        liveMode: "auto", 
    });

    const handleGenerateAnalysis = async () => {
        setIsGenerating(true);
        try { 
            const { data, error } = await supabaseClient.functions.invoke('generate-insight', { // @ts-ignore
                body: { organization_id: user?.id }
            });
            
            if (error) throw new Error(error.message);
            if (data?.error) throw new Error(data.error);

            message.success("Analisis AI Selesai: Data diperbarui.");
            refetchAI(); 
        } catch (err: any) {
            console.error("AI Error:", err);
            message.warning("AI sedang sibuk, menampilkan analisis manual.");
            refetchAI();
        } finally {
            setIsGenerating(false);
        }
    };

    const latestInsight = insights?.data?.[0];

    // ==========================================
    // 2. DATA SQL VIEWS (REALTIME BRIDGE)
    // ==========================================
    
    // A. Fetch Data (Tanpa LiveMode Auto karena ini VIEW)
    const { data: machineHealth, refetch: refreshMachines } = useList({ 
        resource: "view_ai_machine_health", 
        pagination: { mode: "off" } 
    });
    
    const { data: topWorkers, refetch: refreshWorkers } = useList({ 
        resource: "view_ai_top_workers", 
        pagination: { mode: "off" } 
    });
    
    const { data: projectRisks, refetch: refreshRisks } = useList({ 
        resource: "view_ai_project_risks", 
        pagination: { mode: "off" } 
    });

    // B. LOGIKA REALTIME MANUAL (The Bridge)
    // Kita subscribe ke TABEL ASLI, lalu refresh VIEW saat ada perubahan
    useEffect(() => {
        // 1. Channel untuk Tabel MACHINES
        const machineChannel = supabaseClient.channel('realtime-machines')
            .on(
                'postgres_changes', 
                { event: '*', schema: 'public', table: 'machines' }, 
                () => {
                    console.log("⚡ Realtime: Mesin berubah, refresh view...");
                    refreshMachines();
                }
            )
            .subscribe();

        // 2. Channel untuk Tabel PRODUCTION_LOGS (Pemicu Top Worker & Project Risk)
        const productionChannel = supabaseClient.channel('realtime-production')
            .on(
                'postgres_changes', 
                { event: '*', schema: 'public', table: 'production_logs' }, 
                (_payload) => {
                    console.log("⚡ Realtime: Produksi baru masuk, refresh worker & risk...");
                    refreshWorkers();
                    refreshRisks();
                    // Opsional: Jika ada produksi, bisa trigger refetch AI juga kalau mau sangat reaktif
                }
            )
            .subscribe();

        // Cleanup saat unmount
        return () => {
            supabaseClient.removeChannel(machineChannel);
            supabaseClient.removeChannel(productionChannel);
        };
    }, []);

    // Pre-process Data
    const machines = machineHealth?.data || [];
    const troubledMachines = machines.filter((m: any) => ['MAINTENANCE', 'ERROR', 'OFFLINE'].includes(m.current_status));
    const runningMachines = machines.filter((m: any) => m.current_status === 'RUNNING');
    const workers = topWorkers?.data || [];
    const risks = projectRisks?.data || [];

    // --- RENDER HELPERS ---
    const getSeverityColor = (sev: string) => {
        if (sev === 'CRITICAL') return "from-red-500/20 to-red-900/20 border-red-500/50";
        if (sev === 'WARNING') return "from-amber-500/20 to-amber-900/20 border-amber-500/50";
        return "from-emerald-500/20 to-emerald-900/20 border-emerald-500/50";
    };

    const getRankColor = (index: number) => {
        if (index === 0) return "text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]"; 
        if (index === 1) return "text-slate-300 drop-shadow-[0_0_8px_rgba(203,213,225,0.5)]"; 
        if (index === 2) return "text-amber-700 drop-shadow-[0_0_8px_rgba(180,83,9,0.5)]";   
        return "text-slate-500";
    };

    return (
        <div className="flex flex-col gap-6 mb-8 animate-in fade-in duration-700">
            
            {/* BAGIAN 1: THE AI BRAIN */}
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 rounded-2xl opacity-30 blur-xl group-hover:opacity-50 transition duration-1000"></div>
                
                <Card 
                    className="relative w-full border-0 overflow-hidden rounded-2xl"
                    style={{ background: "#0f172a" }} 
                    styles={{ body: { padding: 0 } }}
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/80 backdrop-blur-md">
                        <div className="flex items-center gap-4">
                            <div className={`p-2.5 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 shadow-lg shadow-indigo-500/20 ${isGenerating ? 'animate-pulse' : ''}`}>
                                <RobotOutlined className="text-white text-xl" />
                            </div>
                            <div>
                                <h3 className="text-white text-base font-bold m-0 tracking-wide uppercase flex items-center gap-2">
                                    Factory Intelligence
                                    <Tag className="m-0 bg-indigo-500/20 text-indigo-300 border-0 text-[10px] font-bold px-1.5">GEMINI 2.0</Tag>
                                </h3>
                                <p className="text-slate-400 text-[10px] m-0 font-mono tracking-wider">
                                    SYSTEM STATUS: {isGenerating ? <span className="text-amber-400 animate-pulse">ANALYZING...</span> : <span className="text-emerald-400">ONLINE</span>}
                                </p>
                            </div>
                        </div>
                        
                        <Button 
                            type="primary" 
                            shape="round"
                            size="middle"
                            icon={isGenerating ? <Spin size="small" className="text-white" /> : <ThunderboltFilled />}
                            onClick={handleGenerateAnalysis}
                            disabled={isGenerating}
                            className="bg-gradient-to-r from-indigo-600 to-blue-600 border-0 hover:scale-105 hover:shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-all duration-300 font-bold tracking-wide"
                        >
                            {isGenerating ? "MENGANALISIS..." : "CEK ANOMALI"}
                        </Button>
                    </div>

                    {/* Konten Insight */}
                    <div className="p-6 min-h-[160px] bg-gradient-to-b from-slate-900 to-slate-950">
                        {loadingAI ? (
                            <div className="flex flex-col items-center justify-center h-full gap-3 py-6">
                                <Spin size="large" />
                                <span className="text-slate-500 text-xs font-mono animate-pulse">Mengunduh data saraf tiruan...</span>
                            </div>
                        ) : !latestInsight ? (
                            <div className="flex flex-col items-center justify-center gap-2 py-4 text-slate-500 opacity-60">
                                <InfoCircleFilled className="text-3xl mb-2" /> 
                                <span className="text-sm">Belum ada data analisis hari ini.</span>
                            </div>
                        ) : (
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className={`flex-1 p-4 rounded-xl border bg-gradient-to-br ${getSeverityColor(latestInsight.severity)}`}>
                                    <div className="flex items-start gap-4">
                                        {latestInsight.severity === 'CRITICAL' ? 
                                            <WarningFilled className="text-3xl text-red-500 drop-shadow-lg" /> : 
                                            <CheckCircleFilled className="text-3xl text-emerald-500 drop-shadow-lg" />
                                        }
                                        <div>
                                            <h4 className={`font-bold text-lg mb-1 tracking-tight ${latestInsight.severity === 'CRITICAL' ? 'text-red-100' : 'text-emerald-100'}`}>
                                                {latestInsight.metadata?.title || "Status Pabrik"}
                                            </h4>
                                            <p className="text-sm text-slate-200 leading-relaxed opacity-90">
                                                {latestInsight.message}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-col gap-3">
                                    {latestInsight.metadata?.root_cause && (
                                        <div className="bg-black/40 border border-slate-700/50 rounded-lg p-3 font-mono text-xs relative overflow-hidden group/term">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                                            <p className="text-indigo-400 font-bold mb-1 uppercase text-[10px]">/// ROOT_CAUSE_ANALYSIS</p>
                                            <p className="text-slate-300">
                                                <span className="text-emerald-500 mr-2">$</span>
                                                {latestInsight.metadata.root_cause}
                                                <span className="animate-pulse inline-block w-2 h-4 bg-emerald-500 ml-1 align-middle opacity-0 group-hover/term:opacity-100"></span>
                                            </p>
                                        </div>
                                    )}

                                    {latestInsight.metadata?.suggested_actions?.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-auto">
                                            {latestInsight.metadata.suggested_actions.map((action: any, idx: number) => (
                                                <Button 
                                                    key={idx} 
                                                    size="small"
                                                    type="dashed"
                                                    className="border-slate-600 text-slate-300 hover:text-emerald-400 hover:border-emerald-400 bg-slate-800/50 text-xs"
                                                    onClick={() => message.info(`Perintah dijalankan: ${action.label}`)}
                                                >
                                                    Running: {action.action}
                                                </Button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* BAGIAN 2: STATISTIK GRID (REALTIME) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* CARD 1: STATUS MESIN */}
                <Card 
                    className="bg-slate-800 border-slate-700 shadow-xl hover:border-slate-600 transition-all"
                    styles={{ body: { padding: '16px' } }}
                    bordered={false}
                >
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-slate-400 text-xs font-bold uppercase flex items-center gap-2">
                            <DashboardOutlined /> Kondisi Mesin
                        </span>
                        <Tag color={troubledMachines.length > 0 ? "red" : "green"} className="m-0 border-0 font-bold">
                            {troubledMachines.length > 0 ? "ATTENTION" : "OPTIMAL"}
                        </Tag>
                    </div>
                    
                    <div className="flex items-end justify-between">
                        <div>
                            <div className="text-3xl font-bold text-white mb-1 flex items-baseline gap-2">
                                {runningMachines.length}
                                <span className="text-sm font-normal text-slate-500">/ {machines.length} Unit</span>
                            </div>
                            <div className="flex gap-2 text-[10px]">
                                <span className="flex items-center gap-1 text-emerald-400">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Running
                                </span>
                                {troubledMachines.length > 0 && (
                                    <span className="flex items-center gap-1 text-red-400">
                                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Trouble
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="relative w-12 h-12">
                            <Progress 
                                type="circle" 
                                percent={Math.round((runningMachines.length / (machines.length || 1)) * 100)} 
                                width={48} 
                                strokeWidth={10}
                                strokeColor={troubledMachines.length > 0 ? "#ef4444" : "#10b981"}
                                trailColor="#334155"
                                format={() => null}
                            />
                            <SafetyCertificateFilled className={`absolute inset-0 m-auto text-lg ${troubledMachines.length > 0 ? 'text-red-500' : 'text-emerald-500'}`} />
                        </div>
                    </div>
                </Card>

                {/* CARD 2: TOP WORKER */}
                <Card 
                    className="bg-slate-800 border-slate-700 shadow-xl hover:border-slate-600 transition-all"
                    styles={{ body: { padding: '16px' } }}
                    bordered={false}
                >
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-slate-400 text-xs font-bold uppercase flex items-center gap-2">
                            <TrophyFilled className="text-amber-500" /> Top Performa
                        </span>
                        <span className="text-[10px] text-slate-500">Shift Pagi</span>
                    </div>

                    <div className="space-y-3">
                        {workers.length === 0 ? (
                            <p className="text-center text-xs text-slate-600 py-2 italic">Belum ada data produksi.</p>
                        ) : (
                            workers.slice(0, 3).map((w: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <TrophyFilled className={`text-sm ${getRankColor(idx)} transition-transform group-hover:scale-125`} />
                                        <div className="flex flex-col">
                                            <span className="text-xs text-slate-200 font-medium group-hover:text-white transition-colors">
                                                {w.worker_name}
                                            </span>
                                            <div className="w-16 h-1 bg-slate-700 rounded-full mt-1 overflow-hidden">
                                                <div 
                                                    className="h-full bg-indigo-500 rounded-full" 
                                                    style={{ width: `${Math.min((w.total_qty / (workers[0].total_qty || 1)) * 100, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-sm font-mono font-bold text-emerald-400">{w.total_qty}</span>
                                </div>
                            ))
                        )}
                    </div>
                </Card>

                {/* CARD 3: DEADLINE */}
                <Card 
                    className="bg-slate-800 border-slate-700 shadow-xl hover:border-slate-600 transition-all"
                    styles={{ body: { padding: '16px' } }}
                    bordered={false}
                >
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-slate-400 text-xs font-bold uppercase flex items-center gap-2">
                            <AlertOutlined className="text-orange-500" /> Deadline Warning
                        </span>
                        <Badge count={risks.length} showZero={false} color="red" />
                    </div>

                    <div className="space-y-4 max-h-[100px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-600">
                        {risks.length === 0 ? (
                            <div className="text-center py-3">
                                <CheckCircleFilled className="text-2xl text-emerald-500/20 mb-1" />
                                <p className="text-[10px] text-slate-500">Semua aman.</p>
                            </div>
                        ) : (
                            risks.map((item: any, idx: number) => {
                                const progress = Math.round((item.done_qty / item.total_quantity) * 100);
                                return (
                                    <div key={idx} className="bg-slate-900/50 p-2 rounded border border-slate-700/50">
                                        <div className="flex justify-between text-[10px] text-slate-300 mb-1">
                                            <span className="truncate w-24 font-bold">{item.title}</span>
                                            <span className={item.days_left < 3 ? "text-red-400 font-bold" : "text-orange-400"}>
                                                {item.days_left} Hari Lagi
                                            </span>
                                        </div>
                                        <Progress 
                                            percent={progress} 
                                            size="small" 
                                            status={item.risk_level === 'OVERDUE' ? 'exception' : 'active'}
                                            strokeColor={progress < 50 ? "#ef4444" : "#10b981"}
                                            trailColor="#1e293b"
                                        />
                                    </div>
                                );
                            })
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

// Export Wrapped Component
export const AIInsightWidget = () => (
    <App>
        <InnerAIWidget />
    </App>
);
import React, { useState, useEffect, useRef } from 'react';
import { useList } from "@refinedev/core";
import { Fullscreen, Minimize2, Zap, Activity, AlertTriangle, Layers } from 'lucide-react';

export const LiveFloorMapPage = () => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // 1. REF KHUSUS: Untuk menandai area mana yang mau di-fullscreen
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Update Jam
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: machineData } = useList({
    resource: "view_live_machine_status",
    pagination: { mode: "off" },
    sorters: [{ field: "machine_name", order: "asc" }],
    liveMode: "auto", 
  });

  const machines = machineData?.data || [];
  
  // Stats
  const totalMachines = machines.length;
  const activeMachines = machines.filter((m: any) => m.current_status === 'RUNNING').length;
  const errorMachines = machines.filter((m: any) => m.current_status === 'ERROR').length;
  const efficiency = totalMachines > 0 ? Math.round((activeMachines / totalMachines) * 100) : 0;

  // 2. LOGIC FULLSCREEN BARU: Hanya element container yang membesar
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      // Masuk Fullscreen pada elemen spesifik (Ref)
      if (mapContainerRef.current) {
        mapContainerRef.current.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable full-screen mode: ${err.message}`);
        });
      }
    } else {
      // Keluar Fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Event Listener untuk mendeteksi tombol ESC
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  const getStatusStyle = (status: string) => {
    const s = status?.toUpperCase();
    if (s === 'RUNNING') return 'border-emerald-500 bg-emerald-900/20 shadow-[0_0_15px_rgba(16,185,129,0.3)] text-emerald-400';
    if (s === 'ERROR' || s === 'REPAIR') return 'border-red-500 bg-red-900/20 shadow-[0_0_15px_rgba(239,68,68,0.5)] text-red-400 animate-pulse';
    if (s === 'OFFLINE') return 'border-slate-700 bg-slate-800/50 text-slate-500';
    return 'border-amber-500 bg-amber-900/20 text-amber-400';
  };

  return (
    // Pasang REF disini. Saat fullscreen, div ini akan menutupi seluruh layar (termasuk sidebar)
    <div 
        ref={mapContainerRef} 
        className="bg-slate-950 h-screen flex flex-col font-mono overflow-hidden text-slate-200 w-full fixed top-0 left-0 z-[9999]"
        style={{ position: isFullScreen ? 'fixed' : 'relative', height: '100vh', width: '100%' }}
    >
      
      {/* HEADER */}
      <div className="bg-slate-900/80 backdrop-blur border-b border-slate-800 px-6 py-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded flex items-center justify-center border border-emerald-500/30">
                <Activity className="text-emerald-400 animate-pulse" />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-white tracking-widest uppercase">Production Floor</h1>
                <p className="text-xs text-slate-400 tracking-[0.2em] uppercase">Tasikmalaya Plant • Sector A</p>
            </div>
        </div>

        {/* Global Stats Bar */}
        <div className="flex gap-8 bg-black/20 px-6 py-2 rounded-lg border border-slate-800 hidden md:flex">
            <div className="text-center">
                <p className="text-[10px] text-slate-500 uppercase">Efficiency</p>
                <p className="text-xl font-bold text-emerald-400">{efficiency}%</p>
            </div>
            <div className="w-px bg-slate-800"></div>
            <div className="text-center">
                <p className="text-[10px] text-slate-500 uppercase">Running</p>
                <p className="text-xl font-bold text-blue-400">{activeMachines}</p>
            </div>
            <div className="w-px bg-slate-800"></div>
            <div className="text-center">
                <p className="text-[10px] text-slate-500 uppercase">Alerts</p>
                <p className={`text-xl font-bold ${errorMachines > 0 ? 'text-red-500 animate-pulse' : 'text-slate-400'}`}>
                    {errorMachines}
                </p>
            </div>
        </div>

        <div className="text-right flex items-center gap-6">
             <div className="hidden sm:block">
                <p className="text-2xl font-bold text-white leading-none">
                    {currentTime.toLocaleTimeString('id-ID', {hour12: false})}
                </p>
                <p className="text-xs text-slate-500 mt-1 uppercase">
                    {currentTime.toLocaleDateString('id-ID', {weekday: 'long', day:'numeric', month:'long'})}
                </p>
             </div>
             <button 
                onClick={toggleFullScreen} 
                className="p-3 bg-slate-800 rounded hover:bg-slate-700 transition-all border border-slate-700 z-50 cursor-pointer"
             >
                {isFullScreen ? <Minimize2 /> : <Fullscreen />}
             </button>
        </div>
      </div>

      {/* MAIN GRID - Scrollable Area */}
      {/* 'flex-1 overflow-y-auto' memastikan area ini bisa discroll jika mesin > layar */}
      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-slate-950">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-20">
            {machines.map((m: any) => (
                <div 
                    key={m.machine_id} 
                    className={`
                        relative p-4 rounded-xl border flex flex-col justify-between h-[140px] transition-all hover:scale-105
                        ${getStatusStyle(m.current_status)}
                    `}
                >
                    <div className="flex justify-between items-start">
                        <span className="text-xl font-bold tracking-tighter truncate">{m.machine_name}</span>
                        <div className={`w-2 h-2 rounded-full ${m.current_status === 'RUNNING' ? 'bg-current animate-ping' : 'bg-current'}`}></div>
                    </div>

                    <div className="flex-1 flex items-center justify-center my-2">
                        {m.current_status === 'RUNNING' && (
                            <div className="text-center">
                                <Zap size={24} className="mx-auto mb-1 opacity-80" />
                                <span className="text-[10px] uppercase opacity-70">Running</span>
                            </div>
                        )}
                        {m.current_status === 'IDLE' && <Layers size={24} className="opacity-50" />}
                        {(m.current_status === 'ERROR' || m.current_status === 'REPAIR') && (
                            <AlertTriangle size={24} className="animate-bounce" />
                        )}
                         {m.current_status === 'OFFLINE' && <span className="text-2xl opacity-20">OFF</span>}
                    </div>

                    <div>
                        <div className="h-px bg-current opacity-20 mb-2"></div>
                        <div className="flex justify-between items-end text-[10px] opacity-80 font-bold uppercase">
                            <span>{m.current_status}</span>
                            <span>{m.current_worker_id ? 'OPR-ACTIVE' : 'AUTO'}</span>
                        </div>
                         {(m.current_status === 'ERROR' || m.current_status === 'REPAIR') && (
                             <div className="mt-1 text-[9px] bg-black/30 p-1 rounded truncate">
                                {m.last_note}
                             </div>
                        )}
                    </div>
                </div>
            ))}
            
            {/* Dummy spacers agar scroll mentok enak dilihat di TV */}
            <div className="h-10 w-full col-span-full"></div>
        </div>
      </div>

      {/* FOOTER TICKER */}
      <div className="bg-black py-2 px-6 border-t border-slate-900 flex gap-4 text-[10px] text-slate-500 uppercase tracking-widest shrink-0">
         <span>SYSTEM: ONLINE</span>
         <span>•</span>
         <span>DATA STREAM: LIVE</span>
         <span>•</span>
         <span>SERVER LATENCY: 24ms</span>
         <span className="ml-auto">BordirTech v1.0 Enterprise</span>
      </div>
    </div>
  );
};
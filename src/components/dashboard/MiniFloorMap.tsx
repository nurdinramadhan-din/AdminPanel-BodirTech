import React from 'react';
import { useList } from "@refinedev/core";

export const MiniFloorMap = () => {
  const { data: machineData, isLoading } = useList({
    resource: "view_live_machine_status",
    pagination: { mode: "off" },
    sorters: [{ field: "machine_name", order: "asc" }],
    liveMode: "auto",
  });

  const machines = machineData?.data || [];

  const getStatusColor = (status: string) => {
    const s = status?.toUpperCase();
    if (s === 'RUNNING') return 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400';
    if (s === 'ERROR' || s === 'REPAIR') return 'bg-red-500/20 border-red-500/50 text-red-400 animate-pulse';
    if (s === 'OFFLINE') return 'bg-slate-700/50 border-slate-600 text-slate-500';
    return 'bg-amber-500/20 border-amber-500/50 text-amber-400';
  };

  const getStatusDot = (status: string) => {
    const s = status?.toUpperCase();
    if (s === 'RUNNING') return 'bg-emerald-500 shadow-[0_0_10px_#10B981]';
    if (s === 'ERROR' || s === 'REPAIR') return 'bg-red-500 shadow-[0_0_10px_#EF4444]';
    if (s === 'OFFLINE') return 'bg-slate-500';
    return 'bg-amber-500';
  };

  return (
    <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl shadow-lg h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-700">
        <div>
           <h3 className="text-lg font-bold text-white">🏭 Live Floor Map</h3>
           <p className="text-xs text-slate-400">Status real-time {machines.length} Mesin</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900 px-2 py-1 rounded-full border border-slate-700">
            <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-bold text-emerald-400">ONLINE</span>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center text-slate-500 animate-pulse">
            Memuat Data...
        </div>
      ) : (
        // Grid Responsif: Otomatis menyesuaikan lebar layar agar tidak menumpuk
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 overflow-y-auto max-h-[350px] custom-scrollbar pr-2">
            {machines.map((m: any) => (
            <div 
                key={m.machine_id} 
                className={`
                relative p-3 rounded-lg border shadow-sm flex flex-col justify-between transition-all hover:scale-[1.02]
                ${getStatusColor(m.current_status)}
                `}
            >
                <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-sm font-mono">{m.machine_name}</span>
                    <span className={`h-2 w-2 rounded-full ${getStatusDot(m.current_status)}`}></span>
                </div>
                
                <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold tracking-wider opacity-90">
                        {m.current_status || 'UNKNOWN'}
                    </p>
                    {m.current_status === 'RUNNING' && (
                        <div className="flex items-center gap-1 text-[10px] opacity-70 truncate">
                             <span>👤</span> {m.current_worker_id ? 'Operator' : 'Auto'}
                        </div>
                    )}
                     {(m.current_status === 'ERROR' || m.current_status === 'REPAIR') && (
                        <p className="text-[10px] font-bold bg-red-900/40 px-1 rounded truncate">
                             ⚠️ {m.last_note || 'Perbaikan'}
                        </p>
                    )}
                </div>
            </div>
            ))}
        </div>
      )}
    </div>
  );
};
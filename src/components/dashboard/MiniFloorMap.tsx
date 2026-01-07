import React from 'react';
import { useList } from "@refinedev/core";

export const MiniFloorMap = () => {
  // 1. Fetch Data Mesin Real-time
  const { data: machineData, isLoading } = useList({
    resource: "view_live_machine_status",
    pagination: { mode: "off" },
    sorters: [{ field: "machine_name", order: "asc" }], // Urutkan M-01, M-02...
    liveMode: "auto", // ✅ WAJIB: Agar status berubah sendiri tanpa refresh halaman
  });

  const machines = machineData?.data || [];

  // Helper untuk menentukan warna berdasarkan status DB
  const getStatusColor = (status: string) => {
    const s = status?.toUpperCase();
    if (s === 'RUNNING') return 'bg-emerald-100 border-emerald-500 text-emerald-700';
    if (s === 'ERROR' || s === 'REPAIR') return 'bg-red-100 border-red-500 text-red-700 animate-pulse'; // Efek kedip kalau rusak
    if (s === 'OFFLINE') return 'bg-slate-100 border-slate-300 text-slate-400';
    return 'bg-yellow-50 border-yellow-400 text-yellow-700'; // IDLE/Setting
  };

  const getStatusDot = (status: string) => {
    const s = status?.toUpperCase();
    if (s === 'RUNNING') return 'bg-emerald-500';
    if (s === 'ERROR' || s === 'REPAIR') return 'bg-red-500';
    if (s === 'OFFLINE') return 'bg-slate-400';
    return 'bg-yellow-500';
  };

  return (
    <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
           <h3 className="text-lg font-bold text-gray-800">🏭 Denah Lantai (Live)</h3>
           <p className="text-xs text-gray-400">Status mesin real-time dari sensor IoT/Android.</p>
        </div>
        
        {/* Indikator Live */}
        <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-bold text-emerald-600">LIVE</span>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center text-gray-400 animate-pulse">
            Memuat Peta Pabrik...
        </div>
      ) : (
        /* Grid Layout Mesin */
        <div className="grid grid-cols-2 gap-3 overflow-y-auto max-h-[300px] pr-1 custom-scrollbar">
            {machines.map((m: any) => (
            <div 
                key={m.machine_id} 
                className={`
                relative p-3 rounded-lg border-l-4 shadow-sm flex flex-col justify-between transition-all hover:shadow-md
                ${getStatusColor(m.current_status)}
                `}
            >
                <div className="flex justify-between items-start">
                    <span className="font-bold text-md">{m.machine_name}</span>
                    <span className={`h-2 w-2 rounded-full ${getStatusDot(m.current_status)}`}></span>
                </div>
                
                <div className="mt-2">
                    <p className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                        {m.current_status || 'UNKNOWN'}
                    </p>
                    {/* Tampilkan Operator jika sedang jalan */}
                    {m.current_status === 'RUNNING' && (
                        <p className="text-[10px] mt-1 truncate">
                             👤 {m.current_worker_id ? 'Operator Aktif' : '-'}
                        </p>
                    )}
                     {/* Tampilkan Pesan Error jika rusak */}
                     {(m.current_status === 'ERROR' || m.current_status === 'REPAIR') && (
                        <p className="text-[10px] mt-1 font-bold">
                             ⚠️ {m.last_note || 'Perlu Perbaikan'}
                        </p>
                    )}
                </div>
            </div>
            ))}

            {machines.length === 0 && (
                <div className="col-span-2 text-center py-8 text-gray-400 text-sm border-2 border-dashed rounded-lg">
                    Belum ada data mesin terdaftar.
                </div>
            )}
        </div>
      )}
      
      {/* Legend / Keterangan Warna */}
      <div className="mt-4 flex gap-3 justify-center text-[10px] text-gray-500 border-t pt-3">
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div>Jalan</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-500"></div>Idle</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div>Error</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-400"></div>Mati</div>
      </div>
    </div>
  );
};
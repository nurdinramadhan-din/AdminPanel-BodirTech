import React, { useState } from "react";
import { useList, useCreate, useGetIdentity } from "@refinedev/core";
import { Play, Pause, AlertTriangle, Square, RefreshCw, Loader2 } from "lucide-react";
import { Modal, Input, message, Tooltip } from "antd";

// Interface untuk User Identity
interface IUser {
  id: string;
  name: string;
  avatar: string;
  organization_id: string;
}

export const MachineControl = () => {
  // 1. Ambil Data User (Pastikan sudah Logout-Login agar data ini update)
  const { data: user } = useGetIdentity<IUser>();

  // 2. Ambil Data Mesin
  const { data: machineData, isLoading: isListLoading, refetch } = useList({
    resource: "view_live_machine_status",
    sorters: [{ field: "machine_name", order: "asc" }],
    pagination: { mode: "off" },
    liveMode: "auto", // Mencoba fitur auto-refresh jika didukung
  });

  // 3. Hook Create dengan status loading
  const { mutate: createLog, isLoading: isSubmitting } = useCreate();

  // State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<any>(null);
  const [actionType, setActionType] = useState<string>("");
  const [note, setNote] = useState("");

  // Handler Klik Tombol
  const handleAction = (machine: any, status: string) => {
    console.log("Tombol Ditekan:", machine.machine_name, status); // Debugging

    if (!user?.organization_id) {
      message.error("Sesi kadaluarsa atau ID Organisasi hilang. Silakan Logout & Login lagi.");
      return;
    }

    // Jika Status RUNNING, langsung eksekusi (Cepat)
    if (status === 'RUNNING') {
        executeStatusChange(machine, status, "Produksi Dimulai (Quick Start)");
    } else {
        // Jika status lain, buka modal konfirmasi
        setSelectedMachine(machine);
        setActionType(status);
        setIsModalOpen(true);
    }
  };

  const executeStatusChange = (machine: any, status: string, notes: string) => {
    console.log("Mengirim Data ke DB...", { machine_id: machine.machine_id, status });

    createLog({
        resource: "production_logs",
        values: {
            machine_id: machine.machine_id,
            action_type: status, 
            organization_id: user?.organization_id, 
            actor_id: user?.id,
            notes: notes,
            created_at: new Date().toISOString()
        },
        successNotification: {
            message: `Berhasil: ${machine.machine_name} -> ${status}`,
            type: "success",
        },
        errorNotification: (error) => ({
            message: "Gagal Update Status",
            description: `Error: ${error?.message || "Koneksi Bermasalah"}`,
            type: "error"
        })
    }, {
        onSuccess: () => {
            setIsModalOpen(false);
            setNote("");
            refetch(); // Paksa refresh data agar UI berubah
        }
    });
  };

  if (isListLoading) return (
    <div className="flex h-64 items-center justify-center text-slate-400">
        <Loader2 className="animate-spin mr-2" /> Memuat Data Mesin...
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
      {/* Header Page */}
      <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-xl border border-slate-700">
        <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                🎛️ Operator Panel
                <span className="text-xs font-normal bg-slate-700 px-2 py-1 rounded text-slate-300">
                    User: {user?.name || "Loading..."}
                </span>
            </h1>
            <p className="text-slate-400 text-sm">Klik tombol untuk mengubah status operasional mesin.</p>
        </div>
        <button 
            onClick={() => refetch()} 
            className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-200 transition-colors"
            title="Refresh Data"
        >
            <RefreshCw size={20} className={isListLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Grid Mesin */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {machineData?.data.map((m: any) => (
          <div key={m.machine_id} className={`
            relative p-6 rounded-xl border-2 transition-all overflow-hidden flex flex-col justify-between min-h-[220px]
            ${m.current_status === 'RUNNING' ? 'border-emerald-500/50 bg-emerald-900/10 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : ''}
            ${m.current_status === 'STOPPED' ? 'border-slate-600 bg-slate-800/50' : ''}
            ${m.current_status === 'ERROR' ? 'border-red-500/50 bg-red-900/10' : ''}
            ${m.current_status === 'IDLE' ? 'border-amber-500/50 bg-amber-900/10' : ''}
          `}>
            
            {/* Header Kartu */}
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                    <h3 className="text-xl font-black text-white font-mono tracking-tight">{m.machine_name}</h3>
                    <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">
                        {m.brand || 'NO BRAND'}
                    </p>
                </div>
                <div className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wide
                    ${m.current_status === 'RUNNING' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'bg-slate-700 text-slate-300'}
                `}>
                    {m.current_status}
                </div>
            </div>

            {/* Tombol Control - Z-Index tinggi agar bisa diklik */}
            <div className="grid grid-cols-2 gap-3 mt-4 relative z-20">
                
                {/* START BUTTON */}
                <button 
                    onClick={() => handleAction(m, 'RUNNING')}
                    disabled={m.current_status === 'RUNNING' || isSubmitting}
                    className={`
                        flex flex-col items-center justify-center p-3 rounded-lg transition-all active:scale-95
                        ${m.current_status === 'RUNNING' 
                            ? 'bg-emerald-900/20 text-emerald-700 cursor-not-allowed border border-emerald-900/30' 
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20'
                        }
                    `}
                >
                    {isSubmitting && m.current_status !== 'RUNNING' ? (
                        <Loader2 size={24} className="animate-spin" />
                    ) : (
                        <>
                            <Play size={24} className="mb-1 fill-current" />
                            <span className="text-[10px] font-bold tracking-widest">START</span>
                        </>
                    )}
                </button>

                {/* PAUSE BUTTON */}
                <button 
                    onClick={() => handleAction(m, 'IDLE')}
                    disabled={m.current_status === 'IDLE' || isSubmitting}
                    className={`
                        flex flex-col items-center justify-center p-3 rounded-lg transition-all active:scale-95
                        ${m.current_status === 'IDLE' 
                            ? 'bg-amber-900/20 text-amber-700 cursor-not-allowed border border-amber-900/30' 
                            : 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/20'
                        }
                    `}
                >
                    <Pause size={24} className="mb-1 fill-current" />
                    <span className="text-[10px] font-bold tracking-widest">PAUSE</span>
                </button>

                {/* STOP BUTTON */}
                <button 
                    onClick={() => handleAction(m, 'STOPPED')}
                    disabled={m.current_status === 'STOPPED' || isSubmitting}
                    className={`
                        flex flex-col items-center justify-center p-3 rounded-lg transition-all active:scale-95
                        ${m.current_status === 'STOPPED' 
                            ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700' 
                            : 'bg-slate-600 hover:bg-slate-500 text-white shadow-lg shadow-slate-900/20'
                        }
                    `}
                >
                    <Square size={24} className="mb-1 fill-current" />
                    <span className="text-[10px] font-bold tracking-widest">STOP</span>
                </button>

                {/* ERROR BUTTON */}
                <button 
                    onClick={() => handleAction(m, 'ERROR')}
                    disabled={isSubmitting}
                    className="flex flex-col items-center justify-center p-3 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-all active:scale-95 shadow-lg shadow-red-900/20"
                >
                    <AlertTriangle size={24} className="mb-1" />
                    <span className="text-[10px] font-bold tracking-widest">ERROR</span>
                </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL UPDATE STATUS */}
      <Modal
        title={
            <div className="flex items-center gap-3 border-b border-slate-700 pb-3">
                <div className={`p-2 rounded-lg ${
                    actionType === 'STOPPED' ? 'bg-slate-700' : 
                    actionType === 'ERROR' ? 'bg-red-500/20 text-red-500' : 'bg-amber-500/20 text-amber-500'
                }`}>
                    {actionType === 'ERROR' ? <AlertTriangle size={20}/> : <Square size={20}/>}
                </div>
                <span className="text-white text-lg">Konfirmasi Status</span>
            </div>
        }
        open={isModalOpen}
        onOk={() => executeStatusChange(selectedMachine, actionType, note)}
        onCancel={() => setIsModalOpen(false)}
        okText={isSubmitting ? "Menyimpan..." : "Konfirmasi Update"}
        confirmLoading={isSubmitting}
        okButtonProps={{ 
            className: `${
                actionType === 'ERROR' ? 'bg-red-600 hover:bg-red-500' : 'bg-emerald-500 hover:bg-emerald-600'
            } border-none h-10 px-6`
        }}
        cancelButtonProps={{ className: 'text-slate-400 hover:text-white' }}
        styles={{ 
            content: { backgroundColor: '#0f172a', border: '1px solid #334155', padding: 0 },
            header: { backgroundColor: 'transparent', padding: '16px 24px 0', border: 'none' },
            body: { padding: '24px' },
            footer: { borderTop: '1px solid #1e293b', padding: '12px 16px' }
        }}
        closeIcon={<span className="text-slate-500 hover:text-white">✕</span>}
      >
        <div className="space-y-4">
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                <p className="text-slate-400 text-sm mb-1">Mesin:</p>
                <p className="text-white text-xl font-bold font-mono">{selectedMachine?.machine_name}</p>
            </div>

            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                <p className="text-slate-400 text-sm mb-1">Status Baru:</p>
                <p className={`text-xl font-bold ${
                    actionType === 'ERROR' ? 'text-red-400' : 
                    actionType === 'STOPPED' ? 'text-slate-300' : 'text-amber-400'
                }`}>
                    {actionType}
                </p>
            </div>

            <div>
                <label className="text-xs text-slate-500 mb-2 block uppercase font-bold tracking-wider">
                    Catatan (Wajib jika Error):
                </label>
                <Input.TextArea 
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={actionType === 'ERROR' ? "Contoh: Benang putus di jarum 3..." : "Keterangan tambahan (Opsional)..."}
                    className="bg-slate-900 border-slate-700 text-white placeholder-slate-600 focus:border-emerald-500 hover:border-slate-600 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                />
            </div>
        </div>
      </Modal>
    </div>
  );
};
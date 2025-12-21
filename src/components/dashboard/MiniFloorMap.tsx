import React from 'react';

const MACHINES = [
  { id: 1, status: 'RUNNING', name: 'M-01' },
  { id: 2, status: 'RUNNING', name: 'M-02' },
  { id: 3, status: 'ERROR', name: 'M-03' },
  { id: 4, status: 'IDLE', name: 'M-04' },
];

export const MiniFloorMap = () => {
  return (
    <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-white">🏭 Status Mesin Live</h3>
        <span className="flex h-3 w-3 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {MACHINES.map((m) => (
          <div 
            key={m.id} 
            className={`
              p-4 rounded-lg border flex flex-col items-center justify-center transition-all
              ${m.status === 'RUNNING' ? 'bg-emerald-900/20 border-emerald-500/50 text-emerald-400' : ''}
              ${m.status === 'ERROR' ? 'bg-red-900/20 border-red-500/50 text-red-400' : ''}
              ${m.status === 'IDLE' ? 'bg-slate-700/30 border-slate-600 text-slate-400' : ''}
            `}
          >
            <span className="font-mono font-bold text-lg">{m.name}</span>
            <span className="text-[10px] uppercase font-bold mt-1 tracking-wider">{m.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
import React from "react";
import { useList } from "@refinedev/core";
import { AlertTriangle, CheckCircle, Info, BrainCircuit } from "lucide-react";

export const AIInsightWidget = () => {
    const { data } = useList({
        resource: "ai_insights",
        filters: [{ field: "is_read", operator: "eq", value: false }],
        pagination: { pageSize: 5 },
        sorters: [{ field: "created_at", order: "desc" }],
        liveMode: "auto", 
    });

    const insights = data?.data || [];

    // Jika kosong, sembunyikan saja agar rapi di bawah
    if (insights.length === 0) return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-center justify-center text-slate-500 text-sm">
            <CheckCircle className="w-4 h-4 mr-2" />
            Sistem AI tidak mendeteksi anomali saat ini.
        </div>
    );

    return (
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-lg animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-slate-900/50 px-4 py-3 border-b border-slate-700 flex items-center gap-2">
                <BrainCircuit className="text-purple-400 w-5 h-5" />
                <h3 className="text-slate-200 font-bold text-sm uppercase tracking-wider">Log Analisis AI</h3>
            </div>
            <div className="divide-y divide-slate-700">
                {insights.map((item: any) => (
                    <div 
                        key={item.id} 
                        className={`p-4 flex items-start gap-4 hover:bg-slate-700/30 transition-colors
                            ${item.severity === 'HIGH' ? 'bg-red-900/10' : ''}
                        `}
                    >
                        <div className="mt-1">
                            {item.severity === 'HIGH' ? (
                                <div className="bg-red-500/20 p-2 rounded-full">
                                    <AlertTriangle className="text-red-400 w-5 h-5" />
                                </div>
                            ) : (
                                <div className="bg-blue-500/20 p-2 rounded-full">
                                    <Info className="text-blue-400 w-5 h-5" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                                    item.severity === 'HIGH' 
                                        ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                }`}>
                                    {item.insight_type || "SYSTEM ALERT"}
                                </span>
                                <span className="text-xs text-slate-500">
                                    {new Date(item.created_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>
                            <p className="text-slate-300 text-sm mt-1 leading-relaxed">{item.message}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
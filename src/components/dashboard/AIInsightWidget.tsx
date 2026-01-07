import React from "react";
import { useList } from "@refinedev/core";
import { AlertTriangle, CheckCircle, Info } from "lucide-react"; // Pastikan install lucide-react

export const AIInsightWidget = () => {
    // Fetch data AI yang belum dibaca (realtime)
    const { data } = useList({
        resource: "ai_insights",
        filters: [{ field: "is_read", operator: "eq", value: false }],
        pagination: { pageSize: 3 },
        sorters: [{ field: "created_at", order: "desc" }],
        liveMode: "auto", 
    });

    const insights = data?.data || [];

    // Jika tidak ada masalah, tampilkan pesan aman (Opsional)
    if (insights.length === 0) return (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6 flex items-center shadow-sm animate-in fade-in">
             <div className="bg-emerald-100 p-2 rounded-full mr-4">
                <CheckCircle className="text-emerald-600 w-6 h-6" />
            </div>
            <div>
                <h4 className="font-bold text-emerald-800">Sistem Aman Terkendali</h4>
                <p className="text-emerald-600 text-sm">AI tidak mendeteksi anomali produksi atau stok saat ini.</p>
            </div>
        </div>
    );

    return (
        <div className="mb-6 space-y-3 animate-in slide-in-from-top-4 duration-500">
            {insights.map((item: any) => (
                <div 
                    key={item.id} 
                    className={`border-l-4 p-4 rounded-r-lg shadow-md flex items-start bg-white
                        ${item.severity === 'HIGH' ? 'border-red-500' : 'border-yellow-500'}
                    `}
                >
                    <div className="mr-4 mt-1">
                        {item.severity === 'HIGH' ? (
                             <div className="bg-red-100 p-2 rounded-full animate-pulse">
                                <AlertTriangle className="text-red-600 w-6 h-6" />
                             </div>
                        ) : (
                            <div className="bg-yellow-100 p-2 rounded-full">
                                <Info className="text-yellow-700 w-6 h-6" />
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                                item.severity === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                                {item.insight_type || "AI ALERT"}
                            </span>
                            <span className="text-xs text-gray-400">Baru saja</span>
                        </div>
                        <p className="text-gray-800 font-medium">{item.message}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};
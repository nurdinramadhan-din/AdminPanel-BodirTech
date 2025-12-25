import React from "react";
import { useTable, useUpdate } from "@refinedev/core";
// ✅ KITA PAKAI NAVIGASI BAWAAN REACT ROUTER (Lebih Stabil)
import { useNavigate } from "react-router-dom"; 

export const LoanList = () => {
    // ✅ Inisialisasi hook navigasi standar
    const navigate = useNavigate();

    const { tableQueryResult } = useTable({
        resource: "employee_loans",
        meta: {
            select: "*, profiles(full_name)"
        },
        liveMode: "auto",
        sorters: {
            initial: [{ field: "created_at", order: "desc" }],
        },
    });

    const { mutate: updateLoan } = useUpdate();
    const loans = tableQueryResult?.data?.data ?? [];
    const isLoading = tableQueryResult?.isLoading;

    const handleStatus = (id: string, status: string) => {
        if (window.confirm(`Apakah anda yakin ingin mengubah status menjadi ${status}?`)) {
            updateLoan({
                resource: "employee_loans",
                id,
                values: { status },
            });
        }
    };

    if (isLoading) return <div className="p-6 text-white">Loading data...</div>;

    return (
        <div className="p-6">
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-100">Kasbon Pegawai</h1>
                
                {/* ✅ TOMBOL CREATE: Navigasi manual ke URL */}
                <button 
                    onClick={() => navigate("/loans/create")} 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
                >
                    <span className="text-xl font-bold">+</span> 
                    Ajukan Kasbon
                </button>
            </div>

            <div className="bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-slate-700">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-900 text-slate-400 uppercase text-xs font-semibold">
                        <tr>
                            <th className="p-4">Tanggal</th>
                            <th className="p-4">Nama Pegawai</th>
                            <th className="p-4">Jumlah (Rp)</th>
                            <th className="p-4">Sisa (Rp)</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700 text-slate-300">
                        {loans.map((loan: any) => (
                            <tr key={loan.id} className="hover:bg-slate-750 transition">
                                <td className="p-4">
                                    {new Date(loan.created_at).toLocaleDateString("id-ID")}
                                </td>
                                <td className="p-4 font-medium text-white">
                                    {loan.profiles?.full_name || "Unknown"}
                                </td>
                                <td className="p-4 text-emerald-400">
                                    Rp {parseInt(loan.amount_principal).toLocaleString("id-ID")}
                                </td>
                                <td className="p-4 text-rose-400">
                                    Rp {parseInt(loan.amount_remaining).toLocaleString("id-ID")}
                                </td>
                                <td className="p-4">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                                            loan.status === "APPROVED" ? "bg-emerald-500/20 text-emerald-400" :
                                            loan.status === "REJECTED" ? "bg-red-500/20 text-red-400" :
                                            loan.status === "PENDING" ? "bg-yellow-500/20 text-yellow-400" :
                                            "bg-blue-500/20 text-blue-400"
                                        }`}
                                    >
                                        {loan.status}
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    {loan.status === "PENDING" ? (
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => handleStatus(loan.id, "APPROVED")}
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded text-sm transition"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleStatus(loan.id, "REJECTED")}
                                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    ) : (
                                        // ✅ TOMBOL EDIT: Navigasi manual ke URL edit
                                        <button
                                            onClick={() => navigate(`/loans/edit/${loan.id}`)}
                                            className="text-slate-500 hover:text-white text-sm underline"
                                        >
                                            Edit / Detail
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                {loans.length === 0 && !isLoading && (
                    <div className="p-8 text-center text-slate-500">
                        Belum ada pengajuan kasbon.
                    </div>
                )}
            </div>
        </div>
    );
};
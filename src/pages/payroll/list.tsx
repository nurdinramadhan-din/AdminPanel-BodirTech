// src/pages/payroll/list.tsx
import React from "react";
import { useTable } from "@refinedev/core";

export const PayrollList = () => {
    // Mengambil data dari VIEW yang sudah kita buat di database
    const { tableQueryResult } = useTable({
        resource: "view_employee_payroll",
        pagination: { pageSize: 10 },
        sorters: { initial: [{ field: "current_balance", order: "desc" }] },
    });

    const { data, isLoading } = tableQueryResult;

    // Formatter untuk Rupiah
    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    if (isLoading) return <div className="p-6 text-center">Loading Data Gaji...</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">💰 Manajemen Gaji & Saldo</h1>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow">
                    Export Laporan
                </button>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Nama Pegawai
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Posisi
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Saldo Tersedia
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Update Terakhir
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.data.map((item: any) => (
                            <tr key={item.user_id} className="hover:bg-gray-50">
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <div className="flex items-center">
                                        <div className="ml-3">
                                            <p className="text-gray-900 whitespace-no-wrap font-medium">
                                                {item.full_name || "Tanpa Nama"}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <span
                                        className={`relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight`}
                                    >
                                        <span
                                            aria-hidden
                                            className="absolute inset-0 bg-green-200 opacity-50 rounded-full"
                                        ></span>
                                        <span className="relative text-xs uppercase">{item.role}</span>
                                    </span>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <p className={`font-bold whitespace-no-wrap ${item.current_balance > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                                        {formatRupiah(item.current_balance || 0)}
                                    </p>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <p className="text-gray-900 whitespace-no-wrap">
                                        {new Date(item.last_balance_update).toLocaleDateString("id-ID", {
                                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </p>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                    <button 
                                        className="text-blue-600 hover:text-blue-900 mx-2 font-medium"
                                        onClick={() => alert(`Fitur Withdraw untuk ${item.full_name} akan segera aktif!`)}
                                    >
                                        Cairkan
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* Pagination Sederhana */}
                <div className="px-5 py-5 bg-white border-t flex flex-col xs:flex-row items-center xs:justify-between">
                     <span className="text-xs xs:text-sm text-gray-900">
                        Menampilkan {data?.data.length} pegawai teratas
                    </span>
                </div>
            </div>
        </div>
    );
};
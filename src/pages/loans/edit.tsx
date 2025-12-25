import React, { useEffect } from "react";
import { useForm, useSelect, useNavigation } from "@refinedev/core";

export const LoanEdit = () => {
    const { list } = useNavigation();

    // 1. Hook Form untuk Edit
    const { onFinish, mutationResult, queryResult, formLoading } = useForm({
        action: "edit",
        resource: "employee_loans",
        redirect: "list",
    });

    // Ambil data yang sedang diedit
    const record = queryResult?.data?.data;

    // 2. Hook Select (Dropdown Pegawai)
    const { options: employeeOptions } = useSelect({
        resource: "profiles",
        optionLabel: "full_name",
        optionValue: "id",
        defaultValue: record?.user_id, // Pre-select pegawai
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        // Kirim data update
        onFinish({
            user_id: formData.get("user_id"),
            amount_principal: formData.get("amount_principal"),
            // amount_remaining: ... (Hati-hati mengedit sisa hutang jika sudah ada cicilan)
            // Untuk amannya, kita izinkan edit sisa hutang manual di sini
            amount_remaining: formData.get("amount_remaining"),
            status: formData.get("status"),
            reason: formData.get("reason"),
        });
    };

    if (formLoading) return <div className="p-8 text-white">Loading...</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-8">
                <h1 className="text-2xl font-bold text-slate-100 mb-6">Edit Data Kasbon</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Pegawai (Disabled agar tidak tertukar orang, atau Enabled jika perlu) */}
                    <div className="flex flex-col gap-2">
                        <label className="text-slate-400 text-sm font-semibold">Nama Pegawai</label>
                        <select 
                            name="user_id" 
                            defaultValue={record?.user_id}
                            className="bg-slate-900 border border-slate-600 text-slate-200 rounded-lg p-3 opacity-70 cursor-not-allowed"
                            disabled // Biasanya admin tidak mengubah pemilik hutang
                        >
                            {employeeOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Jumlah Awal */}
                        <div className="flex flex-col gap-2">
                            <label className="text-slate-400 text-sm font-semibold">Total Pinjaman (Principal)</label>
                            <input
                                name="amount_principal"
                                type="number"
                                defaultValue={record?.amount_principal}
                                className="bg-slate-900 border border-slate-600 text-slate-200 rounded-lg p-3"
                            />
                        </div>

                        {/* Sisa Hutang */}
                        <div className="flex flex-col gap-2">
                            <label className="text-slate-400 text-sm font-semibold text-rose-400">Sisa Hutang (Remaining)</label>
                            <input
                                name="amount_remaining"
                                type="number"
                                defaultValue={record?.amount_remaining}
                                className="bg-slate-900 border border-slate-600 text-slate-200 rounded-lg p-3"
                            />
                        </div>
                    </div>

                    {/* Status */}
                    <div className="flex flex-col gap-2">
                        <label className="text-slate-400 text-sm font-semibold">Status</label>
                        <select 
                            name="status" 
                            defaultValue={record?.status}
                            className="bg-slate-900 border border-slate-600 text-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="PENDING">PENDING</option>
                            <option value="APPROVED">APPROVED</option>
                            <option value="REJECTED">REJECTED</option>
                            <option value="PAID">PAID (Lunas)</option>
                        </select>
                    </div>

                    {/* Alasan */}
                    <div className="flex flex-col gap-2">
                        <label className="text-slate-400 text-sm font-semibold">Keterangan</label>
                        <textarea
                            name="reason"
                            rows={3}
                            defaultValue={record?.reason}
                            className="bg-slate-900 border border-slate-600 text-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={mutationResult.isLoading}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-lg transition-colors"
                        >
                            {mutationResult.isLoading ? "Menyimpan..." : "Update Perubahan"}
                        </button>
                        <button
                            type="button"
                            onClick={() => list("employee_loans")}
                            className="bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold py-2.5 px-6 rounded-lg transition-colors"
                        >
                            Batal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
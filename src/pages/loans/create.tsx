import React from "react";
import { useForm, useSelect, useNavigation } from "@refinedev/core";

export const LoanCreate = () => {
    const { list } = useNavigation();

    // 1. Hook Form
    const { onFinish, mutationResult } = useForm({
        action: "create",
        resource: "employee_loans",
        redirect: "list",
    });

    // 2. Hook Select (Ambil Data Pegawai)
    const { options: employeeOptions } = useSelect({
        resource: "profiles",
        optionLabel: "full_name",
        optionValue: "id",
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const amount = formData.get("amount_principal");
        
        onFinish({
            user_id: formData.get("user_id"),
            amount_principal: amount,
            amount_remaining: amount, 
            reason: formData.get("reason"),
            status: formData.get("status") || "APPROVED",
        });
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-8">
                <h1 className="text-2xl font-bold text-slate-100 mb-6">Buat Kasbon Baru</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Input Pegawai */}
                    <div className="flex flex-col gap-2">
                        <label className="text-slate-400 text-sm font-semibold">Nama Pegawai</label>
                        <select name="user_id" required className="bg-slate-900 border border-slate-600 text-slate-200 rounded-lg p-3">
                            <option value="">-- Pilih Pegawai --</option>
                            {employeeOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Input Jumlah */}
                    <div className="flex flex-col gap-2">
                        <label className="text-slate-400 text-sm font-semibold">Jumlah Pinjaman (Rp)</label>
                        <input name="amount_principal" type="number" required className="bg-slate-900 border border-slate-600 text-slate-200 rounded-lg p-3" />
                    </div>

                    {/* Input Status */}
                    <div className="flex flex-col gap-2">
                        <label className="text-slate-400 text-sm font-semibold">Status Awal</label>
                        <select name="status" defaultValue="APPROVED" className="bg-slate-900 border border-slate-600 text-slate-200 rounded-lg p-3">
                            <option value="PENDING">PENDING</option>
                            <option value="APPROVED">APPROVED</option>
                            <option value="PAID">PAID</option>
                        </select>
                    </div>

                    {/* Input Alasan */}
                    <div className="flex flex-col gap-2">
                        <label className="text-slate-400 text-sm font-semibold">Alasan</label>
                        <textarea name="reason" rows={3} className="bg-slate-900 border border-slate-600 text-slate-200 rounded-lg p-3" />
                    </div>

                    {/* Tombol */}
                    <div className="flex gap-4 pt-4">
                        <button type="submit" disabled={mutationResult.isLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded-lg">
                            {mutationResult.isLoading ? "Menyimpan..." : "Simpan"}
                        </button>
                        <button type="button" onClick={() => list("employee_loans")} className="bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold py-2 px-6 rounded-lg">
                            Batal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
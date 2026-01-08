import React, { useState } from "react";
import { useTable } from "@refinedev/antd";
import { Table, Tag, Space, Button, Modal, message, ConfigProvider, theme } from "antd";
import { DollarOutlined, DownloadOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { supabaseClient } from "../../utility";

export const PayrollList = () => {
    const { darkAlgorithm } = theme;
    const [isWithdrawing, setIsWithdrawing] = useState(false);

    const { tableProps, tableQueryResult } = useTable({
        resource: "view_employee_payroll", 
        pagination: { pageSize: 20 },
        liveMode: "auto"
    });

    // FITUR EKSPOR CSV
    const handleExport = () => {
        const data = tableQueryResult.data?.data || [];
        if (data.length === 0) return message.warning("Tidak ada data untuk diekspor");

        const csvHeader = ["Nama", "Role", "Saldo Saat Ini", "Update Terakhir"];
        const csvRows = data.map((row: any) => [
            `"${row.full_name}"`,
            row.role,
            row.current_balance,
            row.last_balance_update
        ]);

        const csvContent = [csvHeader, ...csvRows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `Laporan_Gaji_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    // FITUR CAIRKAN (WITHDRAW)
    const handleWithdraw = (record: any) => {
        if (record.current_balance <= 0) return message.error("Saldo kosong, tidak bisa dicairkan.");

        Modal.confirm({
            title: `Cairkan Gaji ${record.full_name}?`,
            icon: <ExclamationCircleOutlined />,
            content: `Total yang akan dibayarkan: Rp ${record.current_balance.toLocaleString('id-ID')}`,
            okText: 'Bayar & Nol-kan Saldo',
            okType: 'danger',
            cancelText: 'Batal',
            onOk: async () => {
                setIsWithdrawing(true);
                try {
                    // 1. Catat Transaksi Pengeluaran
                    const { error: transError } = await supabaseClient.from('wallet_transactions').insert({
                        wallet_id: record.user_id,
                        amount: -record.current_balance, // Negatif karena uang keluar
                        transaction_type: 'PAYOUT',
                        description: 'Pencairan Gaji Mingguan (Admin)'
                    });
                    if (transError) throw transError;

                    // 2. Update Saldo Jadi 0
                    const { error: walletError } = await supabaseClient.from('wallets')
                        .update({ balance: 0, updated_at: new Date() })
                        .eq('user_id', record.user_id);
                    if (walletError) throw walletError;

                    message.success("Pencairan sukses! Saldo pegawai sudah 0.");
                } catch (err: any) {
                    message.error("Gagal mencairkan: " + err.message);
                } finally {
                    setIsWithdrawing(false);
                }
            }
        });
    };

    return (
        <ConfigProvider theme={{ algorithm: darkAlgorithm }}>
            <div className="bg-slate-900 min-h-screen p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white">💰 Manajemen Gaji & Saldo</h1>
                        <p className="text-slate-400">Monitoring saldo upah borongan pegawai real-time.</p>
                    </div>
                    <Button icon={<DownloadOutlined />} onClick={handleExport}>
                        Ekspor CSV
                    </Button>
                </div>

                <div className="bg-slate-800 rounded-lg shadow border border-slate-700 overflow-hidden">
                    <Table {...tableProps} rowKey="user_id" pagination={{ position: ['bottomCenter'], className: "text-white" }}>
                        <Table.Column 
                            dataIndex="full_name" 
                            title="Nama Pegawai" 
                            render={(t) => <span className="font-bold text-slate-200">{t}</span>}
                        />
                        <Table.Column 
                            dataIndex="role" 
                            title="Posisi"
                            render={(v) => <Tag color="blue">{v}</Tag>}
                        />
                        <Table.Column 
                            dataIndex="current_balance" 
                            title="Saldo Tersedia"
                            render={(v) => (
                                <span className={`font-mono text-lg ${v > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(v || 0)}
                                </span>
                            )}
                        />
                        <Table.Column 
                            dataIndex="last_balance_update" 
                            title="Update Terakhir"
                            render={(v) => <span className="text-slate-400">{v ? new Date(v).toLocaleString() : '-'}</span>}
                        />
                        <Table.Column
                            title="Aksi"
                            render={(_, record: any) => (
                                <Button 
                                    size="small" 
                                    type="primary" 
                                    danger 
                                    icon={<DollarOutlined />}
                                    onClick={() => handleWithdraw(record)}
                                    disabled={record.current_balance <= 0 || isWithdrawing}
                                >
                                    Cairkan
                                </Button>
                            )}
                        />
                    </Table>
                </div>
            </div>
        </ConfigProvider>
    );
};
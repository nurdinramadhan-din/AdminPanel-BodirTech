import React, { useState } from "react";
import { useList, useGetIdentity, useCreate, useOne } from "@refinedev/core";
import { 
    Table, Card, Avatar, Tag, Button, Statistic, Row, Col, 
    Modal, Input, message, ConfigProvider, theme, Empty, Spin 
} from "antd";
import { 
    WalletOutlined, UserOutlined, PayCircleOutlined, 
    DollarOutlined, CrownOutlined, SafetyCertificateOutlined
} from "@ant-design/icons";

export const PayrollList = () => {
    const { darkAlgorithm } = theme;
    
    // 1. Ambil ID User Login
    const { data: identity } = useGetIdentity<{ id?: string }>();
    
    // 2. 🔥 FETCH PROFILE: Pastikan kita ambil Role yang ASLI dari database profiles
    const { data: profileData, isLoading: loadingProfile } = useOne({
        resource: "profiles",
        id: identity?.id,
        queryOptions: {
            enabled: !!identity?.id, // Hanya jalan kalau sudah login
        }
    });

    const userProfile = profileData?.data;
    // Logika Admin: Role 'admin', 'owner', atau 'mandor' (jika mandor boleh lihat)
    const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'owner' || userProfile?.role === 'mandor';

    // 3. Ambil Data Saldo Semua Pegawai (Hanya jika Admin)
    const { data: balanceData, isLoading: loadingBalance, refetch } = useList({
        resource: "view_employee_balances",
        pagination: { mode: "off" },
        liveMode: "auto",
        queryOptions: {
            enabled: isAdmin // Hemat resource: Jangan fetch kalau bukan admin
        }
    });

    // 4. Ambil Data Saldo Diri Sendiri (Jika Worker/Bukan Admin)
    // Kita filter view_employee_balances khusus ID sendiri
    const { data: myBalanceData } = useList({
        resource: "view_employee_balances",
        filters: [
            { field: "user_id", operator: "eq", value: identity?.id }
        ],
        queryOptions: {
            enabled: !isAdmin && !!identity?.id
        }
    });
    
    const myBalance = myBalanceData?.data?.[0];

    // --- FITUR BAYAR GAJI (Admin Only) ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
    const [note, setNote] = useState("");
    const { mutate: createTransaction, isLoading: isPaying } = useCreate();

    const handleOpenPayModal = (record: any) => {
        if(record.current_balance <= 0) {
            message.warning("Saldo kosong atau minus.");
            return;
        }
        setSelectedEmployee(record);
        setNote("Gajian Mingguan");
        setIsModalOpen(true);
    };

    const handlePaySalary = () => {
        if(!selectedEmployee) return;

        createTransaction({
            resource: "wallet_transactions",
            values: {
                wallet_id: selectedEmployee.user_id,
                amount: -Math.abs(selectedEmployee.current_balance),
                transaction_type: 'PAYOUT',
                description: `Pencairan Gaji: ${note}`,
                organization_id: 'ae176f73-c832-4345-9be0-3db9377fb1e9' 
            },
            successNotification: {
                message: "Sukses",
                description: `Gaji ${selectedEmployee.full_name} lunas.`,
                type: "success"
            }
        }, {
            onSuccess: () => {
                setIsModalOpen(false);
                refetch(); 
            }
        });
    };

    if (loadingProfile) return <div className="p-10 text-center text-white"><Spin /> Memuat Data Profil...</div>;

    return (
        <ConfigProvider theme={{ algorithm: darkAlgorithm }}>
            <div className="bg-slate-900 min-h-screen p-6 text-slate-100">
                
                {/* HEADER */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <WalletOutlined className="text-emerald-400" /> 
                            {isAdmin ? "Manajemen Penggajian (Admin)" : "Dompet & Gaji Saya"}
                        </h1>
                        <p className="text-slate-400">
                            Login sebagai: <Tag color="gold">{userProfile?.role?.toUpperCase()}</Tag>
                        </p>
                    </div>
                </div>

                {isAdmin ? (
                    // --- TAMPILAN ADMIN / MANDOR ---
                    <div className="grid grid-cols-1 gap-6 animate-in fade-in">
                        {/* Summary Total */}
                        <Row gutter={16}>
                            <Col span={8}>
                                <Card className="bg-emerald-900/20 border-emerald-500/30">
                                    <Statistic 
                                        title={<span className="text-slate-300">Total Gaji Tertahan (Semua Pegawai)</span>}
                                        value={balanceData?.data?.reduce((acc:any, curr:any) => acc + (Number(curr.current_balance) || 0), 0)}
                                        precision={0}
                                        prefix="Rp"
                                        valueStyle={{ color: '#34d399', fontWeight: 'bold' }}
                                    />
                                </Card>
                            </Col>
                        </Row>

                        {/* Tabel List Pegawai */}
                        <div className="bg-slate-800 rounded-lg shadow border border-slate-700 overflow-hidden">
                            <Table 
                                dataSource={balanceData?.data || []} 
                                rowKey="user_id"
                                loading={loadingBalance}
                                pagination={{ pageSize: 10 }}
                            >
                                <Table.Column 
                                    title="Pegawai" 
                                    render={(_, r: any) => (
                                        <div className="flex items-center gap-3">
                                            <Avatar src={r.avatar_url} icon={<UserOutlined />} />
                                            <div>
                                                <div className="font-bold text-white">{r.full_name || "Tanpa Nama"}</div>
                                                <Tag color={r.role === 'admin' ? 'gold' : 'blue'} className="text-[10px] uppercase">{r.role}</Tag>
                                            </div>
                                        </div>
                                    )}
                                />
                                
                                <Table.Column 
                                    title="Kinerja" 
                                    dataIndex="total_tasks_done"
                                    align="center"
                                    render={(val) => <Tag color="purple">{val} Transaksi</Tag>}
                                />

                                <Table.Column 
                                    title="Saldo Saat Ini" 
                                    dataIndex="current_balance"
                                    render={(val) => (
                                        <span className={`font-mono font-bold text-lg ${val > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                                            Rp {Number(val).toLocaleString('id-ID')}
                                        </span>
                                    )}
                                />

                                <Table.Column 
                                    title="Aksi" 
                                    render={(_, r: any) => (
                                        <Button 
                                            type="primary" 
                                            icon={<PayCircleOutlined />}
                                            disabled={r.current_balance <= 0}
                                            onClick={() => handleOpenPayModal(r)}
                                            className="bg-emerald-600 hover:bg-emerald-500 border-none font-bold"
                                        >
                                            Bayar
                                        </Button>
                                    )}
                                />
                            </Table>
                        </div>
                    </div>
                ) : (
                    // --- TAMPILAN WORKER / PEGAWAI BIASA ---
                    <div className="max-w-md mx-auto mt-10 animate-in zoom-in duration-300">
                        <Card 
                            className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 shadow-2xl"
                            cover={
                                <div className="bg-emerald-600 h-24 flex items-center justify-center relative overflow-hidden">
                                     <WalletOutlined style={{ fontSize: 60, color: 'white', opacity: 0.2, position: 'absolute', right: -10, bottom: -10 }} />
                                     <div className="text-center z-10">
                                        <h3 className="text-emerald-100 m-0">Saldo Aktif Anda</h3>
                                     </div>
                                </div>
                            }
                        >
                            <div className="text-center py-4">
                                <h1 className="text-4xl font-bold text-white mb-2">
                                    Rp {Number(myBalance?.current_balance || 0).toLocaleString('id-ID')}
                                </h1>
                                <Tag color="blue" className="mb-4">
                                    {myBalance?.total_tasks_done || 0} Pekerjaan Selesai
                                </Tag>
                                
                                <div className="bg-slate-700/50 p-4 rounded-lg text-left text-xs text-slate-400">
                                    <p>• Saldo bertambah otomatis saat scan QR "Selesai".</p>
                                    <p>• Hubungi Admin/Mandor untuk pencairan gaji.</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {/* MODAL BAYAR (Hanya Muncul di Admin) */}
                <Modal
                    title="Konfirmasi Pembayaran Gaji"
                    open={isModalOpen}
                    onCancel={() => setIsModalOpen(false)}
                    onOk={handlePaySalary}
                    confirmLoading={isPaying}
                    okText="Bayar & Reset Saldo"
                >
                    {selectedEmployee && (
                        <div className="py-4">
                            <p>Cairkan gaji untuk <b>{selectedEmployee.full_name}</b>?</p>
                            <h2 className="text-2xl font-bold text-emerald-600 mb-4">
                                Rp {Number(selectedEmployee.current_balance).toLocaleString('id-ID')}
                            </h2>
                            <p className="mb-1 text-xs text-gray-500">Catatan:</p>
                            <Input 
                                value={note} 
                                onChange={(e) => setNote(e.target.value)} 
                                placeholder="Contoh: Gaji Minggu Ini" 
                            />
                        </div>
                    )}
                </Modal>

            </div>
        </ConfigProvider>
    );
};
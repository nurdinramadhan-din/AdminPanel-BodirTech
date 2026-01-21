import React, { useState, useRef } from "react";
import { useGetIdentity, useUpdate, useList } from "@refinedev/core";
import { 
    Card, Input, Button, message, Tag, Typography, 
    ConfigProvider, theme 
} from "antd";
import { 
    ScanLine, CheckCircle, Search, 
    Wallet, User, Scissors 
} from "lucide-react";

const { Title, Text } = Typography;

export const ScannerPage = () => {
    const { darkAlgorithm } = theme;
    
    // 1. Identitas User Login
    const { data: user } = useGetIdentity<{ id: string; name?: string }>();
    
    // State
    const [scanInput, setScanInput] = useState("");
    const [scannedBundle, setScannedBundle] = useState<any>(null);
    const inputRef = useRef<any>(null);

    // 2. Hook Update Status
    const { mutate: updateStatus, isLoading: isUpdating } = useUpdate();

    // 3. Hook Cari Data Bundle
    const { refetch: searchBundle, isFetching: isSearching } = useList({
        resource: "spk_bundles",
        filters: [
            { field: "id", operator: "eq", value: scanInput.trim() }, 
        ],
        meta: { select: "*, projects(*, products(*))" },
        queryOptions: { enabled: false } 
    });

    // FUNGSI 1: Handle Scan
    const handleScan = async () => {
        const cleanInput = scanInput.trim();
        
        if (!cleanInput) {
            message.warning("Input kosong!");
            return;
        }
        
        try {
            const { data } = await searchBundle();
            const found = data?.data?.[0];

            if (found) {
                setScannedBundle(found);
                message.success("Bundle ditemukan!");
            } else {
                message.error("QR Code tidak valid atau tidak ditemukan.");
                setScannedBundle(null);
            }
        } catch (error) {
            message.error("Gagal mengambil data. Cek koneksi.");
        }
    };

    // FUNGSI 2: Eksekusi Update (LOGIC FIX)
    const handleProcess = (actionType: 'START_CUTTING' | 'FINISH') => {
        if (!scannedBundle || !user) {
            message.error("Data tidak lengkap (Login User / Bundle hilang).");
            return;
        }

        // Tentukan data yang mau diupdate
        let valuesToUpdate = {};

        if (actionType === 'START_CUTTING') {
            valuesToUpdate = {
                // PENTING: Status harus 'IN_PROGRESS' (Sesuai Enum Database)
                status: 'IN_PROGRESS',      
                // PENTING: Stage 'CUTTING' untuk memicu Trigger Stok
                current_stage: 'CUTTING',   
                updated_at: new Date(),
                updated_by: user.id
            };
        } else {
            valuesToUpdate = {
                status: 'DONE',
                current_stage: 'DONE',
                updated_at: new Date(),
                updated_by: user.id
            };
        }

        updateStatus({
            resource: "spk_bundles",
            id: scannedBundle.id,
            values: valuesToUpdate,
            successNotification: (_data, _values) => {
                return {
                    message: actionType === 'FINISH' ? "Gaji Cair! 💸" : "Cutting Dimulai ✂️",
                    description: actionType === 'FINISH' 
                        ? `Saldo dompet Anda bertambah otomatis.` 
                        : `Stok kain otomatis dipotong dari gudang.`,
                    type: "success",
                };
            }
        }, {
            onSuccess: () => {
                setScannedBundle(null);
                setScanInput("");
                setTimeout(() => inputRef.current?.focus(), 100); 
            },
            onError: (error) => {
                console.error(error);
                message.error("Gagal update status: " + error?.message);
            }
        });
    };

    // Hitung Estimasi Gaji
    const wagePerPcs = scannedBundle?.projects?.products?.wage_per_piece || 0;
    const totalWage = wagePerPcs * (scannedBundle?.quantity || 0);

    return (
        <ConfigProvider theme={{ algorithm: darkAlgorithm }}>
            <div className="bg-slate-950 min-h-screen p-4 flex flex-col items-center justify-center font-mono text-slate-200">
                
                {/* HEADER IDENTITAS */}
                <div className="w-full max-w-md mb-6 flex items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/20 rounded-full">
                            <User className="text-emerald-400" size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase">Operator Aktif</p>
                            <p className="font-bold text-white text-sm">{user?.name || "Loading..."}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-xs text-emerald-500 font-bold">ONLINE</span>
                    </div>
                </div>

                {/* KOTAK SCAN */}
                <Card className="w-full max-w-md bg-slate-900 border-slate-700 shadow-2xl">
                    <div className="text-center mb-6">
                        <ScanLine className="mx-auto text-blue-500 mb-2" size={48} />
                        <Title level={4} style={{ color: 'white', margin: 0 }}>Mobile Scanner</Title>
                        <Text className="text-slate-400 text-xs">Arahkan barcode scanner atau ketik ID</Text>
                    </div>

                    <div className="flex gap-2 mb-6">
                        <Input 
                            ref={inputRef}
                            size="large" 
                            placeholder="Klik disini & Scan QR..." 
                            value={scanInput}
                            onChange={(e) => setScanInput(e.target.value)}
                            onPressEnter={handleScan}
                            prefix={<Search size={16} className="text-slate-500" />}
                            autoFocus
                            className="bg-slate-800 border-slate-600 text-white text-lg h-12"
                        />
                        <Button 
                            type="primary" 
                            size="large" 
                            onClick={handleScan}
                            loading={isSearching}
                            className="bg-blue-600 h-12 w-12 flex items-center justify-center p-0"
                        >
                            <Search size={20} />
                        </Button>
                    </div>

                    {/* HASIL SCAN */}
                    {scannedBundle ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4">
                            <div className="bg-slate-800 p-4 rounded-lg border border-slate-600 mb-4 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-2 opacity-20 pointer-events-none">
                                    <h1 className="text-6xl font-bold text-white m-0">
                                        {scannedBundle.current_stage || scannedBundle.status}
                                    </h1>
                                </div>

                                <div className="relative z-10">
                                    <Tag color="blue" className="mb-2">{scannedBundle.bundle_code}</Tag>
                                    <h3 className="text-xl font-bold text-white mb-1">
                                        {scannedBundle.projects?.title}
                                    </h3>
                                    <p className="text-slate-400 text-sm mb-3">
                                        {scannedBundle.projects?.products?.name}
                                    </p>
                                    
                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <div className="bg-slate-700/50 p-2 rounded">
                                            <p className="text-xs text-slate-500">Isi Karung</p>
                                            <p className="text-lg font-bold text-white">{scannedBundle.quantity} Pcs</p>
                                        </div>
                                        <div className="bg-emerald-900/20 p-2 rounded border border-emerald-500/30">
                                            <p className="text-xs text-emerald-400 flex items-center gap-1">
                                                <Wallet size={12} /> Potensi Upah
                                            </p>
                                            <p className="text-lg font-bold text-emerald-400">
                                                Rp {totalWage.toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {/* TOMBOL 1: CUTTING */}
                                <Button 
                                    size="large"
                                    icon={<Scissors size={18} />} 
                                    onClick={() => handleProcess('START_CUTTING')}
                                    disabled={['CUTTING', 'SEWING', 'DONE', 'FINISHING'].includes(scannedBundle.current_stage)}
                                    className="bg-amber-600 border-none text-white font-bold h-12 hover:bg-amber-500 disabled:bg-slate-800 disabled:text-slate-600"
                                >
                                    Mulai Cutting
                                </Button>
                                
                                {/* TOMBOL 2: SELESAI */}
                                <Button 
                                    size="large"
                                    type="primary"
                                    icon={<CheckCircle size={18} />}
                                    onClick={() => handleProcess('FINISH')}
                                    disabled={scannedBundle.status === 'DONE'}
                                    loading={isUpdating}
                                    className="bg-emerald-600 border-none font-bold h-12 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600"
                                >
                                    Selesai (QC OK)
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 opacity-30">
                            <ScanLine size={64} className="mx-auto mb-4" />
                            <p>Menunggu Scan QR Code...</p>
                        </div>
                    )}
                </Card>
            </div>
        </ConfigProvider>
    );
};
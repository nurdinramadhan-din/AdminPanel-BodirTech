import React, { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Card, Button, message, Tag, Spin, Alert } from "antd";
import { supabaseClient } from "../../utility";
import { CheckCircleOutlined, ScissorOutlined, SkinOutlined } from "@ant-design/icons";

export const ScannerPage = () => {
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [bundleData, setBundleData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Inisialisasi Scanner
        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            false
        );

        scanner.render(onScanSuccess, onScanFailure);

        function onScanSuccess(decodedText: string) {
            // Hentikan scan sementara setelah dapat hasil
            scanner.clear();
            setScanResult(decodedText);
            fetchBundleData(decodedText); // <--- CARI KE DATABASE
        }

        function onScanFailure(_error: any) {
            // Biarkan error scanning frame lewat (wajar)
        }

        return () => {
            scanner.clear().catch(error => console.error("Failed to clear scanner", error));
        };
    }, []);

    // LOGIKA CARI DATA BUNDLE
    const fetchBundleData = async (bundleId: string) => {
        setLoading(true);
        try {
            // Query ke Supabase berdasarkan UUID hasil scan
            const { data, error } = await supabaseClient
                .from('spk_bundles')
                .select(`*, projects(title)`)
                .eq('id', bundleId)
                .single();

            if (error || !data) {
                message.error("QR Code Tidak Ditemukan di Database!");
                setBundleData(null);
            } else {
                setBundleData(data);
                message.success("Bundle Ditemukan: " + data.bundle_code);
            }
        } catch (err) {
            message.error("Format QR Salah / Bukan Bundle Valid.");
        } finally {
            setLoading(false);
        }
    };

    // LOGIKA UPDATE STATUS (Simulasi Operator)
    const updateStatus = async (newStage: string) => {
        if (!bundleData) return;
        setLoading(true);

        const { error } = await supabaseClient
            .from('spk_bundles')
            .update({ 
                current_stage: newStage,
                status: newStage === 'DONE' ? 'DONE' : 'IN_PROGRESS' 
            })
            .eq('id', bundleData.id);

        if (error) {
            message.error("Gagal update: " + error.message);
        } else {
            message.success(`Status Berubah ke: ${newStage}`);
            setBundleData(null); // Reset
            setScanResult(null);
            window.location.reload(); // Reload halaman untuk scan lagi (Simple)
        }
        setLoading(false);
    };

    return (
        <div className="p-4 max-w-md mx-auto">
            <h1 className="text-xl font-bold mb-4 text-center">📷 Mobile Scanner</h1>

            {/* AREA KAMERA */}
            {!scanResult && (
                <div id="reader" className="bg-white p-4 rounded-lg shadow mb-4"></div>
            )}

            {/* LOADING */}
            {loading && <div className="text-center p-10"><Spin size="large" /></div>}

            {/* HASIL SCAN */}
            {bundleData && !loading && (
                <Card className="shadow-lg border-t-4 border-emerald-500 animate-in fade-in zoom-in">
                    <div className="text-center">
                        <Tag color="blue" className="text-lg px-3 py-1 mb-2">{bundleData.bundle_code}</Tag>
                        <h2 className="text-lg font-bold">{bundleData.projects?.title}</h2>
                        <p className="text-gray-500 mb-4">Isi: {bundleData.quantity} Pcs</p>
                        
                        <div className="bg-gray-100 p-2 rounded mb-4">
                            Status Saat Ini: <br/>
                            <span className="font-bold text-emerald-600">{bundleData.current_stage}</span>
                        </div>

                        <div className="space-y-3">
                            <Button 
                                block type="default" icon={<ScissorOutlined />} 
                                onClick={() => updateStatus('CUTTING')}
                                disabled={bundleData.current_stage === 'CUTTING'}
                            >
                                Mulai Cutting
                            </Button>
                            <Button 
                                block type="primary" icon={<SkinOutlined />} 
                                onClick={() => updateStatus('SEWING')}
                                className="bg-orange-500 hover:bg-orange-600"
                                disabled={bundleData.current_stage === 'SEWING'}
                            >
                                Mulai Sewing (Jahit)
                            </Button>
                            <Button 
                                block type="primary" icon={<CheckCircleOutlined />} 
                                onClick={() => updateStatus('DONE')}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                Selesai & QC OK
                            </Button>
                        </div>
                        
                        <Button type="link" danger className="mt-4" onClick={() => window.location.reload()}>
                            Batal / Scan Ulang
                        </Button>
                    </div>
                </Card>
            )}

            {/* TOMBOL RESET MANUAL */}
            {scanResult && !bundleData && !loading && (
                <div className="text-center">
                    <Alert message="QR Code tidak dikenali sebagai Bundle." type="error" showIcon />
                    <Button type="primary" className="mt-4" onClick={() => window.location.reload()}>
                        Scan Ulang
                    </Button>
                </div>
            )}
        </div>
    );
};
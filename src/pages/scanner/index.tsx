import React, { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";
import { Card, Button, message, Tag, Spin, Alert, Upload, Tabs } from "antd";
import { supabaseClient } from "../../utility";
import { CheckCircleOutlined, ScissorOutlined, SkinOutlined, UploadOutlined, CameraOutlined } from "@ant-design/icons";

export const ScannerPage = () => {
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [bundleData, setBundleData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("camera");

    // --- MODE KAMERA ---
    useEffect(() => {
        let scanner: Html5QrcodeScanner | null = null;

        if (activeTab === "camera" && !scanResult) {
            scanner = new Html5QrcodeScanner(
                "reader",
                { fps: 10, qrbox: { width: 250, height: 250 } },
                false
            );
            scanner.render(onScanSuccess, (err) => console.log(err));
        }

        return () => {
            if (scanner) {
                scanner.clear().catch(console.error);
            }
        };
    }, [activeTab, scanResult]);

    function onScanSuccess(decodedText: string) {
        setScanResult(decodedText);
        fetchBundleData(decodedText);
    }

    // --- MODE UPLOAD FILE ---
    const handleFileUpload = async (file: File) => {
        const html5QrCode = new Html5Qrcode("reader-file-hidden");
        try {
            const decodedText = await html5QrCode.scanFile(file, true);
            setScanResult(decodedText);
            fetchBundleData(decodedText);
        } catch (err) {
            message.error("QR Code tidak terbaca pada gambar ini.");
        }
        return false; // Prevent auto upload
    };

    // --- LOGIKA DATA ---
    const fetchBundleData = async (bundleId: string) => {
        setLoading(true);
        try {
            const { data, error } = await supabaseClient
                .from('spk_bundles')
                .select(`*, projects(title)`)
                .eq('id', bundleId)
                .single();

            if (error || !data) {
                message.error("QR Code Tidak Ditemukan!");
                setBundleData(null);
            } else {
                setBundleData(data);
                message.success("Bundle Ditemukan!");
            }
        } catch (err) {
            message.error("Format QR Salah.");
        } finally {
            setLoading(false);
        }
    };

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

        if (error) message.error(error.message);
        else {
            message.success(`Status Berubah: ${newStage}`);
            setBundleData(null);
            setScanResult(null);
        }
        setLoading(false);
    };

    return (
        <div className="p-4 max-w-md mx-auto min-h-screen bg-slate-50">
            <h1 className="text-xl font-bold mb-4 text-center text-slate-800">📷 Mobile Scanner</h1>

            {!scanResult && (
                <Tabs 
                    activeKey={activeTab} 
                    onChange={setActiveTab}
                    centered
                    items={[
                        {
                            key: 'camera',
                            label: <span><CameraOutlined /> Kamera Live</span>,
                            children: <div id="reader" className="bg-white rounded-lg shadow overflow-hidden"></div>
                        },
                        {
                            key: 'upload',
                            label: <span><UploadOutlined /> Upload Gambar</span>,
                            children: (
                                <div className="p-8 bg-white rounded-lg shadow text-center border-2 border-dashed border-slate-300">
                                    <Upload beforeUpload={handleFileUpload} showUploadList={false}>
                                        <Button icon={<UploadOutlined />} size="large">Pilih Foto QR</Button>
                                    </Upload>
                                    <p className="mt-2 text-slate-400 text-sm">Upload foto label karung jika kamera bermasalah.</p>
                                    <div id="reader-file-hidden" style={{display:'none'}}></div>
                                </div>
                            )
                        }
                    ]}
                />
            )}

            {/* HASIL SCAN (Sama seperti sebelumnya) */}
            {loading && <div className="text-center p-10"><Spin size="large" /></div>}

            {bundleData && !loading && (
                <Card className="shadow-lg border-t-4 border-emerald-500 mt-4">
                    <div className="text-center">
                        <Tag color="blue" className="text-lg px-3 py-1 mb-2">{bundleData.bundle_code}</Tag>
                        <h2 className="text-lg font-bold">{bundleData.projects?.title}</h2>
                        <p className="text-gray-500 mb-4">Isi: {bundleData.quantity} Pcs</p>
                        <div className="bg-gray-100 p-2 rounded mb-4 font-bold text-emerald-600">
                            {bundleData.current_stage}
                        </div>
                        <div className="space-y-3">
                            <Button block onClick={() => updateStatus('CUTTING')} disabled={bundleData.current_stage === 'CUTTING'}>Mulai Cutting</Button>
                            <Button block type="primary" className="bg-orange-500" onClick={() => updateStatus('SEWING')} disabled={bundleData.current_stage === 'SEWING'}>Mulai Sewing</Button>
                            <Button block type="primary" className="bg-green-600" onClick={() => updateStatus('DONE')}>Selesai & QC OK</Button>
                        </div>
                        <Button type="link" danger className="mt-4" onClick={() => { setScanResult(null); setBundleData(null); }}>Scan Lagi</Button>
                    </div>
                </Card>
            )}
        </div>
    );
};
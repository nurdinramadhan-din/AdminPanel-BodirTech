import { IResourceComponentsProps } from "@refinedev/core";
import { Card, Typography, Alert, Button, Spin, Tag, Row, Col, Upload, message, Modal } from "antd";
import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useState, useRef } from "react";
import { UploadOutlined, CameraOutlined, StopOutlined, ArrowRightOutlined, CheckCircleOutlined, ScissorOutlined } from "@ant-design/icons";
import { supabaseClient } from "../../utility";

const { Title } = Typography;

export const ScannerPage: React.FC<IResourceComponentsProps> = () => {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [bundleData, setBundleData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [isCameraRunning, setIsCameraRunning] = useState(false);
  
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("reader");
    html5QrCodeRef.current = html5QrCode;
    return () => {
      if (html5QrCodeRef.current?.isScanning) {
        html5QrCodeRef.current.stop().catch(console.error);
      }
    };
  }, []);

  // --- LOGIKA UPDATE STATUS ---
  const handleUpdateStatus = async (nextStage: string) => {
    if(!bundleData) return;
    setProcessing(true);

    try {
        // 1. Update Status di Tabel Utama
        const { error: updateError } = await supabaseClient
            .from('spk_bundles')
            .update({ current_stage: nextStage, status: nextStage === 'DONE' ? 'DONE' : 'IN_PROGRESS' }) // Sekalian update status utama
            .eq('id', bundleData.id);

        if (updateError) throw updateError;

        // 2. Catat di Buku Log (History)
        const { error: logError } = await supabaseClient
            .from('production_logs')
            .insert({
                bundle_id: bundleData.id,
                project_id: bundleData.project_id,
                previous_stage: bundleData.current_stage,
                new_stage: nextStage,
                notes: `Update via Mobile Scanner`
                // organization_id & actor_id biasanya dihandle trigger/default value
            });

        if (logError) console.error("Gagal catat log:", logError); 

        message.success(`Sukses! Status berubah jadi ${nextStage}`);
        
        // 3. Refresh Data Tampilan
        setBundleData({ ...bundleData, current_stage: nextStage });

    } catch (err: any) {
        message.error("Gagal update: " + err.message);
    } finally {
        setProcessing(false);
    }
  };

  // --- LOGIKA TOMBOL AKSI BERDASARKAN STATUS (SUDAH DIPERBAIKI) ---
  const renderActionButtons = () => {
    const status = bundleData.current_stage;

    // ✅ KASUS 1: Jika Barang Baru (NEW) -> Masuk ke CUTTING
    if (status === 'NEW') {
        return (
            <Button type="primary" size="large" block icon={<ScissorOutlined />} 
                loading={processing} onClick={() => handleUpdateStatus('CUTTING')}>
                Mulai Potong (CUTTING)
            </Button>
        );
    }

    // ✅ KASUS 2: Jika CUTTING -> Masuk ke SEWING
    if (status === 'CUTTING') {
        return (
            <Button type="primary" size="large" block icon={<ArrowRightOutlined />} 
                loading={processing} onClick={() => handleUpdateStatus('SEWING')}>
                Mulai Jahit (SEWING)
            </Button>
        );
    }

    // ✅ KASUS 3: Jika SEWING -> Masuk ke FINISHING
    if (status === 'SEWING') {
        return (
            <Button type="primary" size="large" block icon={<ArrowRightOutlined />} style={{backgroundColor: 'purple'}}
                loading={processing} onClick={() => handleUpdateStatus('FINISHING')}>
                Selesai Jahit (FINISHING)
            </Button>
        );
    }

    // ✅ KASUS 4: Jika FINISHING -> Masuk ke DONE
    if (status === 'FINISHING') {
        return (
            <Button type="primary" size="large" block icon={<CheckCircleOutlined />} style={{backgroundColor: 'green'}}
                loading={processing} onClick={() => handleUpdateStatus('DONE')}>
                Selesai Packing (DONE)
            </Button>
        );
    }

    // ✅ KASUS 5: Jika Sudah DONE
    if (status === 'DONE') {
        return <Alert message="Barang Sudah Selesai!" type="success" showIcon />;
    }

    return <Alert message={`Status Tidak Dikenal: ${status}`} type="warning" />;
  };
  // ---------------------------------------------


  const startCamera = () => {
    if (!html5QrCodeRef.current) return;
    html5QrCodeRef.current.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => handleScanSuccess(decodedText),
      (_) => { 
        // Ignore error
      }
    ).then(() => setIsCameraRunning(true)).catch(err => message.error("Gagal buka kamera: " + err));
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current && isCameraRunning) {
        await html5QrCodeRef.current.stop();
        setIsCameraRunning(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!html5QrCodeRef.current) return;
    setLoading(true);
    try {
        const result = await html5QrCodeRef.current.scanFile(file, true);
        handleScanSuccess(result);
    } catch (err) {
        message.error("QR Code tidak terbaca.");
        setLoading(false);
    }
    return false;
  };

  const handleScanSuccess = (decodedText: string) => {
    if(html5QrCodeRef.current?.isScanning) {
        html5QrCodeRef.current.stop().then(() => setIsCameraRunning(false));
    }
    setScanResult(decodedText);
    fetchBundleInfo(decodedText);
  };

  const fetchBundleInfo = async (code: string) => {
    setLoading(true);
    // Kita ambil juga data project dan product untuk ditampilkan
    const { data, error } = await supabaseClient
        .from('spk_bundles')
        .select('*, projects!inner(title, products(name))') 
        .eq('bundle_code', code)
        .maybeSingle();

    setLoading(false);
    if (error || !data) setBundleData(null);
    else setBundleData(data);
  };

  const handleReset = () => {
    setScanResult(null);
    setBundleData(null);
  };
return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '10px' }}>
      <Title level={4} style={{ textAlign: 'center', marginBottom: 20 }}>🏭 Pabrik Scanner v1</Title>

      {!scanResult && (
        <Card>
            <div id="reader" style={{ width: '100%', minHeight: '300px', background: '#000', borderRadius: 8, marginBottom: 16 }}></div>
            <Row gutter={16}>
                <Col span={12}>
                    {!isCameraRunning ? 
                        <Button type="primary" icon={<CameraOutlined />} block onClick={startCamera}>Scan Kamera</Button> : 
                        <Button danger icon={<StopOutlined />} block onClick={stopCamera}>Stop</Button>
                    }
                </Col>
                <Col span={12}>
                      <Upload beforeUpload={handleFileUpload} showUploadList={false} accept="image/*">
                         <Button icon={<UploadOutlined />} block>Upload File</Button>
                      </Upload>
                </Col>
            </Row>
        </Card>
      )}

      {scanResult && (
        <Card style={{ textAlign: 'center', border: bundleData ? '2px solid green' : '2px solid red' }}>
            {loading && <Spin size="large" />}
            
            {!loading && bundleData && (
                <>
                    <Tag color="blue" style={{fontSize: 14, marginBottom: 10}}>{bundleData.current_stage}</Tag>
                    <Title level={3} style={{margin: 0}}>{bundleData.bundle_code}</Title>
                    
                    {/* --- BAGIAN INI TADI YANG ERROR/TERPOTONG --- */}
                    <div style={{textAlign: 'left', background: '#f0f5ff', padding: 15, borderRadius: 8, margin: '15px 0'}}>
                        <p>📦 <b>Order:</b> {bundleData.projects?.title}</p>
                        <p>👕 <b>Barang:</b> {bundleData.projects?.products?.name}</p>
                        <p>🔢 <b>Qty:</b> {bundleData.quantity} Pcs</p>
                    </div>
                    {/* --------------------------------------------- */}

                    {/* TOMBOL AKSI DINAMIS */}
                    <div style={{ marginBottom: 20 }}>
                        {renderActionButtons()}
                    </div>

                    <Button block onClick={handleReset}>Scan Berikutnya</Button>
                </>
            )}

            {!loading && !bundleData && (
                <>
                      <Alert message="QR Code Tidak Ditemukan" type="error" />
                      <div style={{marginTop: 10}}>Kode: {scanResult}</div>
                      <Button onClick={handleReset} style={{marginTop: 20}}>Coba Lagi</Button>
                </>
            )}
        </Card>
      )}
    </div>
  );}
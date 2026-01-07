import React, { useState } from "react";
import { useShow, useList } from "@refinedev/core";
import { Show } from "@refinedev/antd";
import { 
    Typography, 
    Row, 
    Col, 
    Card, 
    Progress, 
    Table, 
    Tag, 
    Button, 
    Statistic,
    Modal 
} from "antd";
import { 
    PrinterOutlined, 
    CheckCircleOutlined, 
    SyncOutlined, 
    CloseCircleOutlined,
    QrcodeOutlined,
    EyeOutlined 
} from "@ant-design/icons";
import { QRCodeSVG } from "qrcode.react"; 

const { Title, Text } = Typography;

export const ProjectShow = () => {
    // State untuk Modal QR Code (Fitur Baru)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBundle, setSelectedBundle] = useState<any>(null);

    const { queryResult } = useShow();
    const { data, isLoading } = queryResult;
    const record = data?.data;

    // Ambil Data Bundle (Realtime)
    const { data: bundleData } = useList({
        resource: "spk_bundles",
        filters: [{ field: "project_id", operator: "eq", value: record?.id }],
        pagination: { pageSize: 1000 }, 
        liveMode: "auto",
    });

    const bundles = bundleData?.data || [];

    // --- FIX LOGIC PROGRESS ---
    // Sekarang kita hitung berdasarkan 'current_stage', bukan 'status' saja
    // Agar lebih akurat sesuai update manual Akang
    const totalBundles = bundles.length;
    
    const completedBundles = bundles.filter((b: any) => 
        b.current_stage === 'DONE' || b.status === 'DONE'
    ).length;

    const sewingBundles = bundles.filter((b: any) => 
        b.current_stage === 'SEWING'
    ).length;

    const cuttingBundles = bundles.filter((b: any) => 
        b.current_stage === 'CUTTING'
    ).length;

    // Rumus Persentase
    const progressPercent = totalBundles > 0 
        ? Math.round((completedBundles / totalBundles) * 100) 
        : 0;

    const handlePrint = () => {
        window.print();
    };

    // Fungsi Buka QR di Layar
    const showQR = (bundle: any) => {
        setSelectedBundle(bundle);
        setIsModalOpen(true);
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <>
            <style>{`
                @media screen { .print-only { display: none !important; } }
                @media print {
                    body * { visibility: hidden; }
                    .ant-layout-sider, .ant-layout-header, button { display: none !important; }
                    .print-only, .print-only * { visibility: visible !important; display: block !important; }
                    .print-only { position: absolute; left: 0; top: 0; width: 100%; }
                    .qr-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
                    .qr-item { border: 2px solid black; padding: 10px; text-align: center; break-inside: avoid; }
                }
            `}</style>

            <Show 
                title={`Detail Order: ${record?.title}`}
                headerButtons={({ defaultButtons }) => (
                    <>
                        <Button icon={<PrinterOutlined />} type="primary" onClick={handlePrint}>
                            Cetak Semua QR
                        </Button>
                        {defaultButtons}
                    </>
                )}
            >
                {/* STATUS BAR */}
                <Row gutter={24} className="mb-6">
                    <Col span={8} xs={24}>
                        <Card>
                            <Statistic 
                                title="Progress Selesai (DONE)" 
                                value={progressPercent} 
                                suffix="%" 
                                valueStyle={{ color: progressPercent === 100 ? '#3f8600' : '#10B981' }}
                            />
                            <Progress percent={progressPercent} status="active" showInfo={false} strokeColor="#10B981" />
                            <div className="mt-2 text-xs text-gray-500">
                                {completedBundles} dari {totalBundles} karung selesai.
                            </div>
                        </Card>
                    </Col>
                    <Col span={16} xs={24}>
                        <Card>
                            <Row gutter={16} className="text-center">
                                <Col span={6}>
                                    <Statistic title="Total Order" value={record?.total_quantity} suffix="Pcs" />
                                </Col>
                                <Col span={6}>
                                    <Statistic title="Cutting" value={cuttingBundles} prefix={<div className="w-2 h-2 rounded-full bg-blue-500 mr-2"/>} valueStyle={{ fontSize: 16 }} />
                                </Col>
                                <Col span={6}>
                                    <Statistic title="Sewing" value={sewingBundles} prefix={<SyncOutlined spin className="text-orange-500" />} valueStyle={{ fontSize: 16 }} />
                                </Col>
                                <Col span={6}>
                                    <Statistic title="Selesai" value={completedBundles} prefix={<CheckCircleOutlined className="text-green-500" />} valueStyle={{ fontSize: 16 }} />
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>

                {/* TABEL DATA */}
                <Table 
                    dataSource={bundles}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    columns={[
                        { 
                            title: "Kode Karung", 
                            dataIndex: "bundle_code", 
                            render: (val) => <Tag color="blue" style={{ fontWeight: 'bold' }}>{val}</Tag> 
                        },
                        { title: "Isi (Pcs)", dataIndex: "quantity" },
                        { 
                            title: "Stage / Tahapan", 
                            dataIndex: "current_stage",
                            render: (val) => {
                                let color = 'default';
                                if (val === 'CUTTING') color = 'blue';
                                if (val === 'SEWING') color = 'orange';
                                if (val === 'DONE') color = 'green';
                                return <Tag color={color}>{val}</Tag>
                            }
                        },
                        { 
                            title: "QR Code", 
                            key: "action",
                            render: (_, record) => (
                                <Button 
                                    size="small" 
                                    icon={<QrcodeOutlined />} 
                                    onClick={() => showQR(record)}
                                >
                                    Lihat QR
                                </Button>
                            )
                        },
                    ]}
                />
            </Show>

            {/* MODAL LIHAT QR DI LAYAR (FITUR BARU) */}
            <Modal 
                title={<span className="font-bold">Scan QR Code</span>}
                open={isModalOpen} 
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                centered
            >
                {selectedBundle && (
                    <div className="flex flex-col items-center justify-center p-4">
                        <div className="border-4 border-black p-4 rounded-lg bg-white">
                            <QRCodeSVG value={selectedBundle.id} size={200} level="H" />
                        </div>
                        <h2 className="mt-4 text-2xl font-bold">{selectedBundle.bundle_code}</h2>
                        <p className="text-gray-500">Isi: {selectedBundle.quantity} Pcs</p>
                        <p className="text-xs text-gray-400 mt-2">ID: {selectedBundle.id}</p>
                        <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded text-sm text-center">
                            Arahkan kamera "Mobile Scanner" ke layar ini untuk tes sistem.
                        </div>
                    </div>
                )}
            </Modal>

            {/* AREA PRINT (TETAP ADA) */}
            <div className="print-only">
                <Title level={3} style={{ textAlign: 'center', marginBottom: 20 }}>Label Produksi - {record?.title}</Title>
                <div className="qr-grid">
                    {bundles.map((bundle: any) => (
                        <div key={bundle.id} className="qr-item">
                            <Title level={4} style={{ margin: 0 }}>{bundle.bundle_code}</Title>
                            <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
                                <QRCodeSVG value={bundle.id} size={100} />
                            </div>
                            <Text strong>Isi: {bundle.quantity} Pcs</Text>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};
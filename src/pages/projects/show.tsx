import {
    useShow,
    useList,
    useNavigation,
    useInvalidate, // Untuk refresh otomatis setelah generate
} from "@refinedev/core";
import {
    Show,
    DateField,
    NumberField,
} from "@refinedev/antd";
import {
    Typography,
    Row,
    Col,
    Card,
    Progress,
    Table,
    Tag,
    Space,
    Button,
    Descriptions,
    Divider,
    InputNumber,
    message,
    Tabs
} from "antd";
import { 
    PrinterOutlined, 
    ArrowLeftOutlined, 
    QrcodeOutlined, 
    ThunderboltFilled 
} from "@ant-design/icons";
import { QRCodeSVG } from "qrcode.react"; // ✅ Pastikan ini terinstall
import { useState } from "react";
import { supabaseClient } from "../../utility"; // ✅ Pastikan path ini benar

const { Title, Text } = Typography;

export const ProjectShow = () => {
    const { list } = useNavigation();
    const invalidate = useInvalidate();

    // 1. Ambil Data Project Utama
    const { queryResult } = useShow();
    const { data, isLoading } = queryResult;
    const record = data?.data;

    // 2. Ambil Data Bundle (Gabungan Refine hook agar auto-refresh)
    const { data: bundleData, isLoading: isLoadingBundles } = useList({
        resource: "spk_bundles",
        queryOptions: { enabled: !!record?.id },
        filters: [{ field: "project_id", operator: "eq", value: record?.id }],
        pagination: { mode: "off" },
        sorters: [{ field: "bundle_number", order: "asc" }]
    });

    const bundles = bundleData?.data || [];

    // 3. State untuk Logic Lama Anda (Generate)
    const [bundleSize, setBundleSize] = useState(20); // Default 1 karung isi 20
    const [isGenerating, setIsGenerating] = useState(false);

    // --- LOGIKA PROGRESS (DARI KODE BARU) ---
    const totalBundles = bundles.length;
    const completedBundles = bundles.filter((b) => b.status === "DONE").length;
    const progressPercent = totalBundles > 0 
        ? Math.round((completedBundles / totalBundles) * 100) 
        : 0;

    // --- LOGIKA GENERATE (DARI KODE LAMA ANDA) ---
    const handleGenerateBundles = async () => {
        if (!record) return;
        if (bundles.length > 0) {
            message.warning("QR Code sudah ada!");
            return;
        }

        setIsGenerating(true);
        const totalQty = record.total_quantity || 0;
        const calculatedTotalBundles = Math.ceil(totalQty / bundleSize);
        const newBundles = [];

        // Loop matematika Anda
        for (let i = 1; i <= calculatedTotalBundles; i++) {
            let qtyThisBundle = bundleSize;
            if (i === calculatedTotalBundles) {
                const remainder = totalQty % bundleSize;
                qtyThisBundle = remainder === 0 ? bundleSize : remainder;
            }

            newBundles.push({
                project_id: record.id,
                // Format kode: SPK-JUDUL-1 (Contoh: SPK-SER-1)
                bundle_code: `SPK-${record.title.substring(0, 3).toUpperCase()}-${i}`, 
                bundle_number: i, // Ganti bundle_sequence jadi bundle_number sesuai DB baru
                quantity: qtyThisBundle,
                status: 'NEW',
                current_stage: 'NEW' // Sesuai enum baru
            });
        }

        // Insert via Supabase Client langsung (lebih cepat untuk batch)
        const { error } = await supabaseClient.from('spk_bundles').insert(newBundles);

        if (error) {
            message.error("Gagal generate: " + error.message);
        } else {
            message.success(`Berhasil membuat ${calculatedTotalBundles} Bundle QR Code!`);
            // Refresh data Refine
            invalidate({ resource: "spk_bundles", invalidates: ["list"] });
        }
        setIsGenerating(false);
    };

    const handlePrint = () => {
        window.print();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "DONE": return "success";
            case "IN_PROGRESS": return "processing";
            case "NEW": return "default";
            case "REJECTED": return "error";
            default: return "default";
        }
    };

    return (
        <Show
            isLoading={isLoading}
            headerProps={{
                extra: (
                    <Space className="no-print">
                        {/* Tombol Print hanya muncul jika sudah ada bundle */}
                        {totalBundles > 0 && (
                            <Button icon={<PrinterOutlined />} onClick={handlePrint}>
                                Cetak QR
                            </Button>
                        )}
                        <Button onClick={() => list("projects")}>Kembali</Button>
                    </Space>
                ),
            }}
        >
            {/* === HEADER & PROGRESS === */}
            <div className="no-print">
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <Card>
                            <Row align="middle" justify="space-between">
                                <Col>
                                    <Title level={4} style={{ margin: 0 }}>{record?.title}</Title>
                                    <Text type="secondary">Product: {record?.products?.name || record?.product_id}</Text>
                                </Col>
                                <Col style={{ textAlign: "right" }}>
                                    <Text strong>Progress Produksi</Text>
                                    <div style={{ width: 300 }}>
                                        <Progress 
                                            percent={progressPercent} 
                                            status={progressPercent === 100 ? "success" : "active"} 
                                        />
                                    </div>
                                    <Text type="secondary">{completedBundles} dari {totalBundles} Selesai</Text>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
                <Divider />
            </div>

            {/* === INFO PROJECT === */}
            <Row gutter={[16, 16]} className="no-print">
                <Col xs={24} lg={12}>
                    <Card title="Detail Project" size="small">
                        <Descriptions column={1} size="small" bordered>
                            <Descriptions.Item label="Target Qty">
                                <NumberField value={record?.total_quantity} /> Pcs
                            </Descriptions.Item>
                            <Descriptions.Item label="Deadline">
                                <DateField value={record?.deadline} format="DD MMMM YYYY" />
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>

                {/* === AREA GENERATOR (LOGIKA LAMA ANDA) === */}
                <Col xs={24} lg={12}>
                    <Card title="Manajemen Bundle (QR)" size="small">
                        {totalBundles === 0 ? (
                            // JIKA BELUM ADA BUNDLE: TAMPILKAN FORM GENERATE
                            <div style={{ textAlign: 'center', padding: 20 }}>
                                <Text>Masukkan isi per karung:</Text>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 10 }}>
                                    <InputNumber 
                                        value={bundleSize} 
                                        onChange={(val) => setBundleSize(val || 20)} 
                                        min={1} 
                                        style={{ width: 100 }}
                                    />
                                    <Button 
                                        type="primary" 
                                        icon={<ThunderboltFilled />} 
                                        onClick={handleGenerateBundles}
                                        loading={isGenerating}
                                    >
                                        Generate QR
                                    </Button>
                                </div>
                                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
                                    Akan membuat {Math.ceil((record?.total_quantity || 0) / bundleSize)} QR Code otomatis.
                                </Text>
                            </div>
                        ) : (
                            // JIKA SUDAH ADA BUNDLE: TAMPILKAN INFO SINGKAT
                            <div style={{ textAlign: 'center', padding: 20 }}>
                                <QrcodeOutlined style={{ fontSize: 40, color: '#52c41a' }} />
                                <Title level={5} style={{ margin: '10px 0' }}>QR Code Siap!</Title>
                                <Text>Total {totalBundles} bundle telah digenerate.</Text>
                                <br/>
                                <Button type="dashed" onClick={handlePrint} style={{ marginTop: 10 }}>
                                    Cetak Semua QR
                                </Button>
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>

            {/* === TABS: PILIH MAU LIHAT TABEL MONITORING ATAU GAMBAR QR === */}
            <div style={{ marginTop: 20 }}>
                <Tabs defaultActiveKey="1" items={[
                    {
                        key: '1',
                        label: '📋 Tabel Monitoring (Live)',
                        children: (
                            <Table
                                dataSource={bundles}
                                rowKey="id"
                                loading={isLoadingBundles}
                                pagination={{ pageSize: 10 }}
                                size="small"
                                className="no-print"
                            >
                                <Table.Column 
                                    dataIndex="bundle_number" 
                                    title="No." 
                                    render={(val) => <Tag>#{val}</Tag>}
                                />
                                <Table.Column dataIndex="bundle_code" title="Kode Bundle" />
                                <Table.Column dataIndex="quantity" title="Isi (Pcs)" />
                                <Table.Column 
                                    dataIndex="status" 
                                    title="Status" 
                                    render={(val) => <Tag color={getStatusColor(val)}>{val}</Tag>} 
                                />
                                <Table.Column 
                                    dataIndex="current_stage" 
                                    title="Posisi" 
                                    render={(val) => <Tag color="purple">{val || 'GUDANG'}</Tag>} 
                                />
                            </Table>
                        )
                    },
                    {
                        key: '2',
                        label: '🖨️ Layout Cetak QR',
                        children: (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', padding: '10px' }}>
                                {bundles.map((bundle) => (
                                    <div 
                                        key={bundle.id} 
                                        style={{ 
                                            width: '200px', 
                                            textAlign: 'center', 
                                            border: '2px dashed #000', // Hitam biar jelas saat print
                                            padding: '15px',
                                            pageBreakInside: 'avoid' // Agar tidak terpotong kertas
                                        }}
                                    >
                                        <Text strong style={{ fontSize: 16 }}>{bundle.bundle_code}</Text>
                                        <div style={{ margin: '10px 0' }}>
                                            <QRCodeSVG value={bundle.bundle_code} size={120} />
                                        </div>
                                        <Tag color="black" style={{ fontSize: 14, padding: '4px 10px' }}>
                                            ISI: {bundle.quantity} PCS
                                        </Tag>
                                        <div style={{ fontSize: 10, marginTop: 5 }}>
                                            {record?.title}
                                        </div>
                                    </div>
                                ))}
                                {bundles.length === 0 && <Text>Belum ada data QR.</Text>}
                            </div>
                        )
                    }
                ]} />
            </div>

            {/* CSS KHUSUS PRINT - Agar Header/Sidebar hilang saat diprint */}
            <style>{`
                @media print {
                    .ant-layout-sider, .ant-layout-header, .no-print, .ant-tabs-nav {
                        display: none !important;
                    }
                    .ant-layout-content {
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    body {
                        background: white;
                    }
                }
            `}</style>
        </Show>
    );
};
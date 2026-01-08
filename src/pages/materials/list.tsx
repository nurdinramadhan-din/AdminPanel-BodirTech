import React from "react";
import { useNavigation } from "@refinedev/core";
import { useTable } from "@refinedev/antd";
import { 
    Table, Tag, Button, Input, Form, Card, Statistic, Row, Col, 
    ConfigProvider, theme, Tooltip 
} from "antd";
import { 
    PlusOutlined, 
    EditOutlined, 
    SearchOutlined, 
    GoldOutlined, 
    AlertOutlined
} from "@ant-design/icons";

export const MaterialList = () => {
    const { darkAlgorithm } = theme;
    const { create, edit } = useNavigation(); // Navigasi Instan

    // 1. Ambil Data Material
    const { tableProps, tableQueryResult, searchFormProps } = useTable({
        resource: "materials",
        sorters: { initial: [{ field: "name", order: "asc" }] },
        pagination: { pageSize: 12 },
        liveMode: "auto", 
        onSearch: (values: any) => {
            return [{
                field: "name",
                operator: "contains",
                value: values.name,
            }];
        },
    });

    const materials = tableQueryResult?.data?.data || [];
    
    // 2. Kalkulasi Aset Gudang (Realtime Client-side)
    // Rumus: Total (Stok * Harga Beli)
    const totalAssetValue = materials.reduce((acc, curr: any) => 
        acc + ((curr.current_stock || 0) * (curr.price_per_unit || 0)), 0
    );

    // Hitung Barang yang Stoknya Habis/Kritis
    const lowStockCount = materials.filter((m: any) => m.current_stock <= m.min_stock_alert).length;

    return (
        <ConfigProvider theme={{ algorithm: darkAlgorithm }}>
            <div className="bg-slate-900 min-h-screen p-6 text-slate-100">
                
                {/* HEADER AREA */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">📦 Manajemen Gudang</h1>
                        <p className="text-slate-400">Monitoring aset, stok benang, dan kebutuhan belanja.</p>
                    </div>
                    
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />} 
                        onClick={() => create("materials")} // Pindah ke create.tsx
                        size="large"
                        className="bg-emerald-600 hover:bg-emerald-500 border-none font-bold shadow-lg shadow-emerald-900/20"
                    >
                        Tambah Barang Baru
                    </Button>
                </div>

                {/* DASHBOARD RINGKASAN GUDANG */}
                <Row gutter={[16, 16]} className="mb-6">
                    <Col xs={24} md={8}>
                        <Card bordered={false} className="bg-slate-800 shadow border border-slate-700 h-full">
                            <Statistic
                                title={<span className="text-slate-400 font-bold uppercase text-xs">Total SKU (Jenis Barang)</span>}
                                value={tableQueryResult?.data?.total || 0}
                                prefix={<GoldOutlined className="text-blue-400" />}
                                valueStyle={{ color: '#fff', fontWeight: 'bold' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} md={8}>
                        <Card bordered={false} className="bg-slate-800 shadow border border-slate-700 h-full">
                            <Statistic
                                title={<span className="text-slate-400 font-bold uppercase text-xs">Estimasi Nilai Aset</span>}
                                value={totalAssetValue}
                                precision={0}
                                prefix={<span className="text-emerald-500">Rp</span>}
                                valueStyle={{ color: '#10B981', fontFamily: 'monospace', fontWeight: 'bold' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} md={8}>
                        <Card bordered={false} className={`h-full shadow border ${lowStockCount > 0 ? 'bg-red-900/10 border-red-500/30' : 'bg-slate-800 border-slate-700'}`}>
                            <Statistic
                                title={<span className={lowStockCount > 0 ? "text-red-400 font-bold uppercase text-xs" : "text-slate-400 font-bold uppercase text-xs"}>
                                    {lowStockCount > 0 ? "⚠️ Stok Kritis (Belanja!)" : "Status Stok"}
                                </span>}
                                value={lowStockCount}
                                suffix={lowStockCount > 0 ? "Item Menipis" : "Aman"}
                                prefix={lowStockCount > 0 ? <AlertOutlined className="animate-pulse" /> : null}
                                valueStyle={{ color: lowStockCount > 0 ? '#ef4444' : '#fff', fontWeight: 'bold' }}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* SEARCH & FILTER */}
                <div className="bg-slate-800 p-4 rounded-t-lg border-b border-slate-700 flex flex-col md:flex-row gap-4">
                    <Form {...searchFormProps} layout="inline" className="w-full">
                        <Form.Item name="name" className="flex-1 mb-0 w-full">
                            <Input 
                                prefix={<SearchOutlined className="text-slate-500" />} 
                                placeholder="Cari nama benang, kain, atau kode barang..." 
                                className="bg-slate-900 border-slate-600 text-white w-full hover:border-emerald-500 focus:border-emerald-500"
                                size="large"
                            />
                        </Form.Item>
                        <Button type="primary" htmlType="submit" icon={<SearchOutlined />} size="large" className="mt-2 md:mt-0">
                            Cari
                        </Button>
                    </Form>
                </div>

                {/* TABEL DATA */}
                <div className="bg-slate-800 rounded-b-lg shadow overflow-hidden border border-t-0 border-slate-700">
                    <Table {...tableProps} rowKey="id" pagination={{ position: ['bottomCenter'], className: "pb-4" }}>
                        
                        <Table.Column 
                            dataIndex="name" 
                            title="Nama Barang / Material"
                            render={(text, record: any) => (
                                <div className="py-2">
                                    <div className="font-bold text-white text-base">{text}</div>
                                    <div className="text-xs text-slate-500 mt-1 flex gap-2">
                                        {record.supplier_contact && <span className="bg-slate-700 px-1 rounded">Supplier: {record.supplier_contact}</span>}
                                    </div>
                                </div>
                            )}
                        />

                        <Table.Column 
                            title="Stok Fisik"
                            dataIndex="current_stock"
                            render={(val, record: any) => {
                                const isLow = val <= record.min_stock_alert;
                                return (
                                    <div className="flex items-center gap-3">
                                        <div className={`px-3 py-1 rounded font-mono font-bold text-lg ${
                                            isLow ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                        }`}>
                                            {val}
                                        </div>
                                        <span className="text-slate-400 text-sm">{record.unit}</span>
                                        {isLow && (
                                            <Tooltip title={`Stok menipis! Batas aman: ${record.min_stock_alert}`}>
                                                <AlertOutlined className="text-red-500 animate-pulse" />
                                            </Tooltip>
                                        )}
                                    </div>
                                );
                            }}
                        />

                        <Table.Column 
                            title="Nilai Aset"
                            dataIndex="price_per_unit"
                            render={(val, record: any) => {
                                const assetVal = (val || 0) * (record.current_stock || 0);
                                return (
                                    <div>
                                        <div className="text-slate-200 font-mono">
                                            Rp {assetVal.toLocaleString('id-ID')}
                                        </div>
                                        <div className="text-[10px] text-slate-500">
                                            @ Rp {val?.toLocaleString('id-ID')} / {record.unit}
                                        </div>
                                    </div>
                                )
                            }}
                        />

                        <Table.Column 
                            title="Aksi"
                            align="center"
                            render={(_, record: any) => (
                                <Button 
                                    icon={<EditOutlined />} 
                                    onClick={() => edit("materials", record.id)} // Pindah ke edit.tsx
                                    className="bg-slate-700 text-white border-slate-600 hover:bg-emerald-600 hover:border-emerald-500"
                                >
                                    Edit
                                </Button>
                            )}
                        />
                    </Table>
                </div>
            </div>
        </ConfigProvider>
    );
};
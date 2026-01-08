import React, { useState } from "react";
import { useNavigation } from "@refinedev/core";
import { useTable } from "@refinedev/antd";
import { 
    Table, Button, Input, Form, Card, Row, Col, 
    ConfigProvider, theme, Tag, Radio 
} from "antd";
import { 
    PlusOutlined, EditOutlined, SearchOutlined, 
    AppstoreOutlined, BarsOutlined, ScissorOutlined, FileImageOutlined
} from "@ant-design/icons";

export const ProductList = () => {
    const { darkAlgorithm } = theme;
    const { create, edit } = useNavigation();
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid'); // Default Grid agar terlihat fotonya

    const { tableProps, searchFormProps } = useTable({
        resource: "products",
        sorters: { initial: [{ field: "name", order: "asc" }] },
        pagination: { pageSize: 12 },
        onSearch: (values: any) => [{
            field: "name",
            operator: "contains",
            value: values.name,
        }],
    });

    return (
        <ConfigProvider theme={{ algorithm: darkAlgorithm }}>
            <div className="bg-slate-900 min-h-screen p-6 text-slate-100">
                
                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">🎨 Galeri Desain & Produk</h1>
                        <p className="text-slate-400">Database master desain, stitch count, dan tarif upah.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Radio.Group value={viewMode} onChange={(e) => setViewMode(e.target.value)} buttonStyle="solid">
                            <Radio.Button value="list"><BarsOutlined /></Radio.Button>
                            <Radio.Button value="grid"><AppstoreOutlined /></Radio.Button>
                        </Radio.Group>
                        <Button 
                            type="primary" icon={<PlusOutlined />} onClick={() => create("products")} 
                            size="large" className="bg-emerald-600 border-none font-bold"
                        >
                            Buat Desain Baru
                        </Button>
                    </div>
                </div>

                {/* SEARCH */}
                <Card className="bg-slate-800 border-slate-700 mb-6" bodyStyle={{ padding: '12px' }}>
                    <Form {...searchFormProps} layout="inline" className="w-full">
                        <Form.Item name="name" className="flex-1 w-full mb-0">
                            <Input prefix={<SearchOutlined className="text-slate-500" />} placeholder="Cari nama desain..." className="bg-slate-900 border-slate-600 text-white w-full" size="large" />
                        </Form.Item>
                        <Button type="primary" htmlType="submit" icon={<SearchOutlined />} size="large">Cari</Button>
                    </Form>
                </Card>

                {/* CONTENT: GRID VIEW (GALLERY) */}
                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {tableProps.dataSource?.map((item: any) => (
                            <div key={item.id} className="group bg-slate-800 rounded-xl border border-slate-700 overflow-hidden hover:border-emerald-500/50 transition-all hover:shadow-xl hover:-translate-y-1">
                                {/* Image Area */}
                                <div className="h-48 bg-slate-900 relative flex items-center justify-center overflow-hidden">
                                    {item.image_url ? (
                                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                    ) : (
                                        <FileImageOutlined className="text-4xl text-slate-600" />
                                    )}
                                    <div className="absolute top-2 right-2">
                                        <Tag color="blue">{item.sku || 'NO-SKU'}</Tag>
                                    </div>
                                </div>
                                
                                {/* Info Area */}
                                <div className="p-4">
                                    <h3 className="text-lg font-bold text-white truncate mb-1">{item.name}</h3>
                                    <div className="flex items-center gap-2 text-slate-400 text-xs mb-3">
                                        <ScissorOutlined /> 
                                        <span>{Number(item.stitch_count).toLocaleString()} Stitches</span>
                                        <span>•</span>
                                        <span>{item.color_count} Warna</span>
                                    </div>
                                    
                                    <div className="flex justify-between items-center border-t border-slate-700 pt-3">
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase">Upah Jahit</p>
                                            <p className="text-emerald-400 font-mono font-bold">Rp {Number(item.wage_per_piece).toLocaleString('id-ID')}</p>
                                        </div>
                                        <Button icon={<EditOutlined />} onClick={() => edit("products", item.id)} type="default" className="bg-slate-700 text-white border-none hover:bg-emerald-600">
                                            Edit
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    // CONTENT: LIST VIEW (TABLE)
                    <div className="bg-slate-800 rounded-lg shadow overflow-hidden border border-slate-700">
                        <Table {...tableProps} rowKey="id" pagination={{ position: ['bottomCenter'], className: "pb-4" }}>
                            <Table.Column title="Gambar" render={(_, r: any) => (
                                r.image_url ? <img src={r.image_url} className="w-12 h-12 object-cover rounded bg-slate-700" /> : <div className="w-12 h-12 bg-slate-700 rounded flex items-center justify-center"><FileImageOutlined /></div>
                            )} />
                            <Table.Column dataIndex="name" title="Nama Desain" render={(t, r: any) => <div><div className="font-bold text-white">{t}</div><div className="text-xs text-slate-500">{r.sku}</div></div>} />
                            <Table.Column title="Teknis" render={(_, r: any) => <div className="text-xs text-slate-300"><div>📏 {Number(r.stitch_count).toLocaleString()} pts</div><div>🎨 {r.color_count} warna</div></div>} />
                            <Table.Column dataIndex="wage_per_piece" title="Upah" render={(v) => <span className="text-emerald-400 font-mono">Rp {Number(v).toLocaleString('id-ID')}</span>} />
                            <Table.Column title="Aksi" render={(_, r: any) => <Button icon={<EditOutlined />} size="small" onClick={() => edit("products", r.id)}>Edit</Button>} />
                        </Table>
                    </div>
                )}
            </div>
        </ConfigProvider>
    );
};
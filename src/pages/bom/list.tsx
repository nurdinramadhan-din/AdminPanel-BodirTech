import React from "react";
import { useNavigation, useDelete } from "@refinedev/core";
import { useTable } from "@refinedev/antd";
import { 
    Table, Tag, Button, ConfigProvider, theme, Popconfirm 
} from "antd";
import { 
    PlusOutlined, 
    CalculatorOutlined, 
    DeleteOutlined,
    EyeOutlined
} from "@ant-design/icons";

export const BomList = () => {
    const { darkAlgorithm } = theme;
    
    // ✅ PERBAIKAN NAVIGASI: Gunakan 'bom_recipes' agar sesuai database
    const { create } = useNavigation(); 
    
    const { mutate: deleteItem } = useDelete();

    const { tableProps, tableQueryResult } = useTable({
        resource: "products", // Kita list Produknya, bukan resep mentahnya
        sorters: { initial: [{ field: "name", order: "asc" }] },
        pagination: { pageSize: 10 },
        liveMode: "auto",
        meta: {
            select: "*, bom_recipes(*, materials(*))" 
        }
    });

    const handleDeleteIngredient = (id: string) => {
        deleteItem({
            resource: "bom_recipes",
            id: id,
            mutationMode: "optimistic",
        });
    };

    return (
        <ConfigProvider theme={{ algorithm: darkAlgorithm }}>
            <div className="bg-slate-900 min-h-screen p-6 text-slate-100">
                
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white">📜 Resep Produksi (BOM)</h1>
                        <p className="text-slate-400">Atur kebutuhan bahan baku per 1 unit produk.</p>
                    </div>
                    
                    {/* ✅ TOMBOL FIXED: Mengarah ke resource 'bom_recipes' */}
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />} 
                        onClick={() => create("bom_recipes")} 
                        size="large"
                        className="bg-emerald-600 hover:bg-emerald-500 border-none font-bold shadow-lg shadow-emerald-900/20"
                    >
                        Racik Resep Baru
                    </Button>
                </div>

                {/* INFO CARD */}
                <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg mb-6 flex items-start gap-3">
                    <CalculatorOutlined className="text-blue-400 text-xl mt-1" />
                    <div>
                        <h3 className="text-blue-400 font-bold">Estimasi HPP Otomatis</h3>
                        <p className="text-slate-300 text-sm">
                            Harga Pokok Produksi dihitung otomatis berdasarkan harga material saat ini.
                        </p>
                    </div>
                </div>

                {/* TABEL */}
                <div className="bg-slate-800 rounded-lg shadow overflow-hidden border border-slate-700">
                    <Table 
                        {...tableProps} 
                        rowKey="id" 
                        pagination={{ position: ['bottomCenter'], className: "pb-4" }}
                        expandable={{
                            expandedRowRender: (record: any) => {
                                const recipes = record.bom_recipes || [];
                                return (
                                    <div className="bg-slate-900/50 p-4 rounded border border-slate-700 m-2">
                                        <h4 className="text-xs font-bold uppercase text-emerald-500 mb-2 tracking-wider">
                                            Komposisi Bahan ({recipes.length} Item)
                                        </h4>
                                        {recipes.length === 0 ? (
                                            <p className="text-slate-500 italic">Belum ada resep.</p>
                                        ) : (
                                            <table className="w-full text-sm text-left text-slate-300">
                                                <thead>
                                                    <tr className="text-slate-500 border-b border-slate-700">
                                                        <th className="py-2">Material</th>
                                                        <th>Kebutuhan</th>
                                                        <th>Toleransi</th>
                                                        <th>Cost</th>
                                                        <th>Aksi</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {recipes.map((item: any) => {
                                                        const cost = (item.quantity_required || 0) * (item.materials?.price_per_unit || 0);
                                                        return (
                                                            <tr key={item.id} className="border-b border-slate-800 last:border-0 hover:bg-slate-800">
                                                                <td className="py-2 font-bold text-white">{item.materials?.name}</td>
                                                                <td>{item.quantity_required} {item.materials?.unit}</td>
                                                                <td><Tag color="orange">{item.tolerance_percent}%</Tag></td>
                                                                <td className="font-mono text-emerald-400">Rp {cost.toLocaleString('id-ID')}</td>
                                                                <td>
                                                                    <Popconfirm
                                                                        title="Hapus bahan ini?"
                                                                        onConfirm={() => handleDeleteIngredient(item.id)}
                                                                        okText="Hapus"
                                                                        cancelText="Batal"
                                                                    >
                                                                        <Button size="small" type="text" danger icon={<DeleteOutlined />} />
                                                                    </Popconfirm>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                );
                            },
                        }}
                    >
                        <Table.Column dataIndex="name" title="Produk" render={(t) => <strong className="text-white">{t}</strong>} />
                        <Table.Column title="Total Bahan" render={(_, r: any) => <Tag color="blue">{r.bom_recipes?.length || 0}</Tag>} />
                        <Table.Column 
                            title="HPP Total"
                            render={(_, record: any) => {
                                const total = record.bom_recipes?.reduce((acc: number, curr: any) => 
                                    acc + ((curr.quantity_required || 0) * (curr.materials?.price_per_unit || 0)), 0) || 0;
                                return <span className="text-emerald-400 font-mono font-bold">Rp {total.toLocaleString('id-ID')}</span>
                            }}
                        />
                        <Table.Column align="center" render={() => <Button size="small" type="text" icon={<EyeOutlined />} className="text-slate-400">Detail</Button>} />
                    </Table>
                </div>
            </div>
        </ConfigProvider>
    );
};
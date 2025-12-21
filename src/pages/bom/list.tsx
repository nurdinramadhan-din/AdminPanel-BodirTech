import React from "react";
import { List, useTable, DeleteButton, EditButton } from "@refinedev/antd"; // Pastikan EditButton di-import
import { Table, Tag, Typography, Space, Tooltip } from "antd";
import { DownOutlined, RightOutlined, EditOutlined } from "@ant-design/icons";

const { Text } = Typography;

export const BomList = () => {
    // 1. SUMBER DATA UTAMA: PRODUCTS
    const { tableProps } = useTable({
        resource: "products", 
        syncWithLocation: true,
        meta: {
            // Ambil Produk -> Ambil Resepnya -> Ambil Detail Materialnya
            select: "*, bom_recipes(id, quantity_required, tolerance_percent, tolerance, materials(id, name, unit, color, variant_name))",
        },
    });

    // 2. DEFINISI TABEL NESTED (RINCIAN BAHAN)
    const expandedRowRender = (record: any) => {
        const recipes = record.bom_recipes || [];

        if (recipes.length === 0) {
            return <Text type="secondary" italic>Belum ada resep untuk produk ini.</Text>;
        }

        return (
            <Table 
                dataSource={recipes} 
                rowKey="id" 
                pagination={false} 
                size="small"
                className="nested-table"
            >
                {/* Kolom Bahan Baku */}
                <Table.Column 
                    title="Bahan Baku" 
                    key="material"
                    render={(_, row: any) => {
                        const mat = row.materials;
                        return (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                {mat?.color && (
                                    <div 
                                        style={{
                                            width: 18, height: 18, 
                                            backgroundColor: mat.color, 
                                            borderRadius: 3, 
                                            border: '1px solid #d9d9d9'
                                        }} 
                                    />
                                )}
                                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                                    <Text strong style={{ fontSize: 13 }}>{mat?.name}</Text>
                                    <Text type="secondary" style={{ fontSize: 11 }}>
                                        {mat?.variant_name || ''}
                                    </Text>
                                </div>
                            </div>
                        );
                    }}
                />

                {/* Kolom Takaran */}
                <Table.Column 
                    title="Takaran" 
                    dataIndex="quantity_required" 
                    key="qty"
                    width={150}
                    render={(val, row: any) => (
                        <Tag color="blue">{val} {row.materials?.unit}</Tag>
                    )}
                />

                {/* Kolom Toleransi */}
                <Table.Column 
                    title="Toleransi" 
                    key="tolerance"
                    render={(_, row: any) => (
                        <Space size={4}>
                            <Tag color="orange">{row.tolerance_percent}%</Tag>
                            {row.tolerance && (
                                <Tooltip title={row.tolerance}>
                                    <Text type="secondary" style={{ fontSize: 11, cursor: 'help' }}>(Info)</Text>
                                </Tooltip>
                            )}
                        </Space>
                    )}
                />

                {/* --- UPDATE: KOLOM AKSI (EDIT & DELETE) --- */}
                <Table.Column 
                    title="Aksi" 
                    key="action"
                    width={120}
                    render={(_, row: any) => (
                        <Space>
                            {/* TOMBOL EDIT */}
                            <EditButton 
                                resource="bom_recipes" // WAJIB: Agar mengarah ke edit resep, bukan produk
                                recordItemId={row.id} 
                                hideText 
                                size="small" 
                            />
                            
                            {/* TOMBOL DELETE */}
                            <DeleteButton 
                                resource="bom_recipes" 
                                recordItemId={row.id} 
                                hideText 
                                size="small" 
                            />
                        </Space>
                    )}
                />
            </Table>
        );
    };

    return (
        <List title="Daftar Resep Produksi">
            <Table 
                {...tableProps} 
                rowKey="id"
                expandable={{
                    expandedRowRender,
                    rowExpandable: (record) => true,
                    expandIcon: ({ expanded, onExpand, record }) => 
                        expanded ? (
                            <DownOutlined onClick={e => onExpand(record, e)} />
                        ) : (
                            <RightOutlined onClick={e => onExpand(record, e)} />
                        )
                }}
            >
                {/* KOLOM UTAMA: PRODUK */}
                <Table.Column 
                    dataIndex="name" 
                    title="Nama Produk / Desain" 
                    render={(val, record: any) => (
                        <div style={{ padding: '8px 0' }}>
                            <Text strong style={{ fontSize: 16 }}>{val}</Text>
                            <br/>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                {record.bom_recipes?.length || 0} Jenis Bahan Baku
                            </Text>
                        </div>
                    )}
                />

                <Table.Column 
                    dataIndex="sku" 
                    title="Kode SKU" 
                    render={(val) => val ? <Tag>{val}</Tag> : "-"}
                />

                <Table.Column 
                    title="Status Resep"
                    render={(_, record: any) => {
                        const count = record.bom_recipes?.length || 0;
                        return count > 0 
                            ? <Tag color="success">Siap Produksi</Tag>
                            : <Tag color="default">Belum Ada Resep</Tag>;
                    }}
                />

            </Table>
        </List>
    );
};
import React from "react";
import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, InputNumber, Select, Row, Col, Card, Tag, Typography } from "antd";

const { Text } = Typography;

export const BomEdit = () => {
    const { formProps, saveButtonProps, queryResult } = useForm();

    // 1. Ambil Data Material dengan Detail Lengkap (Warna & Varian)
    const { selectProps: materialSelectProps, queryResult: materialQueryResult } = useSelect({
        resource: "materials",
        optionLabel: "name",
        optionValue: "id",
        meta: { select: "id, name, color, variant_name, unit" }, // Penting: Ambil kolom tambahan
        defaultValue: queryResult?.data?.data?.material_id,
    });

    const { selectProps: productSelectProps } = useSelect({
        resource: "products",
        optionLabel: "name",
        optionValue: "id",
        defaultValue: queryResult?.data?.data?.product_id,
    });

    // 2. Logic Render Custom Options (Sama seperti halaman Create)
    const materialData = materialQueryResult?.data?.data || [];
    const materialOptions = materialData.map((item: any) => ({
        value: item.id,
        label: (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600 }}>{item.name}</span>
                    <span style={{ fontSize: '12px', color: '#888' }}>
                        {item.variant_name ? `Kode: ${item.variant_name}` : ''}
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: 8, fontSize: '11px', color: '#666' }}>({item.unit})</span>
                    {item.color && (
                        <div 
                            style={{
                                width: 20, height: 20, 
                                backgroundColor: item.color, 
                                border: '1px solid #555', 
                                borderRadius: 3 
                            }} 
                        />
                    )}
                </div>
            </div>
        ),
        // Data mentah untuk keperluan search filter di bawah
        _raw: item 
    }));

    return (
        <Edit saveButtonProps={saveButtonProps} title="Edit Item Resep">
            <Form {...formProps} layout="vertical">
                
                <Card style={{ border: '1px solid #303030', marginBottom: 20 }}>
                    <Row gutter={16}>
                        {/* PRODUK (Biasanya jarang diedit, tapi tetap ditampilkan) */}
                        <Col span={24}>
                            <Form.Item
                                label="Produk / Desain"
                                name="product_id"
                                rules={[{ required: true }]}
                            >
                                <Select {...productSelectProps} disabled placeholder="Nama Desain" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>

                <Card title="Detail Bahan & Takaran" style={{ border: '1px solid #303030' }}>
                    <Row gutter={16}>
                        {/* 1. DROPDOWN MATERIAL (CUSTOM SEARCH) */}
                        <Col span={12}>
                            <Form.Item
                                label="Bahan Baku"
                                name="material_id"
                                rules={[{ required: true, message: "Pilih bahan!" }]}
                                help="Cari berdasarkan nama atau kode warna (contoh: '907')"
                            >
                                <Select 
                                    {...materialSelectProps} 
                                    options={materialOptions} 
                                    placeholder="Pilih Material"
                                    showSearch
                                    filterOption={(input, option: any) => {
                                        // Logic pencarian custom: Nama ATAU Kode Varian
                                        const item = option._raw; 
                                        if (!item) return false;
                                        const searchText = `${item.name} ${item.variant_name || ''}`.toLowerCase();
                                        return searchText.includes(input.toLowerCase());
                                    }}
                                />
                            </Form.Item>
                        </Col>

                        {/* 2. TAKARAN */}
                        <Col span={12}>
                            <Form.Item
                                label="Takaran (Quantity)"
                                name="quantity_required"
                                rules={[{ required: true }]}
                            >
                                <InputNumber 
                                    style={{ width: "100%" }} 
                                    step={0.01} 
                                    placeholder="0.00"
                                    addonAfter="Unit" // Bisa diganti dinamis jika mau kompleks
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        {/* 3. TOLERANSI PERSEN (Sesuaikan nama kolom DB: tolerance_percent) */}
                        <Col span={8}>
                            <Form.Item
                                label="Toleransi (%)"
                                name="tolerance_percent" // Pastikan ini sesuai kolom DB Anda
                                initialValue={5}
                            >
                                <InputNumber 
                                    style={{ width: "100%" }} 
                                    min={0} max={100}
                                    formatter={value => `${value}%`}
                                    parser={value => value?.replace('%', '') as any}
                                />
                            </Form.Item>
                        </Col>

                        {/* 4. CATATAN TOLERANSI */}
                        <Col span={16}>
                            <Form.Item
                                label="Catatan Toleransi"
                                name="tolerance"
                            >
                                <Input placeholder="Contoh: Potong lebih untuk jahitan" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>

            </Form>
        </Edit>
    );
};
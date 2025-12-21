import React from "react";
import { IResourceComponentsProps } from "@refinedev/core";
import { Create, useForm } from "@refinedev/antd";
import { Form, Input, InputNumber, Select, ColorPicker, Row, Col } from "antd";

export const MaterialCreate: React.FC<IResourceComponentsProps> = () => {
    const { formProps, saveButtonProps } = useForm();

    return (
        <Create saveButtonProps={saveButtonProps} title="Tambah Bahan Baru">
            <Form {...formProps} layout="vertical">
                
                {/* BARIS 1: NAMA BAHAN & SATUAN */}
                <Row gutter={16}>
                    <Col span={16}>
                        <Form.Item
                            label="Nama Bahan (Induk)"
                            name="name"
                            rules={[{ required: true, message: "Nama bahan wajib diisi!" }]}
                            help="Contoh: Benang Rayon, Kain Cotton"
                        >
                            <Input placeholder="Nama Material Umum" />
                        </Form.Item>
                    </Col>
                     <Col span={8}>
                        <Form.Item
                            label="Satuan"
                            name="unit"
                            rules={[{ required: true, message: "Wajib diisi" }]}
                            initialValue="Cone"
                        >
                            <Select
                                options={[
                                    { value: "Cone", label: "Cone (Benang)" },
                                    { value: "Meter", label: "Meter (Kain)" },
                                    { value: "Pcs", label: "Pcs (Aksesoris)" },
                                    { value: "Kg", label: "Kilogram" },
                                    { value: "Lusin", label: "Lusin" },
                                ]}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                {/* BARIS 2: VARIAN & WARNA (UPDATED) */}
                <Row gutter={16} style={{ background: '#141414', padding: '10px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #303030' }}>
                    <Col span={16}>
                        <Form.Item
                            label="Kode Varian / Kode Warna"
                            name="variant_name"
                            rules={[{ required: true, message: "Kode varian wajib diisi!" }]}
                            help="Masukkan kode pabrikan. Contoh: '907 (Merah Hati)'"
                        >
                            <Input placeholder="Kode/Nama Warna Text" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label="Visual Warna"
                            name="color"
                            getValueFromEvent={(color) => (typeof color === 'string' ? color : color.toHexString())}
                            help="Pilih warna untuk ikon di sistem"
                        >
                            <ColorPicker showText style={{ width: '100%' }} defaultFormat="hex" />
                        </Form.Item>
                    </Col>
                </Row>

                {/* BARIS 3: STOK & HARGA */}
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Stok Awal"
                            name="current_stock"
                            rules={[{ required: true }]}
                            initialValue={0}
                        >
                            <InputNumber style={{ width: "100%" }} min={0} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                         <Form.Item
                            label="Harga Beli (Per Satuan)"
                            name="price_per_unit"
                            help="Harga modal (HPP)"
                            initialValue={0}
                        >
                            <InputNumber 
                                style={{ width: "100%" }} 
                                formatter={(value) => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                                parser={(value) => value!.replace(/\Rp\s?|(\.*)/g, '')}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                 {/* SUPPLIER & ALERT */}
                 <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Nama Supplier" name="supplier_name">
                            <Input placeholder="Contoh: Toko Benang Jaya Abadi" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Alert Stok Minimum"
                            name="min_stock_alert"
                            initialValue={10}
                        >
                            <InputNumber style={{ width: "100%" }} min={1} />
                        </Form.Item>
                    </Col>
                 </Row>

            </Form>
        </Create>
    );
};
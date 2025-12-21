import React from "react";
import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, InputNumber } from "antd";

export const MaterialsEdit = () => {
    const { formProps, saveButtonProps } = useForm();

    return (
        <Edit saveButtonProps={saveButtonProps} title="Edit Material Gudang">
            <Form {...formProps} layout="vertical">
                
                <Form.Item
                    label="Nama Bahan"
                    name="name"
                    rules={[{ required: true, message: "Nama bahan wajib diisi" }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Stok Saat Ini"
                    name="current_stock"
                    rules={[{ required: true, message: "Stok wajib diisi" }]}
                >
                    <InputNumber style={{ width: "100%" }} />
                </Form.Item>

                <Form.Item
                    label="Satuan (Unit)"
                    name="unit"
                    rules={[{ required: true, message: "Satuan wajib diisi (Kg, Meter, Pcs)" }]}
                >
                    <Input placeholder="Contoh: Meter / Kg / Cone" />
                </Form.Item>

                <Form.Item
                    label="Harga Beli (Per Unit)"
                    name="price_per_unit"
                >
                    <InputNumber 
                        style={{ width: "100%" }}
                        formatter={value => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value!.replace(/\Rp\s?|(,*)/g, '')}
                    />
                </Form.Item>

                <Form.Item
                    label="Batas Aman Stok (Alert)"
                    name="min_stock_alert"
                    help="Jika stok di bawah angka ini, sistem akan memberi peringatan."
                >
                    <InputNumber style={{ width: "100%" }} />
                </Form.Item>

            </Form>
        </Edit>
    );
};
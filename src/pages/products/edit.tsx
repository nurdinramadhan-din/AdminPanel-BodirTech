import React from "react";
import { Edit, useForm } from "@refinedev/antd";
import { Form, Input } from "antd";

export const ProductEdit = () => {
    const { formProps, saveButtonProps } = useForm();

    return (
        <Edit saveButtonProps={saveButtonProps} title="Edit Desain / Produk">
            <Form {...formProps} layout="vertical">
                
                <Form.Item
                    label="Nama Produk / Desain"
                    name="name"
                    rules={[{ required: true, message: "Nama produk wajib diisi" }]}
                >
                    <Input placeholder="Contoh: Seragam SD Merah Putih" />
                </Form.Item>

                <Form.Item
                    label="Kode Produk (SKU)"
                    name="code"
                    rules={[{ required: true, message: "Kode unik wajib diisi" }]}
                >
                    <Input placeholder="Contoh: SRG-SD-001" />
                </Form.Item>

                <Form.Item
                    label="Deskripsi / Catatan"
                    name="description"
                >
                    <Input.TextArea rows={4} placeholder="Detail tentang desain ini..." />
                </Form.Item>

            </Form>
        </Edit>
    );
};
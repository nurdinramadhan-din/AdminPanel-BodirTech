import React from "react";
import { Edit, useForm } from "@refinedev/antd";
import { Form, Input } from "antd";

export const CustomerEdit = () => {
    const { formProps, saveButtonProps } = useForm();

    return (
        <Edit saveButtonProps={saveButtonProps} title="Edit Data Pelanggan">
            <Form {...formProps} layout="vertical">
                
                <Form.Item
                    label="Nama Pelanggan / Toko"
                    name="name"
                    rules={[{ required: true, message: "Nama pelanggan wajib diisi" }]}
                >
                    <Input placeholder="Contoh: Toko Udin Jaya" />
                </Form.Item>

                <Form.Item
                    label="Nomor Telepon / WA"
                    name="phone_number"
                    rules={[{ required: true, message: "Nomor telepon wajib diisi" }]}
                >
                    <Input placeholder="08123xxxx" />
                </Form.Item>

                <Form.Item
                    label="Alamat Lengkap"
                    name="address"
                >
                    <Input.TextArea rows={3} placeholder="Alamat pengiriman..." />
                </Form.Item>

                <Form.Item
                    label="Catatan Tambahan"
                    name="notes"
                >
                    <Input placeholder="Misal: Langganan VIP" />
                </Form.Item>

            </Form>
        </Edit>
    );
};
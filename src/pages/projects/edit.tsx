import React from "react";
import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, InputNumber, Select, DatePicker, Alert } from "antd"; // Tambah Alert
import dayjs from "dayjs";

export const ProjectEdit = () => {
    // 1. Hook Utama untuk Form
    const { formProps, saveButtonProps, queryResult } = useForm();

    // Ambil data project yang sedang diload
    const projectData = queryResult?.data?.data;
    
    // LOGIKA KUNCI: Cek apakah status sudah COMPLETED
    const isCompleted = projectData?.status === 'COMPLETED';

    // 2. Ambil Data Pelanggan (Untuk Dropdown)
    const { selectProps: customerSelectProps } = useSelect({
        resource: "customers",
        optionLabel: "name", 
        optionValue: "id",   
        // PERBAIKAN: Ganti 'client_id' jadi 'customer_id' sesuai database
        defaultValue: projectData?.customer_id, 
    });

    return (
        <Edit 
            saveButtonProps={{ 
                ...saveButtonProps, 
                // Matikan/Sembunyikan tombol save jika sudah Completed
                disabled: isCompleted || saveButtonProps.disabled,
                style: { display: isCompleted ? 'none' : 'inline-block' } 
            }} 
            title="Edit Project (SPK)"
        >
            {/* TAMPILKAN PERINGATAN JIKA SUDAH SELESAI */}
            {isCompleted && (
                <Alert 
                    message="Project Selesai (Locked)" 
                    description="Project ini sudah berstatus COMPLETED. Data dikunci untuk menjaga integritas laporan. Ubah status kembali ke 'In Progress' jika ingin mengedit."
                    type="warning" 
                    showIcon 
                    style={{ marginBottom: 20 }}
                />
            )}

            <Form {...formProps} layout="vertical">
                
                {/* NAMA PROJECT */}
                <Form.Item
                    label="Nama Project / Batch"
                    name="title"
                    rules={[{ required: true, message: "Nama project wajib diisi" }]}
                >
                    <Input placeholder="Contoh: Seragam SD Batch 1" disabled={isCompleted} />
                </Form.Item>

                {/* PILIH PELANGGAN */}
                <Form.Item
                    label="Pelanggan (Klien)"
                    name="customer_id"
                    rules={[{ required: true, message: "Harap pilih pelanggan" }]}
                >
                    <Select {...customerSelectProps} placeholder="Pilih Pelanggan" disabled={isCompleted} />
                </Form.Item>

                {/* STATUS PROJECT */}
                <Form.Item
                    label="Status Produksi"
                    name="status"
                    rules={[{ required: true }]}
                    help={isCompleted ? "Ubah ke 'Sedang Dikerjakan' untuk membuka kunci edit." : ""}
                >
                    <Select
                        // Status tetap saya biarkan aktif (enabled) agar Admin bisa 
                        // mengubahnya kembali ke IN_PROGRESS jika terjadi kesalahan input/ingin unlock.
                        // Jika Anda ingin status ikutan mati total, tambahkan disabled={isCompleted} disini.
                        options={[
                            { value: "PLANNED", label: "Baru Direncanakan (Planned)" },
                            { value: "IN_PROGRESS", label: "Sedang Dikerjakan (In Progress)" },
                            { value: "COMPLETED", label: "Selesai (Completed)" },
                            { value: "CANCELLED", label: "Dibatalkan" },
                        ]}
                    />
                </Form.Item>

                {/* TOTAL JUMLAH ORDER */}
                <Form.Item
                    label="Total Quantity (Pcs)"
                    name="quantity"
                    rules={[{ required: true, message: "Jumlah order wajib diisi" }]}
                >
                    <InputNumber 
                        style={{ width: "100%" }} 
                        placeholder="Contoh: 1000" 
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                        disabled={isCompleted}
                    />
                </Form.Item>

                {/* DEADLINE */}
                <Form.Item
                    label="Deadline"
                    name="deadline"
                    getValueProps={(value) => ({
                        value: value ? dayjs(value) : "",
                    })}
                >
                    <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" disabled={isCompleted} />
                </Form.Item>

                {/* DESKRIPSI */}
                <Form.Item
                    label="Catatan Project"
                    name="description"
                >
                    <Input.TextArea rows={4} disabled={isCompleted} />
                </Form.Item>

            </Form>
        </Edit>
    );
};
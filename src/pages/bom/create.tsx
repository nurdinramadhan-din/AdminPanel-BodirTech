import React from "react";
import { useSelect } from "@refinedev/antd"; 
import { useCreateMany, useNavigation, useNotification } from "@refinedev/core"; 
import { Create } from "@refinedev/antd";
import { Form, Input, InputNumber, Select, Row, Col, Button, Card, Typography, message } from "antd";
import { PlusOutlined, DeleteOutlined, SaveOutlined } from "@ant-design/icons";

export const BomCreate = () => {
    // 1. Hook Navigasi & Notifikasi
    const { list } = useNavigation();
    const { open } = useNotification();
    
    // 2. Form Instance Manual (Penting untuk custom submit)
    const [form] = Form.useForm(); 

    // 3. Hook Batch Insert (Pengganti saveButtonProps)
    const { mutate: createMany, isLoading } = useCreateMany();

    // --- DATA FETCHING (Sama seperti sebelumnya) ---
    const { selectProps: productSelectProps } = useSelect({
        resource: "products",
        optionLabel: "name",
        optionValue: "id",
    });

    const { selectProps: materialSelectProps, queryResult } = useSelect({
        resource: "materials",
        optionLabel: "name",
        optionValue: "id",
        meta: { select: "id, name, color, variant_name, unit" }
    });

    const materialData = queryResult?.data?.data || [];
    
    // Helper Render Options untuk Dropdown Material
    const renderMaterialOptions = materialData.map((item: any) => ({
        value: item.id,
        label: (
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                <span>
                    <b>{item.name}</b> {item.variant_name ? `- ${item.variant_name}` : ''}
                </span>
                <span style={{ color: '#888', fontSize: '0.85em' }}>({item.unit})</span>
            </div>
        ),
    }));
    // -----------------------------------------------

    // 4. LOGIKA UTAMA (TRANSFORMASI DATA)
    const onFinish = (values: any) => {
        // Validasi: Pastikan user sudah input minimal 1 bahan
        if (!values.materials || values.materials.length === 0) {
            message.error("Mohon masukkan minimal satu bahan baku!");
            return;
        }

        // TRANSFORMASI: Mengubah data Form menjadi Data Database
        // Data Form: { product_id: "A", materials: [ {mat: "1", qty: 10}, {mat: "2", qty: 5} ] }
        // Menjadi:   [ {product_id: "A", material_id: "1", ...}, {product_id: "A", material_id: "2", ...} ]
        
        const formattedData = values.materials.map((item: any) => ({
            product_id: values.product_id, // ID Produk dipakai berulang di setiap baris
            material_id: item.material_id,
            quantity_required: item.quantity_required,
            tolerance_percent: item.tolerance_percentage || 5, // Default 5%
            tolerance: item.tolerance // Catatan teks
        }));

        // EKSEKUSI: Kirim data yang sudah rapi ke Supabase
createMany(
    {
        resource: "bom_recipes",
        values: formattedData,
    },
    {
        onSuccess: () => {
            // PERBAIKAN DI SINI (pakai ?.)
            open?.({
                message: "Berhasil Disimpan",
                description: "Resep untuk produk ini berhasil dibuat.",
                type: "success",
            });
            list("bom_recipes"); 
        },
        onError: (error) => {
            console.error(error);
            // Anda bisa pakai message.error dari Antd untuk error handling yang simpel
            message.error("Gagal menyimpan resep. Cek console untuk detail.");
        }
    }
);
    };

    return (
        <Create 
            title="Buat Resep Produksi (BOM)"
            // Kita timpa tombol save bawaan dengan tombol custom kita
            footerButtons={
                <Button 
                    type="primary" 
                    icon={<SaveOutlined />}
                    onClick={() => form.submit()} // Ini akan memicu onFinish di bawah
                    loading={isLoading}
                >
                    Simpan Resep
                </Button>
            }
        >
            <Form 
                form={form} 
                layout="vertical" 
                onFinish={onFinish} // Fungsi custom kita dipanggil di sini
                initialValues={{ 
                    materials: [{ tolerance_percentage: 5 }] // Baris pertama otomatis ada
                }}
            >
                
                {/* BAGIAN 1: PILIH PRODUK */}
                <Card style={{ marginBottom: 20, border: '1px solid #303030' }}>
                    <Form.Item
                        label="Produk / Desain Utama"
                        name="product_id"
                        rules={[{ required: true, message: "Pilih produk / desain!" }]}
                        help="Pilih desain bordir yang akan dihitung resepnya"
                    >
                        <Select {...productSelectProps} placeholder="Cari Desain (misal: Logo SD)" size="large" />
                    </Form.Item>
                </Card>

                {/* BAGIAN 2: LIST MATERIAL (DYNAMIC) */}
                <Typography.Title level={5} style={{ marginBottom: 15 }}>Komposisi Bahan Baku</Typography.Title>
                
                <Form.List name="materials">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Card 
                                    key={key} 
                                    size="small" 
                                    style={{ marginBottom: 10, background: '#141414', border: '1px solid #444' }}
                                >
                                    <Row gutter={12} align="middle">
                                        <Col xs={24} md={8}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'material_id']}
                                                label="Bahan Baku"
                                                rules={[{ required: true, message: 'Wajib!' }]}
                                                style={{ marginBottom: 5 }}
                                            >
                                                <Select 
                                                    {...materialSelectProps} 
                                                    options={renderMaterialOptions}
                                                    placeholder="Pilih Bahan"
                                                    showSearch
                                                    filterOption={(input, option: any) => 
                                                        String(option?.label?.props?.children[0]?.props?.children[0] ?? '').toLowerCase().includes(input.toLowerCase())
                                                    }
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={12} md={5}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'quantity_required']}
                                                label="Takaran"
                                                rules={[{ required: true, message: 'Isi!' }]}
                                                style={{ marginBottom: 5 }}
                                            >
                                                <InputNumber style={{ width: '100%' }} step={0.01} placeholder="0.00" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={12} md={4}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'tolerance_percentage']}
                                                label="Toleransi"
                                                style={{ marginBottom: 5 }}
                                            >
                                                <InputNumber 
                                                    style={{ width: '100%' }} 
                                                    formatter={val => `${val}%`}
                                                    parser={val => val?.replace('%', '') as any}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={20} md={5}>
                                             <Form.Item
                                                {...restField}
                                                name={[name, 'tolerance']}
                                                label="Catatan"
                                                style={{ marginBottom: 5 }}
                                            >
                                                <Input placeholder="Ket..." />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={4} md={2} style={{ textAlign: 'center', paddingTop: 20 }}>
                                            <Button 
                                                type="text" 
                                                danger 
                                                icon={<DeleteOutlined />} 
                                                onClick={() => remove(name)}
                                            />
                                        </Col>
                                    </Row>
                                </Card>
                            ))}

                            <Form.Item>
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} size="large">
                                    + Tambah Bahan Lain
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form.List>

            </Form>
        </Create>
    );
};
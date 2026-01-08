import React from "react";
import { useSelect } from "@refinedev/antd"; 
import { useCreateMany, useNavigation, useNotification } from "@refinedev/core"; 
import { Create } from "@refinedev/antd";
import { 
    Form, Select, Row, Col, Button, Card, Typography, 
    message, ConfigProvider, theme, InputNumber, Input, Divider 
} from "antd";
import { 
    PlusOutlined, DeleteOutlined, SaveOutlined, 
    ExperimentOutlined, CodeSandboxOutlined 
} from "@ant-design/icons";

export const BomCreate = () => {
    const { darkAlgorithm } = theme;
    const { list } = useNavigation();
    const { open } = useNotification();
    const [form] = Form.useForm(); 

    // Hook Batch Insert (Logic Lama Akang)
    const { mutate: createMany, isLoading } = useCreateMany();

    // Fetch Produk
    const { selectProps: productSelectProps } = useSelect({
        resource: "products",
        optionLabel: "name",
        optionValue: "id",
    });

    // Fetch Material
    const { queryResult } = useSelect({
        resource: "materials",
        optionLabel: "name",
        optionValue: "id",
        meta: { select: "id, name, unit, price_per_unit" } // Ambil harga juga utk estimasi
    });

    const materialData = queryResult?.data?.data || [];
    
    // Helper Render Options (Custom Dropdown Dark Mode)
    const renderMaterialOptions = materialData.map((item: any) => ({
        value: item.id,
        label: (
            <div className="flex justify-between w-full">
                <span className="text-white font-bold">{item.name}</span>
                <span className="text-slate-400 text-xs">({item.unit})</span>
            </div>
        ),
    }));

    const onFinish = (values: any) => {
        if (!values.materials || values.materials.length === 0) {
            message.error("Mohon masukkan minimal satu bahan baku!");
            return;
        }

        const formattedData = values.materials.map((item: any) => ({
            organization_id: 'ae176f73-c832-4345-9be0-3db9377fb1e9', // ID Org Akang
            product_id: values.product_id,
            material_id: item.material_id,
            quantity_required: item.quantity_required,
            tolerance_percent: item.tolerance_percentage || 5,
            tolerance: item.tolerance
        }));

        createMany({
            resource: "bom_recipes",
            values: formattedData,
        }, {
            onSuccess: () => {
                open?.({
                    message: "Berhasil Disimpan",
                    description: "Resep berhasil diracik.",
                    type: "success",
                });
                list("bom_recipes"); 
            },
            onError: (error) => {
                console.error(error);
                message.error("Gagal menyimpan resep.");
            }
        });
    };

    return (
        <ConfigProvider theme={{ algorithm: darkAlgorithm }}>
            <div className="bg-slate-900 min-h-screen p-6 flex justify-center text-slate-100">
                <div className="w-full max-w-4xl">
                    <Create 
                        title={<span className="text-xl font-bold text-white">🧪 Racik Resep (BOM)</span>}
                        wrapperProps={{ className: "bg-slate-800 border border-slate-700 rounded-xl shadow-2xl" }}
                        footerButtons={
                            <Button 
                                type="primary" 
                                icon={<SaveOutlined />}
                                onClick={() => form.submit()}
                                loading={isLoading}
                                size="large"
                                className="bg-emerald-600 hover:bg-emerald-500 border-none font-bold"
                            >
                                Simpan Resep
                            </Button>
                        }
                    >
                        <Form 
                            form={form} 
                            layout="vertical" 
                            onFinish={onFinish} 
                            initialValues={{ materials: [{ tolerance_percentage: 5 }] }}
                        >
                            {/* BAGIAN 1: PILIH PRODUK */}
                            <Card className="bg-slate-800 border-slate-700 mb-6">
                                <Form.Item
                                    label={<span className="text-slate-300 font-bold">Pilih Produk / Desain Utama</span>}
                                    name="product_id"
                                    rules={[{ required: true, message: "Pilih produk!" }]}
                                >
                                    <Select 
                                        {...productSelectProps} 
                                        placeholder="Cari Desain (misal: Seragam SD)" 
                                        size="large" 
                                        className="w-full"
                                        suffixIcon={<CodeSandboxOutlined className="text-emerald-500" />}
                                    />
                                </Form.Item>
                            </Card>

                            {/* BAGIAN 2: LIST MATERIAL (DYNAMIC) */}
                            <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700">
                                <div className="flex justify-between items-center mb-4">
                                    <Typography.Title level={5} className="text-emerald-400 m-0">
                                        <ExperimentOutlined /> Komposisi Bahan Baku
                                    </Typography.Title>
                                    <span className="text-xs text-slate-500">Tambah semua bahan yang diperlukan</span>
                                </div>
                                
                                <Form.List name="materials">
                                    {(fields, { add, remove }) => (
                                        <>
                                            {fields.map(({ key, name, ...restField }) => (
                                                <div 
                                                    key={key} 
                                                    className="bg-slate-800 p-4 rounded-lg border border-slate-600 mb-4 shadow-sm hover:border-emerald-500/50 transition-colors"
                                                >
                                                    <Row gutter={16} align="middle">
                                                        <Col xs={24} md={8}>
                                                            <Form.Item
                                                                {...restField}
                                                                name={[name, 'material_id']}
                                                                label={<span className="text-slate-400 text-xs">Pilih Bahan</span>}
                                                                rules={[{ required: true, message: 'Wajib!' }]}
                                                                className="mb-2 md:mb-0"
                                                            >
                                                                <Select 
                                                                    options={renderMaterialOptions}
                                                                    placeholder="Benang/Kain..."
                                                                    showSearch
                                                                    className="w-full"
                                                                    popupMatchSelectWidth={false}
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
                                                                label={<span className="text-slate-400 text-xs">Jumlah</span>}
                                                                rules={[{ required: true, message: 'Isi!' }]}
                                                                className="mb-2 md:mb-0"
                                                            >
                                                                <InputNumber className="w-full bg-slate-700 border-slate-600" step={0.01} placeholder="0.00" />
                                                            </Form.Item>
                                                        </Col>

                                                        <Col xs={12} md={4}>
                                                            <Form.Item
                                                                {...restField}
                                                                name={[name, 'tolerance_percentage']}
                                                                label={<span className="text-slate-400 text-xs">Toleransi %</span>}
                                                                className="mb-2 md:mb-0"
                                                            >
                                                                <InputNumber 
                                                                    className="w-full bg-slate-700 border-slate-600"
                                                                    formatter={val => `${val}%`}
                                                                    parser={val => val?.replace('%', '') as any}
                                                                />
                                                            </Form.Item>
                                                        </Col>

                                                        <Col xs={20} md={5}>
                                                             <Form.Item
                                                                {...restField}
                                                                name={[name, 'tolerance']}
                                                                label={<span className="text-slate-400 text-xs">Catatan</span>}
                                                                className="mb-2 md:mb-0"
                                                            >
                                                                <Input className="bg-slate-700 border-slate-600 text-slate-200" placeholder="Ket..." />
                                                            </Form.Item>
                                                        </Col>

                                                        <Col xs={4} md={2} className="flex items-end justify-center pt-6">
                                                            <Button 
                                                                type="text" 
                                                                danger 
                                                                icon={<DeleteOutlined />} 
                                                                onClick={() => remove(name)}
                                                                className="hover:bg-red-500/20"
                                                            />
                                                        </Col>
                                                    </Row>
                                                </div>
                                            ))}

                                            <Button 
                                                type="dashed" 
                                                onClick={() => add()} 
                                                block 
                                                icon={<PlusOutlined />} 
                                                size="large"
                                                className="border-slate-600 text-slate-400 hover:text-emerald-400 hover:border-emerald-400"
                                            >
                                                + Tambah Bahan Lain
                                            </Button>
                                        </>
                                    )}
                                </Form.List>
                            </div>
                        </Form>
                    </Create>
                </div>
            </div>
        </ConfigProvider>
    );
};
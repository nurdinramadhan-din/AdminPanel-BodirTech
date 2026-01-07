import React, { useState } from "react";
import { IResourceComponentsProps, useNavigation, useGetIdentity } from "@refinedev/core";
import { Create, useForm, useSelect } from "@refinedev/antd";
import { 
    Form, 
    Input, 
    Select, 
    InputNumber, 
    Row, 
    Col, 
    Card, 
    Alert, 
    message, 
    ConfigProvider, 
    theme,
    DatePicker
} from "antd";
import { supabaseClient } from "../../utility";
import dayjs from "dayjs";
import { InfoCircleOutlined, ThunderboltFilled } from "@ant-design/icons";

export const ProjectCreate: React.FC<IResourceComponentsProps> = () => {
    const { list } = useNavigation();
    const { data: user } = useGetIdentity<{ organization_id?: string }>(); 
    const [isGenerating, setIsGenerating] = useState(false);
    
    const { darkAlgorithm } = theme;

    const { formProps, saveButtonProps, form, onFinish } = useForm({
        // Logic ini jalan SETELAH data Project berhasil dibuat (Success)
        onMutationSuccess: async (data: any) => {
            if (data?.data?.id) {
                // Kita ambil bundle_size langsung dari nilai Form yang masih ada di memori
                const allValues = form.getFieldsValue();
                await generateBundles(data.data.id, allValues);
            }
        },
        onMutationError: (error: any) => {
            message.error("Gagal menyimpan Project: " + error?.message);
        }
    });

    const { selectProps: customerSelectProps } = useSelect({
        resource: "customers",
        optionLabel: "name",
        optionValue: "id",
    });

    const { selectProps: productSelectProps } = useSelect({
        resource: "products",
        optionLabel: "name",
        optionValue: "id",
    });

    // --- FIX UTAMA: HANDLER SAVE ---
    // Fungsi ini menyaring data sebelum dikirim ke Supabase
    const handleOnFinish = async (values: any) => {
        // 1. Pisahkan 'bundle_size' karena tidak ada kolomnya di tabel 'projects'
        const { bundle_size, ...projectData } = values;

        // 2. Pastikan format tanggal benar (string) agar aman
        if (projectData.deadline && dayjs.isDayjs(projectData.deadline)) {
            projectData.deadline = projectData.deadline.format('YYYY-MM-DD');
        }

        // 3. Kirim data yang sudah bersih ke Supabase
        await onFinish(projectData);
    };

    // --- LOGIKA GENERATE BUNDLE ---
    const generateBundles = async (projectId: string, formData: any) => {
        setIsGenerating(true);
        try {
            const totalQty = Number(formData.total_quantity) || 0;
            const perBundle = Number(formData.bundle_size) || 50;

            if (totalQty <= 0 || perBundle <= 0) {
                list("projects");
                return;
            }

            const totalBundles = Math.ceil(totalQty / perBundle);
            const bundleData = [];

            // Fallback Organization ID jika user belum terload sempurna
            const orgId = user?.organization_id || 'ae176f73-c832-4345-9be0-3db9377fb1e9'; 

            for (let i = 1; i <= totalBundles; i++) {
                const qtyThisBundle = (i === totalBundles) 
                    ? totalQty - ((totalBundles - 1) * perBundle) 
                    : perBundle;

                bundleData.push({
                    organization_id: orgId,
                    project_id: projectId,
                    bundle_code: `${formData.title.substring(0, 3).toUpperCase()}-${String(i).padStart(3, '0')}`,
                    quantity: qtyThisBundle,
                    status: 'NEW', 
                    // Pastikan kolom 'current_stage' ada di tabel spk_bundles Anda.
                    // Jika error lagi soal kolom, hapus baris 'current_stage' ini.
                    current_stage: 'PLANNED' 
                });
            }

            const { error } = await supabaseClient
                .from('spk_bundles')
                .insert(bundleData);

            if (error) throw error;

            message.success(`Sukses! ${totalBundles} QR Code siap dicetak.`);
            list("projects"); 

        } catch (error: any) {
            console.error(error);
            message.error("Project tersimpan, tapi gagal generate bundle. Cek console untuk detail.");
            list("projects");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <ConfigProvider
            theme={{
                algorithm: darkAlgorithm,
                token: {
                    colorPrimary: '#10B981', 
                    colorBgContainer: '#1e293b', 
                    colorText: '#f8fafc',
                },
            }}
        >
            <div className="bg-slate-900 min-h-screen p-6">
                <Create 
                    saveButtonProps={{ ...saveButtonProps, loading: isGenerating }} 
                    title={<span className="text-xl font-bold text-white">🚀 Buat SPK Produksi Baru</span>}
                    wrapperProps={{ className: "bg-slate-800 rounded-xl border border-slate-700 shadow-xl" }}
                >
                    {/* Perhatikan prop onFinish={handleOnFinish} di bawah ini */}
                    <Form 
                        {...formProps} 
                        onFinish={handleOnFinish} 
                        layout="vertical" 
                        initialValues={{ 
                            bundle_size: 50, 
                            status: 'NEW',
                            total_quantity: 100,
                            deadline: dayjs().add(7, 'day')
                        }}
                    >
                        
                        <Alert 
                            message={<span className="font-bold">Sistem Otomatis</span>}
                            description={<span className="text-slate-300">Total Order akan otomatis dipecah menjadi beberapa QR Code berdasarkan kapasitas karung.</span>}
                            type="info" 
                            showIcon 
                            icon={<InfoCircleOutlined className="text-emerald-400" />}
                            className="mb-8 bg-emerald-900/20 border-emerald-500/30 text-emerald-100"
                        />

                        <Card 
                            title={<span className="text-emerald-400 font-bold">📄 Informasi Order</span>} 
                            bordered={false} 
                            className="mb-6 shadow-none bg-slate-800/50"
                        >
                            <Row gutter={24}>
                                <Col span={12} xs={24}>
                                    <Form.Item
                                        label={<span className="text-slate-300">Judul Project / Nama Order</span>}
                                        name="title"
                                        rules={[{ required: true, message: "Judul wajib diisi" }]}
                                    >
                                        <Input placeholder="Contoh: Seragam Batik SD 2024" />
                                    </Form.Item>
                                </Col>
                                <Col span={12} xs={24}>
                                    <Form.Item
                                        label={<span className="text-slate-300">Pelanggan</span>}
                                        name="customer_id"
                                        rules={[{ required: true }]}
                                    >
                                        <Select {...customerSelectProps} placeholder="Pilih Customer..." />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={24}>
                                <Col span={12} xs={24}>
                                    <Form.Item
                                        label={<span className="text-slate-300">Desain / Produk</span>}
                                        name="product_id"
                                        rules={[{ required: true }]}
                                    >
                                        <Select {...productSelectProps} placeholder="Pilih Produk..." />
                                    </Form.Item>
                                </Col>
                                <Col span={12} xs={24}>
                                    <Form.Item 
                                        label={<span className="text-slate-300">Deadline Target</span>}
                                        name="deadline" 
                                        rules={[{ required: true }]}
                                        getValueProps={(value) => ({ value: value ? dayjs(value) : "" })}
                                    >
                                        <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>

                        <Card 
                            title={<span className="text-blue-400 font-bold"><ThunderboltFilled /> Kalkulasi Produksi</span>} 
                            bordered={false}
                            className="mb-4 bg-slate-800/50 border border-slate-700"
                        >
                            <Row gutter={24}>
                                <Col span={8} xs={24}>
                                    <Form.Item
                                        label={<span className="text-slate-300 font-bold">Total Pcs Order</span>}
                                        name="total_quantity"
                                        rules={[{ required: true }]}
                                    >
                                        <InputNumber style={{ width: "100%" }} min={1} placeholder="1000" />
                                    </Form.Item>
                                </Col>
                                <Col span={8} xs={24}>
                                    <Form.Item
                                        label={<span className="text-slate-300 font-bold">Isi per Karung (Bundle)</span>}
                                        name="bundle_size"
                                        rules={[{ required: true }]}
                                        help={<span className="text-slate-500 text-xs">Field ini tidak masuk database, hanya untuk hitung QR.</span>}
                                    >
                                        <InputNumber style={{ width: "100%" }} min={1} />
                                    </Form.Item>
                                </Col>
                                <Col span={8} xs={24}>
                                    <Form.Item 
                                        label={<span className="text-slate-300">Status Awal</span>}
                                        name="status"
                                    >
                                        <Select 
                                            options={[
                                                { value: 'NEW', label: 'Baru (Draft)' },
                                                { value: 'IN_PROGRESS', label: 'Langsung Kerjakan' },
                                            ]} 
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>

                    </Form>
                </Create>
            </div>
        </ConfigProvider>
    );
};
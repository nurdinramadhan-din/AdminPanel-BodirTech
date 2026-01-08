import React, { useState } from "react";
import { IResourceComponentsProps, useNavigation, useGetIdentity } from "@refinedev/core";
import { Create, useForm, useSelect } from "@refinedev/antd";
import { 
    Form, Input, Select, InputNumber, Row, Col, Card, Alert, message, 
    ConfigProvider, theme, DatePicker
} from "antd";
import { supabaseClient } from "../../utility";
import dayjs from "dayjs"; // Pastikan install: npm install dayjs
import { ThunderboltOutlined } from "@ant-design/icons";

export const ProjectCreate: React.FC<IResourceComponentsProps> = () => {
    const { list } = useNavigation();
    const { data: user } = useGetIdentity<{ organization_id?: string }>(); // Ambil data user login
    const { darkAlgorithm } = theme;
    const [isGenerating, setIsGenerating] = useState(false);

    const { formProps, saveButtonProps, form, onFinish } = useForm({
        // Redirect manual setelah sukses agar kita bisa generate bundle dulu
        redirect: false, 
        onMutationSuccess: async (data: any) => {
            if (data?.data?.id) {
                // Ambil nilai bundle_size dari form saat ini
                const allValues = form.getFieldsValue();
                // Jalankan fungsi generate QR
                await generateBundles(data.data.id, allValues);
            } else {
                message.error("Gagal mendapatkan ID Project baru.");
            }
        },
        onMutationError: (err: any) => {
            console.error(err);
            message.error("Gagal membuat SPK: " + err?.message);
        }
    });

    const { selectProps: customerSelectProps } = useSelect({ 
        resource: "customers", 
        optionLabel: "name", 
        optionValue: "id" 
    });

    const { selectProps: productSelectProps } = useSelect({ 
        resource: "products", 
        optionLabel: "name", 
        optionValue: "id" 
    });

    // 1. Intercept Submit: Buang field 'bundle_size' & Format Tanggal
    const handleOnFinish = async (values: any) => {
        try {
            // Pisahkan bundle_size karena tidak ada di tabel database 'projects'
            const { bundle_size, ...projectData } = values;
            
            // Format Deadline jadi YYYY-MM-DD
            if (projectData.deadline) {
                projectData.deadline = dayjs(projectData.deadline).format('YYYY-MM-DD');
            }

            // Panggil fungsi simpan bawaan Refine
            await onFinish(projectData);
        } catch (error) {
            console.error("Error on finish:", error);
        }
    };

    // 2. Logic Generate Bundle (QR Code)
    const generateBundles = async (projectId: string, formData: any) => {
        setIsGenerating(true);
        try {
            const totalQty = Number(formData.total_quantity) || 0;
            const perBundle = Number(formData.bundle_size) || 50;
            
            // Jika input ngawur, skip generate bundle, langsung balik ke list
            if (totalQty <= 0 || perBundle <= 0) { 
                message.warning("Project dibuat tanpa Bundle (Qty/Size 0).");
                list("projects"); 
                return; 
            }

            const totalBundles = Math.ceil(totalQty / perBundle);
            const bundleData = [];
            
            // Gunakan ID User Organisasi atau Fallback ID jika user belum login sempurna
            // Fallback ID ini penting agar tidak blank screen
            const orgId = user?.organization_id || 'ae176f73-c832-4345-9be0-3db9377fb1e9'; 

            for (let i = 1; i <= totalBundles; i++) {
                // Hitung sisa qty untuk karung terakhir
                const qtyThisBundle = (i === totalBundles) 
                    ? totalQty - ((totalBundles - 1) * perBundle) 
                    : perBundle;
                
                // Format Kode: JUDUL-001 (Misal: SER-001)
                const prefix = formData.title ? formData.title.substring(0, 3).toUpperCase() : "SPK";
                
                bundleData.push({
                    organization_id: orgId,
                    project_id: projectId,
                    bundle_code: `${prefix}-${String(i).padStart(3, '0')}`,
                    quantity: qtyThisBundle,
                    status: 'NEW', // Status awal bundle
                    current_stage: 'PLANNED' // Tahap awal
                });
            }

            // Insert Massal ke Supabase
            const { error } = await supabaseClient.from('spk_bundles').insert(bundleData);
            
            if (error) throw error;
            
            message.success(`Berhasil! ${totalBundles} QR Code Bundle telah dibuat.`);
            list("projects"); // Redirect ke halaman list
        } catch (error: any) {
            console.error(error);
            message.error("Project tersimpan, tapi gagal generate bundle: " + error.message);
            list("projects");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <ConfigProvider theme={{ algorithm: darkAlgorithm }}>
            <div className="bg-slate-900 min-h-screen p-6 flex justify-center text-slate-100">
                <div className="w-full max-w-4xl">
                    <Create 
                        saveButtonProps={{ ...saveButtonProps, loading: isGenerating }} 
                        title={<span className="text-xl font-bold text-white">🚀 Buat SPK Produksi</span>}
                        wrapperProps={{ className: "bg-slate-800 border border-slate-700 rounded-xl shadow-lg" }}
                    >
                        <Form 
                            {...formProps} 
                            onFinish={handleOnFinish} // Pakai handler custom kita
                            layout="vertical" 
                            initialValues={{ 
                                bundle_size: 50, 
                                status: 'NEW', 
                                total_quantity: 100, 
                                deadline: dayjs().add(7, 'day') // Default seminggu kedepan
                            }}
                        >
                            
                            <Alert 
                                message="Otomatisasi Bundle" 
                                description="Sistem akan otomatis memecah total order menjadi beberapa QR Code (Karung) sesuai ukuran bundle." 
                                type="info" 
                                showIcon 
                                className="mb-6 bg-blue-900/20 border-blue-500/30 text-blue-200" 
                            />

                            <Card className="bg-slate-800 border-slate-700 mb-6" title={<span className="text-emerald-400 font-bold">📄 Info Order</span>}>
                                <Row gutter={24}>
                                    <Col xs={24} md={12}>
                                        <Form.Item 
                                            label={<span className="text-slate-300">Judul Order</span>} 
                                            name="title" 
                                            rules={[{ required: true, message: "Wajib diisi" }]}
                                        >
                                            <Input placeholder="Cth: Seragam SD 2025" size="large" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item 
                                            label={<span className="text-slate-300">Pelanggan</span>} 
                                            name="customer_id" 
                                            rules={[{ required: true, message: "Pilih Pelanggan" }]}
                                        >
                                            <Select {...customerSelectProps} placeholder="Pilih Customer" size="large" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={24}>
                                    <Col xs={24} md={12}>
                                        <Form.Item 
                                            label={<span className="text-slate-300">Desain / Produk</span>} 
                                            name="product_id" 
                                            rules={[{ required: true, message: "Pilih Produk" }]}
                                        >
                                            <Select {...productSelectProps} placeholder="Pilih Desain" size="large" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item 
                                            label={<span className="text-slate-300">Deadline</span>} 
                                            name="deadline" 
                                            rules={[{ required: true, message: "Tentukan Deadline" }]}
                                        >
                                            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" size="large" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Card>

                            <Card 
                                className="bg-slate-800 border-slate-700" 
                                title={<span className="text-blue-400 font-bold"><ThunderboltOutlined /> Kalkulasi Produksi</span>}
                            >
                                <Row gutter={24}>
                                    <Col xs={24} md={8}>
                                        <Form.Item 
                                            label={<span className="text-slate-300">Total Qty (Pcs)</span>} 
                                            name="total_quantity" 
                                            rules={[{ required: true }]}
                                        >
                                            <InputNumber style={{ width: "100%" }} min={1} size="large" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={8}>
                                        <Form.Item 
                                            label={<span className="text-slate-300">Isi per Karung (Bundle)</span>} 
                                            name="bundle_size" 
                                            rules={[{ required: true }]} 
                                            help={<span className="text-slate-500 text-xs">Untuk membagi QR Code</span>}
                                        >
                                            <InputNumber style={{ width: "100%" }} min={1} size="large" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={8}>
                                        <Form.Item 
                                            label={<span className="text-slate-300">Status Awal</span>} 
                                            name="status"
                                        >
                                            <Select size="large" options={[
                                                { value: 'NEW', label: 'Baru' }, 
                                                { value: 'IN_PROGRESS', label: 'Langsung Kerjakan' }
                                            ]} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Card>
                        </Form>
                    </Create>
                </div>
            </div>
        </ConfigProvider>
    );
};
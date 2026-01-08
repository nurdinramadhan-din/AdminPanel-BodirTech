import React, { useState } from "react";
import { IResourceComponentsProps, useNavigation } from "@refinedev/core";
import { Create, useForm } from "@refinedev/antd";
import { 
    Form, Input, InputNumber, Row, Col, Divider, 
    Upload, Button, message, ConfigProvider, theme, Card 
} from "antd";
import { 
    UploadOutlined, 
    ScissorOutlined, 
    BgColorsOutlined, 
    ColumnHeightOutlined,
    FileImageOutlined,
    SaveOutlined
} from "@ant-design/icons";
import { supabaseClient } from "../../utility";

export const ProductCreate: React.FC<IResourceComponentsProps> = () => {
    const { darkAlgorithm } = theme;
    const { list } = useNavigation();
    const { formProps, saveButtonProps, form } = useForm();
    const [isUploading, setIsUploading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string>("");

    // LOGIKA UPLOAD KE SUPABASE
    const handleUpload = async (options: any) => {
        const { file, onSuccess, onError } = options;
        const fileName = `design-${Date.now()}-${file.name.replace(/\s/g, '-')}`;
        
        setIsUploading(true);
        try {
            const { data, error } = await supabaseClient.storage
                .from('products') // Pastikan bucket 'products' sudah dibuat di Supabase
                .upload(fileName, file);

            if (error) throw error;

            // Ambil Public URL
            const { data: urlData } = supabaseClient.storage
                .from('products')
                .getPublicUrl(fileName);

            const publicUrl = urlData.publicUrl;
            setImageUrl(publicUrl);
            form.setFieldValue("image_url", publicUrl); // Masukkan ke Form
            
            onSuccess("Ok");
            message.success("Foto berhasil diupload!");
        } catch (err: any) {
            console.error(err);
            onError({ err });
            message.error("Gagal upload foto: " + err.message);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <ConfigProvider theme={{ algorithm: darkAlgorithm }}>
            <div className="bg-slate-900 min-h-screen p-6 flex justify-center text-slate-100">
                <div className="w-full max-w-5xl">
                    <Create 
                        saveButtonProps={saveButtonProps} 
                        title={<span className="text-xl font-bold text-white">🎨 Input Desain Bordir Baru</span>}
                        wrapperProps={{ className: "bg-slate-800 border border-slate-700 rounded-xl shadow-2xl" }}
                        footerButtons={
                            <Button 
                                type="primary" 
                                icon={<SaveOutlined />}
                                onClick={() => form.submit()}
                                size="large"
                                className="bg-emerald-600 hover:bg-emerald-500 font-bold border-none"
                            >
                                Simpan Desain
                            </Button>
                        }
                    >
                        <Form {...formProps} layout="vertical">
                            <Row gutter={32}>
                                {/* KOLOM KIRI: FOTO & DATA UMUM */}
                                <Col xs={24} lg={10}>
                                    <Card className="bg-slate-900 border-slate-700 mb-6 text-center">
                                        <div className="mb-4 flex justify-center items-center h-64 bg-slate-800 rounded-lg border-2 border-dashed border-slate-600 overflow-hidden relative group">
                                            {imageUrl ? (
                                                <img src={imageUrl} alt="Preview" className="h-full w-full object-contain" />
                                            ) : (
                                                <div className="text-slate-500">
                                                    <FileImageOutlined style={{ fontSize: 48 }} />
                                                    <p className="mt-2">Preview Foto Desain</p>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <Form.Item name="image_url" hidden><Input /></Form.Item>
                                        
                                        <Upload customRequest={handleUpload} showUploadList={false}>
                                            <Button icon={<UploadOutlined />} loading={isUploading} className="w-full">
                                                {imageUrl ? "Ganti Foto" : "Upload Foto Desain"}
                                            </Button>
                                        </Upload>
                                        <p className="text-xs text-slate-500 mt-2">*Wajib upload agar operator tidak salah gambar</p>
                                    </Card>

                                    <Form.Item
                                        label={<span className="text-slate-300 font-bold">Nama Desain / Produk</span>}
                                        name="name"
                                        rules={[{ required: true, message: "Wajib diisi" }]}
                                    >
                                        <Input placeholder="Contoh: Logo Sekolah Dasar 2025" size="large" />
                                    </Form.Item>

                                    <Form.Item
                                        label={<span className="text-slate-300">Kode SKU (Opsional)</span>}
                                        name="sku"
                                    >
                                        <Input placeholder="Cth: LGO-SD-001" />
                                    </Form.Item>
                                </Col>

                                {/* KOLOM KANAN: SPESIFIKASI TEKNIS */}
                                <Col xs={24} lg={14}>
                                    <Divider orientation="left" className="border-slate-600 text-emerald-400">
                                        <ScissorOutlined /> Spesifikasi Teknis (PENTING)
                                    </Divider>
                                    
                                    <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 mb-6">
                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <Form.Item
                                                    label={<span className="text-slate-400">Jumlah Tusukan (Stitch)</span>}
                                                    name="stitch_count"
                                                    rules={[{ required: true }]}
                                                    help="Menentukan estimasi waktu & biaya"
                                                >
                                                    <InputNumber 
                                                        style={{ width: "100%" }} 
                                                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                        parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                                                        placeholder="Cth: 15,000"
                                                        size="large"
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item
                                                    label={<span className="text-slate-400">Jumlah Warna</span>}
                                                    name="color_count"
                                                    initialValue={1}
                                                >
                                                    <InputNumber 
                                                        style={{ width: "100%" }} 
                                                        prefix={<BgColorsOutlined className="text-slate-500" />}
                                                        min={1}
                                                        size="large"
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <Form.Item label={<span className="text-slate-400">Lebar (cm)</span>} name="width_cm">
                                                     <InputNumber style={{ width: "100%" }} prefix={<ColumnHeightOutlined className="rotate-90 text-slate-500" />} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item label={<span className="text-slate-400">Tinggi (cm)</span>} name="height_cm">
                                                     <InputNumber style={{ width: "100%" }} prefix={<ColumnHeightOutlined className="text-slate-500" />} />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </div>

                                    <Divider orientation="left" className="border-slate-600 text-blue-400">
                                        💰 Keuangan
                                    </Divider>

                                    <div className="bg-blue-900/10 p-6 rounded-xl border border-blue-500/20">
                                        <Form.Item
                                            label={<span className="text-slate-200 font-bold">Upah Operator (Per Pcs)</span>}
                                            name="wage_per_piece"
                                            rules={[{ required: true }]}
                                            extra={<span className="text-slate-400 text-xs">Gaji yang diterima pegawai setiap 1 pcs selesai & lolos QC.</span>}
                                        >
                                            <InputNumber 
                                                style={{ width: "100%" }}
                                                formatter={(value) => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                                                parser={(value) => value!.replace(/\Rp\s?|(\.*)/g, '')}
                                                size="large"
                                                className="font-bold text-emerald-400 bg-slate-800"
                                            />
                                        </Form.Item>
                                        
                                        <Form.Item
                                            label={<span className="text-slate-300">Harga Jual ke Pelanggan (Estimasi)</span>}
                                            name="base_price"
                                        >
                                            <InputNumber 
                                                style={{ width: "100%" }}
                                                formatter={(value) => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                                                parser={(value) => value!.replace(/\Rp\s?|(\.*)/g, '')}
                                            />
                                        </Form.Item>
                                    </div>
                                </Col>
                            </Row>
                        </Form>
                    </Create>
                </div>
            </div>
        </ConfigProvider>
    );
};
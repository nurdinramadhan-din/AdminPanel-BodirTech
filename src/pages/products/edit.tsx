import React, { useState, useEffect } from "react";
import { IResourceComponentsProps } from "@refinedev/core";
import { Edit, useForm } from "@refinedev/antd";
import { 
    Form, Input, InputNumber, Row, Col, Divider, 
    Upload, Button, message, ConfigProvider, theme, Card 
} from "antd";
import { 
    UploadOutlined, ScissorOutlined, BgColorsOutlined, 
    ColumnHeightOutlined, SaveOutlined
} from "@ant-design/icons";
import { supabaseClient } from "../../utility";

export const ProductEdit: React.FC<IResourceComponentsProps> = () => {
    const { darkAlgorithm } = theme;
    const { formProps, saveButtonProps, queryResult, form } = useForm();
    const [isUploading, setIsUploading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string>("");

    // Load gambar lama saat data database masuk
    const productData = queryResult?.data?.data;
    useEffect(() => {
        if (productData?.image_url) {
            setImageUrl(productData.image_url);
        }
    }, [productData]);

    const handleUpload = async (options: any) => {
        const { file, onSuccess, onError } = options;
        const fileName = `design-${Date.now()}-${file.name.replace(/\s/g, '-')}`;
        setIsUploading(true);
        try {
            const { data, error } = await supabaseClient.storage.from('products').upload(fileName, file);
            if (error) throw error;
            const { data: urlData } = supabaseClient.storage.from('products').getPublicUrl(fileName);
            setImageUrl(urlData.publicUrl);
            form.setFieldValue("image_url", urlData.publicUrl);
            onSuccess("Ok");
            message.success("Foto diperbarui!");
        } catch (err: any) {
            onError({ err });
            message.error("Gagal upload: " + err.message);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <ConfigProvider theme={{ algorithm: darkAlgorithm }}>
            <div className="bg-slate-900 min-h-screen p-6 flex justify-center text-slate-100">
                <div className="w-full max-w-5xl">
                    <Edit 
                        saveButtonProps={saveButtonProps} 
                        title={<span className="text-xl font-bold text-white">✏️ Edit Spesifikasi Desain</span>}
                        wrapperProps={{ className: "bg-slate-800 border border-slate-700 rounded-xl shadow-2xl" }}
                        footerButtons={
                            <Button 
                                type="primary" 
                                icon={<SaveOutlined />}
                                onClick={() => form.submit()}
                                size="large"
                                className="bg-emerald-600 hover:bg-emerald-500 font-bold border-none"
                            >
                                Simpan Perubahan
                            </Button>
                        }
                    >
                        <Form {...formProps} layout="vertical">
                            <Row gutter={32}>
                                <Col xs={24} lg={10}>
                                    <Card className="bg-slate-900 border-slate-700 mb-6 text-center">
                                        <div className="mb-4 flex justify-center items-center h-64 bg-slate-800 rounded-lg border-2 border-dashed border-slate-600 overflow-hidden">
                                            {imageUrl ? (
                                                <img src={imageUrl} alt="Preview" className="h-full w-full object-contain" />
                                            ) : <span className="text-slate-500">Tidak ada foto</span>}
                                        </div>
                                        <Form.Item name="image_url" hidden><Input /></Form.Item>
                                        <Upload customRequest={handleUpload} showUploadList={false}>
                                            <Button icon={<UploadOutlined />} loading={isUploading} className="w-full">
                                                Ganti Foto
                                            </Button>
                                        </Upload>
                                    </Card>
                                    <Form.Item label={<span className="text-slate-300">Nama Desain</span>} name="name" rules={[{ required: true }]}>
                                        <Input size="large" />
                                    </Form.Item>
                                    <Form.Item label={<span className="text-slate-300">SKU</span>} name="sku"><Input /></Form.Item>
                                </Col>

                                <Col xs={24} lg={14}>
                                    <Divider orientation="left" className="border-slate-600 text-emerald-400">
                                        <ScissorOutlined /> Update Teknis
                                    </Divider>
                                    <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 mb-6">
                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <Form.Item label={<span className="text-slate-400">Stitch Count</span>} name="stitch_count" rules={[{ required: true }]}>
                                                    <InputNumber style={{ width: "100%" }} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={v => v!.replace(/\$\s?|(,*)/g, '')} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item label={<span className="text-slate-400">Warna</span>} name="color_count"><InputNumber style={{ width: "100%" }} prefix={<BgColorsOutlined />} /></Form.Item>
                                            </Col>
                                        </Row>
                                        <Row gutter={16}>
                                            <Col span={12}><Form.Item label="Lebar (cm)" name="width_cm"><InputNumber style={{ width: "100%" }} prefix={<ColumnHeightOutlined className="rotate-90" />} /></Form.Item></Col>
                                            <Col span={12}><Form.Item label="Tinggi (cm)" name="height_cm"><InputNumber style={{ width: "100%" }} prefix={<ColumnHeightOutlined />} /></Form.Item></Col>
                                        </Row>
                                    </div>

                                    <div className="bg-blue-900/10 p-6 rounded-xl border border-blue-500/20">
                                        <Form.Item label={<span className="text-slate-200">Upah Operator (Per Pcs)</span>} name="wage_per_piece" rules={[{ required: true }]}>
                                            <InputNumber style={{ width: "100%" }} formatter={v => `Rp ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')} parser={v => v!.replace(/\Rp\s?|(\.*)/g, '')} size="large" className="font-bold text-emerald-400 bg-slate-800" />
                                        </Form.Item>
                                        <Form.Item label={<span className="text-slate-300">Harga Jual</span>} name="base_price"><InputNumber style={{ width: "100%" }} formatter={v => `Rp ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')} parser={v => v!.replace(/\Rp\s?|(\.*)/g, '')} /></Form.Item>
                                    </div>
                                </Col>
                            </Row>
                        </Form>
                    </Edit>
                </div>
            </div>
        </ConfigProvider>
    );
};
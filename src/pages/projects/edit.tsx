import React, { useState, useEffect } from "react";
import { IResourceComponentsProps, useList, useNavigation } from "@refinedev/core";
import { Edit, useForm, useSelect } from "@refinedev/antd";
import { 
    Form, Input, Select, InputNumber, Row, Col, 
    Card, DatePicker, Alert, Progress, Tag, ConfigProvider, theme 
} from "antd";
import dayjs from "dayjs";
import { LockOutlined, UnlockOutlined, InfoCircleOutlined } from "@ant-design/icons";

export const ProjectEdit: React.FC<IResourceComponentsProps> = () => {
    const { darkAlgorithm } = theme;
    const { list } = useNavigation();
    
    // 1. Ambil Data Project
    const { formProps, saveButtonProps, queryResult, form } = useForm();
    const projectData = queryResult?.data?.data;

    // 2. Cek Progress Produksi (Untuk Fitur Lock)
    const { data: bundleData, isLoading: loadingBundles } = useList({
        resource: "spk_bundles",
        filters: [{ field: "project_id", operator: "eq", value: projectData?.id }],
        pagination: { mode: "off" },
        queryOptions: { enabled: !!projectData?.id } // Hanya jalan jika project id ada
    });

    const bundles = bundleData?.data || [];
    const totalBundles = bundles.length;
    const finishedBundles = bundles.filter((b: any) => b.status === 'DONE').length;
    
    // Hitung Persentase
    const progressPercent = totalBundles > 0 
        ? Math.round((finishedBundles / totalBundles) * 100) 
        : 0;

    // LOGIKA PENGUNCIAN (SECURITY)
    // Kunci total jika: Status DONE atau Progress 100%
    const isLocked = projectData?.status === 'DONE' || (totalBundles > 0 && progressPercent === 100);
    
    // Kunci parsial (Qty tidak boleh ubah) jika: Produksi sudah dimulai (ada yang in_progress/done)
    const isProductionStarted = bundles.some((b: any) => b.status !== 'NEW');

    return (
        <ConfigProvider theme={{ algorithm: darkAlgorithm }}>
            <div className="bg-slate-900 min-h-screen p-6 flex justify-center text-slate-100">
                <div className="w-full max-w-4xl">
                    <Edit 
                        saveButtonProps={isLocked ? { disabled: true, style: { display: 'none' } } : saveButtonProps} 
                        title={
                            <div className="flex items-center gap-3">
                                <span className="text-xl font-bold text-white">
                                    {isLocked ? "🔒 SPK Terkunci (Selesai)" : "✏️ Edit SPK Produksi"}
                                </span>
                                {isLocked && <Tag color="red">READ ONLY</Tag>}
                            </div>
                        }
                        wrapperProps={{ className: "bg-slate-800 border border-slate-700 rounded-xl" }}
                    >
                        {/* ALERT STATUS */}
                        {isLocked ? (
                            <Alert 
                                message="Produksi Selesai" 
                                description="Data tidak dapat diubah karena seluruh bundle telah selesai diproduksi (100%). Hubungi Super Admin jika ada kesalahan fatal." 
                                type="error" 
                                showIcon 
                                icon={<LockOutlined />}
                                className="mb-6 bg-red-900/20 border-red-500/30 text-red-200"
                            />
                        ) : isProductionStarted ? (
                            <Alert 
                                message="Produksi Sedang Berjalan" 
                                description="Jumlah Qty & Desain dikunci demi keamanan data QR Code. Anda hanya bisa mengubah Judul, Deadline, & Status." 
                                type="warning" 
                                showIcon 
                                className="mb-6 bg-amber-900/20 border-amber-500/30 text-amber-200"
                            />
                        ) : null}

                        <Form {...formProps} layout="vertical">
                            <Card className="bg-slate-800 border-slate-700 mb-6">
                                <Row gutter={24}>
                                    <Col span={12}>
                                        <Form.Item 
                                            label={<span className="text-slate-300">Judul Order</span>} 
                                            name="title" 
                                            rules={[{ required: true }]}
                                        >
                                            <Input disabled={isLocked} size="large" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item 
                                            label={<span className="text-slate-300">Status Project</span>} 
                                            name="status"
                                        >
                                            <Select 
                                                disabled={isLocked}
                                                size="large"
                                                options={[
                                                    { value: 'NEW', label: 'Baru / Draft' },
                                                    { value: 'IN_PROGRESS', label: 'Sedang Berjalan' },
                                                    { value: 'DONE', label: 'Selesai (Arsipkan)' }, // Hati-hati memilih ini
                                                ]} 
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Row gutter={24}>
                                    <Col span={12}>
                                        <Form.Item 
                                            label={<span className="text-slate-300">Deadline</span>} 
                                            name="deadline" 
                                            getValueProps={(value) => ({ value: value ? dayjs(value) : "" })}
                                        >
                                            <DatePicker disabled={isLocked} style={{ width: "100%" }} format="DD/MM/YYYY" size="large" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item 
                                            label={<span className="text-slate-300">Total Quantity</span>} 
                                            name="total_quantity"
                                        >
                                            <InputNumber 
                                                style={{ width: "100%" }} 
                                                disabled={isLocked || isProductionStarted} // Dikunci jika produksi jalan
                                                size="large"
                                                className={isProductionStarted ? "bg-slate-700 text-slate-500 cursor-not-allowed" : ""}
                                            />
                                        </Form.Item>
                                        {isProductionStarted && !isLocked && (
                                            <p className="text-xs text-amber-400 mt-1">
                                                *Qty dikunci karena QR Code sudah digenerate/diproses.
                                            </p>
                                        )}
                                    </Col>
                                </Row>

                                {/* PROGRESS BAR VISUAL */}
                                <div className="mt-4 p-4 bg-slate-900 rounded-lg border border-slate-700">
                                    <div className="flex justify-between mb-2 text-xs text-slate-400">
                                        <span>Progress Lapangan</span>
                                        <span>{finishedBundles} / {totalBundles} Bundle Selesai</span>
                                    </div>
                                    <Progress 
                                        percent={progressPercent} 
                                        status={progressPercent === 100 ? "success" : "active"} 
                                        strokeColor={{ '0%': '#10B981', '100%': '#059669' }}
                                    />
                                </div>
                            </Card>
                        </Form>
                    </Edit>
                </div>
            </div>
        </ConfigProvider>
    );
};
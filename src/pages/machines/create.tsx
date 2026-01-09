import React from "react";
import { IResourceComponentsProps, useNavigation } from "@refinedev/core";
import { Create, useForm } from "@refinedev/antd";
import { 
    Form, Input, Select, Row, Col, Card, Alert, 
    ConfigProvider, theme, InputNumber 
} from "antd";
import { 
    DatabaseOutlined, 
    InfoCircleOutlined, 
    SettingOutlined,
    RocketOutlined 
} from "@ant-design/icons";

export const MachineCreate: React.FC<IResourceComponentsProps> = () => {
    const { darkAlgorithm } = theme;
    const { list } = useNavigation();
    const { formProps, saveButtonProps } = useForm();

    return (
        <ConfigProvider theme={{ algorithm: darkAlgorithm }}>
            <div className="bg-slate-900 min-h-screen p-6 flex justify-center text-slate-100">
                <div className="w-full max-w-3xl">
                    <Create 
                        saveButtonProps={saveButtonProps} 
                        title={<span className="text-xl font-bold text-white font-mono">⚙️ Registrasi Mesin Baru</span>}
                        wrapperProps={{ className: "bg-slate-800 border border-slate-700 rounded-xl shadow-2xl" }}
                    >
                        <Form 
                            {...formProps} 
                            layout="vertical" 
                            initialValues={{ 
                                status: 'IDLE',
                                type: 'BORDIR_COMPUTER'
                            }}
                        >
                            <Alert 
                                message="Setup Awal Mesin" 
                                description="Pastikan Nama/Kode Mesin unik (Contoh: M-01) untuk memudahkan sinkronisasi dengan alat IoT atau Scanner Mandor nanti." 
                                type="info" 
                                showIcon 
                                icon={<InfoCircleOutlined />}
                                className="mb-6 bg-blue-900/20 border-blue-500/30 text-blue-200" 
                            />

                            <Card 
                                className="bg-slate-800 border-slate-700 mb-6" 
                                title={<span className="text-emerald-400 font-bold"><DatabaseOutlined /> Identitas Mesin</span>}
                            >
                                <Row gutter={24}>
                                    <Col span={12}>
                                        <Form.Item 
                                            label={<span className="text-slate-300">Nama / Kode Mesin</span>} 
                                            name="name" 
                                            rules={[{ required: true, message: "Contoh: Mesin A-01" }]}
                                        >
                                            <Input placeholder="Cth: Mesin 01" size="large" className="bg-slate-900 border-slate-600 text-white" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item 
                                            label={<span className="text-slate-300">Tipe Mesin</span>} 
                                            name="type"
                                        >
                                            <Select size="large" options={[
                                                { value: 'BORDIR_COMPUTER', label: 'Bordir Komputer' },
                                                { value: 'JAHIT_HIGH_SPEED', label: 'Jahit High Speed' },
                                                { value: 'POTONG_LASER', label: 'Cutting Laser' },
                                            ]} />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Row gutter={24}>
                                    <Col span={12}>
                                        <Form.Item 
                                            label={<span className="text-slate-300">Jumlah Kepala (Heads)</span>} 
                                            name="heads_count"
                                        >
                                            <InputNumber min={1} style={{ width: "100%" }} placeholder="Cth: 12" size="large" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item 
                                            label={<span className="text-slate-300">Status Awal</span>} 
                                            name="status"
                                        >
                                            <Select size="large" options={[
                                                { value: 'IDLE', label: 'Ready (Siap Pakai)' },
                                                { value: 'MAINTENANCE', label: 'Dalam Perbaikan' }
                                            ]} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Card>

                            <Card 
                                className="bg-slate-800 border-slate-700" 
                                title={<span className="text-blue-400 font-bold"><SettingOutlined /> Konfigurasi IoT (Opsional)</span>}
                            >
                                <Form.Item 
                                    label={<span className="text-slate-300">Serial Number / Mac Address</span>} 
                                    name="serial_number"
                                    help="Kosongkan jika belum ada alat IoT terpasang."
                                >
                                    <Input placeholder="Cth: SN-9920-XXX" size="large" className="bg-slate-900 border-slate-600 text-white" />
                                </Form.Item>
                            </Card>
                        </Form>
                    </Create>
                </div>
            </div>
        </ConfigProvider>
    );
};
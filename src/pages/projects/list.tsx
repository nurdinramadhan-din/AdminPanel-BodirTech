import React from "react";
import { useNavigation, useDelete } from "@refinedev/core";
import { useTable } from "@refinedev/antd";
import { 
    Table, Tag, Button, Input, Form, Card, Space, 
    ConfigProvider, theme, Tooltip 
} from "antd";
import { 
    PlusOutlined, SearchOutlined, EyeOutlined,
    EditOutlined, DeleteOutlined, CalendarOutlined,
    UserOutlined, SkinOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";

export const ProjectList = () => {
    const { darkAlgorithm } = theme;
    const { create, edit, show } = useNavigation();
    const { mutate: deleteItem } = useDelete();

    // Resource: "projects"
    const { tableProps, searchFormProps } = useTable({
        resource: "projects",
        sorters: { initial: [{ field: "created_at", order: "desc" }] },
        pagination: { pageSize: 10 },
        liveMode: "auto",
        meta: {
            select: "*, customers(name), products(name)"
        },
        onSearch: (values: any) => [{
            field: "title",
            operator: "contains",
            value: values.title,
        }],
    });

    const getStatusColor = (status: string) => {
        if (status === 'DONE') return 'success';
        if (status === 'IN_PROGRESS') return 'processing';
        return 'default';
    };

    return (
        <ConfigProvider theme={{ algorithm: darkAlgorithm }}>
            <div className="bg-slate-900 min-h-screen p-6 text-slate-100">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white">📋 Daftar SPK Produksi</h1>
                        <p className="text-slate-400">Kelola order, deadline, dan QR Code.</p>
                    </div>
                    <Button 
                        type="primary" icon={<PlusOutlined />} onClick={() => create("projects")} 
                        size="large" className="bg-emerald-600 font-bold border-none"
                    >
                        Buat SPK Baru
                    </Button>
                </div>

                <Card className="bg-slate-800 border-slate-700 mb-6" bodyStyle={{ padding: '12px' }}>
                    <Form {...searchFormProps} layout="inline" className="w-full">
                        <Form.Item name="title" className="flex-1 mb-0">
                            <Input prefix={<SearchOutlined />} placeholder="Cari Order..." className="bg-slate-900 border-slate-600 text-white" />
                        </Form.Item>
                        <Button type="primary" htmlType="submit">Cari</Button>
                    </Form>
                </Card>

                <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                    <Table {...tableProps} rowKey="id" pagination={{ className: "pb-4" }}>
                        <Table.Column title="Detail Order" render={(_, r: any) => (
                            <div>
                                <div className="font-bold text-lg text-white">{r.title}</div>
                                <div className="text-xs text-slate-400 flex gap-2">
                                    <span><UserOutlined/> {r.customers?.name}</span>
                                    <span><SkinOutlined/> {r.products?.name}</span>
                                </div>
                            </div>
                        )} />
                        <Table.Column title="Target" render={(_, r: any) => (
                            <div>
                                <div className="font-bold text-emerald-400">{Number(r.total_quantity).toLocaleString()} Pcs</div>
                                <div className="text-xs text-slate-500"><CalendarOutlined/> {r.deadline ? dayjs(r.deadline).format("DD MMM YYYY") : "-"}</div>
                            </div>
                        )} />
                        <Table.Column dataIndex="status" title="Status" render={(v) => <Tag color={getStatusColor(v)}>{v}</Tag>} />
                        <Table.Column title="Aksi" render={(_, r: any) => (
                            <Space>
                                <Tooltip title="Lihat QR"><Button icon={<EyeOutlined />} onClick={() => show("projects", r.id)} className="bg-blue-600 text-white border-none" /></Tooltip>
                                <Button icon={<EditOutlined />} onClick={() => edit("projects", r.id)} />
                                <Button danger icon={<DeleteOutlined />} onClick={() => deleteItem({ resource: "projects", id: r.id })} />
                            </Space>
                        )} />
                    </Table>
                </div>
            </div>
        </ConfigProvider>
    );
};
import React from "react";
import { useList } from "@refinedev/core";
import { Card, List, Avatar, Tag, Alert, Progress, Tooltip } from "antd";
import { 
    TrophyOutlined, 
    AlertOutlined, 
    RobotOutlined, 
    DashboardOutlined,
    CheckCircleFilled,
    WarningFilled
} from "@ant-design/icons";

export const AIInsightWidget = () => {
    // 1. Ambil Data Top Worker
    const { data: topWorkers, isLoading: loadWorkers } = useList({
        resource: "view_ai_top_workers",
        pagination: { mode: "off" },
        liveMode: "auto",
    });

    // 2. Ambil Data Kesehatan Mesin
    const { data: machineHealth, isLoading: loadMachines } = useList({
        resource: "view_ai_machine_health",
        pagination: { mode: "off" },
        liveMode: "auto",
    });

    // 3. Ambil Risiko Project
    const { data: projectRisks, isLoading: loadRisks } = useList({
        resource: "view_ai_project_risks",
        pagination: { mode: "off" },
        liveMode: "auto",
    });

    // LOGIC AI DETEKSI MASALAH
    const machines = machineHealth?.data || [];
    
    // Mesin dianggap bermasalah jika Status SAAT INI bukan IDLE/RUNNING, ATAU Skor kesehatan rendah
    const brokenMachines = machines.filter((m:any) => 
        (m.current_status !== 'IDLE' && m.current_status !== 'RUNNING') || m.health_score < 60
    );

    const riskyProjects = projectRisks?.data?.filter((p:any) => p.risk_level !== 'SAFE') || [];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* 1. PEGAWAI TELADAN */}
            <Card 
                title={<span className="text-emerald-400 font-bold"><TrophyOutlined /> Top Performance</span>}
                className="bg-slate-800 border-slate-700 shadow-lg h-full"
                loading={loadWorkers}
            >
                <List
                    itemLayout="horizontal"
                    dataSource={topWorkers?.data || []}
                    renderItem={(item: any, index) => (
                        <List.Item className="border-b border-slate-700 last:border-0 py-3">
                            <List.Item.Meta
                                avatar={
                                    <div className="relative">
                                        <Avatar src={item.avatar} icon={<RobotOutlined />} size="large" className="bg-slate-700" />
                                        {index === 0 && <div className="absolute -top-2 -right-2 text-lg">👑</div>}
                                    </div>
                                }
                                title={<span className="text-white font-bold">{item.full_name}</span>}
                                description={
                                    <div className="text-xs text-slate-400">
                                        <span className="text-emerald-400 font-bold">{item.total_qty_done} Pcs</span> • {item.total_bundles_done} Bundle
                                    </div>
                                }
                            />
                            <div className="text-right">
                                <Tag color="gold" className="mr-0">Rp {Number(item.weekly_income).toLocaleString()}</Tag>
                            </div>
                        </List.Item>
                    )}
                />
            </Card>

            {/* 2. KESEHATAN MESIN (REALTIME ERROR) */}
            <Card 
                title={<span className="text-blue-400 font-bold"><DashboardOutlined /> Kondisi Mesin</span>}
                className="bg-slate-800 border-slate-700 shadow-lg h-full"
                loading={loadMachines}
            >
                {brokenMachines.length > 0 ? (
                    <Alert 
                        message="PERINGATAN MESIN" 
                        description={
                            <ul className="pl-4 list-disc text-xs mt-1">
                                {brokenMachines.map((m:any) => (
                                    <li key={m.machine_id}>
                                        <b>{m.machine_name}:</b> {m.current_status} (Skor: {m.health_score}%)
                                    </li>
                                ))}
                            </ul>
                        }
                        type="error" 
                        showIcon 
                        className="mb-4 bg-red-900/20 border-red-600/30 text-red-200"
                    />
                ) : (
                    <Alert 
                        message="Operasional Normal" 
                        description="Semua mesin berjalan optimal." 
                        type="success" 
                        showIcon 
                        className="mb-4 bg-emerald-900/20 border-emerald-600/30 text-emerald-200" 
                    />
                )}

                <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                    {machines.map((m: any) => {
                        const isError = m.current_status !== 'IDLE' && m.current_status !== 'RUNNING';
                        return (
                            <div key={m.machine_id} className="flex items-center gap-3 bg-slate-900/50 p-2 rounded border border-slate-700">
                                <Tooltip title={m.current_status}>
                                    {isError ? <WarningFilled className="text-red-500" /> : <CheckCircleFilled className="text-emerald-500" />}
                                </Tooltip>
                                <div className="flex-1">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className={`font-bold ${isError ? 'text-red-400' : 'text-white'}`}>{m.machine_name}</span>
                                        <span className="text-slate-500">{m.current_status}</span>
                                    </div>
                                    <Progress 
                                        percent={m.health_score} 
                                        steps={10} 
                                        size="small" 
                                        strokeColor={m.health_score < 60 ? '#ef4444' : '#10b981'} 
                                        showInfo={false}
                                        trailColor="#1e293b"
                                    />
                                </div>
                                <div className="text-xs font-mono w-8 text-right text-slate-400">{m.health_score}%</div>
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* 3. RISIKO PROJECT */}
            <Card 
                title={<span className="text-amber-400 font-bold"><AlertOutlined /> Risiko Deadline</span>}
                className="bg-slate-800 border-slate-700 shadow-lg h-full"
                loading={loadRisks}
            >
                {riskyProjects.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 py-10">
                        <CheckCircleFilled className="text-5xl text-emerald-500/20 mb-3" />
                        <p>Jadwal Aman Terkendali</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {riskyProjects.map((item: any) => (
                            <div key={item.title} className="bg-slate-900/50 p-3 rounded border border-l-4 border-slate-700 border-l-orange-500">
                                <div className="flex justify-between mb-1">
                                    <span className="text-white font-bold text-sm truncate w-32">{item.title}</span>
                                    <Tag color={item.risk_level === 'OVERDUE' ? 'red' : 'orange'}>
                                        {item.risk_level}
                                    </Tag>
                                </div>
                                <div className="flex justify-between text-xs text-slate-400">
                                    <span>Sisa: {item.days_left} Hari</span>
                                    <span>Done: {Math.round((item.done_qty / item.total_quantity) * 100)}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
};
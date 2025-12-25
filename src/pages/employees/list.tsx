import React from "react";
import {
  List,
  useTable,
  EditButton,
  ShowButton,
  DeleteButton,
  TagField,
  EmailField,
  CreateButton, // ✅ 1. IMPORT CREATE BUTTON
} from "@refinedev/antd";
import { Table, Space, Avatar, Tag, Typography } from "antd";
import { 
  User, 
  Smartphone, 
  ShieldCheck, 
  ShieldAlert,
  Wallet,
  Plus // ✅ 2. IMPORT ICON PLUS
} from "lucide-react";
import { BaseRecord } from "@refinedev/core";

const { Text } = Typography;

interface IEmployee {
  user_id: string;
  full_name: string;
  role: string;
  phone: string;
  email: string;
  device_id: string | null;
  is_active: boolean;
  current_balance: number;
}

export const EmployeeList = () => {
  const { tableProps } = useTable<IEmployee>({
    resource: "view_employee_payroll", 
    syncWithLocation: true,
    sorters: {
        initial: [
            {
                field: "full_name",
                order: "asc",
            },
        ],
    },
  });

  return (
    <List 
        title={<span className="text-xl font-bold text-white">👥 Data Pegawai & Mandor</span>}
        wrapperProps={{ className: "bg-[#1e293b] border-none" }}
        // ✅ 3. TAMBAHKAN BAGIAN HEADER BUTTONS INI
        headerButtons={
            <CreateButton 
                resource="employees" // Mengarah ke route 'employees/create'
                className="bg-emerald-500 hover:bg-emerald-600 border-none text-white font-bold flex items-center shadow-lg shadow-emerald-900/20"
                icon={<Plus size={18} className="mr-1" />}
            >
                Tambah Pegawai
            </CreateButton>
        }
    >
      <Table 
        {...tableProps} 
        rowKey="user_id"
        rowClassName="bg-[#1e293b] text-slate-300 hover:bg-[#0f172a]"
      >
        
        {/* KOLOM 1: NAMA PEGAWAI */}
        <Table.Column
          dataIndex="full_name"
          title="Nama Pegawai"
          render={(value, record: IEmployee) => (
            <div className="flex items-center gap-3">
              <Avatar 
                style={{ backgroundColor: record.role === 'mandor' ? '#f59e0b' : '#10b981' }} 
                icon={<User size={16} />} 
              />
              <div className="flex flex-col">
                <span className="font-bold text-white">{value}</span>
                <span className="text-xs text-slate-400">{record.email || '-'}</span>
              </div>
            </div>
          )}
        />

        {/* KOLOM 2: JABATAN / ROLE */}
        <Table.Column
          dataIndex="role"
          title="Jabatan"
          render={(value) => {
            let color = "default";
            let label = value;

            if (value === "mandor") {
                color = "gold"; 
                label = "MANDOR";
            } else if (value === "worker" || value === "operator") {
                color = "cyan";
                label = "OPERATOR";
            }

            return <Tag color={color} className="font-bold">{label}</Tag>;
          }}
        />

        {/* KOLOM 3: SECURITY (DEVICE ID) */}
        <Table.Column
          dataIndex="device_id"
          title="Security Check"
          render={(value) => (
            <div className="flex items-center">
                {value ? (
                    <Tag icon={<Smartphone size={14} className="mr-1"/>} color="success" className="flex items-center border-0 bg-emerald-900/30 text-emerald-400">
                        HP Terkunci
                    </Tag>
                ) : (
                    <Tag icon={<ShieldAlert size={14} className="mr-1"/>} color="default" className="flex items-center border-0 bg-slate-700 text-slate-400">
                        Belum Login
                    </Tag>
                )}
            </div>
          )}
        />

        {/* KOLOM 4: SALDO BERJALAN */}
        <Table.Column
            dataIndex="current_balance"
            title="Saldo Gaji"
            align="right"
            render={(value) => (
                <div className="flex items-center justify-end gap-2 text-emerald-400 font-mono font-bold">
                    <Wallet size={14} />
                    {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        maximumFractionDigits: 0
                    }).format(value)}
                </div>
            )}
        />

        {/* KOLOM 5: STATUS AKTIF */}
        <Table.Column
          dataIndex="is_active"
          title="Status"
          render={(value) => (
            <Tag color={value ? "green" : "red"}>
              {value ? "Aktif" : "Resign"}
            </Tag>
          )}
        />

        {/* TAMBAHAN: KOLOM KONTAK (HP) */}
        <Table.Column
          dataIndex="phone"
          title="Kontak"
          render={(value) => (
            <div className="text-slate-400 text-xs">
              {value || '-'}
            </div>
          )}
        />

        {/* TAMBAHAN: KOLOM PIN (RAHASIA) */}
        <Table.Column
          dataIndex="pin_code"
          title="PIN Akses"
          render={(value) => (
             <Tag className="font-mono bg-slate-800 border-slate-700 text-slate-300">
                {value || '******'}
             </Tag>
          )}
        />

        {/* KOLOM 6: ACTIONS */}
        <Table.Column
          title="Aksi"
          dataIndex="actions"
          render={(_, record: BaseRecord) => (
            <Space>
              <EditButton 
                hideText 
                size="small" 
                recordItemId={record.user_id} 
                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600 hover:border-slate-500 hover:text-white"
              />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
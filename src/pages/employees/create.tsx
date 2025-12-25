import React, { useState } from "react";
import { Create, useForm } from "@refinedev/antd";
import { Form, Input, Select, Button, message, Card, Alert } from "antd";
import { useGetIdentity, useGo } from "@refinedev/core";
import { supabaseClient } from "../../utility";
import { User, Lock, Smartphone, Hash } from "lucide-react";

export const EmployeeCreate = () => {
  const [loading, setLoading] = useState(false);
  const { data: adminUser } = useGetIdentity<any>(); // Ambil data Admin yg sedang login
  const go = useGo(); // Untuk redirect setelah sukses
  const [form] = Form.useForm();

  const handleRegister = async (values: any) => {
    setLoading(true);
    
    // 1. Validasi: Pastikan Admin punya Organization ID
    const orgId = adminUser?.organization_id;
    if (!orgId) {
        message.error("Gagal: Akun Admin tidak memiliki Organization ID.");
        setLoading(false);
        return;
    }

    try {
        // 2. Buat User di Supabase Auth (Email & Password)
        const { data: authData, error: authError } = await supabaseClient.auth.signUp({
            email: values.email,
            password: values.password,
            options: {
                data: {
                    full_name: values.full_name, // Simpan nama di metadata juga
                }
            }
        });

        if (authError) throw authError;

        if (authData.user) {
            // 3. Masukkan Data Lengkap ke Tabel 'profiles'
            const { error: profileError } = await supabaseClient
                .from("profiles")
                .insert({
                    id: authData.user.id, // ID ini HARUS sama dengan Auth ID
                    organization_id: orgId,
                    full_name: values.full_name,
                    role: values.role, // 'mandor' atau 'operator'
                    pin_code: values.pin_code, // PIN untuk login cepat di HP
                    phone: values.phone,
                    is_active: true
                });

            if (profileError) {
                // Jika gagal insert profile, peringatkan (Idealnya rollback auth, tapi manual dulu)
                console.error("Profile Error:", profileError);
                throw new Error("Gagal membuat Profile: " + profileError.message);
            }

            message.success("Pegawai berhasil didaftarkan!");
            go({ to: "/employees" }); // Kembali ke list pegawai
        }

    } catch (error: any) {
        message.error(error.message || "Terjadi kesalahan saat pendaftaran.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
        <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">Tambah Pegawai Baru</h1>
            <p className="text-slate-400">Daftarkan Mandor atau Operator Pabrik.</p>
        </div>

        <Card className="bg-[#1e293b] border-slate-700" bordered={false}>
            <Alert 
                message="Info Penting" 
                description="Email & Password digunakan untuk Login pertama kali. PIN Code digunakan untuk login cepat sehari-hari di aplikasi HP."
                type="info" 
                showIcon 
                className="mb-6 bg-blue-900/20 border-blue-800 text-blue-200"
            />

            <Form
                form={form}
                layout="vertical"
                onFinish={handleRegister}
                requiredMark={false}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* BAGIAN 1: AKUN LOGIN */}
                    <div className="space-y-4">
                        <h3 className="text-white font-bold border-b border-slate-600 pb-2 mb-4">1. Akun Login</h3>
                        
                        <Form.Item
                            label={<span className="text-slate-300">Email Pegawai</span>}
                            name="email"
                            rules={[{ required: true, type: "email", message: "Email wajib diisi" }]}
                        >
                            <Input prefix={<User size={16} />} placeholder="contoh: budi@pabrik.com" className="bg-[#0f172a] border-slate-600 text-white" />
                        </Form.Item>

                        <Form.Item
                            label={<span className="text-slate-300">Password</span>}
                            name="password"
                            rules={[{ required: true, min: 6, message: "Minimal 6 karakter" }]}
                        >
                            <Input.Password prefix={<Lock size={16} />} placeholder="Rahasia123" className="bg-[#0f172a] border-slate-600 text-white" />
                        </Form.Item>

                         <Form.Item
                            label={<span className="text-slate-300">PIN Code (6 Angka)</span>}
                            name="pin_code"
                            rules={[{ required: true, len: 6, message: "Harus 6 angka" }]}
                        >
                            <Input prefix={<Hash size={16} />} placeholder="123456" maxLength={6} className="bg-[#0f172a] border-slate-600 text-white" />
                        </Form.Item>
                    </div>

                    {/* BAGIAN 2: DATA DIRI */}
                    <div className="space-y-4">
                        <h3 className="text-white font-bold border-b border-slate-600 pb-2 mb-4">2. Data Diri & Jabatan</h3>

                        <Form.Item
                            label={<span className="text-slate-300">Nama Lengkap</span>}
                            name="full_name"
                            rules={[{ required: true, message: "Nama wajib diisi" }]}
                        >
                            <Input placeholder="Nama Sesuai KTP" className="bg-[#0f172a] border-slate-600 text-white" />
                        </Form.Item>

                        <Form.Item
                            label={<span className="text-slate-300">Jabatan / Role</span>}
                            name="role"
                            initialValue="worker"
                            rules={[{ required: true }]}
                        >
                            <Select className="h-10" popupClassName="bg-slate-800">
                                <Select.Option value="worker">Operator (Buruh Jahit)</Select.Option>
                                <Select.Option value="mandor">Mandor (Supervisor)</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label={<span className="text-slate-300">No HP (WhatsApp)</span>}
                            name="phone"
                            rules={[{ required: true, message: "No HP wajib diisi" }]}
                        >
                            <Input prefix={<Smartphone size={16} />} placeholder="0812..." className="bg-[#0f172a] border-slate-600 text-white" />
                        </Form.Item>
                    </div>
                </div>

                <div className="flex justify-end mt-8 border-t border-slate-700 pt-6">
                    <Button 
                        htmlType="submit" 
                        loading={loading}
                        type="primary"
                        className="bg-emerald-500 hover:bg-emerald-600 h-10 px-8 font-bold"
                    >
                        Simpan & Daftarkan
                    </Button>
                </div>
            </Form>
        </Card>
    </div>
  );
};
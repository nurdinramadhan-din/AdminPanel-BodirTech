import React from "react";
import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Select, Button, Alert, message } from "antd";
import { Smartphone, Lock, User, Phone, ShieldAlert, RotateCcw } from "lucide-react";
import { useParams } from "react-router-dom"; // ✅ 1. IMPORT USEPARAMS
import { useGo } from "@refinedev/core";

export const EmployeeEdit = () => {
  // ✅ 2. AMBIL ID DARI URL SECARA MANUAL
  const { id } = useParams(); 
  const go = useGo();

  const { formProps, saveButtonProps, queryResult, form } = useForm({
    resource: "profiles",
    action: "edit",
    id: id,
    // ✅ 3. MATIKAN REDIRECT OTOMATIS BAWAAN (Karena salah alamat)
    redirect: false, 
    // ✅ 4. REDIRECT MANUAL SETELAH SUKSES
    onMutationSuccess: () => {
        message.success("Data pegawai berhasil diperbarui");
        go({ 
            to: { 
                resource: "employees", // Arahkan ke resource 'employees'
                action: "list" 
            } 
        });
    }
  });

  const employeeData = queryResult?.data?.data;

  const handleResetDevice = () => {
    form.setFieldValue("device_id", null);
    message.info("Device ID telah dihapus. Jangan lupa klik Simpan.");
  };

  // Cek loading data
  const isLoading = queryResult?.isLoading;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Edit Data Pegawai</h1>
        <p className="text-slate-400">Update informasi, reset PIN, atau buka kunci HP.</p>
      </div>

      <Edit 
        isLoading={isLoading}
        saveButtonProps={{ ...saveButtonProps, className: "bg-emerald-500 hover:bg-emerald-600 text-white font-bold" }}
        wrapperProps={{ className: "bg-[#1e293b] border-slate-700 rounded-xl p-4" }}
        title={<span className="text-white">Form Edit</span>}
        headerButtons={({ listButtonProps }) => (
           <Button {...listButtonProps} className="text-slate-300 border-slate-600 hover:text-white hover:border-slate-500">
             Kembali
           </Button>
        )}
      >
        <Form {...formProps} layout="vertical">
          
          <Alert
            message="Manajemen Akses"
            description="Jika pegawai lupa password email, minta mereka gunakan 'Forgot Password' di HP. Di sini Anda hanya bisa mereset PIN Harian dan Kunci HP."
            type="warning"
            showIcon
            className="mb-6 bg-amber-900/20 border-amber-800 text-amber-200"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* KOLOM KIRI: DATA DIRI */}
            <div className="space-y-4">
              <h3 className="text-white font-bold border-b border-slate-600 pb-2 mb-4">Data Diri</h3>
              
              <Form.Item
                label={<span className="text-slate-300">Nama Lengkap</span>}
                name="full_name"
                rules={[{ required: true }]}
              >
                <Input prefix={<User size={16}/>} className="bg-[#0f172a] border-slate-600 text-white" />
              </Form.Item>

              <Form.Item
                label={<span className="text-slate-300">No HP (WhatsApp)</span>}
                name="phone"
              >
                <Input prefix={<Phone size={16}/>} className="bg-[#0f172a] border-slate-600 text-white" />
              </Form.Item>

              <Form.Item
                label={<span className="text-slate-300">Jabatan / Role</span>}
                name="role"
                rules={[{ required: true }]}
              >
                 <Select className="h-10" popupClassName="bg-slate-800">
                    <Select.Option value="worker">Operator (Buruh Jahit)</Select.Option>
                    <Select.Option value="mandor">Mandor (Supervisor)</Select.Option>
                 </Select>
              </Form.Item>

              <Form.Item
                label={<span className="text-slate-300">Status Pegawai</span>}
                name="is_active"
              >
                 <Select className="h-10" popupClassName="bg-slate-800">
                    <Select.Option value={true}>✅ Aktif</Select.Option>
                    <Select.Option value={false}>⛔ Non-Aktif (Resign/Blokir)</Select.Option>
                 </Select>
              </Form.Item>
            </div>

            {/* KOLOM KANAN: KEAMANAN & RESET */}
            <div className="space-y-4">
              <h3 className="text-white font-bold border-b border-slate-600 pb-2 mb-4">Keamanan & Reset</h3>

              {/* FITUR 1: RESET PIN */}
              <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                 <Form.Item
                    label={<span className="text-slate-300 font-bold">PIN Code (Login Harian)</span>}
                    name="pin_code"
                    help={<span className="text-xs text-slate-500">Ubah angka ini jika pegawai lupa PIN.</span>}
                    rules={[{ required: true, len: 6, message: "Harus 6 angka" }]}
                    className="mb-0"
                  >
                    <Input 
                        prefix={<Lock size={16} className="text-amber-400"/>} 
                        maxLength={6} 
                        className="bg-[#0f172a] border-slate-600 text-white font-mono text-lg tracking-widest" 
                    />
                  </Form.Item>
              </div>

              {/* FITUR 2: RESET DEVICE ID (GANTI HP) */}
              <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                  <label className="text-slate-300 font-bold block mb-2">Device Lock (Anti-Joki)</label>
                  
                  {/* Field hidden untuk menyimpan device_id (perlu agar form mendeteksinya) */}
                  <Form.Item name="device_id" hidden>
                      <Input />
                  </Form.Item>

                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                          <Smartphone size={20} className={employeeData?.device_id ? "text-emerald-400" : "text-slate-500"} />
                          <div>
                              <p className="text-xs text-slate-400">Status Perangkat:</p>
                              <p className={`text-sm font-bold ${employeeData?.device_id ? "text-emerald-400" : "text-slate-500"}`}>
                                  {employeeData?.device_id ? "Terhubung / Terkunci" : "Belum Ada Perangkat"}
                              </p>
                          </div>
                      </div>

                      {employeeData?.device_id && (
                          <Button 
                            danger 
                            type="dashed" 
                            icon={<RotateCcw size={14} />}
                            onClick={handleResetDevice}
                            className="text-xs"
                          >
                            Reset Device
                          </Button>
                      )}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                    <ShieldAlert size={10} className="inline mr-1" />
                    Klik "Reset Device" jika pegawai ganti HP atau HP hilang. Ini memungkinkan mereka login di HP baru.
                  </p>
              </div>

            </div>
          </div>
        </Form>
      </Edit>
    </div>
  );
};
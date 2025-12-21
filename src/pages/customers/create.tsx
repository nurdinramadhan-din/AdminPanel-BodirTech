import { IResourceComponentsProps } from "@refinedev/core";
import { Create, useForm } from "@refinedev/antd";
import { Form, Input } from "antd";

export const CustomerCreate: React.FC<IResourceComponentsProps> = () => {
  const { formProps, saveButtonProps } = useForm();

  return (
    <Create saveButtonProps={saveButtonProps} title="Tambah Pelanggan Baru">
      <Form {...formProps} layout="vertical">
        
        <Form.Item
          label="Nama Pelanggan / Toko"
          name="name"
          rules={[{ required: true, message: "Nama wajib diisi" }]}
        >
          <Input placeholder="Cth: Pak Budi (Tanah Abang)" />
        </Form.Item>

        <Form.Item
          label="Nomor Telepon / WA"
          name="phone_number"
          rules={[{ required: true, message: "Nomor HP wajib diisi untuk notifikasi" }]}
        >
          <Input placeholder="0812..." type="tel" />
        </Form.Item>

        <Form.Item
          label="Alamat Lengkap"
          name="address"
        >
          <Input.TextArea rows={3} placeholder="Alamat pengiriman barang..." />
        </Form.Item>

        <Form.Item
          label="Catatan Tambahan"
          name="notes"
        >
          <Input placeholder="Cth: Langganan prioritas, minta diskon terus" />
        </Form.Item>

      </Form>
    </Create>
  );
};
import { IResourceComponentsProps } from "@refinedev/core";
import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select, InputNumber, DatePicker, Row, Col } from "antd";
import dayjs from "dayjs";

export const ProjectCreate: React.FC<IResourceComponentsProps> = () => {
  const { formProps, saveButtonProps } = useForm();

  // 1. Ambil Data Pelanggan
  const { selectProps: customerSelectProps } = useSelect({
    resource: "customers",
    optionLabel: "name",
    optionValue: "id",
  });

  // 2. Ambil Data Desain/Produk
  const { selectProps: productSelectProps } = useSelect({
    resource: "products",
    optionLabel: "name",
    optionValue: "id",
  });

  return (
    <Create saveButtonProps={saveButtonProps} title="Buat Order Produksi Baru">
      <Form {...formProps} layout="vertical">
        
        {/* JUDUL ORDER */}
        <Form.Item
          label="Judul Order (Untuk Label Karung)"
          name="title"
          rules={[{ required: true, message: "Wajib diisi, misal: Order Baju Koko Lebaran" }]}
        >
          <Input placeholder="Contoh: Batch Seragam SD 2025" />
        </Form.Item>

        <Row gutter={16}>
            <Col span={12}>
                <Form.Item
                    label="Pilih Pelanggan"
                    name="customer_id"
                    rules={[{ required: true }]}
                >
                    <Select {...customerSelectProps} placeholder="Cari pelanggan..." showSearch />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item
                    label="Pilih Desain"
                    name="product_id"
                    rules={[{ required: true }]}
                >
                    <Select {...productSelectProps} placeholder="Cari desain..." showSearch />
                </Form.Item>
            </Col>
        </Row>

        <Row gutter={16}>
            <Col span={8}>
                <Form.Item
                    label="Jumlah Pesanan (Pcs)"
                    name="total_quantity"
                    rules={[{ required: true }]}
                    initialValue={100}
                >
                    <InputNumber style={{ width: "100%" }} min={1} />
                </Form.Item>
            </Col>
            <Col span={8}>
                <Form.Item
                    label="Target Selesai (Deadline)"
                    name="deadline"
                    rules={[{ required: true }]}
                    getValueProps={(value) => ({
                        value: value ? dayjs(value) : "",
                    })}
                >
                    <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                </Form.Item>
            </Col>
            <Col span={8}>
                <Form.Item
                    label="Status Awal"
                    name="status"
                    initialValue="NEW"
                >
                    <Select options={[
                        { value: 'NEW', label: 'Baru Masuk' },
                        { value: 'IN_PROGRESS', label: 'Sedang Dikerjakan' },
                    ]} />
                </Form.Item>
            </Col>
        </Row>
        
        {/* NOTE: Nanti kita tambahkan fitur Generate QR Code setelah Order Disimpan */}

      </Form>
    </Create>
  );
};
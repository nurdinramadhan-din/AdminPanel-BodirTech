import { IResourceComponentsProps } from "@refinedev/core";
import { Create, useForm } from "@refinedev/antd";
import { Form, Input, InputNumber, Row, Col, Divider } from "antd";

export const ProductCreate: React.FC<IResourceComponentsProps> = () => {
  const { formProps, saveButtonProps } = useForm();

  return (
    <Create saveButtonProps={saveButtonProps} title="Input Desain Baru">
      <Form {...formProps} layout="vertical">
        
        {/* INFO DASAR */}
        <Row gutter={16}>
            <Col span={12}>
                <Form.Item
                    label="Nama Desain / Produk"
                    name="name"
                    rules={[{ required: true, message: "Nama wajib diisi" }]}
                >
                    <Input placeholder="Cth: Logo SD Nasional" />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item
                    label="Kode SKU (Opsional)"
                    name="sku"
                >
                    <Input placeholder="Cth: LOGO-SD-001" />
                </Form.Item>
            </Col>
        </Row>

        <Divider orientation="left">Detail Teknis Bordir</Divider>

        {/* SPESIFIKASI TEKNIS */}
        <Row gutter={16}>
            <Col span={8}>
                <Form.Item
                    label="Jumlah Tusukan (Stitch)"
                    name="stitch_count"
                    rules={[{ required: true }]}
                    help="Semakin banyak, semakin lama dikerjakan"
                >
                    <InputNumber style={{ width: "100%" }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                </Form.Item>
            </Col>
            <Col span={8}>
                <Form.Item
                    label="Jumlah Warna Benang"
                    name="color_count"
                    initialValue={1}
                >
                    <InputNumber min={1} style={{ width: "100%" }} />
                </Form.Item>
            </Col>
            <Col span={8}>
                <Form.Item
                    label="Upah Jahit (Per Pcs)"
                    name="wage_per_piece"
                    rules={[{ required: true }]}
                    help="Upah untuk pegawai per 1 barang jadi"
                >
                    <InputNumber 
                        style={{ width: "100%" }}
                        formatter={(value) => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                        parser={(value) => value!.replace(/\Rp\s?|(\.*)/g, '')}
                    />
                </Form.Item>
            </Col>
        </Row>

        <Row gutter={16}>
            <Col span={12}>
                <Form.Item
                    label="Lebar Desain (cm)"
                    name="width_cm"
                >
                     <InputNumber style={{ width: "100%" }} />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item
                    label="Tinggi Desain (cm)"
                    name="height_cm"
                >
                     <InputNumber style={{ width: "100%" }} />
                </Form.Item>
            </Col>
        </Row>
        
        {/* CATATAN: 
            Fitur Upload Gambar & Resep Bahan (BOM) akan kita tambahkan nanti 
            setelah fitur dasar ini jalan lancar.
        */}

      </Form>
    </Create>
  );
};
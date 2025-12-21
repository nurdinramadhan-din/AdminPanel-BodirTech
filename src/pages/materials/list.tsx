import { IResourceComponentsProps, BaseRecord } from "@refinedev/core";
import {
  useTable,
  List,
  EditButton,
  ShowButton,
  DeleteButton,
  DateField,
} from "@refinedev/antd";
import { Table, Space } from "antd";

export const MaterialList: React.FC<IResourceComponentsProps> = () => {
  // Hook ajaib Refine yang otomatis ambil data dari Supabase tabel 'materials'
  const { tableProps } = useTable({
    syncWithLocation: true,
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        {/* Kolom Nama Bahan */}
        <Table.Column 
            dataIndex="name" 
            title="Nama Bahan" 
        />
        
        {/* Kolom Stok Saat Ini */}
        <Table.Column 
            dataIndex="current_stock" 
            title="Stok (Unit)" 
            render={(value) => (
                <span style={{ fontWeight: "bold", color: value < 10 ? "red" : "green" }}>
                    {value}
                </span>
            )}
        />

        {/* Kolom Satuan */}
        <Table.Column 
            dataIndex="unit" 
            title="Satuan" 
        />

        {/* Kolom Harga Beli (Fitur Baru) */}
        <Table.Column 
            dataIndex="price_per_unit" 
            title="Harga Beli" 
            render={(value) => `Rp ${Number(value).toLocaleString('id-ID')}`}
        />

        {/* Kolom Tanggal Update */}
        <Table.Column
          dataIndex="updated_at"
          title="Terakhir Update"
          render={(value: any) => <DateField value={value} format="DD/MM/YYYY HH:mm" />}
        />

        {/* Kolom Tombol Aksi */}
        <Table.Column
          title="Actions"
          dataIndex="actions"
          render={(_, record: BaseRecord) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.id} />
              <ShowButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
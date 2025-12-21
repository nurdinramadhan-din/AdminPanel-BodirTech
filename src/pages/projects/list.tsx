import { IResourceComponentsProps, BaseRecord } from "@refinedev/core";
import {
  useTable,
  List,
  EditButton,
  ShowButton,
  DeleteButton,
  DateField,
} from "@refinedev/antd";
import { Table, Space, Tag, Progress } from "antd";

export const ProjectList: React.FC<IResourceComponentsProps> = () => {
  const { tableProps } = useTable({
    syncWithLocation: true,
    // PENTING: Kita ambil nama pelanggan & produk dari tabel tetangga
    meta: {
        select: "*, customers(name), products(name)"
    }
  });

  return (
    <List title="Daftar Order Produksi (SPK)">
      <Table {...tableProps} rowKey="id">
        
        {/* KOLOM JUDUL ORDER */}
        <Table.Column 
            dataIndex="title" 
            title="Judul Order"
            render={(val, record: any) => (
                <div>
                    <div style={{fontWeight: 'bold'}}>{val}</div>
                    <div style={{fontSize: '0.8em', color: '#666'}}>
                        Klien: {record.customers?.name || '-'}
                    </div>
                </div>
            )} 
        />

        {/* KOLOM PRODUK & JUMLAH */}
        <Table.Column 
            title="Barang"
            render={(_, record: any) => (
                <span>
                    {/* UBAH record.quantity MENJADI record.total_quantity DI BAWAH INI */}
                    {record.products?.name} <Tag color="blue">{Number(record.total_quantity).toLocaleString()} Pcs</Tag>
                </span>
            )}
        />

        {/* KOLOM PROGRESS (Nanti otomatis jalan saat discan operator) */}
        <Table.Column 
            title="Progress"
            render={(_, record: any) => {
                // Simulasi logika status (Nanti kita update real-time)
                let color = "blue";
                if(record.status === 'DONE') color = "green";
                if(record.status === 'CANCELLED') color = "red";
                
                return <Tag color={color}>{record.status}</Tag>
            }}
        />

        {/* KOLOM DEADLINE */}
        <Table.Column
          dataIndex="deadline"
          title="Deadline"
          render={(value: any) => <DateField value={value} format="DD/MM/YYYY" style={{color: 'red', fontWeight: 'bold'}} />}
        />

        <Table.Column
          title="Actions"
          dataIndex="actions"
          render={(_, record: BaseRecord) => (
            <Space>
               {/* Tombol Show ini nanti dipakai untuk Cetak QR Code */}
              <ShowButton size="small" recordItemId={record.id} />
              <EditButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
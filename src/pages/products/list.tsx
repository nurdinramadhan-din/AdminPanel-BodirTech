import { IResourceComponentsProps, BaseRecord } from "@refinedev/core";
import {
  useTable,
  List,
  EditButton,
  ShowButton,
  DeleteButton,
  DateField,
} from "@refinedev/antd";
import { Table, Space, Tag } from "antd";

export const ProductList: React.FC<IResourceComponentsProps> = () => {
  const { tableProps } = useTable({
    syncWithLocation: true,
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        {/* NAMA PRODUK */}
        <Table.Column 
            dataIndex="name" 
            title="Nama Desain" 
            render={(val, record: any) => (
                <div>
                    <div style={{ fontWeight: "bold" }}>{val}</div>
                    <div style={{ fontSize: "0.8em", color: "#888" }}>{record.sku}</div>
                </div>
            )}
        />
        
        {/* DETAIL TEKNIS (PENTING UNTUK BORDIR) */}
        <Table.Column 
            title="Spesifikasi" 
            render={(_, record: any) => (
                <div style={{ fontSize: "0.9em" }}>
                    <div>📏 {record.width_cm} x {record.height_cm} cm</div>
                    <div>🧵 {Number(record.stitch_count).toLocaleString()} tusukan</div>
                    <div>🎨 {record.color_count} warna</div>
                </div>
            )}
        />

        {/* UPAH JAHIT */}
        <Table.Column 
            dataIndex="wage_per_piece" 
            title="Upah Jahit" 
            render={(value) => (
                <Tag color="blue">
                    Rp {Number(value).toLocaleString('id-ID')}
                </Tag>
            )}
        />

        <Table.Column
          dataIndex="created_at"
          title="Dibuat"
          render={(value: any) => <DateField value={value} format="DD/MM/YYYY" />}
        />

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
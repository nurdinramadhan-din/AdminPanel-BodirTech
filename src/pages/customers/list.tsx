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

export const CustomerList: React.FC<IResourceComponentsProps> = () => {
  const { tableProps } = useTable({
    syncWithLocation: true,
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        {/* NAMA PELANGGAN */}
        <Table.Column 
            dataIndex="name" 
            title="Nama Pelanggan" 
            render={(val) => <b>{val}</b>}
        />
        
        {/* KONTAK */}
        <Table.Column 
            dataIndex="phone_number" 
            title="No. WhatsApp" 
        />

        {/* ALAMAT */}
        <Table.Column 
            dataIndex="address" 
            title="Alamat" 
            ellipsis={true} // Agar tidak terlalu panjang
        />

        <Table.Column
          dataIndex="created_at"
          title="Bergabung Sejak"
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
import React from "react";
import { Table, Tag, Button, Select } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const { Option } = Select;

const data = [
  {
    id: 1,
    name: "Chính sách đổi trả",
    type: "Đổi trả",
    updatedAt: "01/01/2025",
    status: "active",
  },
  {
    id: 2,
    name: "Chính sách bảo hành",
    type: "Bảo hành",
    updatedAt: "15/02/2025",
    status: "active",
  },
  {
    id: 3,
    name: "Chính sách vận chuyển",
    type: "Vận chuyển",
    updatedAt: "10/03/2025",
    status: "inactive",
  },
];

function PolicyTable() {
  const columns = [
    {
      title: "Tên chính sách",
      dataIndex: "name",
      key: "name",
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      render: (type) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: "Cập nhật gần nhất",
      dataIndex: "updatedAt",
      key: "updatedAt",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={status === "active" ? "green" : "default"}
          className="rounded-full px-3 py-1"
        >
          ● {status === "active" ? "Đang áp dụng" : "Ngừng áp dụng"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: () => (
        <Button type="link" size="small">
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="flex justify-between">
        {/* Filter */}
        <div className="mb-4">
          <Select defaultValue="all" style={{ width: 200 }}>
            <Option value="all">Tất cả loại</Option>
            <Option value="return">Đổi trả</Option>
            <Option value="warranty">Bảo hành</Option>
            <Option value="shipping">Vận chuyển</Option>
          </Select>
        </div>
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="bg-orange-500 border-none"
          >
            Thêm chính sách
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          pagination={false}
        />
      </div>
    </div>
  );
}

export default PolicyTable;

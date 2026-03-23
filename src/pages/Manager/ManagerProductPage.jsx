/* eslint-disable no-unused-vars */
import React from "react";
import { useSelector } from "react-redux";
import { Table, Tag, Button, Space } from "antd";

function ManagerProductPage() {
  const { products } = useSelector((state) => state.products);

  // 🔥 Columns config cho antd
  const columns = [
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.name}</div>
          <div className="text-xs text-gray-500">{record.description}</div>
        </div>
      ),
    },
    {
      title: "Giá",
      dataIndex: "basePrice",
      key: "price",
      render: (price) => (
        <span className="text-amber-600 font-medium">
          {price?.toLocaleString()} đ
        </span>
      ),
    },
    {
      title: "Biến thể",
      key: "variants",
      render: (_, record) => (
        <Tag color="blue">{record.variants?.length || 0} loại</Tag>
      ),
    },
    {
      title: "Tồn kho",
      key: "stock",
      render: (_, record) => {
        const total =
          record.variants?.reduce(
            (sum, v) => sum + (v.stockQuantity || v.quantity || 0),
            0
          ) || 0;

        return (
          <span className={total < 10 ? "text-red-500 font-medium" : ""}>
            {total}
          </span>
        );
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button type="primary" size="small">
            Sửa
          </Button>
          <Button danger size="small">
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className=" bg-white rounded-xl shadow">
      <Table
        columns={columns}
        dataSource={products}
        rowKey="id"
        pagination={{ pageSize: 5 }}
      />
    </div>
  );
}

export default ManagerProductPage;

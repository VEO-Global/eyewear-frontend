import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Table,
  Tag,
  Input,
  Select,
  Button,
  Space,
  DatePicker,
  Empty,
} from "antd";
export default function OperationPreOrderPage() {
  const navigate = useNavigate();
  const columns = [
    {
      title: "Order ID",
      dataIndex: "id",
      key: "id",
      render: (text) => (
        <span className="font-medium text-gray-800">{text}</span>
      ),
    },
    {
      title: "Customer",
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: "Type",
      dataIndex: "orderType",
      key: "orderType",
      //   render: (type) => (
      //     // <Tag color={ORDER_TYPE_COLORS[type]}>{ORDER_TYPE_LABELS[type]}</Tag>
      //   ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => <StatusBadge status={status} />,
    },
    {
      title: "Payment",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      render: (status) => (
        <Tag
          color={status === "paid" ? "success" : "default"}
          className="uppercase text-xs"
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          ghost
          size="small"
          icon={<Eye size={14} className="mr-1" />}
          onClick={() => navigate(`/orders/${record.id}`)}
          className="flex items-center"
        >
          View
        </Button>
      ),
    },
  ];
  return (
    <div>
      <div>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Tất cả đơn đặt trước
            </h1>
            <p className="text-gray-500">Quản lý và giám sát đơn đặt trước</p>
          </div>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          // dataSource={filteredOrders}
          rowKey="id"
          // loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
          }}
          locale={{
            emptyText: (
              <Empty
                description="Chưa có đơn hàng nào trong hệ thống"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
          className="border border-gray-100 rounded-lg overflow-hidden"
        />
      </div>
    </div>
  );
}

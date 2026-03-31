import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, Row, Col, Statistic, Table, Tag } from "antd";
export default function OperationDashboardOverivew() {
  const navigate = useNavigate();
  const columns = [
    {
      title: "Order ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Customer",
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type) => {
        const color =
          type === "PREORDER"
            ? "purple"
            : type === "PRESCRIPTION"
              ? "blue"
              : "default";
        return <Tag color={color}>{type}</Tag>;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const color =
          status === "PENDING"
            ? "orange"
            : status === "SHIPPED"
              ? "green"
              : "default";
        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];
  return (
    <div className="mt-6">
      {/* Table */}
      <Row gutter={[16, 16]} className="mt-2">
        <Col xs={24} lg={16}>
          <Card
            title="Recent Orders"
            extra={
              <a onClick={() => navigate("/operation/orders")}>View All</a>
            }
          >
            <Table
              columns={columns}
              dataSource={[]}
              rowKey="id"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

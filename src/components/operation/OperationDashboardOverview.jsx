import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Table,
  Tag,
  Button,
  Tooltip,
  Modal,
  Form,
  Input,
} from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { useForm } from "antd/es/form/Form";
const ORDERTYPEMAP = {
  PRESCRIPTION: {
    label: "Có toa thuốc",
    color: "blue",
  },
  PRE_ORDER: {
    label: "Đặt trước",
    color: "purple",
  },
  NORMAL: {
    label: "Đơn thường",
    color: "default",
  },
};

const STATUSMAP = {
  MANUFACTURING: {
    label: "Đang sản xuất",
    color: "blue",
  },
  WAITING_FOR_STOCK: {
    label: "Chờ nhập kho",
    color: "orange",
  },
  COMPLETED: {
    label: "Hoàn thành",
    color: "green",
  },
  CANCELLED: {
    label: "Đã hủy",
    color: "red",
  },
};

export default function OperationDashboardOverivew({ manufacturingOrders }) {
  const [detailModal, setDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();
  const [form] = useForm();
  function handleViewDetail(order) {
    setDetailModal(true);
    setSelectedOrder(order);
  }
  console.log(manufacturingOrders);

  const columns = [
    {
      title: "Order-ID",
      dataIndex: "orderId",
      key: "id",
    },
    {
      title: "Tên khách hàng",
      dataIndex: "receiverName",
      key: "customerName",
    },
    {
      title: "Loại đơn",
      dataIndex: "orderType",
      key: "type",
      render: (type) => {
        const config = ORDERTYPEMAP[type] || {
          label: type,
          color: "default",
        };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const config = STATUSMAP[status] || {
          label: status,
          color: "default",
        };

        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },

    {
      title: "Hành động",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Tooltip title="Xem chi tiết">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
            style={{
              color: "blue",
            }}
            className="text-blue-500  hover:scale-150 transition shadow"
          />
        </Tooltip>
      ),
    },
  ];

  useEffect(() => {
    if (selectedOrder) {
      form.setFieldsValue({
        orderId: selectedOrder.orderId,
        receiverName: selectedOrder.receiverName,
        phoneNumber: selectedOrder.phoneNumber,
        addressDetail: selectedOrder.addressDetail,
        totalAmount: new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(selectedOrder.totalAmount),
      });
    }
  }, [selectedOrder, form]);
  return (
    <div className="mt-6">
      {/* Table */}
      <Row className="mt-2 max-w-full">
        <Col span={24}>
          <Card
            title="Những đơn hàng gần đây"
            extra={
              <a onClick={() => navigate("/operation/orders")}>
                Tất cả đơn hàng
              </a>
            }
          >
            <Table
              columns={columns}
              dataSource={manufacturingOrders}
              rowKey="orderId"
              pagination={{
                pageSize: 5,
                showSizeChanger: true,
                pageSizeOptions: ["5", "10", "20"],
              }}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        open={detailModal}
        title={`Đơn hàng ${ORDERTYPEMAP[selectedOrder?.orderType]?.label.toLowerCase()}`}
        onCancel={() => setDetailModal(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModal(false)}>
            Đóng
          </Button>,
          <Button key="confirm" type="primary">
            Xác nhận
          </Button>,
        ]}
      >
        {selectedOrder && (
          <Form form={form} layout="vertical">
            <Form.Item label="Mã đơn">
              <Input value={selectedOrder.orderId} readOnly />
            </Form.Item>

            <Form.Item label="Khách hàng">
              <Input value={selectedOrder.receiverName} readOnly />
            </Form.Item>

            <Form.Item label="Số điện thoại">
              <Input value={selectedOrder.phoneNumber} readOnly />
            </Form.Item>

            <Form.Item label="Địa chỉ">
              <Input value={selectedOrder.addressDetail} readOnly />
            </Form.Item>

            <Form.Item label="Tổng tiền">
              <Input
                value={new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(selectedOrder.totalAmount)}
                readOnly
              />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
}

import {
  Card,
  Button,
  Tag,
  Empty,
  Pagination,
  Spin,
  Modal,
  Form,
  Select,
} from "antd";
import { useForm } from "antd/es/form/Form";
import { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getOrderQr,
  payMyOrder,
  setPaymentMethod,
} from "../../redux/payment/paymentSlice";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  const HH = String(date.getHours()).padStart(2, "0");
  const MM = String(date.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${HH}:${MM}`;
};
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};
export default function InvoiceItems({ invoice }) {
  const { loading } = useSelector((state) => state.order);

  const { paymentInfor } = useSelector((state) => state.payment);
  const [form] = useForm();
  const method = Form.useWatch("paymentMethod", form);
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 3;

  const [payOrderModal, setPayOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const isUnpaid = (order) =>
    !order.paymentStatus || order.status === "PENDING_PAYMENT";

  // Filter unpaid nếu cần
  const filteredOrders = useMemo(() => {
    return (invoice || []).filter(isUnpaid);
  }, [invoice]);

  // Pagination logic
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage]);

  useEffect(() => {
    if (payOrderModal) {
      form.setFieldsValue({
        paymentMethod: "COD",
      });
      dispatch(setPaymentMethod("COD"));
    }
  }, [payOrderModal, form, dispatch]);

  useEffect(() => {
    if (method === "BANK_TRANSFER" && selectedOrder?.orderId) {
      dispatch(getOrderQr(selectedOrder.orderId));
    }
  }, [method, selectedOrder, dispatch]);
  if (!filteredOrders.length) {
    return <Empty description="Không có hóa đơn chưa thanh toán" />;
  }

  const handleOpenPay = (order) => {
    setSelectedOrder(order);
    setPayOrderModal(true);
  };

  const handleClose = () => {
    setPayOrderModal(false);
    dispatch(setPaymentMethod("COD"));
    setSelectedOrder(null);
  };

  return (
    <div>
      {loading ? (
        <div className="flex justify-center py-10">
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* List */}
          <div className="grid gap-4">
            {paginatedOrders.map((order) => {
              return (
                <Card key={order.orderId} className="shadow-sm rounded-xl">
                  {/* Header */}
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <div className="font-semibold text-lg">
                        {order.orderCode}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </div>
                    </div>

                    <Tag color="warning">{order.statusLabel}</Tag>
                  </div>

                  {/* Body */}
                  <div className="grid gap-1 text-sm">
                    <div>
                      <strong>Người nhận:</strong> {order.receiverName}
                    </div>
                    <div>
                      <strong>SĐT:</strong> {order.phoneNumber}
                    </div>
                    <div>
                      <strong>Địa chỉ:</strong> {order.shippingAddress}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-blue-600 font-semibold">
                      {formatCurrency(order.finalAmount)}
                    </div>

                    <Button type="primary" onClick={() => handleOpenPay(order)}>
                      Thanh toán
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-6">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={filteredOrders.length}
              onChange={(page) => setCurrentPage(page)}
              showSizeChanger={false}
            />
          </div>

          <Modal
            open={payOrderModal}
            onCancel={handleClose}
            title="Thanh toán đơn hàng"
            footer={[
              <Button key="close" onClick={handleClose}>
                Đóng
              </Button>,
              <Button
                key="submit"
                type="primary"
                onClick={() => dispatch(payMyOrder())}
              >
                Thanh toán
              </Button>,
            ]}
          >
            <Form form={form} layout="vertical">
              <Form.Item label="Mã đơn">
                <span>{selectedOrder?.orderCode}</span>
              </Form.Item>

              <Form.Item label="Số tiền">
                <span>{formatCurrency(selectedOrder?.finalAmount)}</span>
              </Form.Item>
              <Form.Item
                name="paymentMethod"
                label="Phương thức thanh toán"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn phương thức thanh toán",
                  },
                ]}
              >
                <Select
                  placeholder="Chọn phương thức"
                  onChange={(value) => dispatch(setPaymentMethod(value))}
                >
                  <Select.Option value="COD">
                    Thanh toán khi nhận hàng (COD)
                  </Select.Option>
                  <Select.Option value="BANK_TRANSFER">
                    Chuyển khoản ngân hàng
                  </Select.Option>
                </Select>
              </Form.Item>

              {method === "BANK_TRANSFER" && paymentInfor?.qrCodeUrl && (
                <div className="mt-4 text-center">
                  <p className="mb-2 font-medium">Quét mã để thanh toán</p>
                  <img
                    src={paymentInfor.qrCodeUrl}
                    alt="QR Code"
                    className="mx-auto w-40 h-40"
                  />
                </div>
              )}
            </Form>
          </Modal>
        </>
      )}
    </div>
  );
}

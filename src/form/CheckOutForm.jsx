import React from "react";
import { Form, Input, Button } from "antd";
import AddressSelector from "../components/checkout/AddressSelector";

export default function CheckOutForm() {
  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    console.log("Checkout Data:", values);

    // Sau này bạn sẽ gọi API
    // axios.post("/orders", values)
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      className="space-y-4"
      style={{ border: 0 }}
    >
      {/* Receiver Name */}
      <Form.Item
        label="Tên người nhận"
        name="receiverName"
        rules={[{ required: true, message: "Vui lòng nhập tên người nhận" }]}
      >
        <Input placeholder="Nguyễn Văn A" size="large" />
      </Form.Item>

      {/* Phone Number */}
      <Form.Item
        label="Số điện thoại"
        name="phoneNumber"
        rules={[
          { required: true, message: "Vui lòng nhập số điện thoại" },
          {
            pattern: /^[0-9]{10,11}$/,
            message: "Số điện thoại không hợp lệ",
          },
        ]}
      >
        <Input placeholder="0901234567" size="large" />
      </Form.Item>

      {/* Shipping Address */}
      <Form.Item
        label="Địa chỉ giao hàng"
        name="shippingAddress"
        rules={[{ required: true, message: "Vui lòng nhập địa chỉ giao hàng" }]}
      >
        <AddressSelector
          onChange={(address) => {
            form.setFieldsValue({
              shippingAddress: address,
            });
          }}
        />
      </Form.Item>

      {/* Note */}
      <Form.Item label="Ghi chú" name="note">
        <Input.TextArea rows={2} placeholder="Ví dụ: Giao giờ hành chính" />
      </Form.Item>

      {/* Submit Button */}
      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          size="large"
          className="w-full"
        >
          Đặt hàng
        </Button>
      </Form.Item>
    </Form>
  );
}

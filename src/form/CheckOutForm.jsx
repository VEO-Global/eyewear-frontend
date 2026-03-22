import React from "react";
import { Form, Input, Button } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { appToast } from "../utils/appToast";
import AddressSelector from "../components/checkout/AddressSelector";
import api from "../configs/config-axios";
import { clearCart } from "../redux/cart/cartSlice";

const validateShippingAddress = (_, value) => {
  if (!value || typeof value !== "object") {
    return Promise.reject(new Error("Vui lòng nhập địa chỉ giao hàng"));
  }

  if (typeof value.provinceCode !== "number" || !value.provinceName) {
    return Promise.reject(new Error("Vui lòng chọn tỉnh/thành"));
  }

  if (typeof value.districtCode !== "number" || !value.districtName) {
    return Promise.reject(new Error("Vui lòng chọn quận/huyện"));
  }

  if (typeof value.wardCode !== "number" || !value.wardName) {
    return Promise.reject(new Error("Vui lòng chọn phường/xã"));
  }

  if (!value.shippingAddress?.trim()) {
    return Promise.reject(new Error("Vui lòng nhập địa chỉ chi tiết"));
  }

  return Promise.resolve();
};

export default function CheckOutForm() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart } = useSelector((state) => state.cart);

  const handleSubmit = async (values) => {
    if (!cart.length) {
      appToast.warning("Giỏ hàng của bạn đang trống.");
      return;
    }

    const selectedAddress = values.shippingAddress || {};
    const addressDetail = selectedAddress.shippingAddress?.trim() || "";

    const requestBody = {
      orderType: "NORMAL",
      receiverName: values.receiverName,
      phoneNumber: values.phoneNumber,
      province: selectedAddress.provinceName || "",
      district: selectedAddress.districtName || "",
      ward: selectedAddress.wardName || "",
      shippingAddress: addressDetail,
      addressDetail,
      note: values.note || "",
      items: cart.map((item) => ({
        productVariantId: item.variantID,
        quantity: item.quantity,
      })),
    };

    try {
      const response = await api.post("/orders", requestBody);

      dispatch(clearCart());
      form.resetFields();
      appToast.success(response.data?.message || "Đặt hàng thành công!");
      navigate("/products");
    } catch (error) {
      appToast.error(
        error.response?.data?.message || "Thanh toán thất bại. Vui lòng thử lại."
      );
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      className="space-y-4"
      style={{ border: 0 }}
    >
      <Form.Item
        label="Tên người nhận"
        name="receiverName"
        rules={[{ required: true, message: "Vui lòng nhập tên người nhận" }]}
      >
        <Input placeholder="Nguyễn Văn A" size="large" />
      </Form.Item>

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

      <Form.Item
        label="Địa chỉ giao hàng"
        name="shippingAddress"
        rules={[{ validator: validateShippingAddress }]}
      >
        <AddressSelector />
      </Form.Item>

      <Form.Item label="Ghi chú" name="note">
        <Input.TextArea rows={2} placeholder="Ví dụ: Giao giờ hành chính" />
      </Form.Item>

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

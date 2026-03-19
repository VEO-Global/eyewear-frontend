import { toast } from "react-toastify";
import api from "../configs/config-axios";
import { useSelector } from "react-redux";
import { Button, Form, Input, InputNumber, Select } from "antd";
import { useForm } from "antd/es/form/Form";
import AddressSelector from "../components/checkout/AddressSelector";

export default function PreorderForm() {
  const [form] = useForm();
  const { selectedProduct } = useSelector((state) => state.products);
  const currentVariant = selectedProduct?.variants?.[0];

  const handleSubmit = async (values) => {
    if (!currentVariant) {
      toast.warning("Vui lòng chọn sản phẩm trước khi đặt trước");
      return;
    }

    const requestBody = {
      orderType: values.orderType,
      receiverName: values.receiverName,
      phoneNumber: values.phoneNumber,
      shippingAddress: values.shippingAddress,
      note: values.note,
      items: [
        {
          variantId: currentVariant.id,
          quantity: values.quantity,
        },
      ],
      prescription: {
        description: values.prescription,
      },
    };

    await api.post("/orders", requestBody);
    toast.success("Đặt trước thành công!");
  };

  return (
    <div className="max-w-3xl mx-auto py-10">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          orderType: "PREORDER",
          quantity: 1,
        }}
      >
        <Form.Item
          label="Loại đơn hàng"
          name="orderType"
          rules={[{ required: true }]}
        >
          <Select>
            <Select.Option value="PREORDER">Preorder</Select.Option>
            <Select.Option value="NORMAL">Normal Order</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Tên người nhận"
          name="receiverName"
          rules={[{ required: true, message: "Nhập tên người nhận" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Số điện thoại"
          name="phoneNumber"
          rules={[{ required: true, message: "Nhập số điện thoại" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Địa chỉ giao hàng"
          name="shippingAddress"
          rules={[{ required: true, message: "Nhập địa chỉ" }]}
        >
          <AddressSelector />
        </Form.Item>

        <Form.Item label="Số lượng" name="quantity">
          <InputNumber min={1} className="w-full" />
        </Form.Item>

        <Form.Item label="Ghi chú" name="note">
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item label="Đơn thuốc" name="prescription">
          <Input.TextArea rows={3} placeholder="Ví dụ: cận 2 độ..." />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" disabled={!currentVariant}>
            Xác nhận đặt trước
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

import { toast } from "react-toastify";
import api from "../configs/config-axios";
import { Button, Form, Input, InputNumber, Select } from "antd";
import { useForm } from "antd/es/form/Form";
import AddressSelector from "../components/checkout/AddressSelector";

export default function PreorderForm({ selectedProduct }) {
  const [form] = useForm();
  const orderType = Form.useWatch("orderType", form);
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
    };

    if (values.orderType === "PREORDER_PRESCRIPTION") {
      requestBody.prescription = {
        description: values.prescription,
      };
    }

    await api.post("/orders", requestBody);
    toast.success("Đặt trước thành công!");
    form.setFieldsValue({
      orderType: values.orderType,
      quantity: 1,
      receiverName: undefined,
      phoneNumber: undefined,
      shippingAddress: undefined,
      note: undefined,
      prescription: undefined,
    });
  };

  return (
    <div className="max-w-3xl mx-auto py-10">
      {!selectedProduct && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Hãy chọn một sản phẩm ở cột bên trái trước khi điền form đặt trước.
        </div>
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          orderType: "PREORDER_NORMAL",
          quantity: 1,
        }}
      >
        <Form.Item
          label="Loại đơn hàng"
          name="orderType"
          rules={[{ required: true }]}
        >
          <Select>
            <Select.Option value="PREORDER_PRESCRIPTION">
              Preorder Prescription
            </Select.Option>
            <Select.Option value="PREORDER_NORMAL">
              Preorder Normal
            </Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Họ và tên"
          name="receiverName"
          rules={[{ required: true, message: "Nhập họ và tên" }]}
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

        {orderType === "PREORDER_PRESCRIPTION" && (
          <Form.Item
            label="Đơn thuốc"
            name="prescription"
            rules={[{ required: true, message: "Nhập thông tin đơn thuốc" }]}
          >
            <Input.TextArea rows={3} placeholder="Ví dụ: cận 2 độ..." />
          </Form.Item>
        )}

        <Form.Item>
          <Button type="primary" htmlType="submit" disabled={!currentVariant}>
            Xác nhận đặt trước
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

import { Form, Input, Select, Button, Checkbox } from "antd";
import { toast } from "react-toastify";

export default function CustomGlassesPage() {
  const [form] = Form.useForm();

  function handleSubmit() {
    toast.success("Yêu cầu làm kính đã được xác nhận");
    form.resetFields();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-teal-50 px-4 py-12">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
          <span className="inline-flex px-4 py-1 rounded-full bg-teal-100 text-teal-700 text-sm font-medium">
            Cá nhân hóa theo nhu cầu
          </span>
          <h1 className="text-4xl font-bold text-gray-900 mt-4">
            Làm kính theo yêu cầu
          </h1>
          <p className="text-gray-600 mt-4 leading-relaxed">
            Chọn kiểu gọng, chất liệu tròng và các lớp phủ phù hợp để tạo ra
            chiếc kính đúng với nhu cầu sử dụng hằng ngày của bạn.
          </p>

          <div className="mt-8 space-y-4">
            <div className="rounded-2xl bg-amber-50 p-4 border border-amber-100">
              <h2 className="font-semibold text-gray-900">Bạn sẽ nhận được gì?</h2>
              <p className="text-sm text-gray-600 mt-2">
                Tư vấn kiểu dáng, tròng kính, lớp phủ chống ánh sáng xanh và ghi
                chú riêng cho kỹ thuật viên.
              </p>
            </div>
            <div className="rounded-2xl bg-teal-50 p-4 border border-teal-100">
              <h2 className="font-semibold text-gray-900">Thời gian xử lý</h2>
              <p className="text-sm text-gray-600 mt-2">
                Đơn đặt kính theo yêu cầu thường được xác nhận trong ngày và hoàn
                thiện trong 2 đến 5 ngày làm việc.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Gửi yêu cầu của bạn
          </h2>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ lensType: "Cận" }}
          >
            <Form.Item
              label="Họ và tên"
              name="fullName"
              rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
            >
              <Input placeholder="Nhập họ và tên" />
            </Form.Item>

            <Form.Item
              label="Số điện thoại"
              name="phoneNumber"
              extra={
                <span className="text-xs text-gray-500">
                  Nhập số điện thoại (Có sử dụng Zalo)
                </span>
              }
              rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
            >
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>

            <Form.Item label="Loại kính" name="lensType">
              <Select
                options={[
                  { label: "Kính cận", value: "Cận" },
                  { label: "Kính viễn", value: "Viễn" },
                  { label: "Kính loạn", value: "Loạn" },
                  { label: "Kính chống ánh sáng xanh", value: "ASX" },
                ]}
              />
            </Form.Item>

            <Form.Item label="Kiểu gọng mong muốn" name="frameStyle">
              <Input placeholder="Ví dụ: gọng tròn kim loại màu đen" />
            </Form.Item>

            <Form.Item label="Yêu cầu thêm" name="extraNote">
              <Input.TextArea
                rows={4}
                placeholder="Mô tả nhu cầu sử dụng, độ kính, sở thích kiểu dáng..."
              />
            </Form.Item>

            <Form.Item name="antiBlueLight" valuePropName="checked">
              <Checkbox>Thêm lớp phủ chống ánh sáng xanh</Checkbox>
            </Form.Item>

            <Form.Item className="mb-0">
              <Button type="primary" htmlType="submit" className="w-full">
                Gửi yêu cầu làm kính
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
}

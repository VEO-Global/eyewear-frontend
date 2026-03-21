import React, { forwardRef, useEffect } from "react";
import { Form, Input, Select, Button } from "antd";
import { useForm } from "antd/es/form/Form";
import { User, Phone, Mail, Lock } from "lucide-react";
const CustomInput = forwardRef((props, ref) => {
  const { id, value, onChange, onBlur, icon, isPassword, placeholder, type } =
    props;

  return (
    <div className="flex h-12 rounded-xl border border-gray-200 overflow-hidden bg-white transition-all duration-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 shadow-sm">
      <div className="w-12 flex items-center justify-center text-gray-400 bg-gray-50">
        {icon}
      </div>

      <div className="flex-1">
        {isPassword ? (
          <Input.Password
            id={id}
            ref={ref}
            value={value || ""}
            onChange={onChange}
            onBlur={onBlur}
            bordered={false}
            placeholder={placeholder}
            className="w-full h-full px-4 text-sm"
          />
        ) : (
          <Input
            id={id}
            ref={ref}
            type={type}
            value={value || ""}
            onChange={onChange}
            onBlur={onBlur}
            bordered={false}
            placeholder={placeholder}
            className="w-full h-full px-4 text-sm bg-transparent"
          />
        )}
      </div>
    </div>
  );
});

export default function UpdateUserForm({ ROLE_MAP, selectedUser }) {
  const [form] = useForm();

  useEffect(() => {
    if (selectedUser) {
      console.log(selectedUser);

      form.setFieldsValue({
        fullName: selectedUser.fullName,
        roleName: selectedUser.role,
        email: selectedUser.email,
        phone: selectedUser.phone,
      });
    }
  }, [form, selectedUser]);
  return (
    <Form
      form={form}
      layout="vertical"
      className="space-y-5"
      //   onFinish={(values) => handleSubmitForm(values)}
    >
      <h1 className="text-3xl font-serif">Cập nhập thông tin người dùng</h1>
      <Form.Item
        name="fullName"
        label="Họ và tên"
        rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
      >
        <CustomInput icon={<User />} placeholder="Nguyễn Văn A" />
      </Form.Item>

      <Form.Item
        name="roleName"
        label="Vai trò người dùng"
        rules={[
          {
            required: true,
            message: "Vui lòng chọn vai trò cho người dùng",
          },
        ]}
      >
        <Select
          options={Object.values(ROLE_MAP).map((r) => ({
            label: r.label,
            value: r.value,
          }))}
          placeholder="Chọn vai trò"
          className="h-12"
          popupClassName="rounded-xl"
          style={{ width: "100%" }}
        />
      </Form.Item>

      <Form.Item
        name="phone"
        label="Số điện thoại"
        rules={[
          { required: true, message: "Vui lòng nhập số điện thoại" },
          {
            pattern: /^[0-9]{9,11}$/,
            message: "Số điện thoại không hợp lệ",
          },
        ]}
      >
        <CustomInput icon={<Phone />} placeholder="0987654321" />
      </Form.Item>

      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: "Vui lòng nhập email" },
          {
            pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            message: "Email sai định dạng",
          },
        ]}
      >
        <CustomInput
          icon={<Mail />}
          type="email"
          placeholder="you@example.com"
        />
      </Form.Item>

      <Form.Item
        name="password"
        label="Mật khẩu"
        rules={[
          { required: true, message: "Vui lòng nhập mật khẩu" },
          {
            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&]).{8,}$/,
            message:
              "Mật khẩu tối thiểu 8 ký tự, có chữ hoa, số và ký tự đặc biệt",
          },
        ]}
      >
        <CustomInput icon={<Lock />} isPassword placeholder="••••••••" />
      </Form.Item>
    </Form>
  );
}

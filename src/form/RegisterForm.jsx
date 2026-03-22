import { Button, Form, Input } from "antd";
import { useForm } from "antd/es/form/Form";
import { Mail, Phone, User, Lock } from "lucide-react";
import React, { useEffect, forwardRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../redux/auth/authSlice";
import { appToast } from "../utils/appToast";

const CustomInput = forwardRef((props, ref) => {
  const { id, value, onChange, onBlur, icon, isPassword, placeholder, type } =
    props;

  return (
    <div className="flex h-11 rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-teal-500 bg-white">
      <div className="w-1/5 flex shrink-0 items-center justify-center bg-gray-50 text-gray-400 border-r border-gray-100">
        {icon}
      </div>
      <div className="w-4/5">
        {isPassword ? (
          <Input.Password
            id={id}
            ref={ref}
            value={value || ""}
            onChange={onChange}
            onBlur={onBlur}
            bordered={false}
            placeholder={placeholder}
            className="w-full h-full px-4"
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
            className="w-full h-full px-4 bg-transparent"
          />
        )}
      </div>
    </div>
  );
});

export default function RegisterForm() {
  const [form] = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notificationMessage, notificationType } = useSelector(
    (state) => state.auth,
  );

  function onSubmitForm(values) {
    dispatch(registerUser(values));
  }

  useEffect(() => {
    if (notificationType === "success") {
      appToast.success(notificationMessage || "Đăng ký thành công!");
      navigate("/auth/login");
    }
    if (notificationType === "error") {
      appToast.error(
        typeof notificationMessage === "string"
          ? notificationMessage
          : "Đăng ký thất bại!",
      );
    }
  }, [notificationMessage, notificationType, navigate]);

  return (
    <div>
      <Form
        form={form}
        layout="vertical"
        className="mt-10 space-y-6"
        onFinish={onSubmitForm}
      >
        <Form.Item
          name="fullName"
          label="Họ và tên"
          rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
        >
          <CustomInput icon={<User />} placeholder="Nguyễn Văn A" />
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

        <Form.Item
          name="confirmPassword"
          label="Xác nhận mật khẩu"
          dependencies={["password"]}
          hasFeedback
          rules={[
            { required: true, message: "Vui lòng xác nhận mật khẩu" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("Mật khẩu xác nhận không khớp"),
                );
              },
            }),
          ]}
        >
          <CustomInput icon={<Lock />} isPassword placeholder="••••••••" />
        </Form.Item>

        <Form.Item>
          <Button
            htmlType="submit"
            className="w-full flex items-center justify-center gap-2"
            style={{
              backgroundColor: "black",
              color: "white",
              height: "44px",
            }}
          >
            <span className="text-white text-lg">Đăng ký →</span>
          </Button>
        </Form.Item>

        <p className="text-center text-sm text-gray-500">
          Đã có tài khoản?{" "}
          <Link
            to="/auth/login"
            className="text-teal-600 font-medium hover:underline"
          >
            Đăng nhập
          </Link>
        </p>
      </Form>
    </div>
  );
}

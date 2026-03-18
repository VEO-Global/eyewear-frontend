import { Button, Form, Input } from "antd";
import { useForm } from "antd/es/form/Form";
import { Mail, Phone, User } from "lucide-react";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../redux/auth/authSlice";
import { toast } from "react-toastify";

export default function RegisterForm() {
  const [form] = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notificationMessage, notificationType } = useSelector(
    (state) => state.auth
  );

  function onSubmitForm(values) {
    dispatch(registerUser(values));
  }

  useEffect(() => {
    if (notificationType === "success") {
      toast.success(notificationMessage);
      navigate("/auth/login");
    }
    if (notificationType === "error") {
      toast.error("Email này đã tồn tại");
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
        {/* Họ tên */}
        <Form.Item
          name="fullName"
          label="Họ và tên"
          rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
        >
          <div
            className="flex h-11 rounded-lg border border-gray-300 overflow-hidden
                              focus-within:ring-2 focus-within:ring-teal-500"
          >
            <div className="w-1/5 flex items-center justify-center bg-gray-50 text-gray-400">
              <User />
            </div>
            <Input
              placeholder="Nguyễn Văn A"
              bordered={false}
              className="w-4/5 px-4"
            />
          </div>
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
          <div
            className="flex h-11 rounded-lg border border-gray-300 overflow-hidden
                focus-within:ring-2 focus-within:ring-teal-500"
          >
            <div className="w-1/5 flex items-center justify-center bg-gray-50 text-gray-400">
              <Phone />
            </div>
            <Input
              placeholder="0987654321"
              bordered={false}
              className="w-4/5 px-4"
            />
          </div>
        </Form.Item>

        {/* Email */}
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Vui lòng nhập email" },
            { type: "email", message: "" },
            {
              pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
              message: "Email sai định dạng",
            },
          ]}
        >
          <div
            className="flex h-11 rounded-lg border border-gray-300 overflow-hidden
                              focus-within:ring-2 focus-within:ring-teal-500"
          >
            <div className="w-1/5 flex items-center justify-center bg-gray-50 text-gray-400">
              <Mail />
            </div>
            <Input
              placeholder="you@example.com"
              variant={false}
              className="w-4/5 px-4"
            />
          </div>
        </Form.Item>

        {/* Mật khẩu */}
        <Form.Item
          name="password"
          label="Mật khẩu"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu" },
            {
              pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&]).{8,}$/,
              message:
                "Mật khẩu phải có ít nhất 6 ký tự, 1 chữ hoa, 1 số, 1 ký tự đặc biệt và không chứa dấu !",
            },
          ]}
        >
          <div
            className="flex h-11 rounded-lg border border-gray-300 overflow-hidden
                              focus-within:ring-2 focus-within:ring-teal-500"
          >
            <div className="w-1/5 flex items-center justify-center bg-gray-50 text-gray-400">
              <Lock />
            </div>
            <Input.Password
              placeholder="••••••••"
              bordered={false}
              className="w-4/5 px-4"
            />
          </div>
        </Form.Item>

        {/* Xác nhận mật khẩu */}
        <Form.Item
          name="confirmPassword"
          label="Xác nhận mật khẩu"
          dependencies={["password"]}
          rules={[
            { required: true, message: "Vui lòng xác nhận mật khẩu" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("Mật khẩu xác nhận không khớp")
                );
              },
            }),
          ]}
        >
          <div
            className="flex h-11 rounded-lg border border-gray-300 overflow-hidden
                              focus-within:ring-2 focus-within:ring-teal-500"
          >
            <div className="w-1/5 flex items-center justify-center bg-gray-50 text-gray-400">
              <Lock />
            </div>
            <Input.Password
              placeholder="••••••••"
              variant={false}
              className="w-4/5 px-4"
            />
          </div>
        </Form.Item>

        {/* Số điện thoại */}

        {/* Submit */}
        <Form.Item>
          <Button
            htmlType="submit"
            className="w-full flex items-center justify-center gap-2"
            style={{
              backgroundColor: "black",
              height: "44px",
            }}
          >
            <span className="text-white text-lg">Đăng ký →</span>
          </Button>
        </Form.Item>

        {/* Login link */}
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

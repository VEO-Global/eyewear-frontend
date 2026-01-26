import { Key, Mail } from "lucide-react";
import video from "../assets/video/advertise-video.mp4";
import { Button, Checkbox, Form, Input } from "antd";
import { Link } from "react-router-dom";
export default function LoginPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background">
      {/* LEFT: Video */}
      <div className="hidden lg:flex items-center justify-center relative px-12 border-r border-gray-200">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src={video} type="video/mp4" />
        </video>
      </div>

      {/* RIGHT: Form */}
      <div className="flex items-center justify-center px-6 py-12 bg-gradient-to-bl  from-teal-50 via-white to-blue-50 overflow-hidden">
        <div className="w-full max-w-md">
          {/* Tiêu đề */}
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900">
            Chào mừng bạn quay lại
          </h1>
          <p className="mt-2 text-base text-gray-500">
            Đăng nhập vào tài khoản EyeCare để tiếp tục mua sắm
          </p>

          {/* Form */}
          <div
            className="bg-white/80 backdrop-blur
  rounded-2xl
  p-10
  shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]"
          >
            <Form
              layout="vertical"
              className="mt-10 space-y-6"
              onFinish={(values) => {
                console.log("Login data:", values);
              }}
            >
              {/* EMAIL */}
              <Form.Item
                label={
                  <span className="text-lg font-medium text-gray-900">
                    Email của bạn
                  </span>
                }
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập email" },
                  { type: "email", message: "Email không hợp lệ" },
                ]}
              >
                <div className="flex h-11 rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-teal-500">
                  <div className="w-1/5 flex items-center justify-center bg-gray-50 text-gray-400">
                    <Mail />
                  </div>
                  <Input
                    placeholder="you@example.com"
                    className="w-4/5 border-0 outline-none shadow-none focus:shadow-none"
                  />
                </div>
              </Form.Item>

              {/* PASSWORD */}
              <Form.Item
                label={
                  <span className="text-lg font-medium text-gray-900">
                    Mật khẩu
                  </span>
                }
                name="password"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
              >
                <div className="flex h-11 rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-teal-500">
                  <div className="w-1/5 flex items-center justify-center bg-gray-50 text-gray-400">
                    <Key />
                  </div>
                  <Input.Password
                    placeholder="••••••••"
                    className="w-4/5 border-0 outline-none shadow-none focus:shadow-none"
                  />
                </div>
              </Form.Item>

              {/* REMEMBER + FORGOT */}
              <div className="flex items-center justify-between">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox className="text-sm">Ghi nhớ đăng nhập</Checkbox>
                </Form.Item>

                <a
                  href="/forgot-password"
                  className="text-sm text-teal-600 hover:underline"
                >
                  Quên mật khẩu?
                </a>
              </div>

              {/* SUBMIT */}
              <Form.Item>
                <Button
                  htmlType="submit"
                  className="
        w-full flex items-center justify-center gap-2
      "
                  style={{ backgroundColor: "black", height: "44px" }}
                >
                  <span className="text-lg text-white font-medium">
                    {" "}
                    Đăng nhập →
                  </span>
                </Button>
              </Form.Item>

              {/* DIVIDER */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-gray-400">
                    Hoặc tiếp tục với
                  </span>
                </div>
              </div>

              {/* SOCIAL */}
              <div className="grid grid-cols-2 gap-3">
                <Button className="h-11 border border-gray-300 rounded-lg">
                  Google
                </Button>
                <Button className="h-11 border border-gray-300 rounded-lg">
                  GitHub
                </Button>
              </div>

              {/* REGISTER */}
              <p className="text-center text-sm text-gray-500">
                Chưa có tài khoản?{" "}
                <Link
                  to="/auth/register"
                  className="text-teal-600 font-medium hover:underline"
                >
                  Tạo tài khoản mới
                </Link>
              </p>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}

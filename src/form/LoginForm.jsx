import React, { useEffect } from "react";
import { Key, Mail } from "lucide-react";
import { Button, Checkbox, Form, Input } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile, loginUser } from "../redux/auth/authSlice";
import { fetchCart } from "../redux/cart/cartSlice";
import { fetchFavorites } from "../redux/favorites/favoriteSlice";
import { fetchNotifications } from "../redux/notification/notificationSlice";
import { appToast } from "../utils/appToast";
import { normalizeRoleName } from "../utils/authRole";

function resolvePostLoginPath(role) {
  switch (normalizeRoleName(role)) {
    case "ADMIN":
      return "/admin/dashboard";
    case "MANAGER":
      return "/manager/dashboard";
    case "OPERATIONS":
      return "/operation";
    case "SALES":
      return "/";
    case "CUSTOMER":
    default:
      return "/";
  }
}

export default function LoginnForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, user } = useSelector((state) => state.auth);

  async function handleLogin(values) {
    const result = await dispatch(loginUser(values));

    if (loginUser.fulfilled.match(result)) {
      const profileResult = await dispatch(fetchProfile());
      await Promise.all([
        dispatch(fetchCart()),
        dispatch(fetchFavorites()),
        dispatch(fetchNotifications()),
      ]);
      const nextRole = profileResult.payload?.role ?? result.payload.sessionUser?.role ?? user?.role;
      const nextPath = resolvePostLoginPath(nextRole);

      if (fetchProfile.fulfilled.match(profileResult)) {
        appToast.success("Đăng nhập thành công");
        navigate(nextPath, { replace: true });
        return;
      }

      if (profileResult.payload?.status && profileResult.payload.status !== 403) {
        appToast.warning(profileResult.payload.message || "Không tải được thông tin người dùng.");
      } else {
        appToast.success("Đăng nhập thành công");
      }

      navigate(nextPath, { replace: true });
      return;
    }

    if (loginUser.rejected.match(result)) {
      appToast.error(result.payload || "Sai email hoặc mật khẩu");
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      navigate(resolvePostLoginPath(user?.role), { replace: true });
    }
  }, [isAuthenticated, navigate, user?.role]);

  return (
    <div className="rounded-2xl bg-white/80 p-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] backdrop-blur">
      <Form layout="vertical" className="mt-10 space-y-6" onFinish={handleLogin}>
        <Form.Item
          label={<span className="text-lg font-medium text-gray-900">Email của bạn</span>}
          name="email"
          rules={[
            { required: true, message: "Vui lòng nhập email" },
            { type: "email", message: "" },
            {
              pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
              message: "Email sai định dạng",
            },
          ]}
        >
          <div className="flex h-11 overflow-hidden rounded-lg border border-gray-300 focus-within:ring-2 focus-within:ring-teal-500">
            <div className="flex w-1/5 items-center justify-center bg-gray-50 text-gray-400">
              <Mail />
            </div>
            <Input
              placeholder="you@example.com"
              autoComplete="email"
              className="w-4/5 border-0 outline-none shadow-none focus:shadow-none"
            />
          </div>
        </Form.Item>

        <Form.Item
          label={<span className="text-lg font-medium text-gray-900">Mật khẩu</span>}
          name="password"
          rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
        >
          <div className="flex h-11 overflow-hidden rounded-lg border border-gray-300 focus-within:ring-2 focus-within:ring-teal-500">
            <div className="flex w-1/5 items-center justify-center bg-gray-50 text-gray-400">
              <Key />
            </div>
            <Input.Password
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-4/5 border-0 outline-none shadow-none focus:shadow-none"
            />
          </div>
        </Form.Item>

        <div className="flex items-center justify-between">
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox className="text-sm">Ghi nhớ đăng nhập</Checkbox>
          </Form.Item>

          <a href="/forgot-password" className="text-sm text-teal-600 hover:underline">
            Quên mật khẩu?
          </a>
        </div>

        <Form.Item>
          <Button
            htmlType="submit"
            loading={loading}
            className="flex w-full items-center justify-center gap-2"
            style={{ backgroundColor: "black", height: "44px" }}
          >
            <span className="text-lg font-medium text-white">Đăng nhập →</span>
          </Button>
        </Form.Item>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-gray-400">Hoặc tiếp tục với</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button className="h-11 rounded-lg border border-gray-300">Google</Button>
          <Button className="h-11 rounded-lg border border-gray-300">GitHub</Button>
        </div>

        <p className="text-center text-sm text-gray-500">
          Chưa có tài khoản?{" "}
          <Link to="/auth/register" className="font-medium text-teal-600 hover:underline">
            Tạo tài khoản mới
          </Link>
        </p>
      </Form>
    </div>
  );
}

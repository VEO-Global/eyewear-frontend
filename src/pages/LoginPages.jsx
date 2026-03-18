/* eslint-disable no-unused-vars */
import { Key, Mail } from "lucide-react";
import video from "../assets/video/advertise-video.mp4";
import { Button, Checkbox, Form, Input } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { fetchProfile, loginUser } from "../redux/auth/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { toast } from "react-toastify";
import LoginnForm from "../form/LoginForm";
export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, notificationMessage, notificationType } =
    useSelector((state) => state.auth);

  async function handleLogin(values) {
    const result = await dispatch(loginUser(values));

    if (loginUser.fulfilled.match(result)) {
      dispatch(fetchProfile());
      toast.success("Đăng nhập thành công");
      navigate("/");
    }

    if (loginUser.rejected.match(result)) {
      toast.error(result.payload || "Sai email hoặc mật khẩu");
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  return (
    <>
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
        <div className="flex items-center justify-center px-6 py-12 bg-linear-to-bl  from-teal-50 via-white to-blue-50 overflow-hidden">
          <div className="w-full max-w-md">
            {/* Tiêu đề */}
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900">
              Chào mừng bạn quay lại
            </h1>
            <p className="mt-2 text-base text-gray-500">
              Đăng nhập vào tài khoản EyeCare để tiếp tục mua sắm
            </p>

            {/* Form */}
            <LoginnForm />
          </div>
        </div>
      </div>
    </>
  );
}

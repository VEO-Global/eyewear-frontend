import video from "../assets/video/advertise-video.mp4";

import { Link } from "react-router-dom";

import RegisterForm from "../form/RegisterForm";
export default function RegisterPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background">
      {/* LEFT: Video */}
      <div className="hidden lg:flex relative border-r border-gray-200">
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

      {/* RIGHT: Register Form */}
      <div className="flex items-center justify-center px-6 py-12 bg-linear-to-bl from-teal-50 via-white to-blue-50">
        <div className="w-full max-w-md bg-white/80 backdrop-blur rounded-2xl p-10 shadow-xl">
          {/* Header */}
          <h1 className="text-4xl font-serif font-bold text-gray-900">
            Tạo tài khoản
          </h1>
          <p className="mt-2 text-gray-500">
            Đăng ký để trải nghiệm kính mắt cao cấp
          </p>

          {/* FORM */}
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}

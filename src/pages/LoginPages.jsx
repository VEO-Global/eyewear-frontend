/* eslint-disable no-unused-vars */
import video from "../assets/video/advertise-video.mp4";
import LoginnForm from "../form/LoginForm";

export default function LoginPage() {
  return (
    <div className="grid min-h-screen grid-cols-1 bg-background lg:grid-cols-2">
      <div className="relative hidden items-center justify-center border-r border-gray-200 px-12 lg:flex">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src={video} type="video/mp4" />
        </video>
      </div>

      <div className="flex items-center justify-center overflow-hidden bg-linear-to-bl from-teal-50 via-white to-blue-50 px-6 py-12">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
            Chào mừng bạn quay lại
          </h1>
          <p className="mt-2 text-base text-gray-500">
            Đăng nhập vào tài khoản EyeCare để tiếp tục mua sắm
          </p>

          <LoginnForm />
        </div>
      </div>
    </div>
  );
}

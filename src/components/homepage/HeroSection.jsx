import React from "react";
import { ArrowRight, Calendar, Settings } from "lucide-react";
import { Button } from "../common/Button";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
export function HeroSection() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  function handleNavigate() {
    {
      isAuthenticated
        ? navigate("/products")
        : (toast.warning("Vui lòng đăng nhập để tiếp tục"),
          navigate("/auth/login"));
    }
  }
  return (
    <section className="relative bg-gradient-to-br from-teal-50 via-white to-amber-50 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-teal-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-amber-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-xfull h-2 w-2 bg-teal-500"></span>
              </span>
              Công nghệ đo mắt chuẩn quốc tế
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight tracking-tight">
              Giải pháp kính mắt <br />
              <span className="text-teal-600">toàn diện</span> cho đôi mắt
            </h1>

            <p className="text-lg text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Mua kính nhanh chóng – Đặt trước tiện lợi – Cá nhân hóa theo nhu
              cầu. Trải nghiệm dịch vụ chăm sóc mắt chuyên nghiệp và tận tâm
              nhất.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Button
                onClick={() => handleNavigate()}
                size="lg"
                className="shadow-lg shadow-teal-200/50 cursor-pointer"
              >
                Mua kính ngay <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="shadow-lg shadow-amber-200/50  cursor-pointer"
              >
                <Calendar className="mr-2 h-5 w-5" /> Đặt trước
              </Button>
            </div>

            <div className="pt-8 flex items-center justify-center lg:justify-start gap-8 text-sm text-gray-500 font-medium">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                Chính hãng 100%
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                Bảo hành trọn đời
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                Đo mắt miễn phí
              </div>
            </div>
          </div>

          {/* Image/Visual */}
          <div className="relative lg:h-[600px] flex items-center justify-center">
            <div className="relative w-full max-w-lg aspect-square">
              {/* Abstract shapes representing glasses/vision */}
              <div className="absolute inset-0 bg-gradient-to-tr from-teal-200 to-amber-200 rounded-full opacity-20 animate-pulse" />
              <div className="absolute inset-4 bg-white/40 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 flex items-center justify-center overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=1000"
                  alt="Premium Eyewear"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Floating Cards */}
              <div className="absolute -left-8 top-1/4 bg-white p-4 rounded-xl shadow-xl border border-gray-100 animate-bounce duration-[3000ms]">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <span className="text-xl">👓</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Sản phẩm</p>
                    <p className="font-bold text-gray-900">500+ Mẫu</p>
                  </div>
                </div>
              </div>

              <div className="absolute -right-8 bottom-1/4 bg-white p-4 rounded-xl shadow-xl border border-gray-100 animate-bounce duration-[4000ms]">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-100 p-2 rounded-lg">
                    <span className="text-xl">⭐</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Đánh giá</p>
                    <p className="font-bold text-gray-900">4.9/5.0</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

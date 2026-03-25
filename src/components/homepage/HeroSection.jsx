import React from "react";
import { ArrowRight, Calendar } from "lucide-react";
import { Button } from "../common/Button";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { appToast } from "../../utils/appToast";
import { isStaffRole } from "../../utils/authRole";
import { staffTaskItems } from "../../utils/staffTasks";

function HeroVisual() {
  return (
    <div className="relative flex items-center justify-center lg:h-[600px]">
      <div className="relative aspect-square w-full max-w-lg">
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-teal-200 to-amber-200 opacity-20 animate-pulse" />
        <div className="absolute inset-4 flex items-center justify-center overflow-hidden rounded-3xl border border-white/50 bg-white/40 shadow-2xl backdrop-blur-sm">
          <img
            src="https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=1000"
            alt="Premium Eyewear"
            className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
          />
        </div>

        <div className="absolute -left-8 top-1/4 rounded-xl border border-gray-100 bg-white p-4 shadow-xl duration-[3000ms] animate-bounce">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2">
              <span className="text-xl">👓</span>
            </div>
            <div>
              <p className="text-xs text-gray-500">Sản phẩm</p>
              <p className="font-bold text-gray-900">500+ Mẫu</p>
            </div>
          </div>
        </div>

        <div className="absolute -right-8 bottom-1/4 rounded-xl border border-gray-100 bg-white p-4 shadow-xl duration-[4000ms] animate-bounce">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2">
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
  );
}

function StaffHero({ onStartWork }) {
  return (
    <div className="space-y-8 text-center lg:text-left">
      <div className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700">
        <span className="h-2 w-2 rounded-full bg-teal-500" />
        Bảng điều phối dành cho nhân viên
      </div>

      <div className="max-w-4xl space-y-4">
        <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-slate-900 sm:text-5xl xl:text-6xl">
          <span className="block whitespace-nowrap">
            Chào mừng bạn quay lại
          </span>
          <span className="mt-2 block text-teal-600">bắt đầu ca làm việc</span>
        </h1>

        <p className="max-w-3xl text-lg leading-9 text-slate-600">
          Theo dõi đơn hàng mới, kiểm tra prescription, hỗ trợ khách hàng và
          phối hợp với các bộ phận chuyên trách trong một không gian làm việc
          tập trung.
        </p>
      </div>

      <div className="flex justify-center pt-2 lg:justify-start">
        <Button
          onClick={onStartWork}
          size="lg"
          className="cursor-pointer shadow-lg shadow-teal-200/50"
        >
          Bắt đầu làm việc <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>

      <div className="flex flex-col items-center gap-3 pt-6 text-sm font-medium text-slate-500 sm:flex-row sm:flex-wrap lg:justify-start">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-teal-500" />
          Xử lý đơn hàng
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-teal-500" />
          Kiểm tra prescription
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-teal-500" />
          Hỗ trợ khách hàng
        </div>
      </div>
    </div>
  );
}

function CustomerHero({ onBrowseProducts, onPreorder }) {
  return (
    <div className="space-y-8 text-center lg:text-left">
      <div className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-500" />
        </span>
        Công nghệ đo mắt chuẩn quốc tế
      </div>

      <h1 className="text-4xl font-bold leading-tight tracking-tight text-gray-900 lg:text-6xl">
        Giải pháp kính mắt <br />
        <span className="text-teal-600">toàn diện</span> cho đôi mắt
      </h1>

      <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-600 lg:mx-0">
        Mua kính nhanh chóng, đặt trước tiện lợi và cá nhân hóa theo nhu cầu.
        Trải nghiệm dịch vụ chăm sóc mắt chuyên nghiệp và tận tâm.
      </p>

      <div className="flex flex-col justify-center gap-4 pt-4 sm:flex-row lg:justify-start">
        <Button
          onClick={onBrowseProducts}
          size="lg"
          className="cursor-pointer shadow-lg shadow-teal-200/50"
        >
          Mua kính ngay <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
        <Button
          variant="secondary"
          size="lg"
          className="cursor-pointer shadow-lg shadow-amber-200/50"
          onClick={onPreorder}
        >
          <Calendar className="mr-2 h-5 w-5" /> Đặt trước
        </Button>
      </div>

      <div className="flex flex-col items-center gap-3 pt-8 text-sm font-medium text-gray-500 sm:flex-row sm:flex-wrap lg:justify-start">
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
  );
}

export function HeroSection() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const staffOnly = isStaffRole(user?.role);

  function handleBrowseProducts() {
    navigate("/products");
  }

  function handleStartWork() {
    navigate(staffTaskItems[0].href);
  }

  function handleNavigatePreorder() {
    if (isAuthenticated) {
      navigate("/user/preorder");
      return;
    }

    appToast.warning("Vui lòng đăng nhập để đặt trước");
    navigate("/auth/login");
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-white to-amber-50">
      <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-teal-100 opacity-30 mix-blend-multiply blur-3xl filter animate-blob" />
      <div className="animation-delay-2000 absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-amber-100 opacity-30 mix-blend-multiply blur-3xl filter animate-blob" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {staffOnly ? (
            <StaffHero onStartWork={handleStartWork} />
          ) : (
            <CustomerHero
              onBrowseProducts={handleBrowseProducts}
              onPreorder={handleNavigatePreorder}
            />
          )}

          <HeroVisual />
        </div>
      </div>
    </section>
  );
}

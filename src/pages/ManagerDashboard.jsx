import { ArrowRight, ChartNoAxesCombined, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/common/Button";

function HeroVisual() {
  return (
    <div className="relative flex items-center justify-center lg:h-[600px]">
      <div className="relative aspect-square w-full max-w-lg">
        <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-tr from-teal-200 to-amber-200 opacity-20" />
        <div className="absolute inset-4 flex items-center justify-center overflow-hidden rounded-3xl border border-white/50 bg-white/40 shadow-2xl backdrop-blur-sm">
          <img
            src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=1200"
            alt="Không gian làm việc của quản lý"
            className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
          />
        </div>

        <div className="absolute -left-8 top-1/4 rounded-xl border border-gray-100 bg-white p-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2 text-teal-700">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Chính sách</p>
              <p className="font-bold text-gray-900">3 nhóm chính</p>
            </div>
          </div>
        </div>

        <div className="absolute -right-8 bottom-1/4 rounded-xl border border-gray-100 bg-white p-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2 text-amber-700">
              <ChartNoAxesCombined className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Phân tích</p>
              <p className="font-bold text-gray-900">Trung tâm doanh thu</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ManagerDashboard() {
  const navigate = useNavigate();

  function handleStartWork() {
    navigate("/manager/workspace", {
      state: {
        openDefaultSection: true,
      },
    });
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-teal-50 via-white to-amber-50">
      <div className="absolute -right-20 -top-20 h-96 w-96 animate-blob rounded-full bg-teal-100 opacity-30 mix-blend-multiply blur-3xl filter" />
      <div className="animation-delay-2000 absolute -bottom-20 -left-20 h-96 w-96 animate-blob rounded-full bg-amber-100 opacity-30 mix-blend-multiply blur-3xl filter" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700">
              <span className="h-2 w-2 rounded-full bg-teal-500" />
              Bảng điều phối dành cho quản lý
            </div>

            <div className="max-w-4xl space-y-4">
              <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-slate-900 sm:text-5xl xl:text-6xl">
                <span className="block whitespace-nowrap">Chào mừng bạn quay lại</span>
                <span className="mt-2 block text-teal-600">bắt đầu ca điều phối</span>
              </h1>

              <p className="max-w-3xl text-lg leading-9 text-slate-600">
                Theo dõi chính sách kinh doanh, cấu hình sản phẩm, quản lý giá bán, nhân sự và doanh
                thu trong một không gian làm việc riêng cho quản lý.
              </p>
            </div>

            <div className="flex justify-center pt-2 lg:justify-start">
              <Button
                onClick={handleStartWork}
                size="lg"
                className="cursor-pointer shadow-lg shadow-teal-200/50"
              >
                Bắt đầu làm việc <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <div className="flex flex-col items-center gap-3 pt-6 text-sm font-medium text-slate-500 sm:flex-row sm:flex-wrap lg:justify-start">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                Chính sách kinh doanh
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                Giá bán và khuyến mãi
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                Doanh thu
              </div>
            </div>
          </div>

          <HeroVisual />
        </div>
      </div>
    </section>
  );
}

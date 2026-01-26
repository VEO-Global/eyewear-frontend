import React from "react";
import { CheckCircle2, ClipboardList, Glasses, Ruler } from "lucide-react";
export function CustomGlassesProcess() {
  const steps = [
    {
      icon: ClipboardList,
      title: "Nhập thông tin thị lực",
      description:
        "Cung cấp số đo độ cận/loạn hoặc tải lên đơn thuốc của bác sĩ.",
    },
    {
      icon: Glasses,
      title: "Chọn gọng kính",
      description:
        "Lựa chọn gọng kính phù hợp với khuôn mặt và phong cách của bạn.",
    },
    {
      icon: Ruler,
      title: "Chọn tròng kính",
      description:
        "Tùy chọn loại tròng: chống ánh sáng xanh, đổi màu, siêu mỏng...",
    },
    {
      icon: CheckCircle2,
      title: "Xác nhận & Đặt hàng",
      description: "Kiểm tra lại thông tin và hoàn tất đơn hàng. Giao tận nơi.",
    },
  ];
  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-teal-600 font-bold tracking-wider uppercase text-sm">
            Quy trình đơn giản
          </span>
          <h2 className="text-3xl md:text-4xl font-bold font-sans text-gray-900 mt-2 mb-4">
            Làm kính theo nhu cầu
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Chỉ với 4 bước đơn giản để sở hữu chiếc kính hoàn hảo dành riêng cho
            bạn
          </p>
        </div>

        <div className="relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, index) => (
              <div
                key={index}
                className="group relative bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 text-center"
              >
                <div className="w-16 h-16 mx-auto bg-teal-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-teal-600 transition-colors duration-300 relative">
                  <step.icon className="h-8 w-8 text-teal-600 group-hover:text-white transition-colors duration-300" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold border-4 border-white">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

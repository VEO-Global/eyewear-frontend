import React from "react";
import { Clock, Eye, Glasses, PenTool } from "lucide-react";
export function ServiceCards() {
  const services = [
    {
      icon: Glasses,
      title: "Kính có sẵn",
      description:
        "Hàng trăm mẫu kính thời trang, giao nhanh trong 2h nội thành.",
      color: "bg-blue-50 text-blue-600",
      hoverBorder: "hover:border-blue-200",
    },
    {
      icon: Clock,
      title: "Đặt trước",
      description:
        "Giữ chỗ mẫu kính hot, phiên bản giới hạn, không lo hết hàng.",
      color: "bg-amber-50 text-amber-600",
      hoverBorder: "hover:border-amber-200",
    },
    {
      icon: PenTool,
      title: "Làm kính theo nhu cầu",
      description: "Chọn độ, tròng, gọng và lớp phủ theo đúng đôi mắt của bạn.",
      color: "bg-teal-50 text-teal-600",
      hoverBorder: "hover:border-teal-200",
    },
    {
      icon: Eye,
      title: "Kiểm tra thị lực online",
      description: "Bài test sơ bộ giúp bạn nhận biết tình trạng sức khỏe mắt.",
      color: "bg-purple-50 text-purple-600",
      hoverBorder: "hover:border-purple-200",
    },
  ];
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
            Dịch vụ nổi bật
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Chúng tôi cung cấp đa dạng các dịch vụ để đáp ứng mọi nhu cầu về
            kính mắt của bạn
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className={`group p-8 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer ${service.hoverBorder}`}
            >
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${service.color} transition-transform group-hover:scale-110 duration-300`}
              >
                <service.icon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-teal-600 transition-colors">
                {service.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import React from "react";
import { Award, HeartHandshake, ShieldCheck, Users } from "lucide-react";
export function WhyChooseUs() {
  const features = [
    {
      icon: Users,
      title: "Chuyên viên nhãn khoa",
      description: "Đội ngũ bác sĩ và kỹ thuật viên giàu kinh nghiệm, tận tâm.",
    },
    {
      icon: Award,
      title: "Sản phẩm chính hãng",
      description: "Cam kết 100% hàng chính hãng, đầy đủ giấy tờ xuất xứ.",
    },
    {
      icon: HeartHandshake,
      title: "Cá nhân hóa tối đa",
      description: "Tư vấn và thiết kế kính phù hợp nhất với từng khuôn mặt.",
    },
    {
      icon: ShieldCheck,
      title: "Bảo hành lâu dài",
      description: "Chính sách bảo hành và hậu mãi uy tín, hỗ trợ trọn đời.",
    },
  ];
  return (
    <section className="py-16 bg-teal-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Tại sao nên chọn <br />
              <span className="text-teal-400">EyeCare Store?</span>
            </h2>
            <p className="text-teal-100 text-lg mb-8 leading-relaxed">
              Chúng tôi không chỉ bán kính, chúng tôi mang đến giải pháp thị lực
              toàn diện. Sự hài lòng và sức khỏe đôi mắt của bạn là ưu tiên hàng
              đầu của chúng tôi.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <feature.icon className="h-6 w-6 text-teal-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                    <p className="text-sm text-teal-200 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative h-full min-h-[400px] rounded-2xl overflow-hidden shadow-2xl">
            <img
              src="https://www.istockphoto.com/photos/reflection-of-eyes"
              alt="Optometrist examining patient"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-teal-900/80 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8">
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
                <p className="text-xl font-medium italic">
                  "Đôi mắt là cửa sổ tâm hồn. Hãy để chúng tôi giúp bạn giữ cho
                  khung cửa ấy luôn sáng rõ."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

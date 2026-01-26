import React from "react";
import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Youtube,
} from "lucide-react";
export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Store Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">EyeCare Store</h3>
            <p className="text-sm leading-relaxed text-gray-400">
              Hệ thống kính mắt uy tín hàng đầu Việt Nam. Chúng tôi cam kết mang
              lại giải pháp thị lực tốt nhất cho đôi mắt của bạn.
            </p>
            <div className="flex items-start gap-3 pt-2">
              <MapPin className="h-5 w-5 text-teal-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm">
                123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh
              </span>
            </div>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">
              Chính sách
            </h3>
            <ul className="space-y-3">
              {[
                "Chính sách mua hàng",
                "Chính sách bảo hành",
                "Chính sách đổi trả",
                "Vận chuyển & Giao nhận",
                "Bảo mật thông tin",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm hover:text-teal-400 transition-colors flex items-center gap-2 group"
                  >
                    <span className="h-1 w-1 bg-gray-500 rounded-full group-hover:bg-teal-400 transition-colors" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">Liên hệ</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <div className="bg-gray-800 p-2 rounded-full">
                  <Phone className="h-5 w-5 text-teal-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Hotline</p>
                  <p className="font-medium text-white">1900 123 456</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="bg-gray-800 p-2 rounded-full">
                  <Mail className="h-5 w-5 text-teal-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium text-white">support@eyecare.vn</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">Kết nối</h3>
            <p className="text-sm text-gray-400 mb-4">
              Theo dõi chúng tôi để nhận ưu đãi mới nhất
            </p>
            <div className="flex gap-4">
              {[Facebook, Instagram, Youtube].map((Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="bg-gray-800 p-2.5 rounded-lg hover:bg-teal-600 hover:text-white transition-all duration-300 transform hover:-translate-y-1"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © 2024 EyeCare Store. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a
              href="#"
              className="text-sm text-gray-500 hover:text-white transition-colors"
            >
              Điều khoản
            </a>
            <a
              href="#"
              className="text-sm text-gray-500 hover:text-white transition-colors"
            >
              Riêng tư
            </a>
            <a
              href="#"
              className="text-sm text-gray-500 hover:text-white transition-colors"
            >
              Sitemap
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { Facebook, Instagram, Mail, MapPin, Phone, Youtube } from "lucide-react";
import { Link } from "react-router-dom";

const policyLinks = [
  { label: "Chính sách mua hàng", href: "/policies#purchase" },
  { label: "Chính sách bảo hành", href: "/policies#warranty" },
  { label: "Chính sách đổi trả", href: "/policies#return" },
  { label: "Vận chuyển & Giao nhận", href: "/policies#shipping" },
  { label: "Bảo mật thông tin", href: "/policies#privacy" },
];

export function Footer() {
  return (
    <footer className="bg-gray-900 pb-8 pt-16 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <h3 className="mb-4 text-xl font-bold text-white">EyeCare Store</h3>
            <p className="text-sm leading-relaxed text-gray-400">
              Hệ thống kính mắt uy tín hàng đầu Việt Nam. Chúng tôi cam kết mang lại giải pháp thị lực
              tốt nhất cho đôi mắt của bạn.
            </p>
            <div className="flex items-start gap-3 pt-2">
              <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-teal-500" />
              <span className="text-sm">123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</span>
            </div>
          </div>

          <div>
            <h3 className="mb-6 text-lg font-semibold text-white">Chính sách</h3>
            <ul className="space-y-3">
              {policyLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className="group flex items-center gap-2 text-sm transition-colors hover:text-teal-400"
                  >
                    <span className="h-1 w-1 rounded-full bg-gray-500 transition-colors group-hover:bg-teal-400" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-6 text-lg font-semibold text-white">Liên hệ</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <div className="rounded-full bg-gray-800 p-2">
                  <Phone className="h-5 w-5 text-teal-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Hotline</p>
                  <p className="font-medium text-white">1900 123 456</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="rounded-full bg-gray-800 p-2">
                  <Mail className="h-5 w-5 text-teal-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium text-white">support@eyecare.vn</p>
                </div>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-6 text-lg font-semibold text-white">Kết nối</h3>
            <p className="mb-4 text-sm text-gray-400">Theo dõi chúng tôi để nhận ưu đãi mới nhất</p>
            <div className="flex gap-4">
              {[Facebook, Instagram, Youtube].map((Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="transform rounded-lg bg-gray-800 p-2.5 transition-all duration-300 hover:-translate-y-1 hover:bg-teal-600 hover:text-white"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-800 pt-8 md:flex-row">
          <p className="text-sm text-gray-500">© 2024 EyeCare Store. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/policies#purchase" className="text-sm text-gray-500 transition-colors hover:text-white">
              Điều khoản
            </Link>
            <Link to="/policies#privacy" className="text-sm text-gray-500 transition-colors hover:text-white">
              Riêng tư
            </Link>
            <Link to="/policies" className="text-sm text-gray-500 transition-colors hover:text-white">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

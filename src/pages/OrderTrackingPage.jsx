import { ClipboardList, Cog, PackageCheck, Truck, CircleCheckBig, Ban, RotateCcw } from "lucide-react";
import { useMemo } from "react";
import { useLocation } from "react-router-dom";

const orderTabContent = {
  "tat-ca": {
    title: "Tất cả đơn hàng",
    description: "Xem toàn bộ đơn hàng của bạn, từ lúc tiếp nhận đến khi hoàn tất hoặc phát sinh đổi trả.",
    stats: [
      { label: "Đơn đang xử lý", value: "04" },
      { label: "Đơn hoàn thành", value: "12" },
      { label: "Yêu cầu hỗ trợ", value: "02" },
    ],
    icon: ClipboardList,
  },
  "cho-gia-cong": {
    title: "Đơn hàng chờ gia công",
    description: "Các đơn kính đang được đo cắt tròng, lắp ráp gọng hoặc hoàn thiện theo thông số của bạn.",
    stats: [
      { label: "Đơn mới tiếp nhận", value: "02" },
      { label: "Đơn đang mài lắp", value: "01" },
      { label: "Dự kiến hoàn tất", value: "24 giờ" },
    ],
    icon: Cog,
  },
  "van-chuyen": {
    title: "Đơn hàng đang vận chuyển",
    description: "Theo dõi các đơn đã bàn giao cho đơn vị giao nhận và đang trên đường đến bạn.",
    stats: [
      { label: "Đơn đang đi tỉnh", value: "02" },
      { label: "Đơn nội thành", value: "01" },
      { label: "Mã vận đơn", value: "03" },
    ],
    icon: Truck,
  },
  "cho-giao-hang": {
    title: "Đơn hàng chờ giao hàng",
    description: "Các đơn đã hoàn tất đóng gói và đang chờ nhân viên giao hàng hoặc đơn vị vận chuyển lấy hàng.",
    stats: [
      { label: "Đơn chờ lấy hàng", value: "03" },
      { label: "Đã đóng gói", value: "03" },
      { label: "Ưu tiên hôm nay", value: "01" },
    ],
    icon: PackageCheck,
  },
  "hoan-thanh": {
    title: "Đơn hàng hoàn thành",
    description: "Những đơn đã giao thành công để bạn tiện xem lại lịch sử mua hàng và thông tin bảo hành.",
    stats: [
      { label: "Tổng đơn hoàn tất", value: "12" },
      { label: "Bảo hành còn hạn", value: "05" },
      { label: "Đã đánh giá", value: "07" },
    ],
    icon: CircleCheckBig,
  },
  "da-huy": {
    title: "Đơn hàng đã hủy",
    description: "Danh sách đơn hàng đã hủy để bạn dễ kiểm tra lại lý do, thời gian và phương án hỗ trợ tiếp theo.",
    stats: [
      { label: "Đơn đã hủy", value: "02" },
      { label: "Đang chờ xác nhận", value: "01" },
      { label: "Đã hoàn tiền", value: "01" },
    ],
    icon: Ban,
  },
  "tra-hang-hoan-tien": {
    title: "Trả hàng và hoàn tiền",
    description: "Theo dõi các yêu cầu đổi trả, hoàn tiền và cập nhật tiến độ xử lý từ cửa hàng.",
    stats: [
      { label: "Yêu cầu đang xử lý", value: "01" },
      { label: "Đã duyệt", value: "01" },
      { label: "Hoàn tiền dự kiến", value: "3 ngày" },
    ],
    icon: RotateCcw,
  },
};

export default function OrderTrackingPage() {
  const location = useLocation();

  const activeTab = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get("tab") || "tat-ca";
  }, [location.search]);

  const currentSection = orderTabContent[activeTab] || orderTabContent["tat-ca"];
  const ActiveIcon = currentSection.icon;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(153,246,228,0.28),_transparent_24%),linear-gradient(180deg,#f8fafc_0%,#eef6ff_100%)] px-4 py-10">
      <div className="mx-auto max-w-5xl rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur sm:p-8">
        <div className="rounded-[28px] bg-gradient-to-r from-cyan-50 via-white to-sky-50 p-6 sm:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-teal-600 shadow-sm">
                <ActiveIcon className="h-4 w-4" />
                Theo dõi đơn hàng
              </div>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {currentSection.title}
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
                {currentSection.description}
              </p>
            </div>

            <div className="grid w-full max-w-md grid-cols-1 gap-3 sm:grid-cols-3">
              {currentSection.stats.map((item) => (
                <div
                  key={item.label}
                  className="flex min-h-[160px] flex-col rounded-3xl border border-sky-100 bg-white/90 p-5 shadow-sm"
                >
                  <p className="min-h-[3.5rem] text-xs font-semibold uppercase leading-6 tracking-[0.16em] text-slate-400 sm:min-h-[4rem]">
                    {item.label}
                  </p>
                  <p className="mt-auto text-2xl font-bold tabular-nums text-slate-900 sm:text-[2rem]">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Tiến trình xử lý</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Mỗi trạng thái sẽ có giao diện riêng để bạn dễ theo dõi tiến độ, thời gian và hướng xử lý tiếp theo.
            </p>
            <div className="mt-6 space-y-3">
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                Cập nhật gần nhất sẽ được hiển thị nổi bật ở khu vực này.
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                Trạng thái hiện tại: <span className="font-semibold text-teal-600">{currentSection.title}</span>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                Sau bước này mình có thể làm tiếp danh sách đơn thật cho từng tab.
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50/80 p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Khu vực nội dung riêng</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Bạn đang xem giao diện mẫu dành cho mục <span className="font-semibold text-slate-700">{currentSection.title}</span>.
            </p>
            <div className="mt-6 rounded-3xl border border-white bg-white p-5">
              <p className="text-sm font-medium text-slate-500">Gợi ý bước tiếp theo</p>
              <p className="mt-2 text-base leading-7 text-slate-700">
                Nếu bạn chốt bố cục này, mình sẽ dựng tiếp danh sách đơn hàng thật, chi tiết từng đơn và các hành động như xem chi tiết, đổi trả hoặc hoàn tiền.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import {
  AlertCircle,
  Box,
  CheckCheck,
  ClipboardList,
  PackageOpen,
  PhoneCall,
  TimerReset,
} from "lucide-react";
import StaffWorkspaceLayout from "../../components/staff/StaffWorkspaceLayout";

const intakeQueue = [
  {
    code: "EC-1024",
    customer: "Nguyễn Hoàng An",
    channel: "Website",
    type: "Pre-order gọng mới",
    status: "Chờ staff xác nhận",
    eta: "05 phút",
    priority: "Cao",
  },
  {
    code: "EC-1021",
    customer: "Trần Minh Trang",
    channel: "Cửa hàng",
    type: "Kính cận + tròng lọc ánh sáng xanh",
    status: "Đã đủ thông tin",
    eta: "12 phút",
    priority: "Vừa",
  },
  {
    code: "EC-1018",
    customer: "Lê Quốc Bảo",
    channel: "Facebook",
    type: "Pre-order bản giới hạn",
    status: "Đợi báo cọc",
    eta: "18 phút",
    priority: "Cao",
  },
];

const todayFlow = [
  { label: "Đơn mới vào hàng chờ", value: "18 đơn", icon: ClipboardList, tone: "teal" },
  { label: "Đơn pre-order cần giữ chỗ", value: "6 đơn", icon: Box, tone: "amber" },
  { label: "Đơn cần gọi lại khách", value: "4 đơn", icon: PhoneCall, tone: "rose" },
];

const followUpList = [
  "Ưu tiên gọi 2 khách pre-order chưa xác nhận cọc trước 10:30.",
  "Kiểm tra lại địa chỉ giao hàng của đơn EC-1018 vì khách đổi chi nhánh nhận.",
  "Nhắc kho giữ riêng mẫu gọng 'Aurora 03' cho đơn EC-1024.",
];

function QueueCard({ item }) {
  const priorityClass =
    item.priority === "Cao"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : "border-amber-200 bg-amber-50 text-amber-700";

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white">
              {item.code}
            </span>
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${priorityClass}`}>
              Ưu tiên {item.priority}
            </span>
          </div>
          <h3 className="mt-3 text-xl font-bold text-slate-900">{item.customer}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {item.type} • Kênh tiếp nhận: {item.channel}
          </p>
        </div>

        <div className="rounded-[22px] bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <p className="font-semibold text-slate-900">{item.status}</p>
          <p className="mt-1">Thời gian treo: {item.eta}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          className="rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
        >
          Nhận xử lý
        </button>
        <button
          type="button"
          className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Xem chi tiết
        </button>
        <button
          type="button"
          className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
        >
          Gửi báo giá giữ chỗ
        </button>
      </div>
    </div>
  );
}

export default function StaffOrderIntakePage() {
  return (
    <StaffWorkspaceLayout
      eyebrow="Workspace 01"
      title="Tiếp nhận và xử lý đơn hàng"
      description="Một màn chung để staff nắm đơn mới, đơn pre-order và các case cần phản hồi ngay. Mình gộp pre-order vào đây để thao tác nhận đơn, gọi xác nhận, giữ chỗ và đẩy bước tiếp theo trong cùng một luồng."
      currentPath="/staff/orders-intake"
      stats={[
        { label: "Hàng chờ", value: "18", hint: "Đơn mới chưa nhận trong ca hiện tại." },
        { label: "Pre-order", value: "06", hint: "Đơn cần giữ mẫu hoặc chốt cọc." },
        { label: "Phản hồi nhanh", value: "04", hint: "Case cần staff gọi lại trong 15 phút." },
      ]}
      leftColumn={
        <>
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-500">
                  Hàng đợi xử lý
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                  Đơn mới vào ca sáng
                </h2>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1.5 text-sm font-semibold text-teal-700">
                <TimerReset size={16} />
                Cập nhật mỗi 5 phút
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {intakeQueue.map((item) => (
                <QueueCard key={item.code} item={item} />
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-slate-900 p-3 text-white">
                <PackageOpen size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  Checklist tiếp nhận nhanh
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Giúp staff không bỏ sót thông tin ngay từ bước đầu.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                "Xác minh sản phẩm, biến thể và tình trạng kho hoặc pre-order.",
                "Đối chiếu số đo cơ bản, nhu cầu tròng và deadline mong muốn.",
                "Kiểm tra địa chỉ giao nhận hoặc điểm nhận tại cửa hàng.",
                "Đánh dấu case cần gọi lại hoặc xin thêm ảnh/toa kính.",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[24px] border border-slate-200 bg-slate-50/80 px-4 py-4 text-sm leading-7 text-slate-600"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </>
      }
      rightColumn={
        <>
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Tổng quan ca làm</h2>
            <div className="mt-5 space-y-3">
              {todayFlow.map((item) => {
                const Icon = item.icon;
                const toneClass =
                  item.tone === "amber"
                    ? "bg-amber-50 text-amber-700"
                    : item.tone === "rose"
                      ? "bg-rose-50 text-rose-700"
                      : "bg-teal-50 text-teal-700";

                return (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-[24px] border border-slate-200 bg-slate-50/70 px-4 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`rounded-2xl p-3 ${toneClass}`}>
                        <Icon size={18} />
                      </div>
                      <p className="max-w-[220px] text-sm font-medium leading-6 text-slate-700">
                        {item.label}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-slate-900">{item.value}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[32px] border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                <AlertCircle size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Việc cần follow-up</h2>
                <p className="mt-1 text-sm text-slate-500">Ưu tiên xử lý trước giờ cao điểm.</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {followUpList.map((item) => (
                <div
                  key={item}
                  className="rounded-[22px] border border-amber-200 bg-white/90 px-4 py-4 text-sm leading-7 text-slate-600"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                <CheckCheck size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  Đề xuất thao tác kế tiếp
                </h2>
              </div>
            </div>

            <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
              <li className="rounded-[22px] bg-white/90 px-4 py-4">Nhận các đơn treo trên 10 phút trước.</li>
              <li className="rounded-[22px] bg-white/90 px-4 py-4">
                Gắn tag pre-order để kho giữ hàng và gửi xác nhận cọc ngay.
              </li>
              <li className="rounded-[22px] bg-white/90 px-4 py-4">
                Chuyển case thiếu toa kính sang màn prescription sau khi đã thu đủ ảnh.
              </li>
            </ul>
          </div>
        </>
      }
    />
  );
}

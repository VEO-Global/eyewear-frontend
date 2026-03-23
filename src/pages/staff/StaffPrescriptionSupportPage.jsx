import { BadgeHelp, FileSearch, MessageSquareHeart, Phone, SlidersHorizontal } from "lucide-react";
import StaffWorkspaceLayout from "../../components/staff/StaffWorkspaceLayout";

const reviewCases = [
  {
    code: "RX-2201",
    customer: "Phạm Gia Hân",
    issue: "Ảnh toa kính mờ ở trục mắt trái",
    action: "Nhắn khách gửi lại ảnh rõ hơn hoặc đọc trực tiếp thông số.",
    severity: "Cần liên hệ ngay",
  },
  {
    code: "RX-2198",
    customer: "Đỗ Bích Ngọc",
    issue: "PD chưa có, khách muốn lấy kính trong hôm nay",
    action: "Hướng dẫn đo PD từ xa và xác nhận lại khung giờ giao.",
    severity: "Ưu tiên cao",
  },
  {
    code: "RX-2193",
    customer: "Lý Thành Công",
    issue: "Khách đổi từ tròng đơn sang chống ánh sáng xanh",
    action: "Cập nhật báo giá và xin xác nhận đồng ý nâng cấp.",
    severity: "Đang chờ phản hồi",
  },
];

const supportTimeline = [
  { time: "09:10", note: "Gọi khách Hân, chưa bắt máy, đã gửi Zalo kèm mẫu ảnh toa cần chụp lại." },
  { time: "09:24", note: "Ngọc xác nhận muốn nhận kính trước 18:00, cần chốt PD trong 20 phút nữa." },
  { time: "09:35", note: "Case Công đã chốt nâng cấp tròng, chờ staff cập nhật giá cuối." },
];

export default function StaffPrescriptionSupportPage() {
  return (
    <StaffWorkspaceLayout
      eyebrow="Workspace 02"
      title="Kiểm tra prescription và hỗ trợ khách hàng"
      description="Màn này tập trung vào các ca cần soi lại toa kính, làm rõ thông số và giữ nhịp trao đổi với khách hàng. Bố cục ưu tiên nhìn nhanh case nào đang thiếu dữ liệu, case nào chỉ còn chờ staff chốt cuộc gọi."
      currentPath="/staff/prescription-support"
      stats={[
        { label: "Case mở", value: "11", hint: "Prescription đang cần staff rà lại." },
        { label: "Gọi lại", value: "05", hint: "Khách chưa phản hồi hoặc cần staff gọi." },
        { label: "Hoàn tất", value: "08", hint: "Đã đủ điều kiện chuyển qua sản xuất." },
      ]}
      leftColumn={
        <>
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-cyan-100 p-3 text-cyan-700">
                <FileSearch size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  Danh sách prescription cần rà
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Ưu tiên theo độ gấp của khách và mức thiếu dữ liệu.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {reviewCases.map((item) => (
                <div
                  key={item.code}
                  className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-5"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white">
                        {item.code}
                      </div>
                      <h3 className="mt-3 text-xl font-bold text-slate-900">{item.customer}</h3>
                      <p className="mt-2 text-sm leading-7 text-slate-600">{item.issue}</p>
                    </div>
                    <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-700">
                      {item.severity}
                    </span>
                  </div>

                  <div className="mt-4 rounded-[22px] bg-white px-4 py-4 text-sm leading-7 text-slate-600">
                    {item.action}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      className="rounded-full bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700"
                    >
                      Cập nhật thông số
                    </button>
                    <button
                      type="button"
                      className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Gọi khách
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-violet-100 p-3 text-violet-700">
                <SlidersHorizontal size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  Bộ lọc thao tác nhanh
                </h2>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                "Thiếu ảnh toa kính rõ nét",
                "Thiếu PD hoặc thông số trục",
                "Khách muốn đổi loại tròng",
              ].map((item) => (
                <button
                  key={item}
                  type="button"
                  className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-5 text-left text-sm font-medium leading-6 text-slate-700 transition hover:-translate-y-0.5 hover:bg-white"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </>
      }
      rightColumn={
        <>
          <div className="rounded-[32px] border border-rose-200 bg-gradient-to-br from-rose-50 to-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-rose-100 p-3 text-rose-700">
                <Phone size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Timeline liên hệ</h2>
                <p className="mt-1 text-sm text-slate-500">Nhìn nhanh để không gọi trùng khách.</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {supportTimeline.map((item) => (
                <div
                  key={`${item.time}-${item.note}`}
                  className="rounded-[22px] border border-rose-200 bg-white/90 px-4 py-4"
                >
                  <p className="text-sm font-semibold text-rose-700">{item.time}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{item.note}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                <MessageSquareHeart size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  Mẫu trao đổi đề xuất
                </h2>
              </div>
            </div>

            <div className="mt-5 rounded-[24px] bg-white/90 px-4 py-4 text-sm leading-7 text-slate-600">
              “Em chào anh/chị, bên EyeCare đang rà lại toa kính để làm kính chuẩn nhất cho mình.
              Hiện ảnh toa hơi mờ ở phần mắt trái, anh/chị có thể chụp lại rõ hơn hoặc nhắn trực tiếp
              thông số để bên em xử lý ngay giúp mình ạ.”
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                <BadgeHelp size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  Lưu ý chuyên môn
                </h2>
              </div>
            </div>

            <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
              <li className="rounded-[22px] bg-slate-50 px-4 py-4">
                Nếu cylinder có giá trị mà axis trống, cần liên hệ xác minh trước khi chuyển sản xuất.
              </li>
              <li className="rounded-[22px] bg-slate-50 px-4 py-4">
                Các case nhận kính trong ngày phải chốt đủ PD và loại tròng trước khi bàn giao.
              </li>
              <li className="rounded-[22px] bg-slate-50 px-4 py-4">
                Mọi thay đổi về tròng cần cập nhật lại báo giá và xác nhận bằng tin nhắn.
              </li>
            </ul>
          </div>
        </>
      }
    />
  );
}

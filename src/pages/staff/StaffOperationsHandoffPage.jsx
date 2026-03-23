import { Boxes, CheckCircle2, MoveRight, PackageCheck, Send, Truck } from "lucide-react";
import StaffWorkspaceLayout from "../../components/staff/StaffWorkspaceLayout";

const handoffCards = [
  {
    code: "HD-510",
    customer: "Vũ Khánh Linh",
    summary: "Đã đủ prescription, chốt tròng chống chói, giao nội thành trong ngày mai.",
    lane: "Gia công kính",
  },
  {
    code: "HD-508",
    customer: "Trương Tấn Phúc",
    summary: "Đơn gọng sẵn kho, chỉ cần xác nhận đóng gói và bàn giao cho vận chuyển.",
    lane: "Giao vận",
  },
  {
    code: "HD-503",
    customer: "Ngô Yến Nhi",
    summary: "Case đổi màu tròng, cần đính kèm ghi chú xử lý cho Operations.",
    lane: "Gia công + QC",
  },
];

const laneSummary = [
  { label: "Chờ bàn giao", value: "09", icon: Send, tone: "sky" },
  { label: "Gia công hôm nay", value: "05", icon: Boxes, tone: "violet" },
  { label: "Sẵn sàng giao vận", value: "04", icon: Truck, tone: "emerald" },
];

export default function StaffOperationsHandoffPage() {
  return (
    <StaffWorkspaceLayout
      eyebrow="Workspace 03"
      title="Xác nhận đơn và chuyển cho Operations Staff"
      description="Đây là màn chốt cuối của Sales Staff trước khi đơn sang vận hành. Mình ưu tiên cảm giác 'đã đủ dữ liệu hay chưa', kèm phân luồng rõ ràng giữa gia công kính, kiểm tra chất lượng và giao vận."
      currentPath="/staff/operations-handoff"
      stats={[
        { label: "Sẵn sàng chuyển", value: "09", hint: "Đơn đã đủ thông tin để bàn giao." },
        { label: "Gia công", value: "05", hint: "Đơn cần làm kính hoặc tinh chỉnh tròng." },
        { label: "Giao vận", value: "04", hint: "Đơn có thể tạo lệnh giao ngay." },
      ]}
      leftColumn={
        <>
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
                <PackageCheck size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  Danh sách chờ bàn giao
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Chốt lần cuối trước khi đẩy qua bộ phận Operations Staff.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {handoffCards.map((item) => (
                <div key={item.code} className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-5">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white">
                        {item.code}
                      </span>
                      <h3 className="mt-3 text-xl font-bold text-slate-900">{item.customer}</h3>
                      <p className="mt-2 text-sm leading-7 text-slate-600">{item.summary}</p>
                    </div>

                    <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700">
                      {item.lane}
                    </span>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
                    >
                      Xác nhận và chuyển
                    </button>
                    <button
                      type="button"
                      className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Mở phiếu chi tiết
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Luồng xử lý đề xuất</h2>
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {[
                {
                  title: "Sales chốt dữ liệu",
                  body: "Kiểm tra thông tin khách, tròng, địa chỉ, ghi chú và deadline.",
                },
                {
                  title: "Operations tiếp nhận",
                  body: "Phân công gia công, chuẩn bị đóng gói hoặc xếp tuyến giao vận.",
                },
                {
                  title: "QC và xuất kho",
                  body: "Rà soát lần cuối trước khi cập nhật trạng thái cho khách hàng.",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
                    {item.title}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      }
      rightColumn={
        <>
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Tình trạng theo lane</h2>
            <div className="mt-5 space-y-3">
              {laneSummary.map((item) => {
                const Icon = item.icon;
                const toneClass =
                  item.tone === "violet"
                    ? "bg-violet-50 text-violet-700"
                    : item.tone === "emerald"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-sky-50 text-sky-700";

                return (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-[24px] border border-slate-200 bg-slate-50/70 px-4 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`rounded-2xl p-3 ${toneClass}`}>
                        <Icon size={18} />
                      </div>
                      <p className="text-sm font-medium leading-6 text-slate-700">{item.label}</p>
                    </div>
                    <p className="text-lg font-bold text-slate-900">{item.value}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[32px] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  Điều kiện để chuyển đơn
                </h2>
              </div>
            </div>

            <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
              <li className="rounded-[22px] bg-white/90 px-4 py-4">
                Prescription đã đủ hoặc case không cần toa kính.
              </li>
              <li className="rounded-[22px] bg-white/90 px-4 py-4">
                Loại tròng, màu sắc và biến thể gọng đã được khách xác nhận.
              </li>
              <li className="rounded-[22px] bg-white/90 px-4 py-4">
                Đã có ghi chú rõ cho Operations nếu khách có yêu cầu đặc biệt.
              </li>
            </ul>
          </div>

          <div className="rounded-[32px] border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                <MoveRight size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Handoff notes</h2>
              </div>
            </div>

            <div className="mt-5 rounded-[24px] bg-white/90 px-4 py-4 text-sm leading-7 text-slate-600">
              Các case giao trong ngày nên được đẩy qua Operations trước 11:00 để còn thời gian gia
              công, QC và điều phối ship. Những đơn đổi thông số phút cuối cần giữ note rõ để tránh
              làm lại kính.
            </div>
          </div>
        </>
      }
    />
  );
}

import { CircleDollarSign, RefreshCcw, ShieldCheck, Siren, Undo2 } from "lucide-react";
import StaffWorkspaceLayout from "../../components/staff/StaffWorkspaceLayout";

const complaintCases = [
  {
    code: "CS-301",
    customer: "Mai Nhật Vy",
    topic: "Đổi trả vì gọng đeo chưa vừa",
    status: "Đang hẹn khách tới fit lại",
  },
  {
    code: "CS-298",
    customer: "Phan Đức Long",
    topic: "Yêu cầu bảo hành bản lề",
    status: "Đã tạo phiếu bảo hành",
  },
  {
    code: "CS-294",
    customer: "Tạ Phương Linh",
    topic: "Hoàn tiền đơn giao chậm",
    status: "Chờ quản lý duyệt hoàn tiền",
  },
];

const policyBlocks = [
  {
    title: "Đổi trả",
    body: "Áp dụng cho các trường hợp sai mẫu, lỗi gia công hoặc khách cần chỉnh fit trong thời gian hỗ trợ.",
    icon: Undo2,
    tone: "sky",
  },
  {
    title: "Bảo hành",
    body: "Theo dõi tình trạng bản lề, ốc vít, gọng và lịch hẹn xử lý tại cửa hàng hoặc qua vận chuyển.",
    icon: ShieldCheck,
    tone: "emerald",
  },
  {
    title: "Hoàn tiền",
    body: "Gắn rõ nguyên nhân, mốc duyệt và hình thức hoàn tiền để khách không phải hỏi lại nhiều lần.",
    icon: CircleDollarSign,
    tone: "amber",
  },
];

export default function StaffAfterSalesPage() {
  return (
    <StaffWorkspaceLayout
      eyebrow="Workspace 04"
      title="Xử lý khiếu nại, đổi trả, bảo hành, hoàn tiền"
      description="Màn hậu mãi này ưu tiên cảm giác tin cậy và minh bạch: staff nhìn nhanh được từng case đang ở bước nào, vì sao khách liên hệ lại và thao tác kế tiếp cần làm để đóng case gọn gàng."
      currentPath="/staff/after-sales"
      stats={[
        { label: "Case mở", value: "07", hint: "Yêu cầu hậu mãi đang được theo dõi." },
        { label: "Đổi trả", value: "03", hint: "Case cần hẹn khách hoặc đổi mẫu." },
        { label: "Hoàn tiền", value: "02", hint: "Case đang chờ duyệt hoặc hoàn tất." },
      ]}
      leftColumn={
        <>
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-rose-100 p-3 text-rose-700">
                <Siren size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  Danh sách case hậu mãi
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Gom các ca đổi trả, bảo hành và hoàn tiền trong cùng một màn theo dõi.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {complaintCases.map((item) => (
                <div key={item.code} className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-5">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white">
                        {item.code}
                      </span>
                      <h3 className="mt-3 text-xl font-bold text-slate-900">{item.customer}</h3>
                      <p className="mt-2 text-sm leading-7 text-slate-600">{item.topic}</p>
                    </div>
                    <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700">
                      {item.status}
                    </span>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
                    >
                      Cập nhật case
                    </button>
                    <button
                      type="button"
                      className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Xem lịch sử
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Chính sách thao tác nhanh</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {policyBlocks.map((item) => {
                const Icon = item.icon;
                const toneClass =
                  item.tone === "emerald"
                    ? "bg-emerald-100 text-emerald-700"
                    : item.tone === "amber"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-sky-100 text-sky-700";

                return (
                  <div key={item.title} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                    <div className={`inline-flex rounded-2xl p-3 ${toneClass}`}>
                      <Icon size={20} />
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-slate-900">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{item.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      }
      rightColumn={
        <>
          <div className="rounded-[32px] border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                <RefreshCcw size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  Quy trình đóng case
                </h2>
              </div>
            </div>

            <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
              <li className="rounded-[22px] bg-white/90 px-4 py-4">
                Ghi rõ nguyên nhân khách liên hệ lại và mong muốn cuối cùng của khách.
              </li>
              <li className="rounded-[22px] bg-white/90 px-4 py-4">
                Chụp/đính kèm ảnh nếu liên quan lỗi sản phẩm hoặc lỗi gia công.
              </li>
              <li className="rounded-[22px] bg-white/90 px-4 py-4">
                Sau khi xử lý xong, gửi tin nhắn xác nhận để khách biết case đã được khép lại.
              </li>
            </ul>
          </div>

          <div className="rounded-[32px] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  Cam kết trải nghiệm
                </h2>
              </div>
            </div>

            <div className="mt-5 rounded-[24px] bg-white/90 px-4 py-4 text-sm leading-7 text-slate-600">
              Giao diện này thiên về sự trấn an: staff luôn thấy rõ case đang ở bước nào, ai đang giữ
              trách nhiệm và còn thiếu gì để kết thúc. Với khách hàng, điều đó chuyển thành cảm giác
              được theo sát thay vì phải hỏi lại nhiều lần.
            </div>
          </div>
        </>
      }
    />
  );
}

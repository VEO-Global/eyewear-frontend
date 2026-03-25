import StaffWorkspaceLayout from "../../components/staff/StaffWorkspaceLayout";

export default function StaffAfterSalesPage() {
  return (
    <StaffWorkspaceLayout
      eyebrow="Workspace 04"
      title="Xử lý khiếu nại, đổi trả, bảo hành, hoàn tiền"
      description="Màn hậu mãi hiện chưa nối dữ liệu thật, nên toàn bộ dữ liệu cứng đã được gỡ bỏ để tránh gây hiểu nhầm."
      currentPath="/staff/after-sales"
      stats={[]}
      leftColumn={
        <div className="rounded-[32px] border border-dashed border-slate-300 bg-white/90 px-6 py-14 text-center text-slate-500 shadow-sm">
          Chưa có dữ liệu hậu mãi để hiển thị.
        </div>
      }
      rightColumn={
        <div className="rounded-[32px] border border-dashed border-slate-300 bg-white/90 px-6 py-14 text-center text-slate-500 shadow-sm">
          Khi có nguồn dữ liệu thật, màn này sẽ hiển thị case hậu mãi tương ứng.
        </div>
      }
    />
  );
}

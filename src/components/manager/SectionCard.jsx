import { Alert, Button, Empty, Spin } from "antd";

export function SectionCard({ title, description, extra, children }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
          {description ? <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p> : null}
        </div>
        {extra ? <div>{extra}</div> : null}
      </div>
      {children}
    </div>
  );
}

export function SectionLoading({ label = "Đang tải dữ liệu..." }) {
  return (
    <div className="flex min-h-60 items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50/80">
      <div className="flex flex-col items-center gap-4">
        <Spin size="large" />
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
}

export function SectionError({ message, onRetry }) {
  return (
    <Alert
      type="error"
      showIcon
      message="Không thể tải mục này"
      description={
        <div className="space-y-3">
          <p>{message}</p>
          {onRetry ? (
            <Button onClick={onRetry} type="primary">
              Thử lại
            </Button>
          ) : null}
        </div>
      }
    />
  );
}

export function SectionEmpty({ description = "Chưa có dữ liệu để hiển thị." }) {
  return (
    <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/80 py-10">
      <Empty description={description} />
    </div>
  );
}

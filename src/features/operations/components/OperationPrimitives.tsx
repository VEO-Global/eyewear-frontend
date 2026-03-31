import { Loader2, X } from "lucide-react";
import { createPortal } from "react-dom";
import { cn } from "../utils/format";

export function SurfaceCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-white/70 bg-white/90 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur",
        className
      )}
    >
      {children}
    </div>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">{eyebrow}</p>
        ) : null}
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{title}</h1>
        {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function ActionButton({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  loading?: boolean;
}) {
  const variantStyles = {
    primary:
      "border border-cyan-200 bg-[linear-gradient(180deg,#ecfeff_0%,#cffafe_100%)] text-slate-950 shadow-[0_10px_24px_rgba(34,211,238,0.18)] hover:bg-[linear-gradient(180deg,#dffafe_0%,#bae6fd_100%)]",
    secondary: "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100",
    danger: "bg-rose-600 text-white hover:bg-rose-500",
  };

  const sizeStyles = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2.5 text-sm",
  };

  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 [&_svg]:shrink-0",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}

export function TextInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100",
        className
      )}
    />
  );
}

export function TextArea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100",
        className
      )}
    />
  );
}

export function SelectInput({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100",
        className
      )}
    >
      {children}
    </select>
  );
}

export function EmptyBlock({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
      <div className="max-w-md">
        <p className="text-lg font-semibold text-slate-900">{title}</p>
        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      </div>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-3xl bg-slate-200/70", className)} />;
}

export function OverlayModal({
  open,
  title,
  description,
  onClose,
  children,
  widthClassName = "max-w-2xl",
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  widthClassName?: string;
}) {
  if (!open) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[400] flex items-end justify-center bg-slate-950/45 p-3 sm:items-center sm:p-6">
      <div className="absolute inset-0" onClick={onClose} />
      <div
        className={cn(
          "relative z-[410] w-full rounded-[30px] border border-white/80 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.3)]",
          widthClassName
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
            {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[85vh] overflow-y-auto p-5 sm:p-6">{children}</div>
      </div>
    </div>,
    document.body
  );
}

export function SideSheet({
  open,
  title,
  description,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[350] bg-slate-950/45">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 w-full max-w-3xl overflow-hidden rounded-l-[32px] border-l border-white/70 bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_18%,#ffffff_100%)] shadow-[0_20px_80px_rgba(15,23,42,0.28)]">
        <div className="flex h-full flex-col">
          <div className="border-b border-slate-200 bg-white/90 px-5 py-4 backdrop-blur sm:px-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">Chi tiết đơn hàng</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{title}</h2>
                {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">{children}</div>
        </div>
      </div>
    </div>,
    document.body
  );
}

import { Filter, Search, X } from "lucide-react";
import {
  OPERATION_ORDER_TYPE_OPTIONS,
  OPERATION_STATUS_OPTIONS,
} from "../utils/constants";
import { ActionButton, SelectInput, SurfaceCard, TextInput } from "./OperationPrimitives";

export function OperationFilterBar({
  keyword,
  orderType,
  status,
  onKeywordChange,
  onOrderTypeChange,
  onStatusChange,
  onReset,
}: {
  keyword: string;
  orderType: string;
  status: string;
  onKeywordChange: (value: string) => void;
  onOrderTypeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onReset: () => void;
}) {
  return (
    <SurfaceCard className="border-slate-200/80 p-4 sm:p-5">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Filter className="h-4 w-4 text-cyan-700" />
          Lọc đơn hàng
        </div>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.8fr_1fr_1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <TextInput
              value={keyword}
              onChange={(event) => onKeywordChange(event.target.value)}
              placeholder="Tìm theo mã đơn, email, số điện thoại, tracking..."
              className="pl-11"
            />
          </div>
          <SelectInput value={orderType} onChange={(event) => onOrderTypeChange(event.target.value)}>
            {OPERATION_ORDER_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectInput>
          <SelectInput value={status} onChange={(event) => onStatusChange(event.target.value)}>
            {OPERATION_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectInput>
          <ActionButton variant="secondary" onClick={onReset} className="w-full lg:w-auto">
            <X className="h-4 w-4" />
            Đặt lại
          </ActionButton>
        </div>
      </div>
    </SurfaceCard>
  );
}

import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { OperationOrderFilters, OperationOrderType, OperationStatus } from "../types";
import { useDebouncedValue } from "./useDebouncedValue";

function sanitizeOrderType(value: string | null): OperationOrderType | "" {
  if (value === "NORMAL" || value === "PRE_ORDER" || value === "PRESCRIPTION") {
    return value;
  }

  return "";
}

function sanitizeStatus(value: string | null): OperationStatus | "" {
  if (
    value === "WAITING_FOR_STOCK" ||
    value === "MANUFACTURING" ||
    value === "PACKING" ||
    value === "READY_TO_SHIP" ||
    value === "SHIPPING" ||
    value === "COMPLETED"
  ) {
    return value;
  }

  return "";
}

export function useOperationFilters(defaultFilters?: OperationOrderFilters) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [keywordInput, setKeywordInput] = useState(
    searchParams.get("keyword") ?? defaultFilters?.keyword ?? ""
  );

  const debouncedKeyword = useDebouncedValue(keywordInput, 400);
  const orderType = sanitizeOrderType(searchParams.get("orderType") ?? defaultFilters?.orderType ?? "");
  const status = sanitizeStatus(searchParams.get("status") ?? defaultFilters?.status ?? "");
  const selectedOrderId = searchParams.get("selected");

  const filters = useMemo<OperationOrderFilters>(
    () => ({
      orderType,
      status,
      keyword: debouncedKeyword.trim(),
    }),
    [debouncedKeyword, orderType, status]
  );

  function updateParams(next: Record<string, string>) {
    const params = new URLSearchParams(searchParams);

    Object.entries(next).forEach(([key, value]) => {
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    setSearchParams(params, { replace: true });
  }

  function setOrderType(value: OperationOrderType | "") {
    updateParams({ orderType: value, selected: "" });
  }

  function setStatus(value: OperationStatus | "") {
    updateParams({ status: value, selected: "" });
  }

  function setKeyword(value: string) {
    setKeywordInput(value);
    updateParams({ keyword: value.trim(), selected: "" });
  }

  function setSelectedOrder(orderId?: number | string | null) {
    updateParams({ selected: orderId ? String(orderId) : "" });
  }

  function resetFilters() {
    setKeywordInput("");
    setSearchParams(new URLSearchParams(), { replace: true });
  }

  return {
    filters,
    keywordInput,
    orderType,
    status,
    selectedOrderId: selectedOrderId ? Number(selectedOrderId) : null,
    setKeyword,
    setOrderType,
    setStatus,
    setSelectedOrder,
    resetFilters,
  };
}

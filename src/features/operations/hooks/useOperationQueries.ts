import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  assignOperationLogistics,
  getOperationOrderDetail,
  getOperationOrders,
  getOperationSummary,
  receiveOperationStock,
  updateOperationOrderStatus,
  updateOperationTracking,
} from "../api/operationApi";
import type {
  OperationOrderFilters,
  ReceiveOperationStockPayload,
  UpdateOperationLogisticsPayload,
  UpdateOperationStatusPayload,
  UpdateOperationTrackingPayload,
} from "../types";

export const operationQueryKeys = {
  all: ["operation-orders"] as const,
  list: (filters: OperationOrderFilters) => ["operation-orders", filters] as const,
  summary: () => ["operation-summary"] as const,
  detail: (orderId?: number | string | null) => ["operation-order", orderId] as const,
};

export function useOperationOrders(filters: OperationOrderFilters) {
  return useQuery({
    queryKey: operationQueryKeys.list(filters),
    queryFn: () => getOperationOrders(filters),
  });
}

export function useOperationSummary() {
  return useQuery({
    queryKey: operationQueryKeys.summary(),
    queryFn: getOperationSummary,
  });
}

export function useOperationOrder(orderId?: number | string | null) {
  return useQuery({
    queryKey: operationQueryKeys.detail(orderId),
    queryFn: () => getOperationOrderDetail(orderId as number),
    enabled: Boolean(orderId),
  });
}

function useInvalidateOperationQueries() {
  const queryClient = useQueryClient();

  return async (orderId?: number | string | null) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: operationQueryKeys.all }),
      queryClient.invalidateQueries({ queryKey: operationQueryKeys.summary() }),
      queryClient.invalidateQueries({ queryKey: ["operation-order"] }),
      orderId
        ? queryClient.invalidateQueries({ queryKey: operationQueryKeys.detail(orderId) })
        : Promise.resolve(),
    ]);
  };
}

export function useUpdateOperationStatus() {
  const invalidate = useInvalidateOperationQueries();
  return useMutation({
    mutationFn: ({ orderId, payload }: { orderId: number; payload: UpdateOperationStatusPayload }) =>
      updateOperationOrderStatus(orderId, payload),
    onSuccess: async (_, variables) => invalidate(variables.orderId),
  });
}

export function useUpdateOperationLogistics() {
  const invalidate = useInvalidateOperationQueries();
  return useMutation({
    mutationFn: ({ orderId, payload }: { orderId: number; payload: UpdateOperationLogisticsPayload }) =>
      assignOperationLogistics(orderId, payload),
    onSuccess: async (_, variables) => invalidate(variables.orderId),
  });
}

export function useUpdateOperationTracking() {
  const invalidate = useInvalidateOperationQueries();
  return useMutation({
    mutationFn: ({ orderId, payload }: { orderId: number; payload: UpdateOperationTrackingPayload }) =>
      updateOperationTracking(orderId, payload),
    onSuccess: async (_, variables) => invalidate(variables.orderId),
  });
}

export function useReceiveOperationStock() {
  const invalidate = useInvalidateOperationQueries();
  return useMutation({
    mutationFn: ({ orderId, payload }: { orderId: number; payload: ReceiveOperationStockPayload }) =>
      receiveOperationStock(orderId, payload),
    onSuccess: async (_, variables) => invalidate(variables.orderId),
  });
}

import { Filter, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { appToast } from "../../../utils/appToast";
import { getApiErrorMessage } from "../../../utils/apiError";
import {
  LogisticsModal,
  TrackingModal,
  UpdateStatusModal,
} from "../components/OperationActionModals";
import { OperationFilterBar } from "../components/OperationFilterBar";
import { OperationOrderDetailSheet } from "../components/OperationOrderDetailSheet";
import {
  ActionButton,
  EmptyBlock,
  OverlayModal,
  SectionHeader,
  SurfaceCard,
} from "../components/OperationPrimitives";
import { OperationOrderCards, OperationOrdersTable } from "../components/OperationOrdersList";
import { useOperationFilters } from "../hooks/useOperationFilters";
import {
  useOperationOrder,
  useOperationOrders,
  useUpdateOperationLogistics,
  useUpdateOperationStatus,
  useUpdateOperationTracking,
  operationQueryKeys,
} from "../hooks/useOperationQueries";
import type { OperationOrderResponse, OperationStatus } from "../types";
import { getNextActionStatus, isReadyToShipBlocked } from "../utils/workflow";

export default function OperationsOrdersPage() {
  const {
    filters,
    keywordInput,
    orderType,
    status,
    selectedOrderId,
    setKeyword,
    setOrderType,
    setStatus,
    setSelectedOrder,
    resetFilters,
  } = useOperationFilters();

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [logisticsOpen, setLogisticsOpen] = useState(false);
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<OperationStatus | null>(null);
  const [advancingOrderId, setAdvancingOrderId] = useState<number | null>(null);

  const ordersQuery = useOperationOrders(filters);
  const detailQuery = useOperationOrder(selectedOrderId);
  const statusMutation = useUpdateOperationStatus();
  const logisticsMutation = useUpdateOperationLogistics();
  const trackingMutation = useUpdateOperationTracking();

  const selectedOrderSummary = useMemo(
    () =>
      (ordersQuery.data || []).find(
        (item) => String(item.orderId) === String(selectedOrderId)
      ) || null,
    [ordersQuery.data, selectedOrderId]
  );
  const activeOrder = useMemo(() => {
    if (!detailQuery.data && !selectedOrderSummary) {
      return null;
    }

    if (!detailQuery.data) {
      return selectedOrderSummary;
    }

    if (!selectedOrderSummary) {
      return detailQuery.data;
    }

    return {
      ...detailQuery.data,
      status: selectedOrderSummary.status,
      statusLabel: selectedOrderSummary.statusLabel,
      logisticsProvider: selectedOrderSummary.logisticsProvider,
      shippingMethod: selectedOrderSummary.shippingMethod,
      trackingNumber: selectedOrderSummary.trackingNumber,
      estimatedDeliveryDate: selectedOrderSummary.estimatedDeliveryDate,
      updatedAt: selectedOrderSummary.updatedAt,
      items: detailQuery.data.items,
      payment: detailQuery.data.payment,
      lens: detailQuery.data.lens,
      prescription: detailQuery.data.prescription,
      priceSummary: detailQuery.data.priceSummary,
      statusHistory: detailQuery.data.statusHistory,
    };
  }, [detailQuery.data, selectedOrderSummary]);
  const errorMessage = useMemo(
    () => (ordersQuery.isError ? getApiErrorMessage(ordersQuery.error, "Không thể lấy danh sách đơn hàng.") : ""),
    [ordersQuery.error, ordersQuery.isError]
  );

  async function handleSaveLogistics(payload: any) {
    if (!activeOrder) return;
    await logisticsMutation.mutateAsync({ orderId: activeOrder.orderId, payload });
    appToast.success("Cập nhật logistics thành công.");
  }

  async function handleSaveTracking(payload: any) {
    if (!activeOrder) return;
    await trackingMutation.mutateAsync({ orderId: activeOrder.orderId, payload });
    appToast.success("Cập nhật tracking thành công.");
  }

  async function handleUpdateStatus(payload: any) {
    if (!activeOrder) return;
    try {
      await statusMutation.mutateAsync({ orderId: activeOrder.orderId, payload });
      appToast.success("Cập nhật trạng thái thành công.");
    } catch (error) {
      appToast.error(getApiErrorMessage(error, "Không thể cập nhật trạng thái."));
    }
  }

  async function handleAdvanceOrder(order: OperationOrderResponse) {
    const nextStatus = getNextActionStatus(order);

    if (!nextStatus) {
      return;
    }

    if (nextStatus === "READY_TO_SHIP" && isReadyToShipBlocked(order)) {
      setSelectedOrder(order.orderId);
      appToast.warning("Cần cập nhật logistics và tracking trước khi chuyển sang sẵn sàng giao.");
      return;
    }

    try {
      setAdvancingOrderId(order.orderId);
      await statusMutation.mutateAsync({
        orderId: order.orderId,
        payload: {
          status: nextStatus,
        },
      });
      appToast.success("Đã chuyển đơn sang bước tiếp theo.");
    } catch (error) {
      appToast.error(getApiErrorMessage(error, "Không thể chuyển đơn sang bước tiếp theo."));
    } finally {
      setAdvancingOrderId(null);
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Hàng chờ vận hành"
        title="Xử lý đơn vận hành"
        description="Lọc, tìm kiếm, cập nhật logistics, tracking và đẩy đơn hàng theo đúng quy trình cho từng loại đơn."
        action={
          <div className="flex gap-3">
            <ActionButton variant="secondary" className="lg:hidden" onClick={() => setMobileFiltersOpen(true)}>
              <Filter className="h-4 w-4" />
              Bộ lọc
            </ActionButton>
            <ActionButton
              variant="secondary"
              onClick={() => {
                ordersQuery.refetch();
                if (selectedOrderId) {
                  detailQuery.refetch();
                }
              }}
              loading={ordersQuery.isRefetching}
            >
              <RefreshCw className="h-4 w-4" />
              Làm mới
            </ActionButton>
          </div>
        }
      />

      <div className="lg:hidden">
        <OperationFilterBar
          keyword={keywordInput}
          orderType={orderType}
          status={status}
          onKeywordChange={setKeyword}
          onOrderTypeChange={setOrderType}
          onStatusChange={setStatus}
          onReset={resetFilters}
        />
      </div>

      <div className="hidden lg:block">
        <OperationFilterBar
          keyword={keywordInput}
          orderType={orderType}
          status={status}
          onKeywordChange={setKeyword}
          onOrderTypeChange={setOrderType}
          onStatusChange={setStatus}
          onReset={resetFilters}
        />
      </div>

      <div className="grid grid-cols-1 items-start gap-6">
        <div className="space-y-4">
          {ordersQuery.isError ? (
            <EmptyBlock
              title="Không tải được danh sách đơn"
              description={errorMessage}
              action={<ActionButton onClick={() => ordersQuery.refetch()}>Thử lại</ActionButton>}
            />
          ) : (
            <>
              <div className="hidden lg:block">
                <OperationOrdersTable
                  orders={ordersQuery.data}
                  loading={ordersQuery.isLoading}
                  selectedOrderId={selectedOrderId}
                  onSelect={setSelectedOrder}
                  onAdvance={handleAdvanceOrder}
                  advancingOrderId={advancingOrderId}
                />
              </div>
              <OperationOrderCards
                orders={ordersQuery.data}
                loading={ordersQuery.isLoading}
                onSelect={setSelectedOrder}
                onAdvance={handleAdvanceOrder}
                advancingOrderId={advancingOrderId}
              />
            </>
          )}
        </div>
      </div>

      <OperationOrderDetailSheet
        open={Boolean(selectedOrderId)}
        order={activeOrder}
        loading={detailQuery.isLoading && !selectedOrderSummary}
        onClose={() => setSelectedOrder(null)}
        onOpenLogistics={() => setLogisticsOpen(true)}
        onOpenTracking={() => setTrackingOpen(true)}
        onOpenStatusUpdate={(nextStatus) => setTargetStatus(nextStatus)}
      />

      <LogisticsModal
        open={logisticsOpen}
        order={activeOrder}
        submitting={logisticsMutation.isPending}
        onClose={() => setLogisticsOpen(false)}
        onSubmit={handleSaveLogistics}
      />
      <TrackingModal
        open={trackingOpen}
        order={activeOrder}
        submitting={trackingMutation.isPending}
        onClose={() => setTrackingOpen(false)}
        onSubmit={handleSaveTracking}
      />
      <UpdateStatusModal
        open={Boolean(targetStatus)}
        order={activeOrder}
        targetStatus={targetStatus}
        submitting={statusMutation.isPending}
        onClose={() => setTargetStatus(null)}
        onSubmit={handleUpdateStatus}
      />

      <OverlayModal
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        title="Bộ lọc đơn hàng"
        description="Tìm đơn theo workflow, loại đơn và từ khóa. Bộ lọc đồng bộ với URL query params."
        widthClassName="max-w-xl"
      >
        <div className="space-y-4">
          <OperationFilterBar
            keyword={keywordInput}
            orderType={orderType}
            status={status}
            onKeywordChange={setKeyword}
            onOrderTypeChange={setOrderType}
            onStatusChange={setStatus}
            onReset={resetFilters}
          />
          <div className="flex justify-end">
            <ActionButton onClick={() => setMobileFiltersOpen(false)}>Xong</ActionButton>
          </div>
        </div>
      </OverlayModal>
    </div>
  );
}

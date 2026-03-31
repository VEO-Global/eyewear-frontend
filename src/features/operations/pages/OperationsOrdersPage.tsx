import { Filter, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { appToast } from "../../../utils/appToast";
import { getApiErrorMessage } from "../../../utils/apiError";
import {
  LogisticsModal,
  ReceiveStockModal,
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
import { OperationStatusRail } from "../components/OperationStatusRail";
import { useOperationFilters } from "../hooks/useOperationFilters";
import {
  useOperationOrder,
  useOperationOrders,
  useReceiveOperationStock,
  useUpdateOperationLogistics,
  useUpdateOperationStatus,
  useUpdateOperationTracking,
} from "../hooks/useOperationQueries";
import type { OperationStatus } from "../types";

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
  const [receiveStockOpen, setReceiveStockOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<OperationStatus | null>(null);

  const ordersQuery = useOperationOrders(filters);
  const detailQuery = useOperationOrder(selectedOrderId);
  const statusMutation = useUpdateOperationStatus();
  const logisticsMutation = useUpdateOperationLogistics();
  const trackingMutation = useUpdateOperationTracking();
  const receiveStockMutation = useReceiveOperationStock();

  const activeOrder = detailQuery.data;
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

  async function handleReceiveStock(payload: any) {
    if (!activeOrder) return;
    await receiveStockMutation.mutateAsync({ orderId: activeOrder.orderId, payload });
    appToast.success("Nhận hàng thành công. Đơn đã chuyển sang trạng thái đóng gói.");
  }

  async function handleUpdateStatus(payload: any) {
    if (!activeOrder) return;
    await statusMutation.mutateAsync({ orderId: activeOrder.orderId, payload });
    appToast.success("Cập nhật trạng thái thành công.");
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="hidden space-y-4 lg:block">
          <OperationFilterBar
            keyword={keywordInput}
            orderType={orderType}
            status={status}
            onKeywordChange={setKeyword}
            onOrderTypeChange={setOrderType}
            onStatusChange={setStatus}
            onReset={resetFilters}
          />
          <OperationStatusRail value={status} onChange={setStatus} />
        </div>

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
                />
              </div>
              <OperationOrderCards orders={ordersQuery.data} loading={ordersQuery.isLoading} onSelect={setSelectedOrder} />
            </>
          )}
        </div>
      </div>

      <OperationOrderDetailSheet
        open={Boolean(selectedOrderId)}
        order={activeOrder}
        loading={detailQuery.isLoading}
        onClose={() => setSelectedOrder(null)}
        onOpenLogistics={() => setLogisticsOpen(true)}
        onOpenTracking={() => setTrackingOpen(true)}
        onOpenReceiveStock={() => setReceiveStockOpen(true)}
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
      <ReceiveStockModal
        open={receiveStockOpen}
        order={activeOrder}
        submitting={receiveStockMutation.isPending}
        onClose={() => setReceiveStockOpen(false)}
        onSubmit={handleReceiveStock}
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
          <SurfaceCard className="border-slate-200/80 p-4">
            <OperationStatusRail value={status} onChange={setStatus} />
          </SurfaceCard>
          <div className="flex justify-end">
            <ActionButton onClick={() => setMobileFiltersOpen(false)}>Xong</ActionButton>
          </div>
        </div>
      </OverlayModal>
    </div>
  );
}

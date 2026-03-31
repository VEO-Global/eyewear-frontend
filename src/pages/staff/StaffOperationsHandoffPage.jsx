import { Alert, Spin } from "antd";
import { PackageCheck, Send, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import StaffWorkspaceLayout from "../../components/staff/StaffWorkspaceLayout";
import { extractErrorMessage } from "../../services/managerApi";
import { staffOrderApi } from "../../services/staffOrderApi";
import { formatCurrency } from "../../utils/orderHistory";
import { appToast } from "../../utils/appToast";

const STAFF_HIGHLIGHTED_ORDER_KEY = "staff-highlighted-order";
const POLLING_INTERVAL_MS = 15000;

function EmptyState() {
  return (
    <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50/80 px-6 py-10 text-center text-slate-500">
      Chưa có đơn nào sẵn sàng để bàn giao.
    </div>
  );
}

function OrderDetailModal({ order, loading, onClose }) {
  if (!order && !loading) {
    return null;
  }

  const shippingAddress =
    typeof order?.shippingAddress === "string"
      ? order.shippingAddress
      : [
          order?.shippingAddress?.addressDetail,
          order?.shippingAddress?.wardName || order?.shippingAddress?.ward,
          order?.shippingAddress?.districtName || order?.shippingAddress?.district,
          order?.shippingAddress?.provinceName || order?.shippingAddress?.province,
        ]
          .filter(Boolean)
          .join(", ");

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-950/45 px-4 py-8">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[32px] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.22)] sm:p-7">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">
              Chi tiết đơn hàng
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              {order?.code || "Đang tải..."}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {order?.customer || "Đang tải"} • {order?.customerPhone || "Chưa có số điện thoại"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Spin size="large" />
          </div>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-5">
                <h3 className="text-lg font-bold text-slate-900">Thông tin người đặt</h3>
                <div className="mt-4 space-y-2 text-sm leading-7 text-slate-600">
                  <p><span className="font-semibold text-slate-900">Họ tên:</span> {order?.customer}</p>
                  <p><span className="font-semibold text-slate-900">Email:</span> {order?.customerEmail || "Chưa có"}</p>
                  <p><span className="font-semibold text-slate-900">Số điện thoại:</span> {order?.customerPhone || "Chưa có"}</p>
                  <p><span className="font-semibold text-slate-900">Người nhận:</span> {order?.receiverName || order?.customer}</p>
                  <p><span className="font-semibold text-slate-900">Kênh:</span> {order?.channel}</p>
                  <p><span className="font-semibold text-slate-900">Địa chỉ:</span> {shippingAddress || "Chưa có"}</p>
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-5">
                <h3 className="text-lg font-bold text-slate-900">Thông tin xử lý</h3>
                <div className="mt-4 space-y-2 text-sm leading-7 text-slate-600">
                  <p><span className="font-semibold text-slate-900">Tổng tiền:</span> {order?.totalText}</p>
                  <p><span className="font-semibold text-slate-900">Trạng thái:</span> {order?.statusLabel}</p>
                  <p><span className="font-semibold text-slate-900">Đơn thuốc:</span> {order?.requiresPrescription ? "Có" : "Không"}</p>
                  <p><span className="font-semibold text-slate-900">Ghi chú:</span> {order?.note || "Không có"}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-5">
              <h3 className="text-lg font-bold text-slate-900">Sản phẩm trong đơn</h3>
              <div className="mt-4 space-y-3">
                {(order?.items || []).map((entry) => (
                  <div key={entry.orderItemId || entry.id} className="rounded-[20px] bg-white px-4 py-4">
                    <p className="font-semibold text-slate-900">{entry.name || entry.productName || "Sản phẩm"}</p>
                    <p className="mt-1 text-sm text-slate-500">Số lượng: {entry.quantity || 1}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Đơn giá: {formatCurrency((entry.variantPrice || entry.price || 0) * (entry.quantity || 1))}
                    </p>
                  </div>
                ))}

                {order?.lensProduct ? (
                  <div className="rounded-[20px] border border-sky-200 bg-sky-50 px-4 py-4">
                    <p className="font-semibold text-slate-900">{order.lensProduct.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{order.lensProduct.description || "Tròng kính"}</p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function StaffOperationsHandoffPage() {
  const location = useLocation();
  const storedHighlight = (() => {
    try {
      const raw = sessionStorage.getItem(STAFF_HIGHLIGHTED_ORDER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const highlightedOrderId =
    location.state?.highlightedOrderId ||
    (storedHighlight?.targetPath === "/staff/operations-handoff"
      ? storedHighlight.highlightedOrderId
      : null);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actingOrderId, setActingOrderId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  async function loadOrders({ silent = false } = {}) {
    if (!silent) {
      setLoading(true);
    }

    try {
      const nextOrders = await staffOrderApi.fetchReadyForHandoffOrders();
      setOrders(nextOrders);
      setError("");
    } catch (apiError) {
      setError(extractErrorMessage(apiError, "Không thể tải danh sách đơn chờ bàn giao."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();

    const intervalId = window.setInterval(() => {
      loadOrders({ silent: true });
    }, POLLING_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, []);

  async function openOrderDetails(orderId) {
    setSelectedOrder({});
    setDetailLoading(true);

    try {
      const detail = await staffOrderApi.fetchStaffOrderDetail(orderId);
      setSelectedOrder(detail);
    } catch (apiError) {
      appToast.error(extractErrorMessage(apiError, "Không thể tải chi tiết đơn hàng."));
      setSelectedOrder(null);
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleHandoff(order) {
    setActingOrderId(order.id);

    try {
      await staffOrderApi.handoffStaffOrder(order.id);
      setOrders((currentOrders) => currentOrders.filter((item) => item.id !== order.id));
      appToast.success(`Đã bàn giao đơn ${order.code} cho Operation`);
    } catch (apiError) {
      appToast.error(extractErrorMessage(apiError, "Không thể bàn giao đơn hàng."));
    } finally {
      setActingOrderId(null);
    }
  }

  return (
    <>
      <StaffWorkspaceLayout
        eyebrow="Workspace 03"
        title="Bàn giao đơn hàng"
        description="Các đơn ở đây đã qua intake, nếu có đơn thuốc thì cũng đã kiểm tra xong và sẵn sàng bàn giao cho Operation bằng dữ liệu đồng bộ từ database."
        stats={[]}
        leftColumn={
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
                <PackageCheck size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Danh sách chờ bàn giao</h2>
              </div>
            </div>

            {error ? (
              <Alert
                type="error"
                showIcon
                message="Không thể tải danh sách chờ bàn giao"
                description={error}
                className="mt-6"
              />
            ) : null}

            <div className="mt-6 space-y-4">
              {loading ? (
                <div className="flex justify-center py-12">
                  <Spin size="large" />
                </div>
              ) : orders.length > 0 ? (
                orders.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-[28px] border p-5 ${
                      item.id === highlightedOrderId
                        ? "border-sky-200 bg-sky-50/60"
                        : "border-slate-200 bg-slate-50/70"
                    }`}
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white">
                            {item.code}
                          </span>
                          {item.requiresPrescription ? (
                            <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                              Có đơn thuốc
                            </span>
                          ) : null}
                        </div>

                        <h3 className="mt-3 text-xl font-bold text-slate-900">{item.customer}</h3>
                        <p className="mt-2 text-sm leading-7 text-slate-600">
                          {item.type} • Tổng tiền: {item.totalText}
                        </p>
                      </div>

                      <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700">
                        Chờ bàn giao đơn hàng
                      </span>
                    </div>

                    <div className="mt-4 rounded-[22px] bg-white px-4 py-4 text-sm leading-7 text-slate-600">
                      Người nhận: {item.receiverName || item.customer} • Kênh: {item.channel} • Đã chờ: {item.eta}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => handleHandoff(item)}
                        disabled={actingOrderId === item.id}
                        className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        Bàn giao cho Operation
                      </button>
                      <button
                        type="button"
                        onClick={() => openOrderDetails(item.id)}
                        className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState />
              )}
            </div>
          </div>
        }
        rightColumn={
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
                <Send size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Tổng quan bàn giao</h2>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div className="rounded-[22px] border border-slate-200 bg-slate-50/70 px-4 py-4 text-sm text-slate-600">
                Đơn sẵn sàng bàn giao: <span className="font-semibold text-slate-900">{orders.length}</span>
              </div>
              <div className="rounded-[22px] border border-slate-200 bg-slate-50/70 px-4 py-4 text-sm text-slate-600">
                Đơn có đơn thuốc:{" "}
                <span className="font-semibold text-slate-900">
                  {orders.filter((item) => item.requiresPrescription).length}
                </span>
              </div>
            </div>
          </div>
        }
      />

      <OrderDetailModal order={selectedOrder} loading={detailLoading} onClose={() => setSelectedOrder(null)} />
    </>
  );
}

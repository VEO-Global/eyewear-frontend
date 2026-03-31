import { useEffect, useMemo, useRef, useState } from "react";
import { Form, Spin } from "antd";
import { ArrowBigLeft, CircleCheckBig, QrCode, ShieldCheck } from "lucide-react";
import { NavLink, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import CheckOutForm from "../form/CheckOutForm";
import CheckOutOrderSummary from "../components/checkout/CheckOutOrderSummary";
import { fetchCart } from "../redux/cart/cartSlice";
import { fetchProducts } from "../redux/products/producSlice";
import { productService } from "../services/productService";
import { orderService } from "../services/orderService";
import { paymentService } from "../services/paymentService";
import { getApiErrorMessage } from "../utils/apiError";

function formatCurrency(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(Number(amount || 0));
}

function normalizePrescriptionOption(value) {
  return value === "with_prescription" ? "WITH_PRESCRIPTION" : "WITHOUT_PRESCRIPTION";
}

function normalizePrescriptionPayload(values) {
  const prescription = values?.prescription;

  if (!prescription || normalizePrescriptionOption(values?.prescriptionOption) !== "WITH_PRESCRIPTION") {
    return null;
  }

  const normalizeNumber = (value) => {
    if (value === undefined || value === null || value === "") {
      return null;
    }

    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : null;
  };

  return {
    prescriptionImageUrl: prescription?.prescriptionImageUrl || null,
    sphereOd: normalizeNumber(prescription?.sphereOd),
    sphereOs: normalizeNumber(prescription?.sphereOs),
    cylinderOd: normalizeNumber(prescription?.cylinderOd),
    cylinderOs: normalizeNumber(prescription?.cylinderOs),
    axisOd: normalizeNumber(prescription?.axisOd),
    axisOs: normalizeNumber(prescription?.axisOs),
    pd: normalizeNumber(prescription?.pd),
  };
}

function unwrapPayload(payload) {
  if (!payload || typeof payload !== "object") {
    return payload;
  }

  if (payload.data && typeof payload.data === "object" && !Array.isArray(payload.data)) {
    return unwrapPayload(payload.data);
  }

  if (payload.result && typeof payload.result === "object" && !Array.isArray(payload.result)) {
    return unwrapPayload(payload.result);
  }

  return payload;
}

function pickFirstNumber(...values) {
  for (const value of values) {
    const normalizedValue = Number(value);

    if (Number.isFinite(normalizedValue) && normalizedValue >= 0) {
      return normalizedValue;
    }
  }

  return 0;
}

function normalizeLensProductId(value) {
  const normalizedValue = Number(value);
  return Number.isFinite(normalizedValue) && normalizedValue > 0 ? normalizedValue : null;
}

function resolveSelectedCartItems(currentCart, selectedCartItems) {
  const liveCartItems = Array.isArray(currentCart) ? currentCart : [];
  const snapshotItems = Array.isArray(selectedCartItems) ? selectedCartItems : [];

  return snapshotItems.map((snapshotItem) => {
    const matchedLiveItem = liveCartItems.find((cartItem) => {
      if (snapshotItem?.itemId && cartItem?.itemId) {
        return Number(cartItem.itemId) === Number(snapshotItem.itemId);
      }

      return (
        Number(cartItem?.variantID ?? cartItem?.productVariantId) ===
          Number(snapshotItem?.variantID ?? snapshotItem?.productVariantId) &&
        Number(cartItem?.quantity || 1) === Number(snapshotItem?.quantity || 1)
      );
    });

    return matchedLiveItem ? { ...snapshotItem, ...matchedLiveItem } : snapshotItem;
  });
}

function normalizeOrderLike(payload) {
  const order = unwrapPayload(payload) || {};
  const priceSummary =
    order?.priceSummary && typeof order.priceSummary === "object" ? order.priceSummary : {};
  const payment = order?.payment && typeof order.payment === "object" ? order.payment : {};

  const orderId = order?.orderId ?? order?.id ?? order?.order?.orderId ?? order?.order?.id ?? null;
  const orderCode =
    order?.orderCode ?? payment?.orderCode ?? order?.order?.orderCode ?? (orderId ? String(orderId) : null);

  const totalAmount = pickFirstNumber(
    order?.totalAmount,
    order?.subtotal,
    priceSummary?.itemsSubtotal,
    priceSummary?.totalAmount
  );

  return {
    ...order,
    orderId,
    orderCode,
    totalAmount,
    finalAmount: pickFirstNumber(
      order?.finalAmount,
      payment?.amount,
      priceSummary?.total,
      priceSummary?.finalAmount,
      totalAmount
    ),
    paymentMethod: order?.paymentMethod ?? payment?.method ?? null,
    paymentStatus: order?.paymentStatus ?? payment?.status ?? null,
    checkoutUrl: order?.checkoutUrl ?? null,
  };
}

function normalizePaymentStatusLike(payload) {
  const status = unwrapPayload(payload) || {};

  return {
    ...status,
    status: status?.status ?? "PENDING",
    amount: pickFirstNumber(status?.amount),
    orderCode: status?.orderCode ?? null,
  };
}

function normalizeQrLike(payload) {
  const qr = unwrapPayload(payload) || {};

  return {
    ...qr,
    orderCode: qr?.orderCode ?? null,
    amountToPay: pickFirstNumber(qr?.amountToPay),
    qrCodeUrl: qr?.qrCodeUrl ?? null,
  };
}

function buildCheckoutPayload(checkoutValues, selectedCartItems, selectedLensProduct) {
  const prescriptionOption = normalizePrescriptionOption(checkoutValues.prescriptionOption);

  const payload = {
    paymentMethod: checkoutValues.paymentMethod,
    prescriptionOption,
    shippingAddress: {
      cityName: checkoutValues.shippingAddress.provinceName,
      districtName: checkoutValues.shippingAddress.districtName,
      wardName: checkoutValues.shippingAddress.wardName,
      addressDetail: checkoutValues.shippingAddress.addressDetail,
    },
    phoneNumber: checkoutValues.phoneNumber,
    receiverName: checkoutValues.receiverName,
    note: checkoutValues.note || null,
    items: selectedCartItems.map((item) => {
      const normalizedItem = {
        productVariantId: Number(item?.variantID ?? item?.productVariantId),
        quantity: Number(item.quantity || 1),
      };

      if (prescriptionOption === "WITH_PRESCRIPTION") {
        const itemLensProductId = normalizeLensProductId(item?.lensProductId);
        const checkoutLensProductId = normalizeLensProductId(
          selectedLensProduct?.id ?? checkoutValues?.lensProductId
        );

        if (itemLensProductId || checkoutLensProductId) {
          normalizedItem.lensProductId = itemLensProductId ?? checkoutLensProductId;
        }
      }

      return normalizedItem;
    }),
  };

  if (prescriptionOption === "WITH_PRESCRIPTION") {
    payload.prescription = normalizePrescriptionPayload(checkoutValues);
  }

  return payload;
}

async function refreshServerCart(dispatch) {
  try {
    const refreshedCart = await dispatch(fetchCart()).unwrap();
    console.log("cart after checkout refetch", refreshedCart);
    return refreshedCart;
  } catch {
    dispatch(fetchCart());
    return null;
  }
}

function debugCheckoutPayload(payload, currentCart) {
  console.log("cart before checkout", currentCart);
  console.log(
    "checkout item mapping",
    (payload?.items || []).map((item) => {
      const matchedCartItem = Array.isArray(currentCart)
        ? currentCart.find(
            (cartItem) =>
              Number(cartItem?.variantID ?? cartItem?.productVariantId) ===
                Number(item?.productVariantId) &&
              Number(cartItem?.quantity || 1) === Number(item?.quantity || 1)
          )
        : null;

      return {
        payloadProductVariantId: item?.productVariantId,
        payloadLensProductId: item?.lensProductId ?? null,
        payloadQuantity: item?.quantity,
        cartVariantId: matchedCartItem?.variantID ?? null,
        cartLensProductId: matchedCartItem?.lensProductId ?? null,
        cartQuantity: matchedCartItem?.quantity ?? null,
      };
    })
  );
  console.debug("[checkout] payload before submit", payload);
  console.log("[checkout] payload before submit", payload);
}

function hasAtLeastOneLensItem(items) {
  return Array.isArray(items) && items.some((item) => Number(item?.lensProductId) > 0);
}

function validateCheckoutPayload(payload) {
  if (payload?.prescriptionOption !== "WITH_PRESCRIPTION") {
    return null;
  }

  if (!payload?.prescription) {
    return "Đơn có đơn thuốc đang thiếu object prescription.";
  }

  if (!hasAtLeastOneLensItem(payload.items)) {
    return "Đơn có đơn thuốc cần có ít nhất một tròng kính được chọn.";
  };

  if (payload.prescription.pd === null) {
    return "Đơn có đơn thuốc đang thiếu PD.";
  }

  return null;
}

function calculateSelectedItemsAmount(items) {
  if (!Array.isArray(items)) {
    return 0;
  }

  return items.reduce(
    (sum, item) => sum + Number(item?.variantPrice || 0) * Math.max(1, Number(item?.quantity || 1)),
    0
  );
}

function getOrderIdentity(order) {
  return order?.orderId ?? order?.id ?? null;
}

async function hydrateOrderDetail(orderLike) {
  const normalizedOrder = normalizeOrderLike(orderLike);
  const orderId = getOrderIdentity(normalizedOrder);

  if (!orderId) {
    return normalizedOrder;
  }

  try {
    const detail = await orderService.getOrderById(orderId);
    return normalizeOrderLike({
      ...normalizedOrder,
      ...unwrapPayload(detail),
    });
  } catch {
    return normalizeOrderLike({
      ...normalizedOrder,
      orderId,
      orderCode: normalizedOrder?.orderCode ?? String(orderId),
    });
  }
}

function SuccessCard({ orderCode, paymentMethod, paymentStatus, totalAmount }) {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CircleCheckBig className="h-10 w-10" />
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
            Bạn đã đặt hàng thành công
          </h1>

          <div className="mt-8 space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-5 text-left text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>Mã đơn hàng</span>
              <span className="font-semibold text-slate-900">{orderCode || "--"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Phương thức</span>
              <span className="font-semibold text-slate-900">{paymentMethod || "--"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Trạng thái thanh toán</span>
              <span className="font-semibold text-slate-900">{paymentStatus || "UNPAID"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Tổng tiền</span>
              <span className="font-semibold text-slate-900">{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-base font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Về trang chủ
            </button>
            <button
              type="button"
              onClick={() => navigate("/products")}
              className="rounded-2xl bg-teal-600 px-5 py-3 text-base font-semibold text-white transition hover:bg-teal-700"
            >
              Mua thêm sản phẩm
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function BankTransferCard({ order, qrData, paymentStatus, loading, error }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <main className="min-h-screen bg-background px-4 py-10">
        <div className="mx-auto flex max-w-3xl items-center justify-center rounded-[28px] border border-slate-200 bg-white p-10 shadow-sm">
          <Spin size="large" />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-center text-rose-700 shadow-sm">
          <h1 className="text-2xl font-bold">Không tải được mã thanh toán</h1>
          <p className="mt-3 text-sm leading-6">{error}</p>
          <button
            type="button"
            onClick={() => navigate("/user/orders")}
            className="mt-6 rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white"
          >
            Xem đơn hàng của tôi
          </button>
        </div>
      </main>
    );
  }

  if (paymentStatus?.status === "PAID") {
    return (
      <SuccessCard
        orderCode={order?.orderCode}
        paymentMethod="BANK_TRANSFER"
        paymentStatus={paymentStatus?.status}
        totalAmount={order?.finalAmount || order?.totalAmount || qrData?.amountToPay}
      />
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-2">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700">
            <ShieldCheck className="h-4 w-4" />
            Thanh toán an toàn
          </div>
          <h1 className="text-3xl font-bold text-foreground">Thanh toán chuyển khoản</h1>
          <p className="text-sm text-muted-foreground">
            Quét mã QR bên dưới để thanh toán. Hệ thống sẽ tự kiểm tra trạng thái từ backend.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="rounded-[24px] bg-[radial-gradient(circle_at_top_left,_rgba(125,211,252,0.35),_transparent_30%),linear-gradient(180deg,#f8fafc_0%,#eef6ff_100%)] p-6 text-center sm:p-7">
              <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
                <QrCode className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">Quét mã để thanh toán</h2>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                Chỉ coi là thanh toán thành công khi backend trả về trạng thái PAID.
              </p>

              {qrData?.qrCodeUrl ? (
                <img
                  src={qrData.qrCodeUrl}
                  alt={`QR thanh toán cho đơn ${qrData.orderCode || order?.orderCode || ""}`}
                  className="mx-auto mt-6 w-[220px] rounded-[24px] border border-slate-200 bg-white p-3 shadow-sm"
                />
              ) : (
                <div className="mx-auto mt-6 rounded-[24px] border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
                  QR chưa sẵn sàng.
                </div>
              )}
            </div>
          </div>

          <div className="h-fit rounded-[24px] border border-slate-900 bg-white p-6 shadow-sm">
            <h2 className="text-[30px] font-semibold text-slate-900">Thông tin thanh toán</h2>
            <div className="mt-5 space-y-4 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span>Mã đơn</span>
                <span className="font-semibold text-slate-900">
                  {qrData?.orderCode || order?.orderCode || "--"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Ngân hàng</span>
                <span className="font-semibold text-slate-900">{qrData?.bankName || "--"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Số tài khoản</span>
                <span className="font-semibold text-slate-900">
                  {qrData?.bankAccountNumber || "--"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Chủ tài khoản</span>
                <span className="font-semibold text-slate-900">
                  {qrData?.bankAccountName || "--"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Nội dung CK</span>
                <span className="font-semibold text-slate-900">
                  {qrData?.transferContent || "--"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Số tiền</span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(qrData?.amountToPay || order?.finalAmount || order?.totalAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Trạng thái</span>
                <span className="font-semibold text-amber-600">
                  {paymentStatus?.status || "PENDING"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/user/orders")}
          className="mt-5 inline-flex items-center gap-2 rounded-2xl hover:underline"
        >
          <ArrowBigLeft className="h-5 w-5" />
          <span>Về danh sách đơn hàng</span>
        </button>
      </div>
    </main>
  );
}

function PayosPendingCard({ order, error }) {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Đang chờ PayOS</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
          {error || "Backend chưa trả về checkoutUrl hoặc bạn vừa quay lại từ cổng thanh toán."}
        </p>
        <div className="mt-8 space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-5 text-left text-sm text-slate-600">
          <div className="flex items-center justify-between">
            <span>Mã đơn hàng</span>
            <span className="font-semibold text-slate-900">{order?.orderCode || "--"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Phương thức</span>
            <span className="font-semibold text-slate-900">PAYOS</span>
          </div>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => navigate("/user/orders")}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-base font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Theo dõi đơn hàng
          </button>
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="rounded-2xl bg-teal-600 px-5 py-3 text-base font-semibold text-white transition hover:bg-teal-700"
          >
            Mua thêm sản phẩm
          </button>
        </div>
      </div>
    </main>
  );
}

function CheckoutProcessStep() {
  const location = useLocation();
  const dispatch = useDispatch();
  const currentCart = useSelector((state) => state.cart.cart);
  const [searchParams] = useSearchParams();
  const submittedRef = useRef(false);

  const orderIdFromQuery = searchParams.get("orderId");
  const checkoutValues = location.state?.checkoutValues;
  const selectedLensProduct = location.state?.selectedLensProduct || null;
  const selectedCartItems = location.state?.selectedCartItems || [];
  const resolvedSelectedCartItems = useMemo(
    () => resolveSelectedCartItems(currentCart, selectedCartItems),
    [currentCart, selectedCartItems]
  );
  const selectedPaymentMethod =
    checkoutValues?.paymentMethod || searchParams.get("paymentMethod") || "COD";

  const [order, setOrder] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [checkoutSnapshot, setCheckoutSnapshot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function bootstrapExistingOrder(orderId) {
      setLoading(true);
      setError("");

      try {
        const [orderDetail, status] = await Promise.all([
          orderService.getOrderById(orderId),
          paymentService.getOrderStatus(orderId),
        ]);

        if (!mounted) {
          return;
        }

        setOrder(normalizeOrderLike(orderDetail));
        setPaymentStatus(normalizePaymentStatusLike(status));

        const normalizedOrder = normalizeOrderLike(orderDetail);
        const paymentMethod = normalizedOrder?.paymentMethod || selectedPaymentMethod;
        await refreshServerCart(dispatch);

        if (paymentMethod === "BANK_TRANSFER" && normalizePaymentStatusLike(status)?.status !== "PAID") {
          try {
            const qr = await paymentService.getOrderQr(orderId);

            if (mounted) {
              setQrData(normalizeQrLike(qr));
            }
          } catch (nextError) {
            if (mounted) {
              setError(getApiErrorMessage(nextError, "Không tải được mã QR chuyển khoản."));
            }
          }
        }
      } catch (nextError) {
        if (mounted) {
          setError(getApiErrorMessage(nextError, "Không tải được đơn hàng thanh toán."));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    async function submitCheckout() {
      if (!checkoutValues || !resolvedSelectedCartItems.length || submittedRef.current) {
        return;
      }

      submittedRef.current = true;
      setLoading(true);
      setError("");

      try {
        const payload = buildCheckoutPayload(
          checkoutValues,
          resolvedSelectedCartItems,
          selectedLensProduct
        );
        const payloadError = validateCheckoutPayload(payload);

        if (payloadError) {
          throw new Error(payloadError);
        }

        debugCheckoutPayload(payload, currentCart);
        const response = await orderService.checkout(payload);
        const normalizedResponse = normalizeOrderLike(response);
        const snapshotAmount =
          normalizedResponse?.finalAmount ||
          calculateSelectedItemsAmount(resolvedSelectedCartItems) +
            Number(normalizedResponse?.shippingFee || 0) -
            Number(normalizedResponse?.discountAmount || 0);
        setCheckoutSnapshot({
          orderId: normalizedResponse?.orderId ?? null,
          orderCode: normalizedResponse?.orderCode ?? null,
          finalAmount: snapshotAmount,
          paymentMethod: normalizedResponse?.paymentMethod || selectedPaymentMethod,
          paymentStatus: normalizedResponse?.paymentStatus || "UNPAID",
        });
        const hydratedOrder = await hydrateOrderDetail(response);

        if (!mounted) {
          return;
        }

        setOrder(hydratedOrder);
        await refreshServerCart(dispatch);
        dispatch(fetchProducts());

        const paymentMethod =
          hydratedOrder?.paymentMethod || normalizedResponse?.paymentMethod || selectedPaymentMethod;

        if (paymentMethod === "COD") {
          setPaymentStatus({
            ...normalizePaymentStatusLike(response),
            status: hydratedOrder?.paymentStatus || normalizedResponse?.paymentStatus || "UNPAID",
          });
          return;
        }

        if (paymentMethod === "BANK_TRANSFER") {
          try {
            const qr = await paymentService.getOrderQr(getOrderIdentity(hydratedOrder));

            if (mounted) {
              setQrData(normalizeQrLike(qr));
            }
          } catch (nextError) {
            if (mounted) {
              setError(getApiErrorMessage(nextError, "Không tải được mã QR chuyển khoản."));
            }
          }

          try {
            const status = await paymentService.getOrderStatus(getOrderIdentity(hydratedOrder));

            if (mounted) {
              setPaymentStatus(normalizePaymentStatusLike(status));
            }
          } catch {
            if (mounted) {
              setPaymentStatus({ status: "PENDING" });
            }
          }

          return;
        }

        if (paymentMethod === "PAYOS") {
          if (hydratedOrder?.checkoutUrl || normalizedResponse?.checkoutUrl) {
            window.location.href = hydratedOrder?.checkoutUrl || normalizedResponse?.checkoutUrl;
            return;
          }

          try {
            const status = await paymentService.getOrderStatus(getOrderIdentity(hydratedOrder));

            if (mounted) {
              setPaymentStatus(normalizePaymentStatusLike(status));
            }
          } catch {
            if (mounted) {
              setPaymentStatus({
                ...normalizePaymentStatusLike(response),
                status: normalizedResponse?.paymentStatus || "PENDING",
              });
            }
          }
        }
      } catch (nextError) {
        if (mounted) {
          setError(getApiErrorMessage(nextError, "Không thể tạo đơn hàng từ backend."));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    if (orderIdFromQuery) {
      bootstrapExistingOrder(orderIdFromQuery);
    } else {
      submitCheckout();
    }

    return () => {
      mounted = false;
    };
  }, [
    checkoutValues,
    dispatch,
    currentCart,
    orderIdFromQuery,
    resolvedSelectedCartItems,
    selectedLensProduct,
    selectedPaymentMethod,
  ]);

  useEffect(() => {
    const paymentMethod = order?.paymentMethod || selectedPaymentMethod;

    if (!order?.orderId || paymentMethod !== "BANK_TRANSFER") {
      return undefined;
    }

    if (paymentStatus?.status === "PAID") {
      return undefined;
    }

    const intervalId = window.setInterval(async () => {
      try {
        const status = await paymentService.getOrderStatus(order.orderId);
        setPaymentStatus(normalizePaymentStatusLike(status));
      } catch {
        // keep last state
      }
    }, 8000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [order?.orderId, order?.paymentMethod, paymentStatus?.status, selectedPaymentMethod]);

  if (!checkoutValues && !orderIdFromQuery && !loading && !order) {
    return (
      <main className="min-h-screen bg-background px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-[28px] border border-amber-200 bg-amber-50 p-8 text-center text-amber-800 shadow-sm">
          <h1 className="text-2xl font-bold">Thiếu thông tin checkout</h1>
          <p className="mt-3 text-sm leading-6">
            Vui lòng quay lại giỏ hàng và thực hiện thanh toán lại.
          </p>
        </div>
      </main>
    );
  }

  const displayedOrderCode =
    order?.orderCode || paymentStatus?.orderCode || qrData?.orderCode || checkoutSnapshot?.orderCode;
  const displayedAmount =
    paymentStatus?.amount ||
    qrData?.amountToPay ||
    order?.finalAmount ||
    checkoutSnapshot?.finalAmount ||
    calculateSelectedItemsAmount(resolvedSelectedCartItems);
  const displayedPaymentStatus =
    paymentStatus?.status || order?.paymentStatus || checkoutSnapshot?.paymentStatus || "UNPAID";
  const displayedPaymentMethod =
    order?.paymentMethod || checkoutSnapshot?.paymentMethod || selectedPaymentMethod;

  if (selectedPaymentMethod === "COD" && loading && !displayedOrderCode && !displayedAmount) {
    return (
      <main className="min-h-screen bg-background px-4 py-10">
        <div className="mx-auto flex max-w-3xl items-center justify-center rounded-[28px] border border-slate-200 bg-white p-10 shadow-sm">
          <Spin size="large" />
        </div>
      </main>
    );
  }

  if (selectedPaymentMethod === "COD") {
    return (
      <SuccessCard
        orderCode={displayedOrderCode}
        paymentMethod={displayedPaymentMethod}
        paymentStatus={displayedPaymentStatus}
        totalAmount={displayedAmount}
      />
    );
  }

  if (selectedPaymentMethod === "BANK_TRANSFER") {
    return (
      <BankTransferCard
        order={order}
        qrData={qrData}
        paymentStatus={paymentStatus}
        loading={loading}
        error={error}
      />
    );
  }

  if (selectedPaymentMethod === "PAYOS" && paymentStatus?.status === "PAID") {
    return (
      <SuccessCard
        orderCode={order?.orderCode}
        paymentMethod="PAYOS"
        paymentStatus={paymentStatus?.status}
        totalAmount={paymentStatus?.amount || order?.finalAmount}
      />
    );
  }

  return <PayosPendingCard order={order} error={error} />;
}

export default function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const paymentStep = searchParams.get("step");
  const [form] = Form.useForm();
  const [lensProducts, setLensProducts] = useState([]);
  const [lensLoading, setLensLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchLensProducts() {
      setLensLoading(true);

      try {
        const response = await productService.getLensProducts();
        const normalizedLensProducts = Array.isArray(response)
          ? response.filter((item) => item?.isActive !== 0 && item?.is_active !== 0)
          : [];

        if (isMounted) {
          setLensProducts(normalizedLensProducts);
        }
      } catch {
        if (isMounted) {
          setLensProducts([]);
        }
      } finally {
        if (isMounted) {
          setLensLoading(false);
        }
      }
    }

    fetchLensProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  if (paymentStep === "process" || paymentStep === "result") {
    return <CheckoutProcessStep />;
  }

  return (
    <main className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12">
          <h1 className="mb-2 font-mono text-4xl font-bold text-foreground">Thanh toán</h1>
          <p className="text-muted-foreground">
            Hoàn tất đơn hàng bằng cách điền thông tin giao hàng
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-xl bg-card p-8 shadow-sm">
              <h2 className="mb-8 text-2xl font-semibold text-foreground">
                Thông tin giao hàng
              </h2>

              <CheckOutForm form={form} lensProducts={lensProducts} lensLoading={lensLoading} />
            </div>
          </div>

          <div className="rounded-2xl lg:col-span-1">
            {lensLoading ? (
              <div className="flex min-h-48 items-center justify-center rounded-xl border bg-white shadow-sm">
                <Spin />
              </div>
            ) : (
              <CheckOutOrderSummary form={form} lensProducts={lensProducts} />
            )}
          </div>
        </div>

        <NavLink className="mt-5 flex items-center gap-2 rounded-2xl hover:underline" to="/user/cart">
          <ArrowBigLeft className="h-5 w-5" />
          <span>Quay về giỏ hàng</span>
        </NavLink>
      </div>
    </main>
  );
}

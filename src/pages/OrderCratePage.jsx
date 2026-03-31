import React, { useEffect, useMemo, useRef, useState } from "react";
import { Form, Spin } from "antd";
import {
  ArrowBigLeft,
  CircleCheckBig,
  Copy,
  LoaderCircle,
  QrCode,
  ShieldCheck,
} from "lucide-react";
import {
  NavLink,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import api from "../configs/config-axios";
import CheckOutForm from "../form/CheckOutForm";
import CheckOutOrderSummary from "../components/checkout/CheckOutOrderSummary";
import { removeSelectedItems } from "../redux/cart/cartSlice";
import { decreaseVariantStock } from "../redux/products/producSlice";
import { appToast } from "../utils/appToast";
import { CHECKOUT_LENS_SELECTION_STORAGE_KEY } from "../constants/lensProducts";
import {
  appendStoredOrder,
  createStoredOrder,
  formatCurrency,
} from "../utils/orderHistory";

const SHIPPING_COST = 30000;

function FakeQrCode() {
  const qrPattern = [
    "111101011011111",
    "100101010010001",
    "101101111010111",
    "101000101010101",
    "111011101110111",
    "000010010010000",
    "111010111011101",
    "001110001000111",
    "111011111010111",
    "100010001010001",
    "101111101111101",
    "101000101000101",
    "111110111011111",
    "100000001000001",
    "111111111111111",
  ];

  return (
    <div
      className="mx-auto grid w-[200px] overflow-hidden rounded-[24px] border border-slate-200 bg-white p-3 shadow-sm sm:w-[220px]"
      style={{ gridTemplateColumns: "repeat(15, minmax(0, 1fr))" }}
    >
      {qrPattern
        .join("")
        .split("")
        .map((cell, index) => (
          <div
            key={index}
            className={`aspect-square ${cell === "1" ? "bg-slate-900" : "bg-white"}`}
          />
        ))}
    </div>
  );
}

function PaymentSuccessStep() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CircleCheckBig className="h-10 w-10" />
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
            Thanh toán thành công
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
            Hệ thống đã xác nhận thanh toán của bạn. Đơn hàng đang được chuyển
            sang bước xử lý tiếp theo.
          </p>

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

function PaymentQrStep() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { cart } = useSelector((state) => state.cart);
  const user = useSelector((state) => state.auth.user);
  const [paymentStatus, setPaymentStatus] = useState("idle");
  const hasProcessedSuccessfulPayment = useRef(false);
  const hasSavedSuccessfulOrder = useRef(false);

  const storedCheckoutData = useMemo(() => {
    try {
      const raw = sessionStorage.getItem(CHECKOUT_LENS_SELECTION_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }, []);

  const checkoutValues =
    location.state?.checkoutValues || storedCheckoutData.checkoutValues || {};
  const selectedLensProduct =
    location.state?.selectedLensProduct ||
    storedCheckoutData.selectedLensProduct ||
    null;
  const selectedCartItems =
    location.state?.selectedCartItems ||
    storedCheckoutData.selectedCartItems ||
    [];

  const lensPrice =
    checkoutValues?.prescriptionOption === "with_prescription"
      ? Number(selectedLensProduct?.price || 0)
      : 0;
  const selectedTotalPrice = selectedCartItems.reduce(
    (total, item) => total + item.variantPrice * item.quantity,
    0
  );
  const subtotal = selectedTotalPrice + lensPrice;
  const totalAmount = subtotal + SHIPPING_COST;
  const firstProduct = selectedCartItems[0];

  const paymentCode = useMemo(
    () =>
      `EC-${String(totalAmount).slice(0, 4)}-${selectedCartItems.length || 1}QR`,
    [selectedCartItems.length, totalAmount]
  );

  useEffect(() => {
    if (paymentStatus !== "checking") return undefined;

    const timer = window.setTimeout(() => {
      setPaymentStatus("success");
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [paymentStatus]);

  useEffect(() => {
    if (paymentStatus !== "success" || hasProcessedSuccessfulPayment.current) {
      return;
    }

    hasProcessedSuccessfulPayment.current = true;

    selectedCartItems.forEach((item) => {
      dispatch(
        decreaseVariantStock({
          productId: item.productID,
          variantId: item.variantID,
          amount: item.quantity,
        })
      );
    });

    sessionStorage.removeItem(CHECKOUT_LENS_SELECTION_STORAGE_KEY);
    appToast.success("Thanh toán thành công");
    dispatch(
      removeSelectedItems(selectedCartItems.map((item) => item.variantID))
    );
  }, [dispatch, paymentStatus, selectedCartItems]);

  useEffect(() => {
    if (
      paymentStatus !== "success" ||
      hasSavedSuccessfulOrder.current ||
      !user?.id
    ) {
      return;
    }

    hasSavedSuccessfulOrder.current = true;

    appendStoredOrder(
      user.id,
      createStoredOrder({
        userId: user.id,
        user,
        checkoutValues,
        selectedCartItems,
        selectedLensProduct,
        lensPrice,
        shippingCost: SHIPPING_COST,
        totalAmount,
      })
    );
  }, [
    checkoutValues,
    lensPrice,
    paymentStatus,
    selectedCartItems,
    selectedLensProduct,
    totalAmount,
    user?.id,
  ]);

  async function handleCopyCode() {
    try {
      await navigator.clipboard.writeText(paymentCode);
    } catch {
      // no-op
    }
  }

  function handleConfirmPayment() {
    if (paymentStatus === "checking") return;
    setPaymentStatus("checking");
  }

  if (paymentStatus === "success") {
    return <PaymentSuccessStep />;
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-2">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700">
            <ShieldCheck className="h-4 w-4" />
            Thanh toán an toàn
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Thanh toán bằng mã QR
          </h1>
          <p className="text-sm text-muted-foreground">
            Quét mã để hoàn tất thanh toán. Sau đó bấm xác nhận để hệ thống kiểm
            tra giao dịch.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="rounded-[24px] bg-[radial-gradient(circle_at_top_left,_rgba(125,211,252,0.35),_transparent_30%),linear-gradient(180deg,#f8fafc_0%,#eef6ff_100%)] p-6 text-center sm:p-7">
              <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
                <QrCode className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">
                Quét mã để thanh toán
              </h2>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                Bạn có thể dùng ứng dụng ngân hàng hoặc ví điện tử để quét mã QR
                bên dưới.
              </p>

              <div className="mt-6">
                <FakeQrCode />
              </div>

              <div className="mt-5 rounded-3xl border border-sky-100 bg-white/90 px-5 py-4 shadow-sm">
                <p className="text-sm font-medium text-slate-500">
                  Giá thành khách phải trả
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  {formatCurrency(totalAmount)}
                </p>
              </div>

              <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
                  Mã thanh toán:{" "}
                  <span className="font-semibold text-slate-900">
                    {paymentCode}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  <Copy className="h-4 w-4" />
                  Sao chép mã
                </button>
              </div>
            </div>

            <div className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-600">
              Đơn hàng mẫu:{" "}
              <span className="font-semibold text-slate-900">
                {firstProduct
                  ? `${firstProduct.name} (${firstProduct.gender === "Male" ? "Nam" : "Nữ"})`
                  : "Chưa có sản phẩm"}
              </span>
              . Sau khi bạn xác nhận, hệ thống sẽ kiểm tra xem giao dịch đã được
              ghi nhận hay chưa.
            </div>
          </div>

          <div className="h-fit rounded-[24px] border border-slate-900 bg-white p-6 shadow-sm">
            <h2 className="text-[30px] font-semibold text-slate-900">
              Tóm tắt đơn hàng
            </h2>

            <div className="mt-5 space-y-4">
              {selectedCartItems.map((item) => (
                <div
                  key={item.variantID}
                  className="flex items-start justify-between gap-4"
                >
                  <div>
                    <p className="text-lg font-medium text-slate-900">
                      {item.name} ({item.gender === "Male" ? "Nam" : "Nữ"})
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      Số lượng: {item.quantity}
                    </p>
                  </div>
                  <p className="text-lg font-medium text-slate-900">
                    {formatCurrency(item.variantPrice * item.quantity)}
                  </p>
                </div>
              ))}

              {checkoutValues?.prescriptionOption === "with_prescription" &&
              selectedLensProduct ? (
                <div className="rounded-2xl border border-sky-100 bg-sky-50/60 px-4 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-base font-semibold text-slate-900">
                        {selectedLensProduct.name}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {selectedLensProduct.description}
                      </p>
                    </div>
                    <p className="text-lg font-medium text-slate-900">
                      {formatCurrency(lensPrice)}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="my-7 border-t border-slate-900" />

            <div className="space-y-4 text-lg">
              <div className="flex items-center justify-between text-slate-800">
                <span>Tạm tính</span>
                <span>{formatCurrency(selectedTotalPrice)}</span>
              </div>

              {checkoutValues?.prescriptionOption === "with_prescription" &&
              selectedLensProduct ? (
                <div className="flex items-center justify-between text-slate-800">
                  <span>Tròng kính</span>
                  <span>{formatCurrency(lensPrice)}</span>
                </div>
              ) : null}

              <div className="flex items-center justify-between text-slate-800">
                <span>Phí vận chuyển</span>
                <span>{formatCurrency(SHIPPING_COST)}</span>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-900 pt-6">
              <div className="flex items-center justify-between gap-4">
                <span className="text-2xl font-semibold text-slate-900">
                  Tổng cộng
                </span>
                <span className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>

            <div className="mt-10">
              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={paymentStatus === "checking"}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-teal-600 px-5 py-3.5 text-base font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-teal-400"
              >
                {paymentStatus === "checking" ? (
                  <>
                    <LoaderCircle className="h-5 w-5 animate-spin" />
                    Đang xác nhận thanh toán...
                  </>
                ) : (
                  "Tôi đã thanh toán"
                )}
              </button>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/user/cart/payment")}
          className="mt-5 inline-flex items-center gap-2 rounded-2xl hover:underline"
        >
          <ArrowBigLeft className="h-5 w-5" />
          <span>Quay lại thông tin giao hàng</span>
        </button>
      </div>
    </main>
  );
}

export default function OrderCreatePage() {
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
        const response = await api.get("/lens-products");
        const normalizedLensProducts = Array.isArray(response.data)
          ? response.data.filter(
              (item) => item?.isActive !== 0 && item?.is_active !== 0
            )
          : [];

        if (isMounted && normalizedLensProducts.length) {
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

  if (paymentStep === "qr") {
    return <PaymentQrStep />;
  }

  return (
    <main className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12">
          <h1 className="mb-2 text-4xl font-bold text-foreground font-mono">
            Thanh toán
          </h1>
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

              <CheckOutForm
                form={form}
                lensProducts={lensProducts}
                lensLoading={lensLoading}
              />
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

        <NavLink
          className="mt-5 flex items-center gap-2 rounded-2xl hover:underline"
          to="/user/cart"
        >
          <ArrowBigLeft className="h-5 w-5" />
          <span>Quay về giỏ hàng</span>
        </NavLink>
      </div>
    </main>
  );
}

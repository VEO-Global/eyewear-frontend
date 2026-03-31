import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  FileText,
  Glasses,
  PackageCheck,
} from "lucide-react";
import { Button, Form, Input, Select, Spin } from "antd";
import api from "../configs/config-axios";
import AddressSelector from "../components/checkout/AddressSelector";
import PrescriptionSection from "../components/prescription/PrescriptionSection";
import { appToast } from "../utils/appToast";
import CustomGlassForm from "../form/custom-glass/CustomGlassForm";

const STEP_KEYS = {
  SHIPPING: 0,
  PRESCRIPTION: 1,
  PAYMENT: 2,
};

const SHIPPING_COST = 30000;

function formatCurrency(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(amount || 0);
}

const validateShippingAddress = (_, value) => {
  if (!value || typeof value !== "object") {
    return Promise.reject(new Error("Vui lòng nhập địa chỉ giao hàng"));
  }

  if (typeof value.provinceCode !== "number" || !value.provinceName) {
    return Promise.reject(new Error("Vui lòng chọn tỉnh/thành"));
  }

  if (typeof value.districtCode !== "number" || !value.districtName) {
    return Promise.reject(new Error("Vui lòng chọn quận/huyện"));
  }

  if (typeof value.wardCode !== "number" || !value.wardName) {
    return Promise.reject(new Error("Vui lòng chọn phường/xã"));
  }

  if (!value.addressDetail?.trim()) {
    return Promise.reject(new Error("Vui lòng nhập địa chỉ chi tiết"));
  }

  return Promise.resolve();
};

function StepPill({ index, currentStep, title, caption }) {
  const isActive = currentStep === index;
  const isDone = currentStep > index;

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${
        isActive
          ? "border-teal-200 bg-teal-50"
          : isDone
            ? "border-emerald-200 bg-emerald-50"
            : "border-slate-200 bg-white"
      }`}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${
          isActive
            ? "bg-teal-600 text-white"
            : isDone
              ? "bg-emerald-600 text-white"
              : "bg-slate-100 text-slate-500"
        }`}
      >
        {isDone ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="text-xs text-slate-500">{caption}</p>
      </div>
    </div>
  );
}

function InfoCard({ title, description, tone }) {
  const toneMap = {
    amber: "border-amber-100 bg-amber-50",
    teal: "border-teal-100 bg-teal-50",
    sky: "border-sky-100 bg-sky-50",
  };

  return (
    <div className={`rounded-2xl border p-4 ${toneMap[tone] || toneMap.teal}`}>
      <h2 className="font-semibold text-gray-900">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-gray-600">{description}</p>
    </div>
  );
}

export default function CustomGlassesPage() {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(STEP_KEYS.SHIPPING);
  const [lensProducts, setLensProducts] = useState([]);
  const [lensLoading, setLensLoading] = useState(false);

  function handleBack() {
    setCurrentStep((prev) => Math.max(STEP_KEYS.SHIPPING, prev - 1));
  }
  const prescriptionOption =
    Form.useWatch("prescriptionOption", form) || "without_prescription";

  const selectedLensId = Form.useWatch("lensProductId", form);

  const selectedLens = useMemo(
    () =>
      lensProducts.find((item) => Number(item.id) === Number(selectedLensId)) ||
      null,
    [lensProducts, selectedLensId]
  );

  const paymentSubtotal = selectedLens?.price || 0;
  const paymentTotal = paymentSubtotal + SHIPPING_COST;

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

  async function handleContinueFromShipping() {
    try {
      await form.validateFields([
        "fullName",
        "phoneNumber",
        "shippingAddress",
        "frameStyle",
        "extraNote",
        "prescriptionOption",
      ]);

      if (prescriptionOption === "with_prescription") {
        setCurrentStep(STEP_KEYS.PRESCRIPTION);
        return;
      }

      setCurrentStep(STEP_KEYS.PAYMENT);
    } catch {
      appToast.warning(
        "Bạn kiểm tra lại giúp mình các thông tin giao hàng nhé"
      );
    }
  }

  async function handleContinueFromPrescription() {
    try {
      await form.validateFields([
        "lensProductId",
        "prescriptionMethod",
        ["prescription", "prescriptionImageUrl"],
        ["prescription", "sphereOd"],
        ["prescription", "sphereOs"],
        ["prescription", "cylinderOd"],
        ["prescription", "cylinderOs"],
        ["prescription", "axisOd"],
        ["prescription", "axisOs"],
        ["prescription", "pd"],
      ]);

      setCurrentStep(STEP_KEYS.PAYMENT);
    } catch {
      appToast.warning(
        "Bạn kiểm tra lại phần toa thuốc và tròng kính giúp mình nhé"
      );
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#fff8f1_0%,#ffffff_35%,#ecfeff_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
          <span className="inline-flex rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-sm font-semibold text-teal-700">
            Cá nhân hóa theo nhu cầu
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900">
            Làm kính theo yêu cầu
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Chọn kiểu gọng, xác định có cần toa thuốc hay không, rồi hoàn tất
            các bước còn lại để EyeCare chuẩn bị chiếc kính phù hợp nhất cho
            bạn.
          </p>

          <div className="mt-8 grid gap-4">
            <InfoCard
              title="Luồng nhiều bước dễ theo dõi"
              tone="amber"
              description="Nếu bạn chọn không có đơn thuốc, hệ thống sẽ bỏ qua bước nhập toa và đi thẳng tới phần thanh toán. Nếu có đơn thuốc, bạn sẽ chọn tròng kính rồi nhập hoặc tải ảnh toa trước khi thanh toán."
            />
            <InfoCard
              title="Chọn tròng kính theo tên"
              tone="teal"
              description="Khách chỉ cần chọn tên tròng kính dễ hiểu trên giao diện. Hệ thống vẫn giữ lại lens id ở phía dưới để gửi dữ liệu chính xác."
            />
            <InfoCard
              title="Hiển thị rõ mô tả và giá"
              tone="sky"
              description="Ngay sau khi chọn tên tròng kính, người dùng sẽ thấy giá tiền và mô tả chi tiết để dễ quyết định hơn."
            />
          </div>

          <div className="mt-8 rounded-[28px] border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Các bước thực hiện
            </h2>
            <div className="mt-4 grid gap-3">
              <StepPill
                index={STEP_KEYS.SHIPPING}
                currentStep={currentStep}
                title="Thông tin giao hàng"
                caption="Điền thông tin cơ bản và chọn có cần toa thuốc hay không"
              />
              <StepPill
                index={STEP_KEYS.PRESCRIPTION}
                currentStep={currentStep}
                title="Chọn tròng kính và toa thuốc"
                caption="Chỉ hiện khi khách chọn có đơn thuốc"
              />
              <StepPill
                index={STEP_KEYS.PAYMENT}
                currentStep={currentStep}
                title="Thanh toán"
                caption="Kiểm tra lại thông tin trước khi xác nhận"
              />
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.1)] backdrop-blur sm:p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-600">
                Bước {currentStep + 1}
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                {currentStep === STEP_KEYS.SHIPPING && "Thông tin giao hàng"}
                {currentStep === STEP_KEYS.PRESCRIPTION &&
                  "Toa thuốc và tròng kính"}
                {currentStep === STEP_KEYS.PAYMENT && "Thanh toán"}
              </h2>
            </div>
          </div>
          <CustomGlassForm
            STEP_KEYS={STEP_KEYS}
            validateShippingAddress={validateShippingAddress}
            currentStep={currentStep}
            prescriptionOption={prescriptionOption}
            form={form}
            handleContinueFromShipping={handleContinueFromShipping}
            selectedLens={selectedLens}
            lensLoading={lensLoading}
            lensProducts={lensProducts}
            selectedLensId={selectedLensId}
            handleContinueFromPrescription={handleContinueFromPrescription}
            formatCurrency={formatCurrency}
            paymentSubtotal={paymentTotal}
            paymentTotal={paymentTotal}
            SHIPPING_COST={SHIPPING_COST}
            setCurrentStep={setCurrentStep}
          />
        </div>
      </div>
    </div>
  );
}

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
import { Button, Form, Input, Radio, Select, Spin } from "antd";
import api from "../configs/config-axios";
import AddressSelector from "../components/checkout/AddressSelector";
import PrescriptionSection from "../components/prescription/PrescriptionSection";
import {
  FALLBACK_LENS_PRODUCTS,
} from "../constants/lensProducts";
import { appToast } from "../utils/appToast";

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
  const [lensProducts, setLensProducts] = useState(FALLBACK_LENS_PRODUCTS);
  const [lensLoading, setLensLoading] = useState(false);

  const prescriptionOption =
    Form.useWatch("prescriptionOption", form) || "without_prescription";
  const selectedLensId = Form.useWatch("lensProductId", form);

  const selectedLens = useMemo(
    () =>
      lensProducts.find((item) => Number(item.id) === Number(selectedLensId)) || null,
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
          ? response.data.filter((item) => item?.isActive !== 0 && item?.is_active !== 0)
          : [];

        if (isMounted && normalizedLensProducts.length) {
          setLensProducts(normalizedLensProducts);
        }
      } catch {
        if (isMounted) {
          setLensProducts(FALLBACK_LENS_PRODUCTS);
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
      appToast.warning("Bạn kiểm tra lại giúp mình các thông tin giao hàng nhé");
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
      appToast.warning("Bạn kiểm tra lại phần toa thuốc và tròng kính giúp mình nhé");
    }
  }

  function handleBack() {
    setCurrentStep((prev) => Math.max(STEP_KEYS.SHIPPING, prev - 1));
  }

  async function handleSubmit(values) {
    const payload = {
      fullName: values.fullName,
      phoneNumber: values.phoneNumber,
      shippingAddress: values.shippingAddress,
      frameStyle: values.frameStyle,
      lensType: values.lensType,
      extraNote: values.extraNote,
      prescriptionOption: values.prescriptionOption,
      lensProductId:
        values.prescriptionOption === "with_prescription"
          ? values.lensProductId
          : undefined,
      prescription:
        values.prescriptionOption === "with_prescription"
          ? values.prescription
          : undefined,
    };

    console.log("custom glasses payload", payload);
    appToast.success("Yêu cầu làm kính đã được xác nhận");
    form.resetFields();
    setCurrentStep(STEP_KEYS.SHIPPING);
  }

  const shippingAddressValue = form.getFieldValue("shippingAddress");

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
            Chọn kiểu gọng, xác định có cần toa thuốc hay không, rồi hoàn tất các
            bước còn lại để EyeCare chuẩn bị chiếc kính phù hợp nhất cho bạn.
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
            <h2 className="text-lg font-semibold text-slate-900">Các bước thực hiện</h2>
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
                {currentStep === STEP_KEYS.PRESCRIPTION && "Toa thuốc và tròng kính"}
                {currentStep === STEP_KEYS.PAYMENT && "Thanh toán"}
              </h2>
            </div>

            {currentStep > STEP_KEYS.SHIPPING && (
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-teal-300 hover:text-teal-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Quay lại
              </button>
            )}
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              lensType: "Cận",
              prescriptionOption: "without_prescription",
              prescriptionMethod: "image",
            }}
          >
            {currentStep === STEP_KEYS.SHIPPING && (
              <div className="space-y-1">
                <Form.Item
                  label="Tên người nhận"
                  name="fullName"
                  rules={[{ required: true, message: "Vui lòng nhập tên người nhận" }]}
                >
                  <Input size="large" placeholder="Khách Hàng VIP" />
                </Form.Item>

                <Form.Item
                  label="Số điện thoại"
                  name="phoneNumber"
                  rules={[
                    { required: true, message: "Vui lòng nhập số điện thoại" },
                    {
                      pattern: /^[0-9]{10,11}$/,
                      message: "Số điện thoại chưa đúng định dạng",
                    },
                  ]}
                >
                  <Input size="large" placeholder="0888888887" />
                </Form.Item>

                <Form.Item
                  label="Địa chỉ giao hàng"
                  name="shippingAddress"
                  rules={[{ validator: validateShippingAddress }]}
                >
                  <AddressSelector />
                </Form.Item>

                <Form.Item label="Loại kính" name="lensType">
                  <Select
                    size="large"
                    options={[
                      { label: "Kính cận", value: "Cận" },
                      { label: "Kính viễn", value: "Viễn" },
                      { label: "Kính loạn", value: "Loạn" },
                      { label: "Kính chống ánh sáng xanh", value: "ASX" },
                    ]}
                  />
                </Form.Item>

                <Form.Item label="Kiểu gọng mong muốn" name="frameStyle">
                  <Input
                    size="large"
                    placeholder="Ví dụ: gọng tròn kim loại màu đen"
                  />
                </Form.Item>

                <Form.Item label="Ghi chú" name="extraNote">
                  <Input.TextArea
                    rows={4}
                    placeholder="Ví dụ: Giao giờ hành chính, ưu tiên tròng mỏng nhẹ..."
                  />
                </Form.Item>

                <Form.Item
                  label="Bạn có đơn thuốc không?"
                  name="prescriptionOption"
                  rules={[{ required: true }]}
                  extra="Nếu chọn có đơn thuốc, bước tiếp theo sẽ hiện giao diện nhập toa thuốc và chọn tròng kính."
                >
                  <Radio.Group className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Radio.Button
                      value="without_prescription"
                      className="!h-auto !rounded-2xl !border !border-slate-200 !bg-white !px-5 !py-4 !text-left !shadow-sm before:!hidden"
                    >
                      <div>
                        <p className="text-base font-semibold text-slate-900">
                          Không có đơn thuốc
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Bỏ qua bước nhập toa và đi thẳng tới thanh toán.
                        </p>
                      </div>
                    </Radio.Button>

                    <Radio.Button
                      value="with_prescription"
                      className="!h-auto !rounded-2xl !border !border-slate-200 !bg-white !px-5 !py-4 !text-left !shadow-sm before:!hidden"
                    >
                      <div>
                        <p className="text-base font-semibold text-slate-900">
                          Có đơn thuốc
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Sẽ chuyển sang bước nhập toa và chọn tròng kính.
                        </p>
                      </div>
                    </Radio.Button>
                  </Radio.Group>
                </Form.Item>

                <div className="pt-4">
                  <Button
                    type="primary"
                    size="large"
                    className="h-12 w-full rounded-2xl"
                    onClick={handleContinueFromShipping}
                  >
                    {prescriptionOption === "with_prescription"
                      ? "Tiếp tục tới toa thuốc"
                      : "Tiếp tục tới thanh toán"}
                  </Button>
                </div>
              </div>
            )}

            {currentStep === STEP_KEYS.PRESCRIPTION && (
              <div>
                <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <Glasses className="mt-1 h-5 w-5 text-teal-700" />
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        Chọn loại tròng kính
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        Người dùng sẽ nhìn thấy tên tròng kính để dễ chọn. Hệ thống
                        vẫn lưu lại `id` của lens ở nền.
                      </p>
                    </div>
                  </div>

                  <Form.Item
                    className="mt-5 mb-0"
                    name="lensProductId"
                    rules={[
                      { required: true, message: "Vui lòng chọn một loại tròng kính" },
                    ]}
                  >
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {lensLoading ? (
                        <div className="col-span-full flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-10">
                          <Spin />
                        </div>
                      ) : (
                        lensProducts.map((lens) => {
                          const isSelected = Number(selectedLensId) === Number(lens.id);

                          return (
                            <button
                              key={lens.id}
                              type="button"
                              onClick={() => form.setFieldValue("lensProductId", lens.id)}
                              className={`rounded-2xl border px-4 py-4 text-left transition ${
                                isSelected
                                  ? "border-teal-400 bg-teal-50 shadow-sm"
                                  : "border-slate-200 bg-white hover:border-slate-300"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="text-base font-semibold text-slate-900">
                                    {lens.name}
                                  </p>
                                  <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                                    {lens.type || "Lens Product"}
                                  </p>
                                </div>
                                {isSelected && (
                                  <span className="rounded-full bg-teal-600 px-2.5 py-1 text-xs font-semibold text-white">
                                    Đã chọn
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </Form.Item>

                  {selectedLens && (
                    <div className="mt-5 rounded-[24px] border border-sky-100 bg-white p-5 shadow-sm">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="max-w-2xl">
                          <p className="text-xl font-semibold text-slate-900">
                            {selectedLens.name}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            {selectedLens.description}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-right">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                            Giá tròng kính
                          </p>
                          <p className="mt-1 text-2xl font-bold text-slate-900">
                            {formatCurrency(selectedLens.price)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <PrescriptionSection form={form} />

                <div className="mt-8">
                  <Button
                    type="primary"
                    size="large"
                    className="h-12 w-full rounded-2xl"
                    onClick={handleContinueFromPrescription}
                  >
                    Tiếp tục tới thanh toán
                  </Button>
                </div>
              </div>
            )}

            {currentStep === STEP_KEYS.PAYMENT && (
              <div className="grid gap-6 lg:grid-cols-[1.04fr_0.96fr]">
                <div className="space-y-6">
                  <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 sm:p-6">
                    <div className="flex items-start gap-3">
                      <PackageCheck className="mt-1 h-5 w-5 text-teal-700" />
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          Thông tin giao hàng
                        </h3>
                        <div className="mt-4 space-y-3 text-sm text-slate-600">
                          <p>
                            <span className="font-semibold text-slate-900">Người nhận:</span>{" "}
                            {form.getFieldValue("fullName")}
                          </p>
                          <p>
                            <span className="font-semibold text-slate-900">Số điện thoại:</span>{" "}
                            {form.getFieldValue("phoneNumber")}
                          </p>
                          <p>
                            <span className="font-semibold text-slate-900">Địa chỉ:</span>{" "}
                            {shippingAddressValue?.addressDetail}, {shippingAddressValue?.wardName},{" "}
                            {shippingAddressValue?.districtName}, {shippingAddressValue?.provinceName}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 sm:p-6">
                    <div className="flex items-start gap-3">
                      <FileText className="mt-1 h-5 w-5 text-teal-700" />
                      <div className="w-full">
                        <h3 className="text-lg font-semibold text-slate-900">
                          Tùy chọn đơn hàng
                        </h3>
                        <div className="mt-4 space-y-3 text-sm text-slate-600">
                          <p>
                            <span className="font-semibold text-slate-900">Loại kính:</span>{" "}
                            {form.getFieldValue("lensType")}
                          </p>
                          <p>
                            <span className="font-semibold text-slate-900">Kiểu gọng:</span>{" "}
                            {form.getFieldValue("frameStyle") || "Chưa có ghi chú"}
                          </p>
                          <p>
                            <span className="font-semibold text-slate-900">Đơn thuốc:</span>{" "}
                            {prescriptionOption === "with_prescription"
                              ? "Có đơn thuốc"
                              : "Không có đơn thuốc"}
                          </p>
                          {selectedLens ? (
                            <div className="rounded-2xl border border-sky-100 bg-white px-4 py-4">
                              <p className="font-semibold text-slate-900">
                                Tròng kính đã chọn: {selectedLens.name}
                              </p>
                              <p className="mt-2 text-sm leading-6 text-slate-600">
                                {selectedLens.description}
                              </p>
                            </div>
                          ) : null}
                          {form.getFieldValue("extraNote") ? (
                            <p>
                              <span className="font-semibold text-slate-900">Ghi chú:</span>{" "}
                              {form.getFieldValue("extraNote")}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-fit rounded-[28px] border border-slate-900 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <CircleDollarSign className="h-6 w-6 text-teal-700" />
                    <h3 className="text-2xl font-semibold text-slate-900">
                      Thanh toán
                    </h3>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between text-slate-700">
                      <span>Tròng kính</span>
                      <span>{formatCurrency(paymentSubtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-700">
                      <span>Phí vận chuyển</span>
                      <span>{formatCurrency(SHIPPING_COST)}</span>
                    </div>
                  </div>

                  <div className="my-6 border-t border-slate-200" />

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-lg font-semibold text-slate-900">Tổng cộng</span>
                    <span className="text-3xl font-bold tracking-tight text-slate-900">
                      {formatCurrency(paymentTotal)}
                    </span>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-500">
                    Nếu bạn chưa chọn tròng kính, EyeCare sẽ xác nhận chi phí hoàn
                    thiện sau khi tiếp nhận yêu cầu của bạn.
                  </p>

                  <div className="mt-8 space-y-3">
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      className="h-12 w-full rounded-2xl"
                    >
                      Xác nhận và thanh toán
                    </Button>
                    <button
                      type="button"
                      onClick={handleBack}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      Chỉnh sửa lại thông tin
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </Form>
        </div>
      </div>
    </div>
  );
}

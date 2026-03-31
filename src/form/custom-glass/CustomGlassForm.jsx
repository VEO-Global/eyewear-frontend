import { Button, Form, Input, Select } from "antd";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import AddressSelector from "../../components/checkout/AddressSelector";
import {
  ChevronRight,
  CircleDollarSign,
  FileText,
  Glasses,
  PackageCheck,
} from "lucide-react";
import PrescriptionSection from "../../components/prescription/PrescriptionSection";

export default function CustomGlassForm({
  STEP_KEYS,
  currentStep,
  prescriptionOption,
  form,
  handleContinueFromShipping,
  selectedLens,
  lensLoading,
  lensProducts,
  selectedLensId,
  handleContinueFromPrescription,
  formatCurrency,
  paymentSubtotal,
  paymentTotal,
  SHIPPING_COST,
  setCurrentStep,
}) {
  const user = useSelector((state) => state.auth.user);
  console.log(user);

  const navigate = useNavigate();

  useEffect(() => {
    user &&
      form.setFieldsValue({
        fullName: user.fullName,
        phoneNumber: user.phone,
        shippingAddress: user.addressLine,
        prescriptionOption: "without_prescription",
      });
  }, [user, form]);

  function handleBack() {
    setCurrentStep(Number(0));
  }

  console.log(currentStep);

  async function handleSubmit(values) {
    console.log(values);
  }
  return (
    <div>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        {currentStep === STEP_KEYS.SHIPPING && (
          <div className="space-y-1">
            <Form.Item
              label="Tên người nhận"
              name="fullName"
              rules={[
                { required: true, message: "Vui lòng nhập tên người nhận" },
              ]}
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
              // rules={[{ validator: validateShippingAddress }]}
            >
              {user?.addressLine ? <Input></Input> : <AddressSelector />}
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
            >
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    value: "without_prescription",
                    title: "Không có đơn thuốc",
                    description: "Tiếp tục với đơn hàng cơ bản",
                  },
                  {
                    value: "with_prescription",
                    title: "Có đơn thuốc",
                    description: "Chọn loại tròng và nhập toa thuốc",
                  },
                ].map((option) => {
                  const isSelected = prescriptionOption === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        form.setFieldValue("prescriptionOption", option.value)
                      }
                      className={`flex min-h-[168px] w-full flex-col items-center justify-start rounded-[28px] border px-5 py-5 text-center shadow-sm transition ${
                        isSelected
                          ? "border-teal-400 bg-teal-50/70"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition ${
                          isSelected
                            ? "border-teal-500 bg-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        <span
                          className={`h-3 w-3 rounded-full transition ${
                            isSelected ? "bg-teal-500" : "bg-transparent"
                          }`}
                        />
                      </span>

                      <p className="mt-5 text-xl font-semibold text-slate-900">
                        {option.title}
                      </p>
                      <p className="mt-4 max-w-[220px] text-sm leading-6 text-slate-500">
                        {option.description}
                      </p>
                    </button>
                  );
                })}
              </div>
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
                  {
                    required: true,
                    message: "Vui lòng chọn một loại tròng kính",
                  },
                ]}
              >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {lensLoading ? (
                    <div className="col-span-full flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-10">
                      <Spin />
                    </div>
                  ) : (
                    lensProducts.map((lens) => {
                      const isSelected =
                        Number(selectedLensId) === Number(lens.id);

                      return (
                        <button
                          key={lens.id}
                          type="button"
                          onClick={() =>
                            form.setFieldValue("lensProductId", lens.id)
                          }
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
                        <span className="font-semibold text-slate-900">
                          Người nhận:
                        </span>{" "}
                        {form.getFieldValue("fullName")}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-900">
                          Số điện thoại:
                        </span>{" "}
                        {form.getFieldValue("phoneNumber")}
                      </p>
                      {/* <p>
                        <span className="font-semibold text-slate-900">
                          Địa chỉ:
                        </span>{" "}
                        {shippingAddressValue?.addressDetail},{" "}
                        {shippingAddressValue?.wardName},{" "}
                        {shippingAddressValue?.districtName},{" "}
                        {shippingAddressValue?.provinceName}
                      </p> */}
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
                        <span className="font-semibold text-slate-900">
                          Loại kính:
                        </span>{" "}
                        {form.getFieldValue("lensType")}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-900">
                          Kiểu gọng:
                        </span>{" "}
                        {form.getFieldValue("frameStyle") || "Chưa có ghi chú"}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-900">
                          Đơn thuốc:
                        </span>{" "}
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
                          <span className="font-semibold text-slate-900">
                            Ghi chú:
                          </span>{" "}
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
                <span className="text-lg font-semibold text-slate-900">
                  Tổng cộng
                </span>
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
  );
}

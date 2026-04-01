import { useEffect, useMemo } from "react";
import { Button, Form, Input, Select, Spin } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import AddressSelector from "../components/checkout/AddressSelector";
import PrescriptionSection from "../components/prescription/PrescriptionSection";
import { fetchProfile } from "../redux/auth/authSlice";
import { appToast } from "../utils/appToast";
import { extractLatestCheckoutAddress, hasCheckoutAddress } from "../utils/userAddress";

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

export default function CheckOutForm({ form, lensProducts, lensLoading }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart, selectedVariantIds } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  const prescriptionOption =
    Form.useWatch("prescriptionOption", form) || "without_prescription";
  const selectedLensId = Form.useWatch("lensProductId", form);

  const selectedLensProduct = useMemo(
    () => lensProducts.find((item) => Number(item.id) === Number(selectedLensId)) || null,
    [lensProducts, selectedLensId]
  );

  const selectedCartItems = useMemo(
    () => cart.filter((item) => selectedVariantIds.includes(item.variantID)),
    [cart, selectedVariantIds]
  );

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token && !user) {
      dispatch(fetchProfile());
    }
  }, [dispatch, user]);

  useEffect(() => {
    const currentValues = form.getFieldsValue(["receiverName", "phoneNumber", "shippingAddress"]);
    const nextValues = {};

    if (!currentValues.receiverName?.trim() && user?.fullName) {
      nextValues.receiverName = user.fullName;
    }

    const userPhone = user?.phone ?? user?.phoneNumber ?? user?.phone_number;

    if (!currentValues.phoneNumber?.trim() && userPhone) {
      nextValues.phoneNumber = userPhone;
    }

    if (!hasCheckoutAddress(currentValues.shippingAddress)) {
      const latestAddress = extractLatestCheckoutAddress(user);

      if (latestAddress) {
        nextValues.shippingAddress = latestAddress;
      }
    }

    if (Object.keys(nextValues).length) {
      form.setFieldsValue(nextValues);
    }
  }, [form, user]);

  useEffect(() => {
    if (prescriptionOption === "without_prescription") {
      form.setFieldsValue({
        lensProductId: undefined,
        prescriptionMethod: "image",
        prescription: undefined,
      });
    }
  }, [form, prescriptionOption]);

  async function handleSubmit(values) {
    if (!cart.length) {
      appToast.warning("Giỏ hàng của bạn đang trống.");
      return;
    }

    if (!selectedCartItems.length) {
      appToast.warning("Vui lòng chọn ít nhất một sản phẩm để thanh toán.");
      return;
    }

    if (values.prescriptionOption === "with_prescription") {
      const prescription = values?.prescription || {};
      const hasValue = (field) =>
        prescription[field] !== undefined &&
        prescription[field] !== null &&
        `${prescription[field]}`.trim() !== "";

      if (!hasValue("pd")) {
        appToast.warning("Vui lòng nhập PD trước khi gửi đơn có toa thuốc.");
        return;
      }

      if (hasValue("cylinderOd") && !hasValue("axisOd")) {
        appToast.warning("Mắt phải đã có CYL nên cần nhập thêm AXIS.");
        return;
      }

      if (hasValue("cylinderOs") && !hasValue("axisOs")) {
        appToast.warning("Mắt trái đã có CYL nên cần nhập thêm AXIS.");
        return;
      }

      if (!selectedLensProduct?.id) {
        appToast.warning("Vui lòng chọn tròng kính cho đơn có toa thuốc.");
        return;
      }
    }

    navigate("/user/cart/payment?step=process", {
      state: {
        checkoutValues: values,
        selectedLensProduct,
        selectedCartItems,
      },
    });
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      className="space-y-4"
      initialValues={{
        prescriptionOption: "without_prescription",
        prescriptionMethod: "image",
        paymentMethod: "COD",
      }}
      style={{ border: 0 }}
    >
      <Form.Item
        label="Tên người nhận"
        name="receiverName"
        rules={[{ required: true, message: "Vui lòng nhập tên người nhận" }]}
      >
        <Input placeholder="Nguyễn Văn A" size="large" />
      </Form.Item>

      <Form.Item
        label="Số điện thoại"
        name="phoneNumber"
        rules={[
          { required: true, message: "Vui lòng nhập số điện thoại" },
          {
            pattern: /^[0-9]{10,11}$/,
            message: "Số điện thoại không hợp lệ",
          },
        ]}
      >
        <Input placeholder="0901234567" size="large" />
      </Form.Item>

      <Form.Item
        label="Địa chỉ giao hàng"
        name="shippingAddress"
        rules={[{ validator: validateShippingAddress }]}
      >
        <AddressSelector />
      </Form.Item>

      <Form.Item label="Ghi chú" name="note">
        <Input.TextArea rows={2} placeholder="Ví dụ: Giao giờ hành chính" />
      </Form.Item>

      <Form.Item
        label="Phương thức thanh toán"
        name="paymentMethod"
        rules={[{ required: true, message: "Vui lòng chọn phương thức thanh toán" }]}
      >
        <Select
          size="large"
          options={[
            { label: "Thanh toán khi nhận hàng (COD)", value: "COD" },
                        { label: "PayOS", value: "PAYOS" },
                                  ]}
        />
      </Form.Item>

      <Form.Item label="Đơn thuốc" name="prescriptionOption" rules={[{ required: true }]}>
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
                onClick={() => form.setFieldValue("prescriptionOption", option.value)}
                className={`flex min-h-[168px] w-full flex-col items-center justify-start rounded-[28px] border px-5 py-5 text-center shadow-sm transition ${
                  isSelected
                    ? "border-teal-400 bg-teal-50/70"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition ${
                    isSelected ? "border-teal-500 bg-white" : "border-slate-300 bg-white"
                  }`}
                >
                  <span
                    className={`h-3 w-3 rounded-full transition ${
                      isSelected ? "bg-teal-500" : "bg-transparent"
                    }`}
                  />
                </span>

                <p className="mt-5 text-xl font-semibold text-slate-900">{option.title}</p>
                <p className="mt-4 max-w-[220px] text-sm leading-6 text-slate-500">
                  {option.description}
                </p>
              </button>
            );
          })}
        </div>
      </Form.Item>

      {prescriptionOption === "with_prescription" && (
        <>
          <Form.Item
            label="Loại tròng kính"
            name="lensProductId"
            rules={[{ required: true, message: "Vui lòng chọn loại tròng kính" }]}
          >
            <Select
              size="large"
              placeholder="Chọn loại tròng kính"
              loading={lensLoading}
              notFoundContent={lensLoading ? <Spin size="small" /> : "Không có dữ liệu"}
              options={lensProducts.map((lens) => ({
                label: lens.name,
                value: lens.id,
              }))}
            />
          </Form.Item>

          {selectedLensProduct ? (
            <div className="mb-6 rounded-[28px] border border-sky-100 bg-sky-50/70 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="max-w-xl">
                  <p className="text-lg font-semibold text-slate-900">
                    {selectedLensProduct.name}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {selectedLensProduct.description}
                  </p>
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-right shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    Giá tròng
                  </p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {Number(selectedLensProduct.price).toLocaleString("vi-VN")}đ
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <PrescriptionSection form={form} />
        </>
      )}

      <Form.Item>
        <Button type="primary" htmlType="submit" size="large" className="w-full">
          Đặt hàng
        </Button>
      </Form.Item>
    </Form>
  );
}


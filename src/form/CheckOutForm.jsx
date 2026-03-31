import { useEffect, useMemo } from "react";
import { Button, Checkbox, Form, Input, Select, Spin } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import AddressSelector from "../components/checkout/AddressSelector";
import PrescriptionSection from "../components/prescription/PrescriptionSection";

import { useForm } from "antd/es/form/Form";
import { setPaymentMethod } from "../redux/payment/paymentSlice";
import cartWithDetails from "../utils/cartWithDetail";
import { createOrder } from "../redux/order/orderSlice";
import { toast } from "react-toastify";
import { clearCart } from "../redux/cart/cartSlice";

export default function CheckOutForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart } = useSelector((state) => state.cart);
  const { products } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);
  const [form] = useForm();
  const { provinces, districts, wards } = useSelector(
    (state) => state.location
  );
  const prescriptionOption =
    Form.useWatch("prescriptionOption", form) || "WITHOUT_PRESCRIPTION";

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        receiverName: user.fullName,
        phoneNumber: user.phone,
        prescriptionOption: "WITHOUT_PRESCRIPTION",
      });
    }
  }, [form, user]);

  useEffect(() => {
    if (prescriptionOption === "WITHOUT_PRESCRIPTION") {
      form.setFieldsValue({
        lensProductId: undefined,
        prescriptionMethod: "image",
        prescription: undefined,
      });
    }
  }, [form, prescriptionOption]);

  const cartsWithDetails = useMemo(() => {
    return cartWithDetails(cart, products);
  }, [cart, products]);

  const handleSubmit = async (values) => {
    if (values.prescriptionOption === "WITHOUT_PRESCRIPTION") {
      const payloadWithouPrescription = {
        ...values,
        paymentMethod: values.paymentMethod,
        receiverName: values.receiverName,
        phoneNumber: values.phoneNumber,
        city: provinces.find(
          (p) => p.code === values.shippingAddress?.provinceCode
        )?.name,
        district: districts.find(
          (d) => d.code === values.shippingAddress?.districtCode
        )?.name,
        ward: wards.find((w) => w.code === values.shippingAddress?.wardCode)
          ?.name,
        items: cartsWithDetails.map((item) => ({
          productVariantId: item.productVariantId,
          variantId: item.productVariantId,
          quantity: item.quantity,
        })),
        addressDetail: values.shippingAddress?.addressDetail,
        shippingAddress: {
          cityCode: String(values.shippingAddress?.provinceCode),
          cityName: provinces.find(
            (p) => p.code === values.shippingAddress?.provinceCode
          )?.name,
          districtCode: String(values.shippingAddress?.districtCode),
          districtName: districts.find(
            (d) => d.code === values.shippingAddress?.districtCode
          )?.name,
          wardCode: String(values.shippingAddress?.wardCode),
          wardName: wards.find(
            (w) => w.code === values.shippingAddress?.wardCode
          )?.name,
          addressDetail: values.shippingAddress?.addressDetail,
        },
        note: values.note,
      };
      const result = await dispatch(createOrder(payloadWithouPrescription));
      if (createOrder.fulfilled.match(result)) {
        toast.success("Tạo đơn hàng thành công");
        toast.success("Chuyển hưởng đến trang thanh toán");
        navigate("/user/payment");
        dispatch(clearCart());
      }
    } else if (values.prescriptionOption === "WITH_PRESCRIPTION") {
      const payloadWitreschription = {
        ...values,
        paymentMethod: values.paymentMethod,
        receiverName: values.receiverName,
        phoneNumber: values.phoneNumber,
        city: provinces.find(
          (p) => p.code === values.shippingAddress?.provinceCode
        )?.name,
        district: districts.find(
          (d) => d.code === values.shippingAddress?.districtCode
        )?.name,
        ward: wards.find((w) => w.code === values.shippingAddress?.wardCode)
          ?.name,
        items: cartsWithDetails.map((item) => ({
          productVariantId: item.productVariantId,
          variantId: item.productVariantId,
          quantity: item.quantity,
          lensProductId: item.lensProductId,
        })),
        addressDetail: values.shippingAddress?.addressDetail,
        shippingAddress: {
          cityCode: String(values.shippingAddress?.provinceCode),
          cityName: provinces.find(
            (p) => p.code === values.shippingAddress?.provinceCode
          )?.name,
          districtCode: String(values.shippingAddress?.districtCode),
          districtName: districts.find(
            (d) => d.code === values.shippingAddress?.districtCode
          )?.name,
          wardCode: String(values.shippingAddress?.wardCode),
          wardName: wards.find(
            (w) => w.code === values.shippingAddress?.wardCode
          )?.name,
          addressDetail: values.shippingAddress?.addressDetail,
        },
        note: values.note,
      };
      dispatch(createOrder(payloadWitreschription));
      console.log(
        "Checkout form submitted with payload:",
        payloadWitreschription
      );
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      className="space-y-4"
      initialValues={{
        prescriptionOption: "WITHOUT_PRESCRIPTION",
        prescriptionMethod: "image",
      }}
      style={{ border: 0 }}
    >
      <Form.Item
        label="Phương thức thanh toán"
        name="paymentMethod"
        rules={[
          { required: true, message: "Vui lòng chọn phương thức thanh toán" },
        ]}
      >
        <Select
          size="large"
          placeholder="Chọn phương thức thanh toán"
          onChange={(value) => dispatch(setPaymentMethod(value))}
        >
          <Select.Option value="COD">
            Thanh toán khi nhận hàng (COD)
          </Select.Option>
          <Select.Option value="BANK_TRANSFER">
            Thanh toán qua MoMo
          </Select.Option>
        </Select>
      </Form.Item>

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
        rules={[{ required: true, message: "Vui lòng nhập địa chỉ giao hàng" }]}
      >
        <AddressSelector
          form={form}
          provinces={provinces}
          districts={districts}
          wards={wards}
        />
      </Form.Item>

      <Form.Item label="Ghi chú" name="note">
        <Input.TextArea rows={2} placeholder="Ví dụ: Giao giờ hành chính" />
      </Form.Item>

      <Form.Item
        label="Đơn thuốc"
        name="prescriptionOption"
        rules={[{ required: true }]}
      >
        <div className="grid grid-cols-2 gap-4">
          {[
            {
              value: "WITHOUT_PRESCRIPTION",
              title: "Không có đơn thuốc",
              description: "Tiếp tục với đơn hàng cơ bản",
            },
            {
              value: "With_PRESCRIPTION",
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

      {/* {prescriptionOption === "with_prescription" && (
        <>
          <Form.Item
            label="Loại tròng kính"
            name="lensProductId"
            rules={[
              { required: true, message: "Vui lòng chọn loại tròng kính" },
            ]}
          >
            <Select
              size="large"
              placeholder="Chọn loại tròng kính"
              loading={lensLoading}
              notFoundContent={
                lensLoading ? <Spin size="small" /> : "Không có dữ liệu"
              }
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
      )} */}

      {/* {prescriptionOption === "with_prescription" && (
        <>
          <Form.Item
            label="Chọn sản phẩm cần đơn thuốc"
            name="prescriptionItemIds"
            rules={[
              { required: true, message: "Vui lòng chọn ít nhất 1 sản phẩm" },
            ]}
          >
            <Checkbox.Group
              className="w-full"
              onChange={(checkedValues) =>
                dispatch(setSelectedProductForPrescription(checkedValues))
              }
            >
              <div className="space-y-2">
                {cartsWithDetails.map((item) => (
                  <Checkbox key={item.id} value={item.productVariantId}>
                    {item.productName}
                  </Checkbox>
                ))}
              </div>
            </Checkbox.Group>
          </Form.Item>

          <Form.Item
            label="Đơn thuốc"
            name="prescription"
            rules={[{ required: true, message: "Vui lòng nhập đơn thuốc" }]}
          >
            <Input.TextArea rows={4} placeholder="Nhập đơn thuốc tại đây" />
          </Form.Item>
        </>
      )} */}

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          size="large"
          className="w-full"
        >
          Đặt hàng
        </Button>
      </Form.Item>
    </Form>
  );
}

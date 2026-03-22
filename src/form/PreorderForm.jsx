import { useEffect, useMemo, useState } from "react";
import { Button, Form, Input, InputNumber, Select } from "antd";
import { useForm } from "antd/es/form/Form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import AddressSelector from "../components/checkout/AddressSelector";
import { fetchProfile } from "../redux/auth/authSlice";
import { addItem } from "../redux/cart/cartSlice";
import { appToast } from "../utils/appToast";
import {
  extractLatestCheckoutAddress,
  hasCheckoutAddress,
} from "../utils/userAddress";
import { getPrimaryProductImage } from "../utils/productImages";

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

export default function PreorderForm({ selectedProduct }) {
  const [form] = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");

  const variants = selectedProduct?.variants || [];

  const colorOptions = useMemo(
    () =>
      [...new Set(variants.map((variant) => variant.color).filter(Boolean))].map(
        (color) => ({
          label: color,
          value: color,
        })
      ),
    [variants]
  );

  const sizeOptions = useMemo(() => {
    const filteredVariants = selectedColor
      ? variants.filter((variant) => variant.color === selectedColor)
      : variants;

    return [...new Set(filteredVariants.map((variant) => variant.size).filter(Boolean))].map(
      (size) => ({
        label: size,
        value: size,
      })
    );
  }, [selectedColor, variants]);

  const currentVariant = useMemo(
    () =>
      variants.find(
        (variant) =>
          (!selectedColor || variant.color === selectedColor) &&
          (!selectedSize || variant.size === selectedSize)
      ) || null,
    [selectedColor, selectedSize, variants]
  );

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token && !user) {
      dispatch(fetchProfile());
    }
  }, [dispatch, user]);

  useEffect(() => {
    const currentValues = form.getFieldsValue([
      "receiverName",
      "phoneNumber",
      "shippingAddress",
    ]);

    const nextValues = {};

    if (!currentValues.receiverName?.trim() && user?.fullName) {
      nextValues.receiverName = user.fullName;
    }

    if (!currentValues.phoneNumber?.trim() && user?.phone) {
      nextValues.phoneNumber = user.phone;
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
    if (!variants.length) {
      setSelectedColor("");
      setSelectedSize("");
      return;
    }

    const firstVariant = variants[0];
    setSelectedColor(firstVariant?.color || "");
    setSelectedSize(firstVariant?.size || "");
  }, [variants]);

  useEffect(() => {
    if (!selectedColor) {
      return;
    }

    const hasSelectedSize = variants.some(
      (variant) => variant.color === selectedColor && variant.size === selectedSize
    );

    if (!hasSelectedSize) {
      const nextVariant = variants.find((variant) => variant.color === selectedColor);
      setSelectedSize(nextVariant?.size || "");
    }
  }, [selectedColor, selectedSize, variants]);

  async function handleSubmit(values) {
    if (!selectedProduct || !currentVariant) {
      appToast.warning("Vui lòng chọn sản phẩm, màu sắc và size trước khi đặt trước");
      return;
    }

    dispatch(
      addItem({
        productID: selectedProduct.id,
        variantID: currentVariant.id,
        variantPrice: currentVariant.price,
        color: currentVariant.color || selectedColor,
        size: currentVariant.size || selectedSize,
        name: selectedProduct.name,
        brand: selectedProduct.brand,
        description: selectedProduct.description,
        material: selectedProduct.material,
        imgUrl: getPrimaryProductImage(selectedProduct),
        gender: selectedProduct.gender,
        cartQuantity: Math.max(1, Number(values.quantity) || 1),
        isPreorder: true,
        isPreorderReady: false,
      })
    );

    dispatch(fetchProfile());

    appToast.success("Đã thêm sản phẩm đặt trước vào giỏ hàng");

    form.setFieldsValue({
      quantity: 1,
      receiverName: undefined,
      phoneNumber: undefined,
      shippingAddress: undefined,
      note: undefined,
    });

    navigate("/user/cart");
  }

  return (
    <div className="mx-auto max-w-3xl py-2">
      {!selectedProduct && (
        <div className="mb-8 rounded-[28px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-800">
          Hãy chọn một sản phẩm ở cột bên trái trước khi điền form đặt trước. Khi đã
          chọn mẫu kính, bạn sẽ thấy đầy đủ thông tin để xác nhận nhanh hơn.
        </div>
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          quantity: 1,
        }}
        className="space-y-8"
      >
        <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-slate-900">Thông tin giao hàng</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              EyeCare sẽ dùng thông tin này để liên hệ xác nhận và thông báo khi sản
              phẩm sẵn sàng.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Form.Item
              label="Họ và tên"
              name="receiverName"
              rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
              className="mb-0"
            >
              <Input size="large" placeholder="Nguyễn Văn A" />
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
              className="mb-0"
            >
              <Input size="large" placeholder="0901234567" />
            </Form.Item>
          </div>

          <Form.Item
            label="Địa chỉ giao hàng"
            name="shippingAddress"
            rules={[{ validator: validateShippingAddress }]}
            className="mb-0 mt-5"
          >
            <AddressSelector />
          </Form.Item>

          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1fr_140px]">
            <Form.Item label="Màu sắc" className="mb-0">
              <Select
                size="large"
                value={selectedColor || undefined}
                onChange={setSelectedColor}
                placeholder="Chọn màu sắc"
                options={colorOptions}
                disabled={!selectedProduct}
              />
            </Form.Item>

            <Form.Item label="Kích thước" className="mb-0">
              <Select
                size="large"
                value={selectedSize || undefined}
                onChange={setSelectedSize}
                placeholder="Chọn size"
                options={sizeOptions}
                disabled={!selectedProduct}
              />
            </Form.Item>

            <Form.Item label="Số lượng" name="quantity" className="mb-0">
              <InputNumber min={1} className="w-full" size="large" />
            </Form.Item>
          </div>

          {currentVariant ? (
            <div className="mt-5 rounded-2xl border border-sky-100 bg-sky-50/70 px-4 py-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">
                Biến thể đã chọn: {currentVariant.color || selectedColor} /{" "}
                {currentVariant.size || selectedSize}
              </p>
              <p className="mt-2">
                Giá dự kiến:{" "}
                <span className="font-semibold text-slate-900">
                  {Number(currentVariant.price || 0).toLocaleString("vi-VN")}đ
                </span>
              </p>
            </div>
          ) : null}

          <Form.Item label="Ghi chú" name="note" className="mb-0 mt-5">
            <Input.TextArea
              rows={3}
              placeholder="Ví dụ: Gọi trước khi giao hàng, giao giờ hành chính..."
            />
          </Form.Item>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-slate-500">
            {currentVariant
              ? "Khi xác nhận đặt trước, sản phẩm sẽ được thêm vào giỏ hàng của bạn."
              : "Chọn một sản phẩm cùng màu và size trước để tiếp tục."}
          </p>

          <Button
            type="primary"
            htmlType="submit"
            disabled={!currentVariant}
            size="large"
            className="h-12 w-full rounded-2xl px-8 sm:w-auto"
          >
            Xác nhận đặt trước
          </Button>
        </div>
      </Form>
    </div>
  );
}

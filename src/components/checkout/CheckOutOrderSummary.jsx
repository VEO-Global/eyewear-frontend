import React, { useMemo } from "react";
import { Form } from "antd";
import { useSelector } from "react-redux";

const SHIPPING_COST = 30000;

function formatCurrency(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(amount || 0);
}

export default function CheckOutOrderSummary({ form, lensProducts }) {
  const { cart, selectedVariantIds } = useSelector((state) => state.cart);
  const prescriptionOption =
    Form.useWatch("prescriptionOption", form) || "without_prescription";
  const selectedLensId = Form.useWatch("lensProductId", form);

  const selectedCartItems = useMemo(
    () => cart.filter((item) => selectedVariantIds.includes(item.variantID)),
    [cart, selectedVariantIds]
  );

  const selectedLensProduct = useMemo(
    () => lensProducts.find((item) => Number(item.id) === Number(selectedLensId)) || null,
    [lensProducts, selectedLensId]
  );

  const lensPrice =
    prescriptionOption === "with_prescription" ? Number(selectedLensProduct?.price || 0) : 0;
  const selectedTotalPrice = selectedCartItems.reduce(
    (total, item) => total + item.variantPrice * item.quantity,
    0
  );
  const subtotal = selectedTotalPrice + lensPrice;
  const totalAmount = subtotal + SHIPPING_COST;

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-semibold">Tóm tắt đơn hàng</h2>

      <div className="mb-6 space-y-4">
        {selectedCartItems.map((item) => (
          <div
            key={item.variantID}
            className="flex items-start justify-between gap-4 text-sm"
          >
            <div>
              <p className="font-medium">{`${item.name} (${
                item.gender === "Male" ? "Nam" : "Nữ"
              })`}</p>
              <p className="text-gray-500">Số lượng: {item.quantity}</p>
            </div>

            <p className="font-medium">
              {formatCurrency(item.variantPrice * item.quantity)}
            </p>
          </div>
        ))}

        {prescriptionOption === "with_prescription" && selectedLensProduct ? (
          <div className="rounded-2xl border border-sky-100 bg-sky-50/70 px-4 py-4 text-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-900">
                  {selectedLensProduct.name}
                </p>
                <p className="mt-1 leading-6 text-slate-500">
                  {selectedLensProduct.description}
                </p>
              </div>
              <p className="font-semibold text-slate-900">
                {formatCurrency(lensPrice)}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="my-4 border-t" />

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span>Tạm tính</span>
          <span>{formatCurrency(selectedTotalPrice)}</span>
        </div>

        {prescriptionOption === "with_prescription" && selectedLensProduct ? (
          <div className="flex justify-between">
            <span>Tròng kính</span>
            <span>{formatCurrency(lensPrice)}</span>
          </div>
        ) : null}

        <div className="flex justify-between">
          <span>Phí vận chuyển</span>
          <span>{formatCurrency(SHIPPING_COST)}</span>
        </div>
      </div>

      <div className="mt-4 flex justify-between border-t pt-4 text-lg font-semibold">
        <span>Tổng cộng</span>
        <span>{formatCurrency(totalAmount)}</span>
      </div>
    </div>
  );
}

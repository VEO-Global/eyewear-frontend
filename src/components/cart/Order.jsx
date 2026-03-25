import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function OrderSummary() {
  const { cart, selectedVariantIds } = useSelector((state) => state.cart);
  const navigate = useNavigate();

  const selectedItems = cart.filter((item) => selectedVariantIds.includes(item.variantID));
  const selectedTotalPrice = selectedItems.reduce(
    (total, item) => total + item.variantPrice * item.quantity,
    0
  );
  const selectedTotalProduct = selectedItems.reduce((total, item) => total + item.quantity, 0);

  function formatCurrency(amount) {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);
  }

  return (
    <div className="h-fit rounded-lg border border-border bg-card p-6 shadow-sm sticky top-6">
      <h2 className="mb-6 text-lg font-semibold text-foreground">Tóm tắt đơn hàng</h2>

      <div className="mb-6 space-y-3">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Tạm tính</span>
          <span>{formatCurrency(selectedTotalPrice)}</span>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Sản phẩm được chọn</span>
          <span>{selectedTotalProduct}</span>
        </div>

        <div className="my-2 border-t border-border" />

        <div className="flex items-center justify-between">
          <span className="font-semibold text-foreground">Tổng cộng</span>
          <span className="text-lg font-bold text-foreground">
            {formatCurrency(selectedTotalPrice)}
          </span>
        </div>
      </div>

      <button
        className="w-full cursor-pointer rounded-lg bg-orange-500 py-3 font-medium text-primary-foreground transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        onClick={() => navigate("/user/cart/payment")}
        disabled={!selectedItems.length}
      >
        <span className="text-white">Tiến hành thanh toán</span>
      </button>

      <p className="mt-10 text-center text-xs text-muted-foreground">
        Chỉ các sản phẩm đã tick mới được đưa vào bước thanh toán
      </p>
    </div>
  );
}

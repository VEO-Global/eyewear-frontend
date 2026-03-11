import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";

const SHIPPING_COST = 30000;
const TAX_RATE = 0.1;

export default function OrderSummary() {
  const { cart, totalPrice, totalProduct } = useSelector((state) => state.cart);
  const navigate = useNavigate();
  // Format tiền VNĐ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-sm h-fit sticky top-6">
      {/* Tiêu đề */}
      <h2 className="text-lg font-semibold text-foreground mb-6">
        Tóm tắt đơn hàng
      </h2>

      {/* Chi tiết giá */}
      <div className="space-y-3 mb-6">
        {/* Tạm tính */}
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>Tạm tính</span>
          <span>{formatCurrency(totalPrice)}</span>
        </div>

        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>Tổng sản phẩm</span>
          <span>{totalProduct}</span>
        </div>
        {/* Divider */}
        <div className="border-t border-border my-2" />

        {/* Tổng tiền */}
        <div className="flex justify-between items-center">
          <span className="font-semibold text-foreground">Tổng cộng</span>
          <span className="text-lg font-bold text-foreground">
            {formatCurrency(totalPrice)}
          </span>
        </div>
      </div>

      {/* Nút thanh toán */}
      <button
        className="w-full bg-primary text-primary-foreground py-3 rounded-lg bg-orange-500 font-medium transition-all hover:opacity-90 active:scale-95 cursor-pointer"
        onClick={() => navigate("/user/cart/payment")}
      >
        <span className="text-white">Tiến hành thanh toán</span>
      </button>

      {/* Thông tin */}
      <p className="text-xs text-muted-foreground text-center mt-10">
        Phí vận chuyển sẽ được tính khi thanh toán
      </p>
    </div>
  );
}

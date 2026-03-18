import React from "react";
import { useSelector } from "react-redux";

const SHIPPING_COST = 30000;

export default function CheckOutOrderSummary() {
  const { cart, totalPrice } = useSelector((state) => state.cart);
  console.log(cart);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-xl border p-6 shadow-sm">
      {/* Title */}
      <h2 className="text-xl font-semibold mb-6">Tóm tắt đơn hàng</h2>

      {/* Product list */}
      <div className="space-y-4 mb-6">
        {cart.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center text-sm"
          >
            <div>
              <p className="font-medium">{`${item.name} (${
                item.gender === "Male" ? "Nam" : "Nữ"
              })`}</p>
              <p className="text-gray-500">Số lượng: {item.quantity}</p>
            </div>

            <div className="mb-7">
              <p className="font-medium">
                {formatCurrency(item.variantPrice * item.quantity)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t my-4"></div>

      {/* Price breakdown */}
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span>Tạm tính</span>
          <span>{formatCurrency(totalPrice)}</span>
        </div>

        <div className="flex justify-between">
          <span>Phí vận chuyển</span>
          <span>{formatCurrency(SHIPPING_COST)}</span>
        </div>
      </div>

      {/* Total */}
      <div className="border-t mt-4 pt-4 flex justify-between font-semibold text-lg">
        <span>Tổng cộng</span>
        <span>{formatCurrency(totalPrice + SHIPPING_COST)}</span>
      </div>
    </div>
  );
}

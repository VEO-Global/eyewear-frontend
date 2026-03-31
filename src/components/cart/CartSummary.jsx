import React from "react";
import { ShoppingBag } from "lucide-react";
import CartItems from "./CartItems";
import { useLocation } from "react-router-dom";

export function CartSummary({ cart }) {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
          <ShoppingBag className="w-5 h-5" />
        </div>

        <h2 className="text-lg font-bold text-gray-900 mt-6">Giỏ hàng</h2>

        <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full ml-auto">
          {totalItems} sản phẩm
        </span>
      </div>

      <div className="flex flex-col">
        <CartItems cart={cart} />
      </div>
    </div>
  );
}

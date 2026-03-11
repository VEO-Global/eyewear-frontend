import React from "react";
import CartItems from "../components/cart/CartItems";
import Order from "../components/cart/Order";
import { useSelector } from "react-redux";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";

export default function CartPage() {
  const { totalProduct } = useSelector((state) => state.cart);
  const navigate = useNavigate();

  if (totalProduct === 0) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center gap-6">
        <p className="text-lg text-muted-foreground">
          Bạn chưa thêm sản phẩm vào giỏ hàng
        </p>

        <Button onClick={() => navigate("/products")}>
          Xem tất cả sản phẩm
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex gap-8">
        {/* Left - Cart Items */}
        <div className="w-[65%]">
          <CartItems />
        </div>

        {/* Right - Order Summary */}
        <div className="w-[35%]">
          <Order />
        </div>
      </div>
    </div>
  );
}

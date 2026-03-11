import React from "react";
import { useSelector } from "react-redux";
import CheckOutForm from "../form/CheckOutForm";
import CheckOutOrderSummary from "../components/checkout/checkOutOrderSummary";

export default function CheckoutPage() {
  const { cart } = useSelector((state) => state.cart);

  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2 font-mono">
            💵 Thanh toán
          </h1>
          <p className="text-muted-foreground">
            Hoàn tất đơn hàng bằng cách điền thông tin giao hàng
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-xl p-8 shadow-sm">
              <h2 className="text-2xl font-semibold text-foreground mb-8">
                Thông tin giao hàng
              </h2>

              <CheckOutForm />
            </div>
          </div>

          <div className="lg:col-span-1  rounded-2xl">
            <CheckOutOrderSummary></CheckOutOrderSummary>
          </div>
        </div>

        {/* Security Info */}
        <div className="mt-12 text-center">
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            Thông tin của bạn được bảo mật và mã hóa
          </p>
        </div>
      </div>
    </main>
  );
}

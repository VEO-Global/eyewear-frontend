import React from "react";
import CheckOutForm from "../form/CheckOutForm";
import CheckOutOrderSummary from "../components/checkout/checkOutOrderSummary";
import { ArrowBigLeft } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2 font-mono">
            Thanh toán
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

          <div className="lg:col-span-1 rounded-2xl">
            <CheckOutOrderSummary />
          </div>
        </div>

        <NavLink
          className="mt-5 flex items-center gap-2 rounded-2xl hover:underline"
          to="/products"
        >
          <ArrowBigLeft className="h-5 w-5" />
          <span>Tiếp tục xem các sản phẩm khác</span>
        </NavLink>
      </div>
    </main>
  );
}

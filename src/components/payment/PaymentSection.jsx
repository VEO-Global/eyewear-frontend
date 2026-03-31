import React from "react";
import {
  Truck,
  QrCode,
  CreditCard,
  Loader2,
  TruckIcon,
  QrCodeIcon,
  Check,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import CheckOutOrderSummary from "../checkout/CheckOutOrderSummary";
import OrderSummary from "../cart/Order";

export function PaymentSection({
  paymentMethod,
  isProcessing,
  onPlaceOrder,
  isEmpty,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
          <CreditCard className="w-5 h-5" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Thanh toán</h2>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-3">
          Phương thức thanh toán
        </h3>

        <div className="space-y-3">
          {paymentMethod === "COD" ? (
            <label
              className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                paymentMethod === "COD"
                  ? "border-emerald-500 bg-emerald-50/30 ring-1 ring-emerald-500"
                  : "border-gray-200 hover:border-emerald-200 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name="payment_method"
                value="cod"
                checked={paymentMethod === "COD"}
                className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
              />

              <div className="flex items-center gap-3 ml-3">
                <div
                  className={`p-2 rounded-lg ${
                    paymentMethod === "COD"
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <TruckIcon className="w-5 h-5" />
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Thanh toán khi nhận hàng
                  </p>
                  <p className="text-xs text-gray-500">COD</p>
                </div>
              </div>
            </label>
          ) : (
            <label
              className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                paymentMethod === "BANK_TRANSFER"
                  ? "border-emerald-500 bg-emerald-50/30 ring-1 ring-emerald-500"
                  : "border-gray-200 hover:border-emerald-200 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name="payment_method"
                value="qr"
                checked={paymentMethod === "BANK_TRANSFER"}
                className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
              />
              {/* 
            <div className="flex items-center gap-3 ml-3">
              <div
                className={`p-2 rounded-lg ${
                  selectedMethod === "qr"
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                <QrCodeIcon className="w-5 h-5" />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900">
                  Chuyển khoản QR
                </p>
                <p className="text-xs text-gray-500">Quét mã qua ứng dụng</p>
              </div>
            </div> */}
            </label>
          )}
        </div>

        {/* <AnimatePresence>
          {paymentMethod === "BANK_TRANSFER" && (
            <QRPayment orderId={orderId} totalAmount={total} />
          )}
        </AnimatePresence> */}
      </div>

      {/* <div className="border-t border-gray-100 pt-2 mb-6">
        <OrderSummary
          subtotal={subtotal}
          shippingFee={shippingFee}
          total={total}
        />
      </div> */}

      <button
        onClick={onPlaceOrder}
        disabled={isEmpty || isProcessing}
        className={`w-full py-4 px-6 rounded-xl text-white font-medium text-base flex items-center justify-center transition-all duration-200 ${
          isEmpty || isProcessing
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] shadow-sm hover:shadow-md shadow-emerald-600/20"
        }`}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Đang xử lý...
          </>
        ) : (
          "Đặt hàng"
        )}
      </button>
    </div>
  );
}

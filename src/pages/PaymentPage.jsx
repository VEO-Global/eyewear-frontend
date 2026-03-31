import React, { useState } from "react";
import CartItems from "../components/cart/CartItems";
import { DollarSign, Store } from "lucide-react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { PaymentSection } from "../components/payment/PaymentSection";
import { CartSummary } from "../components/cart/CartSummary";
import cartWithDetails from "../utils/cartWithDetail";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getMyOrder } from "../redux/order/orderSlice";
import InvoiceSummary from "../components/payment/InvoiceList";
import InvoiceList from "../components/payment/InvoiceList";

const SHIPPING_FEE = 30000;

export default function PaymentPage() {
  const { products } = useSelector((state) => state.products);
  const dispatch = useDispatch();
  const { cart } = useSelector((state) => state.cart);
  const { myOrder } = useSelector((state) => state.order);
  const cartDetails = cartWithDetails(cart, products);
  const paymentMethod = useSelector((state) => state.payment.paymentMethod);
  const { loading } = useSelector((state) => state.payment);

  const subtotal = cartDetails.reduce(
    (sum, item) => sum + (item.variantPrice || 0) * item.quantity,
    0
  );

  const shippingFee = subtotal > 0 ? SHIPPING_FEE : 0;
  const total = subtotal + shippingFee;

  useEffect(() => {
    dispatch(getMyOrder());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 selection:bg-emerald-100 selection:text-emerald-900 pb-20">
      {" "}
      {/* Main Content */}
      <main className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="lg:flex-row gap-8">
          {/* Left Column - Cart Summary */}
          <motion.div
            initial={{
              opacity: 0,
              x: -20,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.4,
              ease: "easeOut",
            }}
            className="w-full lg:w-full"
          >
            {<InvoiceList invoice={myOrder} />}
          </motion.div>
          {/* Right Column - Payment & Summary
          <motion.div
            initial={{
              opacity: 0,
              x: 20,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.4,
              ease: "easeOut",
              delay: 0.1,
            }}
            className="w-full lg:w-[40%]"
          >
            <PaymentSection
              paymentMethod={paymentMethod}
              subtotal={subtotal}
              shippingFee={subtotal > 0 ? SHIPPING_FEE : 0}
              total={total}
              loading={loading}
              isEmpty={cartDetails.length === 0}
              orderId={cartDetails.itemId}
            />
          </motion.div> */}
        </div>
      </main>
    </div>
  );
}

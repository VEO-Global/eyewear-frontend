import { BrickWallFire, DockIcon, ShoppingBag } from "lucide-react";
import React from "react";
import InvoiceItems from "./InvoiceItems";

export default function InvoiceList({ invoice }) {
  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="w-full flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
          <DockIcon className="w-5 h-5" />
        </div>

        <h2 className="text-lg font-bold text-gray-900 mt-6">
          Danh sách hóa đơn chưa thanh toán
        </h2>

        <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full ml-auto">
          Hóa đơn
        </span>
      </div>

      <div className="flex flex-col">
        <InvoiceItems invoice={invoice} />
      </div>
    </div>
  );
}

import React, { useMemo, useState } from "react";
import { ChevronDown, Info, RotateCcw } from "lucide-react";

export default function FilterBar({ products = [] }) {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const categories = useMemo(
    () => [...new Set(products.map((item) => item.category).filter(Boolean))],
    [products]
  );
  const statuses = useMemo(
    () => [...new Set(products.map((item) => item.status).filter(Boolean))],
    [products]
  );

  function onCategoryChange(category) {
    setSelectedCategory(category);
  }

  function onStatusChange(status) {
    setSelectedStatus(status);
  }

  function onReset() {
    setSelectedCategory("");
    setSelectedStatus("");
  }

  return (
    <div className="mb-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
          </svg>
          <span className="px-2 font-medium text-gray-500">
            Tổng <span className="font-bold text-teal-600">{products.length}</span> sản phẩm
          </span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full cursor-pointer appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 pr-8 text-gray-700 transition-shadow focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500 sm:w-48"
            >
              <option value="">Loại kính</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <ChevronDown />
            </div>
          </div>

          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full cursor-pointer appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 pr-8 text-gray-700 transition-shadow focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500 sm:w-48"
            >
              <option value="">Trạng thái</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>

            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center gap-1 px-2 text-gray-500">
              <Info size={16} />
              <ChevronDown size={16} />
            </div>
          </div>

          <button
            onClick={onReset}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-zinc-900/10 transition-all duration-300 hover:bg-zinc-800 hover:shadow-zinc-900/20"
          >
            <span className="text-white">Làm mới</span>
            <RotateCcw className="text-white" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

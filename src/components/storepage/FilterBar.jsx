import React, { useState } from "react";
import data from "../../mockdata/data.js";
import {
  ChevronDown,
  CircleDot,
  Info,
  MoveDown,
  RotateCcw,
} from "lucide-react";
export default function FilterBar() {
  const categories = [...new Set(data.map((item) => item.category))];
  const statuses = [...new Set(data.map((item) => item.status))];
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

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
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4 ">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
            <span className="px-2 text-gray-500 font-medium">
              Tổng{" "}
              <span className="text-teal-600 font-bold">{data.length}</span> sản
              phẩm
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="w-full sm:w-48 appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2.5 px-4 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent cursor-pointer transition-shadow"
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
                className="w-full sm:w-48 appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2.5 px-4 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent cursor-pointer transition-shadow"
              >
                <option value="">Trạng thái</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <Info />
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>

            <button
              onClick={onReset}
              className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-medium rounded-xl transition-all duration-300 shadow-lg shadow-zinc-900/10 hover:shadow-zinc-900/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="text-white">Làm mới</span>
              <RotateCcw className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

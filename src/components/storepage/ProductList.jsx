import React, { useState, useMemo, useEffect } from "react";
import { ArrowRight, Filter } from "lucide-react";
import { products } from "../../mockdata/data";
import { ProductCard } from "../common/ProductCard";
import { Button } from "../common/Button";
import { NavLink } from "react-router-dom";
import FilterBar from "./FilterBar";

export default function ProductList() {
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  const totalPages = Math.ceil(products.length / itemsPerPage);

  const currentProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return products.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage]);

  // Scroll lên đầu khi đổi trang
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  return (
    <section className="">
      <div className="max-w mx-auto px-4 sm:px-6 lg:px-8">
        {/* Grid */}
        <FilterBar />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {currentProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              className="overflow-hidden hover:shadow-lg transition-shadow bg-card border-border flex flex-col"
            />
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-2 mt-12 flex-wrap">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 disabled:opacity-50 transition"
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, index) => {
            const page = index + 1;
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-xl transition ${
                  currentPage === page
                    ? "bg-teal-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {page}
              </button>
            );
          })}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 disabled:opacity-50 transition"
          >
            Next
          </button>
        </div>

        {/* Mobile CTA */}
        <div className="mt-10 text-center md:hidden">
          <Button variant="outline" fullWidth>
            Xem tất cả sản phẩm
          </Button>
        </div>
      </div>
    </section>
  );
}

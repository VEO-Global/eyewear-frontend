import React, { useState, useMemo, useEffect } from "react";
import { ProductCard } from "../common/ProductCard";
import { Button } from "../common/Button";
import FilterBar from "./FilterBar";
import { useSelector } from "react-redux";

export default function ProductList() {
  const [currentPage, setCurrentPage] = useState(1);

  const { products, loading } = useSelector((state) => state.products);

  const itemsPerPage = 8;

  const totalPages = Math.ceil(products.length / itemsPerPage);

  const currentProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return products.slice(startIndex, startIndex + itemsPerPage);
  }, [products, currentPage]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  return (
    <section>
      <div className="max-w mx-auto px-4 sm:px-6 lg:px-8">
        {/* Filter */}
        <FilterBar />

        {/* ================= LOADING ================= */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[...Array(8)].map((_, index) => (
              <div
                key={index}
                className="bg-white border rounded-xl p-4 animate-pulse"
              >
                <div className="h-40 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        )}

        {/* ================= PRODUCTS ================= */}
        {!loading && products.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {currentProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* ================= PAGINATION ================= */}
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
          </>
        )}

        {/* ================= EMPTY ================= */}
        {!loading && products.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">Không có sản phẩm nào</p>
          </div>
        )}

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

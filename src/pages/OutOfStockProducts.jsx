import { includes } from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import ProductList from "../components/storepage/ProductList";
import FilterBar from "../components/storepage/FilterBar";
import { ProductCard } from "../components/common/ProductCard";

export default function OutOfStockProducts() {
  const { products } = useSelector((state) => state.products);

  const outOfStockProducts = products
    .map((p) => ({
      ...p,
      variants: p.variants.filter((v) => v.stockQuantity === 0),
    }))
    .filter((p) => p.variants.length > 0);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const totalPages = Math.ceil(products.length / itemsPerPage);

  const currentProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return outOfStockProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [outOfStockProducts, currentPage]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  return (
    <section>
      <div className="max-w mx-auto px-4 sm:px-6 lg:px-8">
        {/* Filter */}
        {outOfStockProducts && (
          <h1 className="text-3xl px-4 py-5 text-center font-semibold font-mono">
            Đặt trước các sản phẩm
          </h1>
        )}
        <FilterBar />

        {/* ================= LOADING ================= */}
        {/* {loading && (
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
          )} */}

        {/* ================= PRODUCTS ================= */}
        {/* {!loading && products.length > 0 && (
            
              {outOfStockProducts ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                  {outOfStockProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : ( */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {currentProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {/* )} */}

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
            className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 disabled:opacity-50 transition cursor-pointer"
          >
            Next
          </button>
        </div>

        {/* )} */}
      </div>
    </section>
  );
}

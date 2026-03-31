import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ProductCard } from "../common/ProductCard";
import FilterBar from "./FilterBar";
import { fetchProducts } from "../../redux/products/producSlice";
import { fetchAllCategories } from "../../redux/category/categorySlice";
import { getProductAvailability } from "../../utils/productCatalog";

function getProductCategoryValue(product) {
  if (product?.category && typeof product.category === "object") {
    return String(product.category.id ?? product.category.code ?? "");
  }

  if (product?.categoryId !== undefined && product?.categoryId !== null) {
    return String(product.categoryId);
  }

  if (typeof product?.category === "string") {
    return product.category;
  }

  if (product?.categoryName) {
    return product.categoryName;
  }

  return "";
}

export default function ProductList() {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const { products, loading } = useSelector((state) => state.products);
  const { categories } = useSelector((state) => state.category);

  const itemsPerPage = 8;

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    if (!categories.length) {
      dispatch(fetchAllCategories());
    }
  }, [categories.length, dispatch]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchCategory = selectedCategory
        ? getProductCategoryValue(product) === selectedCategory
        : true;
      const matchStatus = selectedStatus
        ? getProductAvailability(product) === selectedStatus
        : true;

      return matchCategory && matchStatus;
    });
  }, [products, selectedCategory, selectedStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));

  const currentProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedStatus]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  function handleReset() {
    setSelectedCategory("");
    setSelectedStatus("");
    setCurrentPage(1);
    dispatch(fetchProducts());
  }

  return (
    <section>
      <div className="max-w mx-auto px-4 sm:px-6 lg:px-8">
        <FilterBar
          products={products}
          categories={categories}
          totalCount={filteredProducts.length}
          selectedCategory={selectedCategory}
          selectedStatus={selectedStatus}
          onCategoryChange={setSelectedCategory}
          onStatusChange={setSelectedStatus}
          onReset={handleReset}
          refreshing={loading}
        />

        {loading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {[...Array(8)].map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-xl border bg-white p-4"
              >
                <div className="mb-4 h-40 rounded-lg bg-gray-200"></div>
                <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
                <div className="mb-4 h-4 w-1/2 rounded bg-gray-200"></div>
                <div className="h-10 rounded bg-gray-200"></div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredProducts.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
              {currentProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="rounded-xl bg-gray-200 px-4 py-2 transition hover:bg-gray-300 disabled:opacity-50"
              >
                Prev
              </button>

              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;

                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`rounded-xl px-4 py-2 transition ${
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
                className="cursor-pointer rounded-xl bg-gray-200 px-4 py-2 transition hover:bg-gray-300 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center text-gray-500">
            Không tìm thấy sản phẩm phù hợp.
          </div>
        )}
      </div>
    </section>
  );
}

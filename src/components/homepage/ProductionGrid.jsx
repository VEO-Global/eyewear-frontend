import React from "react";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "../common/ProductCard";
import { Button } from "../common/Button";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProductionGrid() {
  const { products } = useSelector((state) => state.products);

  return (
    <section className="py-16 bg-gray-50">
      {" "}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {" "}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          {" "}
          <div>
            {" "}
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {" "}
              Sản phẩm nổi bật{" "}
            </h2>{" "}
            <p className="text-gray-600">
              {" "}
              Những mẫu kính được yêu thích nhất tuần qua{" "}
            </p>{" "}
          </div>{" "}
          <NavLink
            to="/products"
            className="hidden md:flex items-center group text-teal-600 font-medium"
          >
            Xem tất cả
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </NavLink>
        </div>{" "}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {" "}
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              className="overflow-hidden hover:shadow-lg transition-shadow bg-card border-border flex flex-col"
            />
          ))}{" "}
        </div>{" "}
        <div className="mt-10 text-center md:hidden">
          {" "}
          <Button variant="outline" fullWidth>
            {" "}
            Xem tất cả sản phẩm{" "}
          </Button>{" "}
        </div>{" "}
      </div>{" "}
    </section>
  );
}

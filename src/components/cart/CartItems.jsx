"use client";

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Trash2, Plus, Minus, ArrowBigLeft } from "lucide-react";
import { Tooltip } from "antd";
import { NavLink, useNavigate } from "react-router-dom";
import { removeItem, updateQuantity } from "../../redux/cart/cartSlice";
import { toast } from "react-toastify";
import Product3DViewer from "../common/Model3dViewer";

export default function CartItems() {
  const { cart, totalProduct } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  console.log(cart);

  function handleUpdateQuantity(variantId, type) {
    dispatch(
      updateQuantity({
        variantId,
        type,
      })
    );
  }

  function removeProductFromCart(productID) {
    dispatch(removeItem(productID));
    toast.success("Xóa sản phẩm khỏi giỏ hàng thành công");
  }
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-mono font-bold text-foreground">
          Giỏ hàng
        </h2>

        <span className="text-lg font-medium text-muted-foreground">
          {totalProduct} sản phẩm
        </span>
      </div>

      <div className="space-y-6">
        {cart.map((item) => (
          <Tooltip key={item.variantID} title="Xem chi tiết sản phẩm">
            <div
              className="group flex gap-6 rounded-lg bg-card p-6 transition-all hover:shadow-md hover:border-primary/30 cursor-pointer"
              onClick={() => navigate(`/products/${item.productID}`)}
            >
              {/* Product Image */}
              <div className="shrink-0">
                <div className="h-24 w-24 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-xs bg-amber-100">
                  <Product3DViewer modelUrl={item.imgUrl}></Product3DViewer>
                </div>
              </div>

              {/* Product Details */}
              <div className="grow min-w-0">
                <h3 className="text-lg font-semibold text-foreground truncate">
                  {item.name}
                </h3>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Hãng:{" "}
                    <span className="font-medium text-foreground">
                      {item.brand}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Nguyên liệu:{" "}
                    <span className="font-medium text-foreground">
                      {item.material}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Màu sắc:{" "}
                    <span className="font-medium text-foreground">
                      {item.color || "Chưa cập nhật"}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Giới tính:{" "}
                    <span className="font-medium text-foreground">
                      {item.gender === "Male" ? "Nam" : "Nữ"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg bg-muted p-2">
                <Tooltip title="Giảm số lượng">
                  <button
                    className="p-1 rounded hover:bg-background transition-colors border border-border cursor-pointer"
                    aria-label="Decrease quantity"
                    hidden={item.quantity === 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdateQuantity(item.variantID, "-");
                    }}
                  >
                    <Minus className="h-4 w-4 text-muted-foreground" />
                  </button>
                </Tooltip>
                <span className="font-semibold text-foreground w-8 text-center">
                  {item.quantity}
                </span>

                <Tooltip title="Tăng số lượng">
                  <button
                    className="p-1 rounded hover:bg-background transition-colors border border-border cursor-pointer"
                    aria-label="Increase quantity"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdateQuantity(item.variantID, "+");
                    }}
                  >
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  </button>
                </Tooltip>
              </div>

              <div className="flex flex-col items-end justify-between">
                <div className="text-2xl font-bold text-foreground mt-8">
                  {(item.variantPrice * item.quantity).toLocaleString("vi-VN")}đ
                </div>
              </div>

              <div className="flex items-center">
                <Tooltip title="Xóa sản phẩm">
                  <button
                    className="p-2 rounded-lg bg-red-500 cursor-pointer"
                    aria-label="Remove item"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeProductFromCart(item.productID);
                    }}
                  >
                    <Trash2 className="h-5 w-5 text-white" />
                  </button>
                </Tooltip>
              </div>
            </div>
          </Tooltip>
        ))}
      </div>

      <NavLink
        className="rounded-2xl flex items-center gap-2 hover:underline"
        onClick={() => navigate(-1)}
        style={{ marginTop: 20 }}
      >
        <ArrowBigLeft className="w-5 h-5" />
        <span>Quay lại</span>
      </NavLink>
    </div>
  );
}

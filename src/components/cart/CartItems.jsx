"use client";

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Trash2, Plus, Minus, ArrowBigLeft } from "lucide-react";
import { Checkbox, Tooltip } from "antd";
import { NavLink, useNavigate } from "react-router-dom";
import { removeItem, updateQuantity } from "../../redux/cart/cartSlice";
import { toast } from "react-toastify";
import Product3DViewer from "../common/Model3dViewer";

export default function CartItems() {
  const { cart, totalProduct, selectedVariantIds } = useSelector((state) => state.cart);
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
      <div className="mb-8 flex items-center justify-between gap-4">
        <h2 className="text-3xl font-mono font-bold text-foreground">Giỏ hàng</h2>

        <div className="flex items-center gap-4">
          <Tooltip
            title={
              selectableItems.length
                ? "Chọn tất cả sản phẩm có thể thanh toán ngay"
                : "Chưa có sản phẩm nào sẵn sàng để thanh toán"
            }
          >
            <Checkbox
              checked={isAllSelected}
              disabled={!selectableItems.length}
              onChange={() => dispatch(toggleSelectAllItems())}
            >
              Chọn tất cả
            </Checkbox>
          </Tooltip>

          <span className="text-lg font-medium text-muted-foreground">
            {totalProduct} sản phẩm
          </span>
        </div>
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

                <div className="min-w-0 flex-grow">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="truncate text-lg font-semibold text-foreground">{item.name}</h3>
                    {item.isPreorder ? (
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          item.isPreorderReady
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {item.isPreorderReady ? "Hàng đặt trước đã có hàng" : "Hàng đặt trước"}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Hãng: <span className="font-medium text-foreground">{item.brand}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Kích thước:{" "}
                      <span className="font-medium text-foreground">
                        {item.size || "Chưa cập nhật"}
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Nguyên liệu:{" "}
                      <span className="font-medium text-foreground">{item.material}</span>
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
                    {isLockedPreorder ? (
                      <p className="pt-2 text-sm font-medium text-amber-700">
                        Sản phẩm đang chờ nhân viên xác nhận đã có hàng, tạm thời chưa thể chọn để
                        thanh toán.
                      </p>
                    ) : null}
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
            </Tooltip>
          );
        })}
      </div>

      <NavLink
        className="mt-5 flex items-center gap-2 rounded-2xl hover:underline"
        onClick={() => navigate(-1)}
      >
        <ArrowBigLeft className="h-5 w-5" />
        <span>Quay lại</span>
      </NavLink>
    </div>
  );
}

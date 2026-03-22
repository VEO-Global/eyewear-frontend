"use client";

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Trash2, Plus, Minus, ArrowBigLeft } from "lucide-react";
import { Checkbox, Tooltip } from "antd";
import { NavLink, useNavigate } from "react-router-dom";
import {
  removeItem,
  toggleSelectedItem,
  toggleSelectAllItems,
  updateQuantity,
} from "../../redux/cart/cartSlice";

export default function CartItems() {
  const { cart, totalProduct, selectedVariantIds } = useSelector(
    (state) => state.cart,
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const selectableItems = cart.filter(
    (item) => !item.isPreorder || item.isPreorderReady,
  );
  const sortedCart = [...cart].sort((left, right) => {
    const leftLocked = left.isPreorder && !left.isPreorderReady;
    const rightLocked = right.isPreorder && !right.isPreorderReady;

    if (leftLocked === rightLocked) {
      return 0;
    }

    return leftLocked ? 1 : -1;
  });
  const isAllSelected =
    selectableItems.length > 0 &&
    selectedVariantIds.length === selectableItems.length;

  function handleUpdateQuantity(variantId, type) {
    dispatch(
      updateQuantity({
        variantId,
        type,
      }),
    );
  }

  function handleCardSelect(item) {
    if (item.isPreorder && !item.isPreorderReady) {
      return;
    }

    dispatch(toggleSelectedItem(item.variantID));
  }

  return (
    <div className="w-full">
      <div className="mb-8 flex items-center justify-between gap-4">
        <h2 className="text-3xl font-mono font-bold text-foreground">
          Giỏ hàng
        </h2>

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
        {sortedCart.map((item) => {
          const isLockedPreorder = item.isPreorder && !item.isPreorderReady;

          return (
            <div
              key={item.variantID}
              className={`group flex gap-6 rounded-[20px] border bg-white p-6 shadow-[0_10px_28px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.14)] ${
                isLockedPreorder
                  ? "border-amber-200 bg-amber-50/40 hover:shadow-[0_18px_40px_rgba(180,83,9,0.12)]"
                  : "border-slate-200 hover:border-slate-300"
              }`}
              onClick={() => handleCardSelect(item)}
              role="button"
              tabIndex={0}
            >
              <div className="pt-1">
                <Checkbox
                  checked={selectedVariantIds.includes(item.variantID)}
                  disabled={isLockedPreorder}
                  onClick={(event) => event.stopPropagation()}
                  onChange={() => dispatch(toggleSelectedItem(item.variantID))}
                />
              </div>

              <div className="flex-shrink-0">
                {item.imgUrl ? (
                  <img
                    src={item.imgUrl}
                    alt={item.name}
                    className="h-24 w-24 rounded-lg border border-border bg-white object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
                    No Image
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-grow">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      navigate(`/products/${item.productID}`);
                    }}
                    className="truncate text-left text-lg font-semibold text-foreground transition hover:text-teal-700 hover:underline"
                  >
                    {item.name}
                  </button>

                  {item.isPreorder ? (
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        item.isPreorderReady
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {item.isPreorderReady
                        ? "Hàng đặt trước đã có hàng"
                        : "Hàng đặt trước"}
                    </span>
                  ) : null}
                </div>

                <div className="mt-2 space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Hãng:{" "}
                    <span className="font-medium text-foreground">
                      {item.brand}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Kích thước:{" "}
                    <span className="font-medium text-foreground">
                      {item.size || "Chưa cập nhật"}
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
                  {isLockedPreorder ? (
                    <p className="pt-2 text-sm font-medium text-amber-700">
                      Sản phẩm đang chờ nhân viên xác nhận đã có hàng, tạm thời
                      chưa thể chọn để thanh toán.
                    </p>
                  ) : null}
                </div>
              </div>

              <div
                className="flex items-center gap-3 rounded-lg bg-muted p-2"
                onClick={(event) => event.stopPropagation()}
              >
                <Tooltip title="Giảm số lượng">
                  <button
                    className="cursor-pointer rounded border border-border p-1 transition-colors hover:bg-background"
                    aria-label="Decrease quantity"
                    hidden={item.quantity === 1}
                    onClick={() => handleUpdateQuantity(item.variantID, "-")}
                  >
                    <Minus className="h-4 w-4 text-muted-foreground" />
                  </button>
                </Tooltip>

                <span className="w-8 text-center font-semibold text-foreground">
                  {item.quantity}
                </span>

                <Tooltip title="Tăng số lượng">
                  <button
                    className="cursor-pointer rounded border border-border p-1 transition-colors hover:bg-background"
                    aria-label="Increase quantity"
                    onClick={() => handleUpdateQuantity(item.variantID, "+")}
                  >
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  </button>
                </Tooltip>
              </div>

              <div className="flex flex-col items-end justify-between">
                <div className="mt-8 text-2xl font-bold text-foreground">
                  {(item.variantPrice * item.quantity).toLocaleString("vi-VN")}đ
                </div>
              </div>

              <div
                className="flex items-center"
                onClick={(event) => event.stopPropagation()}
              >
                <Tooltip title="Xóa sản phẩm">
                  <button
                    className="cursor-pointer rounded-lg bg-red-500 p-2"
                    aria-label="Remove item"
                    onClick={() => dispatch(removeItem(item.variantID))}
                  >
                    <Trash2 className="h-5 w-5 text-white" />
                  </button>
                </Tooltip>
              </div>
            </div>
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

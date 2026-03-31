"use client";

import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Trash2, Plus, Minus, ArrowBigLeft } from "lucide-react";
import { Checkbox, Tooltip } from "antd";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  getMyCart,
  removeCartItem,
  updateQuantity,
} from "../../redux/cart/cartSlice";
import { toast } from "react-toastify";

export default function CartItems({ cart }) {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  // const selectableItems = cart?.filter(
  //   (item) => !item.isPreorder || item.isPreorderReady
  // );

  const sortedCart = cart?.sort((left, right) => {
    const leftLocked = left.isPreorder && !left.isPreorderReady;
    const rightLocked = right.isPreorder && !right.isPreorderReady;

    if (leftLocked === rightLocked) {
      return 0;
    }

    return leftLocked ? 1 : -1;
  });
  // const isAllSelected =
  //   selectableItems.length > 0 &&
  //   selectedVariantIds.length === selectableItems.length;

  function handleUpdateQuantity(variantId, type) {
    dispatch(
      updateQuantity({
        variantId,
        type,
      })
    );
  }

  async function removeProductFromCart(productID) {
    try {
      await dispatch(removeCartItem(productID)).unwrap();
      toast.success("Xóa sản phẩm khỏi giỏ hàng thành công");
      dispatch(getMyCart());
    } catch (error) {
      toast.error("Xóa thất bại");
    }
  }

  useEffect(() => {
    dispatch(getMyCart());
  }, [dispatch]);
  return (
    <div className="w-full">
      <div className="space-y-6">
        {sortedCart?.map((item) => {
          const isLockedPreorder = item.isPreorder && !item.isPreorderReady;

          return (
            <div
              key={item.productVariantId}
              className={`group flex gap-6 rounded-[20px] border bg-white p-6 shadow-[0_10px_28px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.14)] ${
                isLockedPreorder
                  ? "border-amber-200 bg-amber-50/40 hover:shadow-[0_18px_40px_rgba(180,83,9,0.12)]"
                  : "border-slate-200 hover:border-slate-300"
              }`}
              // onClick={() => handleCardSelect(item)}
              role="button"
              tabIndex={0}
            >
              {/* Product Image */}
              <div className="shrink-0">
                <div className="h-24 w-24 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-xs bg-amber-100">
                  <img src={item.imageUrl}></img>
                </div>
              </div>

              {/* Product Details */}
              <div className="grow min-w-0">
                <h3 className="text-lg font-semibold text-foreground truncate">
                  {item.productName}
                </h3>
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

              {location.pathname === "/user/payment" ? (
                <div className="flex flex-col items-end justify-between">
                  {null}
                  <div className="mt-18 text-2xl font-semibold text-foreground mr-4">
                    {item.quantity} x{" "}
                    {item?.variantPrice?.toLocaleString("vi-VN")}đ
                  </div>
                </div>
              ) : (
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
              )}

              {location.pathname === "/user/payment" ? null : (
                <div className="flex flex-col items-end justify-between">
                  <div className="mt-18 text-2xl font-bold text-foreground">
                    {(item.variantPrice * item.quantity).toLocaleString(
                      "vi-VN"
                    )}
                    đ
                  </div>
                </div>
              )}

              {location.pathname === "/user/payment" ? null : (
                <div
                  className="flex items-center"
                  onClick={(event) => event.stopPropagation()}
                >
                  <Tooltip title="Xóa sản phẩm">
                    <button
                      className="cursor-pointer rounded-lg bg-red-500 p-2"
                      aria-label="Remove item"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeProductFromCart(item.itemId);
                      }}
                    >
                      <Trash2 className="h-5 w-5 text-white" />
                    </button>
                  </Tooltip>
                </div>
              )}
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

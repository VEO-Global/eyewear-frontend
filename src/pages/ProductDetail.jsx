/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { ArrowBigLeft, Heart, ShoppingCart } from "lucide-react";
import { toast } from "react-toastify";
import {
  decreaseVariantStock,
  fetchProductById,
} from "../redux/products/producSlice";
import { addItem } from "../redux/cart/cartSlice";
import { ProductGallery } from "../components/productdetail/ProductGallery";
import { ProductInfo } from "../components/productdetail/ProductInfor";
import { VariantSelector } from "../components/productdetail/VariantSelector";
import { Button } from "../components/common/Button";
import { ArrowBigLeft, Heart, ShoppingCart } from "lucide-react";
import { addItem } from "../redux/cart/cartSlice";
import { toast } from "react-toastify";
import Product3DViewer from "../components/common/Model3dViewer";
export default function ProductDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { selectedProduct, loading } = useSelector((state) => state.products);

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");

  const currentVariant = selectedProduct?.variants?.find(
    (variant) => variant.size === selectedSize
  );

  useEffect(() => {
    dispatch(fetchProductById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (selectedProduct?.variants?.length) {
      setSelectedColor(selectedProduct.variants[0]?.color);
      setSelectedSize(selectedProduct.variants[0]?.size);
    }
  }, [selectedProduct]);

  function handleAddToCart(product) {
    if (!currentVariant || currentVariant.stockQuantity <= 0) {
      toast.warning("Sản phẩm này đã hết hàng");
      return;
    }

    dispatch(
      addItem({
        productID: product.id,
        variantID: currentVariant.id,
        variantPrice: currentVariant.price,
        color: currentVariant.color || selectedColor,
        name: product.name,
        brand: product.brand,
        description: product.description,
        material: product.material,
        imgUrl: product.model3dUrl,
        gender: product.gender,
        quantity: currentVariant.stockQuantity,
      })
    );

    dispatch(
      decreaseVariantStock({
        productId: product.id,
        variantId: currentVariant.id,
      })
    );

    toast.success(`Đã thêm sản phẩm ${product.name} vào giỏ hàng`);
  }

  function handleNavigateToPreoder(product) {
    dispatch(fetchProductById(product.id));
    navigate("/user/preorder");
  }

  function handleSelectProductVariant(size) {
    setSelectedSize(size);
  }

  if (loading || !selectedProduct) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-muted-foreground text-lg">
          Đang tải thông tin sản phẩm...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white selection:bg-gray-900 selection:text-white">
      {" "}
      <main className="max-w-360 mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-12">
        <NavLink
          className="rounded-2xl flex items-center gap-2 bg-white hover:underline"
          onClick={() => navigate(-1)}
          style={{ marginBottom: 20 }}
        >
          <ArrowBigLeft className="w-5 h-5" />
          <span>Quay lại</span>
        </NavLink>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          {/* Left Column - Gallery */}
          <div className="w-full lg:w-5/5 flex flex-col gap-6 bg-amber-100">
            <Product3DViewer modelUrl={selectedProduct.model3dUrl} />
          </div>

          <div className="w-full lg:w-2/5 flex flex-col">
            <div className="sticky top-32">
              <ProductInfo
                brand={selectedProduct.brand}
                name={selectedProduct.name}
                price={currentVariant?.price || selectedProduct.basePrice}
                description={selectedProduct.description}
                material={selectedProduct.material}
                createdAt={selectedProduct.createdAt}
                gender={selectedProduct.gender}
              />

              <VariantSelector
                variants={selectedProduct.variants}
                selectedColor={selectedColor}
                selectedSize={selectedSize}
                onColorChange={setSelectedColor}
                onSizeChange={handleSelectProductVariant}
                selectedProduct={selectedProduct}
                selectedVariant={currentVariant}
              />

              <div className="flex gap-2">
                {currentVariant?.stockQuantity === 0 ? (
                  <Button
                    size="sm"
                    className="flex-1 bg-teal-600 text-white hover:bg-teal-700 gap-2 cursor-pointer"
                    onClick={() => handleNavigateToPreoder(selectedProduct)}
                  >
                    <ShoppingCart className="w-4 h-4 text-white" />
                    <span className="font-medium text-white">Đặt trước</span>
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="flex-1 bg-teal-600 text-white hover:bg-teal-700 gap-2 cursor-pointer"
                    onClick={() => handleAddToCart(selectedProduct)}
                  >
                    <ShoppingCart className="w-4 h-4 text-white" />
                    <span className="font-medium text-white">
                      Thêm sản phẩm vào giỏ hàng
                    </span>
                  </Button>
                )}

                <Button size="sm" variant="danger">
                  <Heart className="w-4 h-4 text-white" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

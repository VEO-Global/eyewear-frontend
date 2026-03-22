import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { ArrowBigLeft, Heart, ShoppingCart } from "lucide-react";
import { appToast } from "../utils/appToast";
import { fetchProductById } from "../redux/products/producSlice";
import { addItem } from "../redux/cart/cartSlice";
import { ProductGallery } from "../components/productdetail/ProductGallery";
import { ProductInfo } from "../components/productdetail/ProductInfor";
import { VariantSelector } from "../components/productdetail/VariantSelector";
import { Button } from "../components/common/Button";
import { getVariantStock, isPreorderProduct } from "../utils/productCatalog";

export default function ProductDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { selectedProduct, loading } = useSelector((state) => state.products);

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const isPreorder = isPreorderProduct(selectedProduct);

  const currentVariant = selectedProduct?.variants?.find(
    (variant) =>
      variant.size === selectedSize &&
      (!selectedColor || variant.color === selectedColor)
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
    if (isPreorder) {
      handleNavigateToPreoder(product);
      return;
    }

    if (!currentVariant || getVariantStock(currentVariant) <= 0) {
      appToast.warning("Sản phẩm này đang tạm hết hàng");
      return;
    }

    dispatch(
      addItem({
        productID: product.id,
        variantID: currentVariant.id,
        variantPrice: currentVariant.price,
        color: currentVariant.color || selectedColor,
        size: currentVariant.size || selectedSize,
        name: product.name,
        brand: product.brand,
        description: product.description,
        material: product.material,
        imgUrl: product.imageUrl || product.image || product.model3dUrl,
        gender: product.gender,
        quantity: getVariantStock(currentVariant),
      })
    );

    appToast.success(`Đã thêm sản phẩm ${product.name} vào giỏ hàng`);
  }

  function handleNavigateToPreoder(product) {
    dispatch(fetchProductById(product.id));
    navigate("/user/preorder", {
      state: { preserveSelection: true },
    });
  }

  function handleSelectProductVariant(size) {
    setSelectedSize(size);
  }

  if (loading || !selectedProduct) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500"></div>
        <p className="text-lg text-muted-foreground">
          Đang tải thông tin sản phẩm...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white selection:bg-gray-900 selection:text-white">
      <main className="mx-auto max-w-[1440px] px-4 py-8 md:px-8 md:py-12 lg:px-12">
        <NavLink
          className="flex items-center gap-2 rounded-2xl bg-white hover:underline"
          onClick={() => navigate(-1)}
          style={{ marginBottom: 20 }}
        >
          <ArrowBigLeft className="h-5 w-5" />
          <span>Quay lại</span>
        </NavLink>

        <div className="flex flex-col gap-12 lg:flex-row lg:gap-20">
          <div className="flex w-full flex-col gap-6 lg:w-3/5">
            <ProductGallery
              images={
                "data:image/jpeg;base64,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"
              }
            />
          </div>

          <div className="flex w-full flex-col lg:w-2/5">
            <div className="sticky top-32">
              <ProductInfo
                brand={selectedProduct.brand}
                name={selectedProduct.name}
                price={currentVariant?.price || selectedProduct.basePrice}
                description={selectedProduct.description}
                material={selectedProduct.material}
                createdAt={selectedProduct.createdAt}
                gender={selectedProduct.gender}
                catalogType={selectedProduct.catalogType}
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
                {isPreorder ? (
                  <Button
                    size="sm"
                    className="flex-1 cursor-pointer gap-2 bg-teal-600 text-white hover:bg-teal-700"
                    onClick={() => handleNavigateToPreoder(selectedProduct)}
                  >
                    <ShoppingCart className="h-4 w-4 text-white" />
                    <span className="font-medium text-white">Đặt trước</span>
                  </Button>
                ) : getVariantStock(currentVariant) > 0 ? (
                  <Button
                    size="sm"
                    className="flex-1 cursor-pointer gap-2 bg-teal-600 text-white hover:bg-teal-700"
                    onClick={() => handleAddToCart(selectedProduct)}
                  >
                    <ShoppingCart className="h-4 w-4 text-white" />
                    <span className="font-medium text-white">
                      Thêm sản phẩm vào giỏ hàng
                    </span>
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="flex-1 cursor-not-allowed gap-2 bg-gray-300 text-white"
                    disabled
                  >
                    <ShoppingCart className="h-4 w-4 text-white" />
                    <span className="font-medium text-white">Hết hàng</span>
                  </Button>
                )}

                <Button size="sm" variant="danger">
                  <Heart className="h-4 w-4 text-white" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

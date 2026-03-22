import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { ArrowBigLeft, Heart, ShoppingCart } from "lucide-react";
import { appToast } from "../utils/appToast";
import { fetchProductById } from "../redux/products/producSlice";
import { addItem } from "../redux/cart/cartSlice";
import { toggleFavorite } from "../redux/favorites/favoriteSlice";
import { ProductGallery } from "../components/productdetail/ProductGallery";
import { ProductInfo } from "../components/productdetail/ProductInfor";
import { VariantSelector } from "../components/productdetail/VariantSelector";
import { Button } from "../components/common/Button";
import { getVariantStock, isPreorderProduct } from "../utils/productCatalog";
import { extractProductImages, getPrimaryProductImage } from "../utils/productImages";

export default function ProductDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { selectedProduct, loading } = useSelector((state) => state.products);
  const user = useSelector((state) => state.auth.user);
  const favoriteItems = useSelector((state) => state.favorites.items);

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const isPreorder = isPreorderProduct(selectedProduct);
  const isFavorite = favoriteItems.some(
    (item) => Number(item.id) === Number(selectedProduct?.id)
  );
  const productImages = extractProductImages(selectedProduct).map((image) => image.url);

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

  useEffect(() => {
    setSelectedImage(getPrimaryProductImage(selectedProduct));
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

  async function handleToggleFavorite() {
    if (!selectedProduct) {
      return;
    }

    if (!user?.id) {
      appToast.warning("Vui lòng đăng nhập để lưu sản phẩm yêu thích.");
      return;
    }

    const result = await dispatch(toggleFavorite(selectedProduct));

    if (toggleFavorite.fulfilled.match(result)) {
      appToast.success(
        isFavorite
          ? "Đã xóa sản phẩm khỏi danh sách yêu thích."
          : "Đã lưu sản phẩm vào danh sách yêu thích."
      );
      return;
    }

    appToast.error(result.payload || "Không thể cập nhật danh sách yêu thích.");
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
              images={productImages}
              selectedImage={selectedImage}
              onImageSelect={setSelectedImage}
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

                <Button
                  size="sm"
                  type="button"
                  variant={isFavorite ? "danger" : "outline"}
                  className={
                    isFavorite
                      ? "border-red-500 bg-red-500 text-white hover:bg-red-600"
                      : "border-slate-300 text-slate-600 hover:bg-rose-50 hover:text-rose-600"
                  }
                  onClick={handleToggleFavorite}
                >
                  <Heart
                    className="h-4 w-4"
                    fill={isFavorite ? "currentColor" : "none"}
                  />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

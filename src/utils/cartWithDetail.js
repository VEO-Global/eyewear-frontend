export default function cartWithDetails(cart, products) {
  return cart?.map((item) => {
    const product = products.find((p) => p.variants.some((v) => v.id === item.productVariantId));

    const variant = product?.variants.find((v) => v.id === item.productVariantId);

    if (!variant) {
      return item;
    }

    return {
      ...item,
      brand: product?.brand || "Unknown",
      size: item.size || "Unknown",
      categoryId: product?.categoryId || null,
      material: product?.material || "Unknown",
      variantPrice: variant?.price || 0,
      isPreorder: product?.isPreorder || false,
      isPreorderReady: product?.isPreorderReady || false,
      imageUrl: product.imageUrl,
    };
  });
}

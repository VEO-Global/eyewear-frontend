const PRODUCT_PLACEHOLDER_IMAGE = "/placeholder.jpg";

function normalizeImageItem(image, index = 0) {
  if (!image) {
    return null;
  }

  if (typeof image === "string") {
    const trimmedImage = image.trim();

    if (!trimmedImage) {
      return null;
    }

    return {
      id: `image-${index}`,
      url: trimmedImage,
      alt: "",
      isPrimary: index === 0,
      sortOrder: index,
    };
  }

  if (typeof image !== "object") {
    return null;
  }

  const url = String(
    image.url ??
      image.imageUrl ??
      image.image ??
      image.src ??
      image.path ??
      ""
  ).trim();

  if (!url) {
    return null;
  }

  return {
    id: image.id ?? `image-${index}`,
    url,
    alt: image.alt ?? image.name ?? image.label ?? "",
    isPrimary: Boolean(image.isPrimary ?? image.primary ?? index === 0),
    sortOrder: Number(image.sortOrder ?? image.orderIndex ?? image.position ?? index),
  };
}

export function extractProductImages(product) {
  if (!product || typeof product !== "object") {
    return [];
  }

  const rawImages = [
    ...(Array.isArray(product.images) ? product.images : []),
    ...(Array.isArray(product.imageUrls) ? product.imageUrls : []),
    ...(Array.isArray(product.productImages) ? product.productImages : []),
  ];

  if (!rawImages.length) {
    const fallbackImage = normalizeImageItem(
      product.imageUrl || product.image || product.thumbnailUrl || product.model3dUrl
    );

    return fallbackImage ? [fallbackImage] : [];
  }

  return rawImages
    .map((image, index) => normalizeImageItem(image, index))
    .filter(Boolean)
    .sort((firstImage, secondImage) => {
      if (firstImage.isPrimary && !secondImage.isPrimary) {
        return -1;
      }

      if (!firstImage.isPrimary && secondImage.isPrimary) {
        return 1;
      }

      return firstImage.sortOrder - secondImage.sortOrder;
    });
}

export function getPrimaryProductImage(product) {
  const productImages = extractProductImages(product);

  return (
    productImages[0]?.url ||
    product?.imageUrl ||
    product?.image ||
    product?.thumbnailUrl ||
    PRODUCT_PLACEHOLDER_IMAGE
  );
}

export { PRODUCT_PLACEHOLDER_IMAGE };

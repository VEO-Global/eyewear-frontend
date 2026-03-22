/**
 * @typedef {"OLD" | "NEW"} ProductCatalogType
 */

function hasTruthyPreorderFlag(product) {
  return [
    product?.isPreorder,
    product?.preorder,
    product?.preOrder,
    product?.allowPreorder,
    product?.availableForPreorder,
  ].some(Boolean);
}

function getNormalizedStatus(product) {
  return String(
    product?.status ??
      product?.productStatus ??
      product?.state ??
      product?.availability ??
      ""
  )
    .trim()
    .toLowerCase();
}

export function normalizeCatalogType(catalogType) {
  if (typeof catalogType === "string") {
    const normalizedCatalogType = catalogType.trim().toUpperCase();

    if (["NEW", "PREORDER", "PRE_ORDER"].includes(normalizedCatalogType)) {
      return "NEW";
    }
  }

  return "OLD";
}

export function isPreorderProduct(product) {
  if (!product || typeof product !== "object") {
    return false;
  }

  if (normalizeCatalogType(product.catalogType) === "NEW") {
    return true;
  }

  if (hasTruthyPreorderFlag(product)) {
    return true;
  }

  return ["preorder", "pre_order", "coming_soon", "comingsoon"].includes(
    getNormalizedStatus(product)
  );
}

export function getVariantStock(variant) {
  return Number(variant?.stockQuantity ?? variant?.quantity ?? 0);
}

export function getProductStocks(product) {
  if (!Array.isArray(product?.variants)) {
    return [];
  }

  return product.variants
    .map((variant) => getVariantStock(variant))
    .filter((stock) => Number.isFinite(stock));
}

export function getProductAvailability(product) {
  if (isPreorderProduct(product)) {
    return "preorder";
  }

  const variantStocks = getProductStocks(product);
  if (variantStocks.length) {
    return variantStocks.some((stock) => stock > 0) ? "in_stock" : "out_of_stock";
  }

  const directStock = Number(
    product?.stockQuantity ?? product?.quantity ?? product?.stock ?? NaN
  );
  if (Number.isFinite(directStock)) {
    return directStock > 0 ? "in_stock" : "out_of_stock";
  }

  const fallbackStatus = getNormalizedStatus(product);

  if (["available", "in_stock", "instock", "active"].includes(fallbackStatus)) {
    return "in_stock";
  }

  if (["out_of_stock", "outofstock", "sold_out", "inactive"].includes(fallbackStatus)) {
    return "out_of_stock";
  }

  return "out_of_stock";
}

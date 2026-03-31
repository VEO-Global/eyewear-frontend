import dayjs from "dayjs";
import api, { publicApi } from "../configs/config-axios";

function extractNestedPayload(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  if (payload.data && typeof payload.data === "object") {
    return extractNestedPayload(payload.data);
  }

  if (payload.result && typeof payload.result === "object") {
    return extractNestedPayload(payload.result);
  }

  return payload;
}

export function extractErrorMessage(error, fallbackMessage = "Đã xảy ra lỗi") {
  const responseData = error?.response?.data;

  if (typeof responseData === "string" && responseData.trim()) {
    return responseData;
  }

  if (typeof responseData?.message === "string" && responseData.message.trim()) {
    return responseData.message;
  }

  if (typeof responseData?.error === "string" && responseData.error.trim()) {
    return responseData.error;
  }

  if (Array.isArray(responseData?.errors) && responseData.errors.length > 0) {
    const firstError = responseData.errors[0];

    if (typeof firstError === "string" && firstError.trim()) {
      return firstError;
    }

    if (typeof firstError?.message === "string" && firstError.message.trim()) {
      return firstError.message;
    }
  }

  return fallbackMessage;
}

export function normalizeBoolean(value) {
  if (typeof value === "boolean") {
    return value;
  }

  if ([1, "1", "true", "TRUE", "active", "ACTIVE"].includes(value)) {
    return true;
  }

  if ([0, "0", "false", "FALSE", "inactive", "INACTIVE"].includes(value)) {
    return false;
  }

  return Boolean(value);
}

function normalizeNumber(value, fallback = 0) {
  const nextValue = Number(value);
  return Number.isFinite(nextValue) ? nextValue : fallback;
}

function normalizeOptionalNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  const nextValue = Number(value);
  return Number.isFinite(nextValue) ? nextValue : undefined;
}

function normalizeDateValue(value, fallback = "") {
  if (!value) {
    return fallback;
  }

  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("YYYY-MM-DD") : fallback;
}

export function normalizePagedResponse(payload) {
  const normalizedPayload = extractNestedPayload(payload);

  if (Array.isArray(normalizedPayload)) {
    return {
      items: normalizedPayload,
      page: 1,
      size: normalizedPayload.length || 10,
      total: normalizedPayload.length,
      totalPages: 1,
    };
  }

  const items =
    normalizedPayload?.content ||
    normalizedPayload?.items ||
    normalizedPayload?.records ||
    normalizedPayload?.rows ||
    normalizedPayload?.list ||
    normalizedPayload?.result ||
    [];

  const total =
    normalizedPayload?.totalElements ??
    normalizedPayload?.total ??
    normalizedPayload?.count ??
    normalizedPayload?.totalItems ??
    (Array.isArray(items) ? items.length : 0);

  const rawPage =
    normalizedPayload?.number ??
    normalizedPayload?.page ??
    normalizedPayload?.pageNumber ??
    normalizedPayload?.current ??
    0;

  const size =
    normalizedPayload?.size ??
    normalizedPayload?.pageSize ??
    normalizedPayload?.limit ??
    (Array.isArray(items) ? items.length || 10 : 10);

  const totalPages =
    normalizedPayload?.totalPages ??
    normalizedPayload?.pages ??
    Math.max(1, Math.ceil(normalizeNumber(total, 0) / Math.max(normalizeNumber(size, 10), 1)));

  return {
    items: Array.isArray(items) ? items : [],
    page: normalizeNumber(rawPage, 0) + (normalizedPayload?.number !== undefined ? 1 : 0),
    size: normalizeNumber(size, 10),
    total: normalizeNumber(total, 0),
    totalPages: normalizeNumber(totalPages, 1),
  };
}

function unwrapEntity(payload) {
  const normalizedPayload = extractNestedPayload(payload);

  if (normalizedPayload && typeof normalizedPayload === "object" && !Array.isArray(normalizedPayload)) {
    if (normalizedPayload.item && typeof normalizedPayload.item === "object") {
      return normalizedPayload.item;
    }

    if (
      normalizedPayload.content &&
      typeof normalizedPayload.content === "object" &&
      !Array.isArray(normalizedPayload.content)
    ) {
      return normalizedPayload.content;
    }
  }

  return normalizedPayload;
}

function cleanPayload(payload) {
  if (!payload || typeof payload !== "object") {
    return payload;
  }

  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  );
}

function buildProductPayload(payload) {
  const normalizedImages = Array.isArray(payload?.imageUrls)
    ? payload.imageUrls.map((item) => String(item || "").trim()).filter(Boolean)
    : undefined;

  return cleanPayload({
    name: payload?.name?.trim?.() || payload?.name,
    brand: payload?.brand?.trim?.() || undefined,
    description: payload?.description?.trim?.() || payload?.description,
    material: payload?.material?.trim?.() || undefined,
    gender: payload?.gender?.trim?.() || undefined,
    model3dUrl: payload?.model3dUrl?.trim?.() || undefined,
    categoryId: normalizeOptionalNumber(payload?.categoryId),
    status: payload?.status?.trim?.()?.toUpperCase?.() || undefined,
    catalogType: payload?.catalogType?.trim?.()?.toUpperCase?.() || undefined,
    basePrice: normalizeNumber(payload?.price ?? payload?.basePrice ?? payload?.sellingPrice, 0),
    imageUrl:
      payload?.imageUrl?.trim?.() ||
      normalizedImages?.[0] ||
      payload?.thumbnailUrl ||
      undefined,
    active: payload?.active ?? payload?.isActive,
    isActive: payload?.isActive ?? payload?.active,
  });
}

function normalizePolicy(payload, fallbackType) {
  const item = unwrapEntity(payload);
  const content =
    item?.content ??
    item?.policyContent ??
    item?.htmlContent ??
    item?.description ??
    (typeof item === "string" ? item : "");

  return {
    raw: item,
    type: item?.type ?? fallbackType,
    title: item?.title ?? fallbackType,
    content,
  };
}

function normalizeVariant(item) {
  return {
    ...item,
    id: item?.id ?? item?.variantId ?? item?.variantID,
    color: item?.color ?? "",
    size: item?.size ?? "",
    sku: item?.sku ?? item?.code ?? "",
    price: normalizeNumber(item?.price ?? item?.variantPrice, 0),
    stockQuantity: normalizeNumber(item?.stockQuantity ?? item?.quantity ?? item?.stock, 0),
    active: normalizeBoolean(item?.active ?? item?.isActive ?? item?.is_active ?? true),
  };
}

function normalizeProduct(item) {
  return {
    ...item,
    id: item?.id ?? item?.productId ?? item?.productID,
    name: item?.name ?? item?.productName ?? "",
    brand: item?.brand ?? "",
    description: item?.description ?? "",
    material: item?.material ?? "",
    gender: item?.gender ?? "",
    model3dUrl: item?.model3dUrl ?? item?.modelUrl ?? "",
    categoryId: item?.categoryId ?? item?.category?.id ?? "",
    categoryName: item?.categoryName ?? item?.category?.name ?? "",
    status: item?.status ?? "",
    catalogType: item?.catalogType ?? "",
    active: normalizeBoolean(item?.active ?? item?.isActive ?? item?.is_active ?? true),
    isActive: normalizeBoolean(item?.isActive ?? item?.active ?? item?.is_active ?? true),
    price: normalizeNumber(item?.price ?? item?.basePrice ?? item?.sellingPrice, 0),
    basePrice: normalizeNumber(item?.basePrice ?? item?.price ?? item?.sellingPrice, 0),
    imageUrl: item?.imageUrl ?? item?.thumbnailUrl ?? "",
    imageUrls: Array.isArray(item?.imageUrls)
      ? item.imageUrls.filter(Boolean)
      : Array.isArray(item?.images)
        ? item.images
            .map((image) => image?.url ?? image?.imageUrl ?? image?.src)
            .filter(Boolean)
        : item?.imageUrl
          ? [item.imageUrl]
          : [],
  };
}

function sortProductsByActiveStatus(items) {
  return [...items].sort((firstProduct, secondProduct) => {
    const firstActive = normalizeBoolean(firstProduct?.active ?? firstProduct?.isActive ?? true);
    const secondActive = normalizeBoolean(secondProduct?.active ?? secondProduct?.isActive ?? true);

    if (firstActive === secondActive) {
      return 0;
    }

    return firstActive ? -1 : 1;
  });
}

function normalizeSimpleCatalogItem(item) {
  return {
    ...item,
    id: item?.id,
    name: item?.name ?? "",
    description: item?.description ?? "",
    type: item?.type ?? "",
    code: item?.code ?? "",
    price: normalizeNumber(item?.price, 0),
    active: normalizeBoolean(item?.active ?? item?.isActive ?? item?.is_active ?? true),
    discountType: item?.discountType ?? item?.type ?? "",
    discountValue: normalizeNumber(item?.discountValue ?? item?.value, 0),
    startDate: normalizeDateValue(item?.startDate ?? item?.startAt),
    endDate: normalizeDateValue(item?.endDate ?? item?.endAt),
  };
}

function normalizeUser(item) {
  return {
    ...item,
    id: item?.id ?? item?.userId ?? item?.staffId,
    fullName: item?.fullName ?? item?.full_name ?? item?.name ?? "",
    email: item?.email ?? "",
    phone: item?.phone ?? item?.phoneNumber ?? item?.phone_number ?? "",
    role: item?.role ?? "",
    active: normalizeBoolean(item?.active ?? item?.isActive ?? item?.is_active ?? true),
  };
}

function normalizeRevenueSummary(payload) {
  const item = unwrapEntity(payload) || {};

  return {
    totalRevenue: normalizeNumber(item?.totalRevenue ?? item?.revenue ?? item?.totalAmount, 0),
    totalOrders: normalizeNumber(item?.totalOrders ?? item?.orders ?? item?.orderCount, 0),
    averageOrderValue: normalizeNumber(item?.averageOrderValue ?? item?.avgOrderValue, 0),
    successfulPayments: normalizeNumber(item?.successfulPayments ?? item?.paidOrders, 0),
  };
}

function normalizeChartPoint(item, fallbackIndex) {
  const label =
    item?.label ??
    item?.date ??
    item?.day ??
    item?.monthName ??
    item?.month ??
    String(fallbackIndex + 1);

  return {
    label: String(label),
    revenue: normalizeNumber(item?.revenue ?? item?.totalRevenue ?? item?.amount, 0),
    orders: normalizeNumber(item?.orders ?? item?.totalOrders ?? item?.count, 0),
  };
}

function normalizePayment(item) {
  return {
    ...item,
    id: item?.id ?? item?.paymentId,
    paymentCode: item?.paymentCode ?? item?.code ?? "",
    orderCode: item?.orderCode ?? item?.orderId ?? "",
    customerName: item?.customerName ?? item?.fullName ?? item?.customer?.fullName ?? "",
    method: item?.method ?? item?.paymentMethod ?? "",
    status: item?.status ?? "",
    amount: normalizeNumber(item?.amount ?? item?.totalAmount, 0),
    createdAt: item?.createdAt ?? item?.paymentDate ?? "",
  };
}

export const managerApi = {
  async fetchPolicyTypes() {
    const response = await api.get("/manager/policies");
    const payload = extractNestedPayload(response.data);

    if (Array.isArray(payload)) {
      return payload.map((item) => (typeof item === "string" ? item : item?.type)).filter(Boolean);
    }

    const types = payload?.types || payload?.policyTypes || payload?.content;

    if (Array.isArray(types)) {
      return types.map((item) => (typeof item === "string" ? item : item?.type)).filter(Boolean);
    }

    return [];
  },

  async fetchPolicy(type) {
    const response = await api.get(`/manager/policies/${type}`);
    return normalizePolicy(response.data, type);
  },

  async fetchManagerPolicy(type) {
    const response = await api.get(`/manager/policies/${type}`);
    return normalizePolicy(response.data, type);
  },

  async fetchPublicPolicy(type) {
    const response = await publicApi.get(`/public/policies/${type}`);
    return normalizePolicy(response.data, type);
  },

  async updatePolicy(type, payload) {
    const currentRecord = payload?.currentRecord;
    const title = payload?.title?.trim?.() || payload?.title || type;
    const content = payload?.content ?? "";

    const requestBody =
      currentRecord?.raw && typeof currentRecord.raw === "object"
        ? {
            ...currentRecord.raw,
            type,
            title,
            content,
            htmlContent: content,
            policyContent: content,
          }
        : { type, title, content };

    const response = await api.put(`/manager/policies/${type}`, cleanPayload(requestBody));
    return normalizePolicy(response.data, type);
  },

  async fetchProducts(params) {
    const response = await api.get("/products/management", { params });
    const paged = normalizePagedResponse(response.data);
    return { ...paged, items: sortProductsByActiveStatus(paged.items.map(normalizeProduct)) };
  },

  async fetchProductDetail(id) {
    const response = await api.get(`/products/${id}`);
    return normalizeProduct(unwrapEntity(response.data));
  },

  async fetchCategories() {
    const response = await api.get("/categories");
    const payload = extractNestedPayload(response.data);
    const items = Array.isArray(payload) ? payload : normalizePagedResponse(payload).items;

    return items.map((item) => ({
      ...item,
      id: item?.id ?? item?.categoryId,
      name: item?.name ?? item?.categoryName ?? item?.title ?? "",
    }));
  },

  async createProduct(payload) {
    const response = await api.post("/products", buildProductPayload(payload));
    return normalizeProduct(unwrapEntity(response.data));
  },

  async updateProduct(id, payload) {
    const response = await api.put(`/products/${id}`, buildProductPayload(payload));
    return normalizeProduct(unwrapEntity(response.data));
  },

  async deleteProduct(id) {
    await api.delete(`/products/${id}`);
  },

  async fetchVariants(productId, active) {
    const response = await api.get("/variants", { params: cleanPayload({ productId, active }) });
    const payload = extractNestedPayload(response.data);
    const items = Array.isArray(payload) ? payload : normalizePagedResponse(payload).items;
    return items.map(normalizeVariant);
  },

  async fetchProductVariants(productId) {
    const response = await api.get(`/variants/product/${productId}`);
    const payload = extractNestedPayload(response.data);
    const items = Array.isArray(payload) ? payload : normalizePagedResponse(payload).items;
    return items.map(normalizeVariant);
  },

  async createVariant(payload) {
    const response = await api.post("/variants", cleanPayload(payload));
    return normalizeVariant(unwrapEntity(response.data));
  },

  async createVariantsBulk(payload) {
    const response = await api.post("/variants/bulk", payload);
    const items = extractNestedPayload(response.data);
    return Array.isArray(items) ? items.map(normalizeVariant) : [];
  },

  async updateVariant(id, payload) {
    const response = await api.put(`/variants/${id}`, cleanPayload(payload));
    return normalizeVariant(unwrapEntity(response.data));
  },

  async deleteVariant(id) {
    await api.delete(`/variants/${id}`);
  },

  async bulkUpdateVariantStock(payload) {
    await api.patch("/variants/bulk-stock", payload);
  },

  async fetchLensProducts() {
    const response = await api.get("/lens-products");
    const payload = extractNestedPayload(response.data);
    return (Array.isArray(payload) ? payload : []).map(normalizeSimpleCatalogItem);
  },

  async createLensProduct(payload) {
    const response = await api.post("/lens-products", cleanPayload(payload));
    return normalizeSimpleCatalogItem(unwrapEntity(response.data));
  },

  async updateLensProduct(id, payload) {
    const response = await api.put(`/lens-products/${id}`, cleanPayload(payload));
    return normalizeSimpleCatalogItem(unwrapEntity(response.data));
  },

  async deleteLensProduct(id) {
    await api.delete(`/lens-products/${id}`);
  },

  async fetchPromotions() {
    const response = await api.get("/promotions");
    const payload = extractNestedPayload(response.data);
    return (Array.isArray(payload) ? payload : []).map(normalizeSimpleCatalogItem);
  },

  async createPromotion(payload) {
    const response = await api.post("/promotions", cleanPayload(payload));
    return normalizeSimpleCatalogItem(unwrapEntity(response.data));
  },

  async updatePromotion(id, payload) {
    const response = await api.put(`/promotions/${id}`, cleanPayload(payload));
    return normalizeSimpleCatalogItem(unwrapEntity(response.data));
  },

  async deletePromotion(id) {
    await api.delete(`/promotions/${id}`);
  },

  async validatePromotionCode(code) {
    const response = await api.post("/promotions/validate-code", { code });
    return unwrapEntity(response.data);
  },

  async fetchStaffUsers(params) {
    const response = await api.get("/manager/users/staff", { params });
    const paged = normalizePagedResponse(response.data);
    return { ...paged, items: paged.items.map(normalizeUser) };
  },

  async fetchStaffUserDetail(id) {
    const response = await api.get(`/manager/users/staff/${id}`);
    return normalizeUser(unwrapEntity(response.data));
  },

  async createStaffUser(payload) {
    const response = await api.post("/manager/users/staff", cleanPayload(payload));
    return normalizeUser(unwrapEntity(response.data));
  },

  async updateStaffUser(id, payload) {
    const response = await api.put(`/manager/users/staff/${id}`, cleanPayload(payload));
    return normalizeUser(unwrapEntity(response.data));
  },

  async updateStaffStatus(id, active) {
    await api.patch(`/manager/users/staff/${id}/status`, cleanPayload({ active }));
  },

  async fetchRoles() {
    const response = await api.get("/manager/users/roles");
    const payload = extractNestedPayload(response.data);
    return (Array.isArray(payload) ? payload : []).map((item) =>
      typeof item === "string" ? item : item?.name || item?.role || item?.value
    );
  },

  async fetchRevenueSummary(params) {
    const response = await api.get("/manager/revenue/summary", { params });
    return normalizeRevenueSummary(response.data);
  },

  async fetchDailyRevenue(params) {
    const response = await api.get("/manager/revenue/daily", { params });
    const payload = extractNestedPayload(response.data);
    const items = Array.isArray(payload) ? payload : normalizePagedResponse(payload).items;
    return items.map(normalizeChartPoint);
  },

  async fetchMonthlyRevenue(params) {
    const response = await api.get("/manager/revenue/monthly", { params });
    const payload = extractNestedPayload(response.data);
    const items = Array.isArray(payload) ? payload : normalizePagedResponse(payload).items;
    return items.map(normalizeChartPoint);
  },

  async fetchPayments(params) {
    const response = await api.get("/payments/all", { params });
    const paged = normalizePagedResponse(response.data);
    return { ...paged, items: paged.items.map(normalizePayment) };
  },
};

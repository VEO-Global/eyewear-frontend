function toNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function normalizeAddressRecord(address) {
  if (!address || typeof address !== "object") {
    return null;
  }

  const provinceCode = toNumber(
    address.provinceCode ?? address.province_code ?? address.province?.code
  );
  const districtCode = toNumber(
    address.districtCode ?? address.district_code ?? address.district?.code
  );
  const wardCode = toNumber(
    address.wardCode ?? address.ward_code ?? address.ward?.code
  );

  return {
    provinceCode,
    provinceName:
      address.provinceName ??
      address.province_name ??
      address.province?.name ??
      address.province ??
      "",
    districtCode,
    districtName:
      address.districtName ??
      address.district_name ??
      address.district?.name ??
      address.district ??
      "",
    wardCode,
    wardName:
      address.wardName ??
      address.ward_name ??
      address.ward?.name ??
      address.ward ??
      "",
    addressDetail:
      address.addressDetail ??
      address.address_detail ??
      address.detailAddress ??
      address.detail_address ??
      address.shippingAddress ??
      address.street ??
      "",
    isLatest: Boolean(address.isLatest || address.isDefault || address.defaultAddress),
    updatedAt:
      address.updatedAt ??
      address.updated_at ??
      address.lastUsedAt ??
      address.createdAt,
  };
}

export function extractLatestCheckoutAddress(user) {
  if (!user || typeof user !== "object") {
    return null;
  }

  const candidateCollections = [
    user.userAddresses,
    user.userAddress,
    user.addresses,
    user.shippingAddresses,
  ];

  for (const collection of candidateCollections) {
    if (!Array.isArray(collection) || !collection.length) {
      continue;
    }

    const normalizedList = collection
      .map(normalizeAddressRecord)
      .filter(Boolean)
      .sort((left, right) => {
        if (left.isLatest !== right.isLatest) {
          return left.isLatest ? -1 : 1;
        }

        const leftTime = new Date(left.updatedAt || 0).getTime();
        const rightTime = new Date(right.updatedAt || 0).getTime();
        return rightTime - leftTime;
      });

    if (normalizedList.length) {
      return normalizedList[0];
    }
  }

  const flatProfileAddress = normalizeAddressRecord({
    provinceCode: user.provinceCode,
    province: user.province,
    districtCode: user.districtCode,
    district: user.district,
    wardCode: user.wardCode,
    ward: user.ward,
    addressDetail: user.addressDetail,
  });

  if (
    flatProfileAddress &&
    (flatProfileAddress.addressDetail ||
      flatProfileAddress.provinceName ||
      flatProfileAddress.districtName ||
      flatProfileAddress.wardName)
  ) {
    return flatProfileAddress;
  }

  const singleCandidates = [
    user.latestShippingAddress,
    user.lastUsedAddress,
    user.defaultAddress,
  ];

  for (const candidate of singleCandidates) {
    const normalized = normalizeAddressRecord(candidate);
    if (normalized) {
      return normalized;
    }
  }

  return null;
}

export function hasCheckoutAddress(address) {
  if (!address || typeof address !== "object") {
    return false;
  }

  return Boolean(
    typeof address.provinceCode === "number" ||
      typeof address.districtCode === "number" ||
      typeof address.wardCode === "number" ||
      address.provinceName?.trim() ||
      address.districtName?.trim() ||
      address.wardName?.trim() ||
      address.addressDetail?.trim()
  );
}

export function formatCheckoutAddress(address) {
  if (!address || typeof address !== "object") {
    return "";
  }

  return [
    address.addressDetail?.trim(),
    address.wardName?.trim(),
    address.districtName?.trim(),
    address.provinceName?.trim(),
  ]
    .filter(Boolean)
    .join(", ");
}

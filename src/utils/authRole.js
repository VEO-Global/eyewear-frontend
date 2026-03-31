export function normalizeRoleName(role) {
  if (typeof role !== "string") {
    return "";
  }

  const normalized = role.trim().replace(/[\s-]+/g, "_").toUpperCase();

  if (normalized === "OPERATION") {
    return "OPERATIONS";
  }

  return normalized;
}

export function isCustomerFacingRole(role) {
  return normalizeRoleName(role) === "CUSTOMER";
}

export function isStaffRole(role) {
  return normalizeRoleName(role) === "SALES";
}

export function isManagerRole(role) {
  return normalizeRoleName(role) === "MANAGER";
}

export function isOperationsRole(role) {
  return normalizeRoleName(role) === "OPERATIONS";
}

export function isWorkspaceRole(role) {
  return isStaffRole(role) || isManagerRole(role) || isOperationsRole(role);
}

export function getRoleDisplayLabel(role) {
  const normalizedRole = normalizeRoleName(role);

  if (normalizedRole === "ADMIN") {
    return "Quản trị viên";
  }

  if (normalizedRole === "SALES") {
    return "Nhân viên kinh doanh";
  }

  if (normalizedRole === "MANAGER") {
    return "Quản lý";
  }

  if (normalizedRole === "OPERATIONS") {
    return "Nhân viên vận hành";
  }

  if (normalizedRole === "CUSTOMER") {
    return "Khách hàng";
  }

  return role || "Người dùng";
}

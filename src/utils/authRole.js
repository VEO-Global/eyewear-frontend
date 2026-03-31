export function isCustomerFacingRole(role) {
  return role === "CUSTOMER" || role === "SALES";
}

export function isStaffRole(role) {
  return role === "SALES";
}

export function isManagerRole(role) {
  return role === "MANAGER";
}

export function isWorkspaceRole(role) {
  return isStaffRole(role) || isManagerRole(role);
}

export function getRoleDisplayLabel(role) {
  if (role === "ADMIN") {
    return "Quản trị viên";
  }

  if (role === "SALES") {
    return "Nhân viên kinh doanh";
  }

  if (role === "MANAGER") {
    return "Quản lý";
  }

  if (role === "CUSTOMER") {
    return "Khách hàng";
  }

  return role || "Người dùng";
}

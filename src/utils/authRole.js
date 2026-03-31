export function isCustomerFacingRole(role) {
  return role === "CUSTOMER" || role === "SALES";
}

export function isStaffRole(role) {
  return role === "SALES";
}

export function getRoleDisplayLabel(role) {
  if (role === "ADMIN") {
    return "Quản trị viên";
  }

  if (role === "SALES") {
    return "Nhân viên kinh doanh";
  }

  if (role === "CUSTOMER") {
    return "Khách hàng";
  }
  if (role === "OPERATIONS") {
    return "Nhân viên vận hành";
  }

  return role || "Người dùng";
}

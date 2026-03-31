import { ORDER_PHASE } from "./orderHistory";

export const STAFF_HIDDEN_INTAKE_ORDER_IDS_KEY = "staff-hidden-intake-order-ids";

export function readHiddenIntakeOrderIds() {
  try {
    const raw = localStorage.getItem(STAFF_HIDDEN_INTAKE_ORDER_IDS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? new Set(parsed.map((item) => String(item))) : new Set();
  } catch {
    return new Set();
  }
}

export function writeHiddenIntakeOrderIds(ids) {
  try {
    localStorage.setItem(
      STAFF_HIDDEN_INTAKE_ORDER_IDS_KEY,
      JSON.stringify(Array.from(ids))
    );
  } catch {
    // ignore storage failures
  }
}

export function isVisibleInStaffIntake(order, hiddenIds = new Set()) {
  const normalizedPhase = String(order?.phase ?? "").trim().toLowerCase();
  const normalizedStatus = String(order?.status ?? "").trim().toUpperCase();
  const normalizedId = String(order?.id ?? order?.orderId ?? "");

  if (!normalizedId || hiddenIds.has(normalizedId)) {
    return false;
  }

  return (
    normalizedPhase === ORDER_PHASE.PENDING_CONFIRMATION &&
    !["READY_TO_DELIVER", "PROCESSING", "SHIPPING", "COMPLETED", "CANCELED"].includes(
      normalizedStatus
    )
  );
}

export function filterVisibleStaffIntakeOrders(
  orders,
  hiddenIds = readHiddenIntakeOrderIds()
) {
  return (Array.isArray(orders) ? orders : []).filter((order) =>
    isVisibleInStaffIntake(order, hiddenIds)
  );
}

export function filterVisiblePrescriptionSupportOrders(orders) {
  return (Array.isArray(orders) ? orders : []).filter((order) =>
    String(order?.phase ?? "").trim().toLowerCase() === ORDER_PHASE.PRESCRIPTION_REVIEW
  );
}

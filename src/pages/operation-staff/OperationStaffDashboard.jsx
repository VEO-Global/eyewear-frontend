import React from "react";
import OperationHeader from "./OperationHeader";
import OperationDashboardOverivew from "../../components/operation/OperationDashboardOverview";
import { useSelector } from "react-redux";

export default function OperationStaffDashboard() {
  const { manufacturingOrders } = useSelector((state) => state.operation);

  return (
    <div>
      <OperationHeader manufacturingOrders={manufacturingOrders} />
      <OperationDashboardOverivew manufacturingOrders={manufacturingOrders} />
    </div>
  );
}

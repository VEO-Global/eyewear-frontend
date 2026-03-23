import {
  DollarSignIcon,
  ShoppingBagIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react";
import { StatCard } from "../common/StatCard";

function ManagerRevenueStatics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Tổng doanh thu (30 ngày)"
        // value={formatVND(totalRevenue) || ""}
        value="120"
        icon={DollarSignIcon}
        color="amber"
      />

      <StatCard
        title="Doanh thu hôm nay"
        value="120"
        // value={formatVND(todayRevenue)}
        icon={TrendingUpIcon}
        color="green"
        change="+12.5%"
        changeType="up"
      />

      <StatCard
        title="Đơn hàng hôm nay"
        value="120"
        // value={todayOrders}
        icon={ShoppingBagIcon}
        color="blue"
      />

      <StatCard
        title="Tăng trưởng"
        value="120"
        // value={`${growth.toFixed(1)}%`}
        icon={UsersIcon}
        color="purple"
        change="Tốt"
        changeType="up"
      />
    </div>
  );
}

export default ManagerRevenueStatics;

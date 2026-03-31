import { Collapse } from "antd";
import { BarChart3, Megaphone, Package2, ScrollText } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import ManagerDashboardLayout from "../components/manager/ManagerDashboardLayout";
import BusinessPoliciesSection from "../components/manager/sections/BusinessPoliciesSection";
import ProductConfigurationSection from "../components/manager/sections/ProductConfigurationSection";
import PricingPromotionsSection from "../components/manager/sections/PricingPromotionsSection";
import RevenueAnalyticsSection from "../components/manager/sections/RevenueAnalyticsSection";

const WORKSPACE_ACTIVE_SECTIONS_KEY = "manager-workspace-active-sections";

const sectionConfig = [
  {
    key: "policies",
    title: "Chính sách kinh doanh",
    description: "Chỉnh sửa chính sách mua hàng, đổi trả và bảo hành với cơ chế tải khi mở và lưu riêng từng mục.",
    icon: ScrollText,
  },
  {
    key: "products",
    title: "Cấu hình sản phẩm",
    description: "Quản lý sản phẩm có phân trang và thao tác biến thể cố định theo từng sản phẩm.",
    icon: Package2,
  },
  {
    key: "pricing",
    title: "Giá bán và khuyến mãi",
    description: "Quản lý tròng kính và mã khuyến mãi trong các tab riêng biệt.",
    icon: Megaphone,
  },
  {
    key: "revenue",
    title: "Phân tích doanh thu",
    description: "Theo dõi thẻ tổng quan, biểu đồ và bảng thanh toán có phân trang.",
    icon: BarChart3,
  },
];

export default function ManagerWorkspacePage() {
  const location = useLocation();

  const initialActiveKeys = useMemo(() => {
    try {
      const storedValue = sessionStorage.getItem(WORKSPACE_ACTIVE_SECTIONS_KEY);
      const parsedValue = storedValue ? JSON.parse(storedValue) : [];

      if (Array.isArray(parsedValue) && parsedValue.length > 0) {
        return parsedValue;
      }
    } catch {
      // Ignore sessionStorage failures and continue to fallback behavior.
    }

    if (location.state?.openDefaultSection) {
      return ["policies"];
    }

    return [];
  }, [location.state]);

  const [activeKeys, setActiveKeys] = useState(initialActiveKeys);
  const [loadedSections, setLoadedSections] = useState(initialActiveKeys);

  useEffect(() => {
    try {
      sessionStorage.setItem(WORKSPACE_ACTIVE_SECTIONS_KEY, JSON.stringify(activeKeys));
    } catch {
      // Ignore sessionStorage failures
    }
  }, [activeKeys]);

  function handleAccordionChange(nextKeys) {
    const normalizedKeys = Array.isArray(nextKeys) ? nextKeys : nextKeys ? [nextKeys] : [];
    setActiveKeys(normalizedKeys);
    setLoadedSections((current) => Array.from(new Set([...current, ...normalizedKeys])));
  }

  return (
    <ManagerDashboardLayout>
      <Collapse
        activeKey={activeKeys}
        onChange={handleAccordionChange}
        size="large"
        ghost
        items={sectionConfig.map((section) => {
          const Icon = section.icon;

          return {
            key: section.key,
            label: (
              <div className="flex items-start gap-4">
                <div className="mt-1 rounded-2xl bg-teal-50 p-3 text-teal-700">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-xl font-semibold text-slate-900">{section.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{section.description}</p>
                </div>
              </div>
            ),
            styles: {
              header: {
                padding: "22px 24px",
                background: "rgba(255,255,255,0.92)",
                border: "1px solid #e2e8f0",
                borderRadius: "28px",
                marginBottom: "12px",
                boxShadow: "0 12px 34px rgba(15,23,42,0.06)",
              },
              body: {
                padding: "8px 0 20px",
              },
            },
            children:
              loadedSections.includes(section.key) ? (
                <>
                  {section.key === "policies" ? <BusinessPoliciesSection enabled={activeKeys.includes("policies")} /> : null}
                  {section.key === "products" ? <ProductConfigurationSection enabled={activeKeys.includes("products")} /> : null}
                  {section.key === "pricing" ? <PricingPromotionsSection enabled={activeKeys.includes("pricing")} /> : null}
                  {section.key === "revenue" ? <RevenueAnalyticsSection enabled={activeKeys.includes("revenue")} /> : null}
                </>
              ) : null,
          };
        })}
      />
    </ManagerDashboardLayout>
  );
}

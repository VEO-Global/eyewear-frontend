import { useLocation } from "react-router-dom";
import BusinessPoliciesAccordion, {
  resolveDefaultPolicyTypeFromHash,
} from "../components/policies/BusinessPoliciesAccordion";

export default function PoliciesPage() {
  const location = useLocation();
  const defaultExpandedType = resolveDefaultPolicyTypeFromHash(location.hash) || "PURCHASE";

  return (
    <section className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.18),_transparent_26%),radial-gradient(circle_at_top_right,_rgba(245,158,11,0.16),_transparent_26%),linear-gradient(180deg,#f8fafc_0%,#ffffff_48%,#eef6ff_100%)] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-[36px] border border-white/70 bg-white/90 shadow-[0_28px_90px_rgba(15,23,42,0.10)] backdrop-blur">
          <div className="border-b border-slate-100 bg-[linear-gradient(135deg,#ccfbf1_0%,#fff7ed_28%,#f8fafc_58%,#dbeafe_100%)] px-6 py-8 sm:px-8 sm:py-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/80 px-4 py-2 text-sm font-semibold text-teal-700">
                Chính sách
              </div>
              <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                Trung tâm chính sách
              </h1>
              <p className="mt-4 text-base leading-8 text-slate-600 sm:text-lg">
                Xem các điều khoản mua hàng, đổi trả, bảo hành, giao nhận và bảo mật thông tin.
              </p>
            </div>
          </div>

          <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <BusinessPoliciesAccordion defaultExpandedType={defaultExpandedType} forceCanEdit={false} />
          </div>
        </div>
      </div>
    </section>
  );
}

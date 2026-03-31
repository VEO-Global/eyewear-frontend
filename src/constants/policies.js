export const POLICY_DEFINITIONS = [
  {
    type: "PURCHASE",
    key: "purchase",
    title: "Chính sách mua hàng",
    summary: "Điều khoản mua hàng, đặt cọc, xác nhận đơn và hỗ trợ sau mua.",
  },
  {
    type: "RETURN",
    key: "return",
    title: "Chính sách đổi trả",
    summary: "Điều kiện đổi trả, hoàn tiền và quy trình tiếp nhận yêu cầu.",
  },
  {
    type: "WARRANTY",
    key: "warranty",
    title: "Chính sách bảo hành",
    summary: "Phạm vi bảo hành, thời hạn áp dụng và hướng dẫn xử lý bảo hành.",
  },
  {
    type: "SHIPPING",
    key: "shipping",
    title: "Vận chuyển & Giao nhận",
    summary: "Thông tin thời gian giao hàng, đối tác vận chuyển và khu vực hỗ trợ.",
  },
  {
    type: "PRIVACY",
    key: "privacy",
    title: "Bảo mật thông tin",
    summary: "Cách thu thập, sử dụng và bảo vệ dữ liệu cá nhân của khách hàng.",
  },
];

export function getPolicyDefinition(type) {
  return POLICY_DEFINITIONS.find((item) => item.type === type);
}

export function getPolicyDefinitionByKey(key) {
  return POLICY_DEFINITIONS.find((item) => item.key === key);
}

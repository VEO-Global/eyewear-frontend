import React from "react";
import { Table, Tag, Button, Select } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { PlusIcon, TagIcon } from "lucide-react";

const { Option } = Select;

const data = [
  {
    id: 1,
    name: "Sale tự trường",
    discount: "15%",
    time: "15/08/2024 - 16/09/2024",
    status: "ended",
  },
  {
    id: 2,
    name: "Black Friday",
    discount: "30%",
    time: "25/11/2024 - 01/12/2024",
    status: "ended",
  },
  {
    id: 3,
    name: "Giảm giá tròng kính",
    discount: "200.000 đ",
    time: "01/01/2024 - 01/01/2025",
    status: "ended",
  },
  {
    id: 4,
    name: "Khai trương chi nhánh mới",
    discount: "20%",
    time: "01/10/2023 - 01/11/2023",
    status: "ended",
  },
  {
    id: 5,
    name: "Flash Sale cuối tuần",
    discount: "500.000 đ",
    time: "15/06/2024 - 17/06/2024",
    status: "ended",
  },
];

const getStatusLabel = (status) => {
  switch (status) {
    case "active":
      return "● Đang diễn ra";
    case "upcoming":
      return "● Sắp diễn ra";
    case "ended":
      return "● Đã kết thúc";
    default:
      return status;
  }
};

function ManagerPromotionPage() {
  const columns = [
    {
      title: "Tên chương trình",
      dataIndex: "name",
      key: "name",
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Mức giảm",
      dataIndex: "discount",
      key: "discount",
    },
    {
      title: "Thời gian",
      dataIndex: "time",
      key: "time",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const label = getStatusLabel(status);
        const colorMap = {
          active: "green",
          upcoming: "blue",
          ended: "default",
        };
        return TagIcon;
      },
    },
    {
      title: "Thao tác",
      key: "action",
      render: () => (
        <Button type="link" size="small">
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div className=" bg-white-50 min-h-screen">
      <div className="flex justify-between">
        {/* Filter */}
        <div className="mb-4">
          <Select defaultValue="all" style={{ width: 180 }}>
            <Option value="all">Tất cả trạng thái</Option>
            <Option value="active">Đang diễn ra</Option>
            <Option value="ended">Đã kết thúc</Option>
          </Select>
        </div>
        {/* Header */}

        <div className="flex justify-between items-center mb-4 px-6">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="bg-orange-500 border-none -5 h-5 mr-2"
            style={{ padding: 10 }}
          >
            Thêm khuyến mãi
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white p-4 rounded-xl shadow-sm cursor-pointer">
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          pagination={false}
        />
      </div>
    </div>
  );
}

export default ManagerPromotionPage;

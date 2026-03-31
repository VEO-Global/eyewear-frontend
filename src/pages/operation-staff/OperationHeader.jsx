import { Card, Row, Col, Statistic, Table, Tag } from "antd";
import {
  Package,
  Clock,
  Glasses,
  CheckCircle,
  ShoppingBag,
} from "lucide-react";
export default function OperationHeader({ manufacturingOrders }) {
  return (
    <div className="">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Tổng quan hệ thống</h1>
        <p className="text-gray-500">
          Chào mừng bạn quay lại! Đây là tình hình hôm nay.
        </p>
      </div>

      {/* Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8} xl={4}>
          <Card className="shadow-sm border-gray-200 hover:shadow-md transition-shadow">
            <Statistic
              title={
                <span className="text-gray-500 font-medium">Tổng đơn hàng</span>
              }
              value={manufacturingOrders.length}
              prefix={<ShoppingBag className="text-blue-500 mr-2" size={20} />}
              style={{
                fontWeight: 600,
                color: "#1f2937",
              }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8} xl={5}>
          <Card className="shadow-sm border-gray-200 hover:shadow-md transition-shadow">
            <Statistic
              title={
                <span className="text-gray-500 font-medium">
                  Đang chờ xử lý
                </span>
              }
              value={manufacturingOrders.length}
              prefix={<Package className="text-orange-500 mr-2" size={20} />}
              style={{
                fontWeight: 600,
                color: "#1f2937",
              }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8} xl={5}>
          <Card className="shadow-sm border-gray-200 hover:shadow-md transition-shadow">
            <Statistic
              title={
                <span className="text-gray-500 font-medium">Đơn đặt trước</span>
              }
              value={1}
              prefix={<Clock className="text-purple-500 mr-2" size={20} />}
              style={{
                fontWeight: 600,
                color: "#1f2937",
              }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8} xl={5}>
          <Card className="shadow-sm border-gray-200 hover:shadow-md transition-shadow">
            <Statistic
              title={
                <span className="text-gray-500 font-medium">
                  Đơn kính theo toa
                </span>
              }
              value={
                manufacturingOrders.filter(
                  (o) => o?.orderType === "PRESCRIPTION"
                )?.length
              }
              prefix={<Glasses className="text-teal-500 mr-2" size={20} />}
              style={{
                fontWeight: 600,
                color: "#1f2937",
              }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8} xl={5}>
          <Card className="shadow-sm border-gray-200 hover:shadow-md transition-shadow">
            <Statistic
              title={
                <span className="text-gray-500 font-medium">
                  Đã hoàn thành / Đã giao
                </span>
              }
              value={1}
              prefix={<CheckCircle className="text-green-500 mr-2" size={20} />}
              style={{
                fontWeight: 600,
                color: "#1f2937",
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

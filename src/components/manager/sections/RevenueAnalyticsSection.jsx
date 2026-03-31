import { Button, Card, DatePicker, Select, Table, Tag } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { extractErrorMessage, managerApi } from "../../../services/managerApi";
import { appToast } from "../../../utils/appToast";
import SimpleLineChart from "../SimpleLineChart";
import { SectionCard, SectionEmpty, SectionError, SectionLoading } from "../SectionCard";

function formatCurrency(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(value || 0);
}

function formatChartLabels(data, mode) {
  if (mode !== "daily") {
    return data;
  }

  return data.map((item, index) => {
    const parsedDate = dayjs(item.label);

    return {
      ...item,
      label: parsedDate.isValid() ? String(parsedDate.date()) : String(index + 1),
    };
  });
}

function SummaryCard({ label, value }) {
  return (
    <Card className="h-full rounded-[24px] border-slate-200 shadow-sm">
      <div className="flex min-h-[160px] flex-col justify-center gap-3 px-1">
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-700">{label}</p>
        <p className="overflow-hidden text-[2rem] font-bold leading-none tracking-tight text-slate-950 sm:text-[2.35rem] [overflow-wrap:anywhere]">
          {value}
        </p>
      </div>
    </Card>
  );
}

export default function RevenueAnalyticsSection({ enabled }) {
  const [bootstrapped, setBootstrapped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState(null);
  const [dailyData, setDailyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [payments, setPayments] = useState({ items: [], page: 1, size: 10, total: 0 });
  const [summaryRange, setSummaryRange] = useState([dayjs().startOf("month"), dayjs().endOf("month")]);
  const [chartFilters, setChartFilters] = useState({
    year: dayjs().year(),
    month: dayjs().month() + 1,
    mode: "daily",
  });
  const [paymentPage, setPaymentPage] = useState({ page: 1, size: 10 });
  const chartData = formatChartLabels(chartFilters.mode === "daily" ? dailyData : monthlyData, chartFilters.mode);

  useEffect(() => {
    if (!enabled || bootstrapped) {
      return;
    }

    const initialRange = [dayjs().startOf("month"), dayjs().endOf("month")];
    const initialYear = dayjs().year();
    const initialMonth = dayjs().month() + 1;

    setLoading(true);
    setError("");

    Promise.all([
      managerApi.fetchRevenueSummary({
        from: initialRange[0]?.format("YYYY-MM-DD"),
        to: initialRange[1]?.format("YYYY-MM-DD"),
      }),
      managerApi.fetchDailyRevenue({ year: initialYear, month: initialMonth }),
      managerApi.fetchMonthlyRevenue({ year: initialYear }),
      managerApi.fetchPayments({ page: 0, size: 10 }),
    ])
      .then(([summaryResponse, dailyResponse, monthlyResponse, paymentResponse]) => {
        setSummary(summaryResponse);
        setDailyData(dailyResponse);
        setMonthlyData(monthlyResponse);
        setPayments(paymentResponse);
        setBootstrapped(true);
      })
      .catch((loadError) => {
        setError(extractErrorMessage(loadError, "Không thể tải dữ liệu phân tích doanh thu."));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [bootstrapped, enabled]);

  async function handleRefreshSummary(range) {
    setLoading(true);

    try {
      const nextSummary = await managerApi.fetchRevenueSummary({
        from: range[0]?.format("YYYY-MM-DD"),
        to: range[1]?.format("YYYY-MM-DD"),
      });
      setSummary(nextSummary);
    } catch (loadError) {
      appToast.error(extractErrorMessage(loadError, "Không thể làm mới phần tổng quan."));
    } finally {
      setLoading(false);
    }
  }

  async function handleRefreshCharts(nextChartFilters = chartFilters) {
    setLoading(true);

    try {
      const [nextDaily, nextMonthly] = await Promise.all([
        managerApi.fetchDailyRevenue({ year: nextChartFilters.year, month: nextChartFilters.month }),
        managerApi.fetchMonthlyRevenue({ year: nextChartFilters.year }),
      ]);

      setDailyData(nextDaily);
      setMonthlyData(nextMonthly);
    } catch (loadError) {
      appToast.error(extractErrorMessage(loadError, "Không thể làm mới biểu đồ."));
    } finally {
      setLoading(false);
    }
  }

  async function handleLoadPayments(nextPage = paymentPage) {
    setLoading(true);

    try {
      const paymentResponse = await managerApi.fetchPayments({
        page: Math.max((nextPage.page || 1) - 1, 0),
        size: nextPage.size,
      });
      setPayments(paymentResponse);
    } catch (loadError) {
      appToast.error(extractErrorMessage(loadError, "Không thể tải danh sách thanh toán."));
    } finally {
      setLoading(false);
    }
  }

  if (!enabled) {
    return null;
  }

  if (loading && !summary) {
    return <SectionLoading label="Đang tải dữ liệu phân tích..." />;
  }

  if (error && !summary) {
    return <SectionError message={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <SectionCard
      title="Phân tích doanh thu"
    >
      <div className="grid gap-5 xl:grid-cols-[1.18fr_0.82fr]">
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <SummaryCard label="Tổng doanh thu" value={formatCurrency(summary?.totalRevenue)} />
            <SummaryCard label="Tổng đơn hàng" value={summary?.totalOrders || 0} />
            <SummaryCard label="Giá trị đơn trung bình" value={formatCurrency(summary?.averageOrderValue)} />
            <SummaryCard label="Thanh toán thành công" value={summary?.successfulPayments || 0} />
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Khoảng thời gian tổng quan</h3>
                <p className="mt-1 text-sm text-slate-500">Chọn khoảng ngày để cập nhật số liệu tổng quan.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <DatePicker.RangePicker value={summaryRange} onChange={(value) => setSummaryRange(value)} />
                <Button type="primary" onClick={() => handleRefreshSummary(summaryRange)}>
                  Làm mới tổng quan
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Xu hướng doanh thu</h3>
                <p className="mt-1 text-sm text-slate-500">Xem doanh thu theo ngày hoặc theo tháng.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Select
                  value={chartFilters.mode}
                  onChange={(value) => {
                    const nextFilters = { ...chartFilters, mode: value };
                    setChartFilters(nextFilters);
                  }}
                  options={[
                    { label: "Theo ngày", value: "daily" },
                    { label: "Theo tháng", value: "monthly" },
                  ]}
                  style={{ width: 120 }}
                />
                <Select
                  value={chartFilters.year}
                  onChange={(value) => setChartFilters((current) => ({ ...current, year: value }))}
                  options={Array.from({ length: 5 }, (_, index) => {
                    const year = dayjs().year() - 2 + index;
                    return { label: year, value: year };
                  })}
                  style={{ width: 120 }}
                />
                <Select
                  value={chartFilters.month}
                  onChange={(value) => setChartFilters((current) => ({ ...current, month: value }))}
                  options={Array.from({ length: 12 }, (_, index) => ({
                    label: `Tháng ${index + 1}`,
                    value: index + 1,
                  }))}
                  style={{ width: 140 }}
                  disabled={chartFilters.mode !== "daily"}
                />
                <Button type="primary" onClick={() => handleRefreshCharts(chartFilters)}>
                  Làm mới biểu đồ
                </Button>
              </div>
            </div>

            <div className="mt-5">
              <SimpleLineChart data={chartData} />
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-[24px] border border-slate-200 bg-white p-5">
            <h3 className="text-lg font-semibold text-slate-900">Thanh toán</h3>
            <p className="mt-1 text-sm text-slate-500">Theo dõi mã thanh toán, phương thức, trạng thái và số tiền.</p>

            {!payments.items.length && !loading ? <SectionEmpty description="Chưa có thanh toán nào để hiển thị." /> : null}

            {payments.items.length ? (
              <Table
                className="mt-5"
                rowKey="id"
                loading={loading}
                dataSource={payments.items}
                columns={[
                  { title: "Mã thanh toán", dataIndex: "paymentCode", render: (value) => value || "-" },
                  { title: "Mã đơn", dataIndex: "orderCode", render: (value) => value || "-" },
                  { title: "Khách hàng", dataIndex: "customerName", render: (value) => value || "-" },
                  { title: "Phương thức", dataIndex: "method", render: (value) => value || "-" },
                  { title: "Số tiền", dataIndex: "amount", render: (value) => formatCurrency(value) },
                  {
                    title: "Trạng thái",
                    dataIndex: "status",
                    render: (value) => <Tag color={value === "SUCCESS" ? "green" : "default"}>{value || "-"}</Tag>,
                  },
                ]}
                pagination={{
                  current: paymentPage.page,
                  pageSize: paymentPage.size,
                  total: payments.total,
                  onChange: (page, size) => {
                    const nextPage = { page, size };
                    setPaymentPage(nextPage);
                    handleLoadPayments(nextPage);
                  },
                }}
              />
            ) : null}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

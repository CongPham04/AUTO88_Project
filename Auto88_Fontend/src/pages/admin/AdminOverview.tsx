import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Car, Users, Package, TrendingUp, Download, AlertTriangle, RefreshCcw, PieChart as PieChartIcon 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { toast } from 'sonner';

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

// IMPORT STORE
import { useAdminDashboardStore } from '@/store/useAdminDashboardStore';

// --- HELPERS ---
const formatPrice = (price: number) => 
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const formatDate = (dateString: string) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString('vi-VN', { 
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit' 
  });
};

const getStatusBadge = (status: string) => {
  const map: any = {
    COMPLETED: { label: 'Hoàn thành', color: 'bg-green-600' },
    DELIVERED: { label: 'Đã giao', color: 'bg-green-600' },
    SHIPPING: { label: 'Đang giao', color: 'bg-blue-600' },
    PENDING: { label: 'Chờ xử lý', color: 'bg-yellow-600' },
    CONFIRMED: { label: 'Đã xác nhận', color: 'bg-yellow-500' },
    CANCELLED: { label: 'Đã hủy', color: 'bg-red-600' },
  };
  const conf = map[status] || { label: status, color: 'bg-gray-600' };
  return <Badge className={`${conf.color} hover:${conf.color} text-white`}>{conf.label}</Badge>;
};

// --- MOCK DATA DỰ PHÒNG (Hiện khi chưa có data thật) ---
const MOCK_REVENUE_DATA = [
  { month: 'Tháng 1', revenue: 1.2 },
  { month: 'Tháng 2', revenue: 2.5 },
  { month: 'Tháng 3', revenue: 1.8 },
  { month: 'Tháng 4', revenue: 3.2 },
  { month: 'Tháng 5', revenue: 2.9 },
  { month: 'Tháng 6', revenue: 4.5 },
];

const MOCK_ORDER_STATUS_DATA = [
  { name: 'Hoàn thành', value: 15, color: '#16a34a' },
  { name: 'Đang giao', value: 5, color: '#2563eb' },
  { name: 'Chờ xử lý', value: 8, color: '#ca8a04' },
  { name: 'Đã hủy', value: 2, color: '#dc2626' },
];

export default function AdminOverview() {
  const navigate = useNavigate();
  const { data, isLoading, isError, fetchDashboardStats, exportRevenueReport } = useAdminDashboardStore();
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  // ✅ LOGIC XỬ LÝ DATA AN TOÀN CHO BIỂU ĐỒ
  // Sử dụng useMemo để tính toán lại chỉ khi data thay đổi
  const chartData = useMemo(() => {
    // Kiểm tra xem có data thật từ API không
    const hasRealRevenue = data?.revenueChart && data.revenueChart.length > 0 && data.revenueChart.some(d => d.revenue > 0);
    const hasRealStatus = data?.orderStatusChart && data.orderStatusChart.length > 0;

    console.log("Real Data Check:", { hasRealRevenue, hasRealStatus, rawData: data });

    return {
      // Nếu có data thật thì dùng, không thì dùng Mock, nếu mock cũng không muốn hiện thì để mảng rỗng
      revenue: hasRealRevenue ? data!.revenueChart : MOCK_REVENUE_DATA, 
      status: hasRealStatus ? data!.orderStatusChart : MOCK_ORDER_STATUS_DATA,
      // Cờ đánh dấu đang dùng Mock (để hiện thông báo nhỏ cho user biết)
      isMockRevenue: !hasRealRevenue,
      isMockStatus: !hasRealStatus
    };
  }, [data]);

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      await exportRevenueReport();
      toast.success("Đã xuất báo cáo thành công!");
    } catch (error) {
      toast.error("Lỗi khi xuất báo cáo");
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-8 min-h-screen bg-muted/40">
        <div className="flex justify-between"><Skeleton className="h-10 w-48" /><Skeleton className="h-10 w-32" /></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}</div>
        <div className="grid grid-cols-3 gap-6"><Skeleton className="h-[400px] col-span-2 rounded-xl" /><Skeleton className="h-[400px] col-span-1 rounded-xl" /></div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-red-500 gap-4">
        <AlertTriangle className="w-12 h-12" />
        <p className="text-lg font-medium">Không thể tải dữ liệu thống kê.</p>
        <Button variant="outline" onClick={() => fetchDashboardStats()}><RefreshCcw className="w-4 h-4 mr-2" /> Thử lại</Button>
      </div>
    );
  }

  const statsConfig = [
    { title: 'Tổng xe trong kho', metric: data.stats.totalCars, icon: Car, color: 'bg-blue-100 text-blue-600' },
    { title: 'Đơn hàng tháng này', metric: data.stats.monthlyOrders, icon: Package, color: 'bg-green-100 text-green-600' },
    { title: 'Khách hàng mới', metric: data.stats.newCustomers, icon: Users, color: 'bg-purple-100 text-purple-600' },
    { title: 'Doanh thu tháng này', metric: data.stats.monthlyRevenue, icon: TrendingUp, color: 'bg-red-100 text-red-600', isCurrency: true }
  ];

  return (
    <div className="space-y-6 py-4 px-4 sm:px-6 lg:px-8">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Tổng Quan Hệ Thống</h2>
          <p className="text-gray-500 mt-2 mb-2 text-sm">Số liệu cập nhật thời gian thực từ hệ thống.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => fetchDashboardStats()} className="h-9">
            <RefreshCcw className="w-4 h-4 mr-2" /> Làm mới
          </Button>
          <Button onClick={handleExportExcel} disabled={isExporting} size="sm" className="h-9 bg-gray-600 hover:bg-gray-900 text-white shadow-sm">
            <Download className="w-4 h-4 mr-2" /> {isExporting ? "Đang xuất..." : "Xuất Excel"}
          </Button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {statsConfig.map((item, index) => (
            <Card key={index} className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-full ${item.color} bg-opacity-20`}><item.icon className="w-5 h-5" /></div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${item.metric.isUp ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                    {item.metric.isUp ? '+' : ''}{item.metric.growthPercent.toFixed(1)}%
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">{item.title}</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-2">
                    {item.isCurrency 
                      ? new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(item.metric.value) + " (VND)"
                      : item.metric.value}
                  </h3>
                </div>
              </CardContent>
            </Card>
        ))}
      </div>

      {/* CHARTS SECTION */}
      <div className=" grid grid-cols-2 lg:grid-cols-7 gap-6 mb-6">
        
        {/* --- BAR CHART --- */}
        <Card className="lg:col-span-4 shadow-sm border-none flex flex-col">
          <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle>Biểu đồ doanh thu</CardTitle>
                    <CardDescription>Doanh thu 6 tháng gần nhất (Tỷ VNĐ)</CardDescription>
                </div>
                {chartData.isMockRevenue && <Badge variant="secondary" className="text-xs">Dữ liệu mẫu</Badge>}
            </div>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 pl-0">
            {/* ✅ FIX: Dùng width 99% để fix lỗi resize của Recharts */}
            <div style={{ width: '99%', height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.revenue} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={(val) => `${val}`} />
                  <Tooltip 
                    cursor={{ fill: '#f9fafb' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`${value} Tỷ`, 'Doanh thu']}
                  />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={50} name="Doanh thu" animationDuration={1000} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* --- PIE CHART --- */}
        <Card className="lg:col-span-4 shadow-sm border-none flex flex-col">
          <CardHeader>
             <div className="flex justify-between items-center">
                <div>
                    <CardTitle>Tỷ lệ đơn hàng</CardTitle>
                    <CardDescription>Theo trạng thái hiện tại</CardDescription>
                </div>
                {chartData.isMockStatus && <Badge variant="secondary" className="text-xs">Dữ liệu mẫu</Badge>}
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center">
             <div style={{ width: '100%', height: 350, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.status}
                      cx="50%" cy="50%"
                      innerRadius={80} outerRadius={110}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {chartData.status.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Label */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none mb-8">
                    <p className="text-3xl font-bold text-gray-800">
                        {chartData.status.reduce((a, b) => a + b.value, 0)}
                    </p>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Tổng đơn</p>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TABLES SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* RECENT ORDERS */}
        <Card className="lg:col-span-2 shadow-sm border-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1.5"><CardTitle>Đơn hàng gần đây</CardTitle><CardDescription>5 giao dịch mới nhất</CardDescription></div>
            <Button variant="outline" className="text-xs h-8" onClick={() => navigate('/admin/orders')}>Xem tất cả</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentOrders.length > 0 ? (
                 data.recentOrders.map((order) => (
                    <div key={order.orderId} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer group" onClick={() => navigate(`/admin/orders/view/${order.orderId}`)}>
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            {order.customerName ? order.customerName.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                             <h4 className="font-semibold text-gray-900 text-sm">{order.customerName}</h4>
                             <span className="text-xs text-gray-400">#{order.orderId.substring(0, 8)}</span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1"><Car className="w-3 h-3"/> {order.carModel} <span className="mx-1">•</span> {formatDate(order.date)}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 mt-3 sm:mt-0">
                        <p className="font-bold text-gray-900">{formatPrice(order.total)}</p>
                        {getStatusBadge(order.status)}
                      </div>
                    </div>
                  ))
              ) : <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed"><p className="text-gray-500 text-sm">Chưa có đơn hàng nào.</p></div>}
            </div>
          </CardContent>
        </Card>

        {/* LOW STOCK */}
        <Card className="shadow-sm border-none bg-orange-50/50 border border-orange-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 font-semibold"><AlertTriangle className=" text-red-600 w-5 h-5" /> Cảnh báo tồn kho</CardTitle>
            <CardDescription className="text-orange-600/80">Top 5 xe sắp hết hàng (&lt; 5 xe)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.lowStockCars.length > 0 ? (
                data.lowStockCars.map((car) => (
                  <div key={car.carId} className="bg-white p-3 rounded-lg border border-orange-100 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
                    <div className="min-w-0 pr-2">
                        <span className="font-medium text-gray-800 text-sm truncate block" title={car.model}>{car.model}</span>
                        <span className="text-xs text-gray-500">ID: {car.carId}</span>
                    </div>
                    <div className="flex gap-2 items-center shrink-0">
                      <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 whitespace-nowrap">Còn {car.stock}</Badge>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full" onClick={() => navigate(`/admin/cars/edit/${car.carId}`)} title="Nhập hàng / Sửa"><RefreshCcw className="w-4 h-4" /></Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-green-600">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2"><Package className="w-6 h-6 text-green-600" /></div>
                    <p className="font-medium text-sm">Kho hàng ổn định</p>
                </div>
              )}
            </div>
            <Button className="w-full mt-6 bg-red-600 hover:bg-orange-700 text-white shadow-orange-200 shadow-md" onClick={() => navigate('/admin/cars')}>Quản lý kho xe</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
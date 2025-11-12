// pages/admin/AdminOverview.tsx
import { useState } from 'react';
import { Car, Users, Package, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardTitle, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN');
};

// Mock statistics
const stats = [
  {
    title: 'Tổng xe trong kho',
    value: '156',
    change: '+12%',
    icon: Car,
    color: 'text-blue-600'
  },
  {
    title: 'Đơn hàng tháng này',
    value: '48',
    change: '+23%',
    icon: Package,
    color: 'text-green-600'
  },
  {
    title: 'Khách hàng mới',
    value: '127',
    change: '+8%',
    icon: Users,
    color: 'text-purple-600'
  },
  {
    title: 'Doanh thu tháng',
    value: '15.2 tỷ',
    change: '+18%',
    icon: TrendingUp,
    color: 'text-red-600'
  }
];

// Mock orders
const orders = [
  {
    id: 'DH001',
    customer: 'Nguyễn Văn A',
    car: 'Toyota Camry 2024',
    date: '2024-01-15',
    status: 'Đã giao',
    total: 1250000000
  },
  {
    id: 'DH002',
    customer: 'Trần Thị B',
    car: 'Honda Civic 2024',
    date: '2024-01-20',
    status: 'Đang xử lý',
    total: 890000000
  },
  {
    id: 'DH003',
    customer: 'Lê Văn C',
    car: 'Ford Explorer 2024',
    date: '2024-01-22',
    status: 'Đang giao',
    total: 2150000000
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Đã giao':
      return 'bg-green-600';
    case 'Đang giao':
      return 'bg-blue-600';
    case 'Đang xử lý':
      return 'bg-yellow-600';
    case 'Đã hủy':
      return 'bg-red-600';
    default:
      return 'bg-gray-600';
  }
};

export default function AdminOverview() {
  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-green-600">{stat.change}</p>
                  </div>
                  <IconComponent className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent orders */}
      <Card className="cursor-pointer hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle>Đơn hàng gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <div>
                  <h4 className="font-medium">#{order.id} - {order.customer}</h4>
                  <p className="text-sm text-gray-600">{order.car}</p>
                  <p className="text-xs text-gray-500">{formatDate(order.date)}</p>
                </div>
                <div className="text-right">
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                  <p className="text-lg font-bold text-red-600 mt-1">
                    {formatPrice(order.total)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
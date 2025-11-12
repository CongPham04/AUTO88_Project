import React, { useEffect, useState, useMemo } from 'react';
import { usePaymentStore } from '@/store/paymentStore';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreHorizontal, AlertCircle } from 'lucide-react';
import { PaymentResponse, PaymentStatus, PaymentMethod } from '@/services/orderService';

const AdminPayments: React.FC = () => {
  const { payments, isLoading, error, fetchPayments, updateStatus } = usePaymentStore();
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'ALL'>('ALL');
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | 'ALL'>('ALL');

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleStatusChange = (paymentId: string, status: PaymentStatus) => {
    updateStatus(paymentId, status);
  };

  const getStatusVariant = (status: PaymentStatus) => {
    switch (status) {
      case 'SUCCESS':
        return 'default';
      case 'PENDING':
        return 'secondary';
      case 'FAILED':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getClassNameForStatus = (status: PaymentStatus) => {
    if (status === 'SUCCESS') {
      return 'bg-green-600 text-white';
    }
    return '';
  };

  const translatePaymentMethod = (method: PaymentMethod) => {
    switch (method) {
      case 'CREDIT_CARD':
        return 'Thẻ tín dụng';
      case 'DEBIT_CARD':
        return 'Thẻ ghi nợ';
      case 'BANK_TRANSFER':
        return 'Chuyển khoản';
      case 'MOMO':
        return 'Ví Momo';
      case 'VNPAY':
        return 'VNPAY';
      case 'CASH':
        return 'Tiền mặt';
      default:
        return method;
    }
  };

  const translateStatus = (status: PaymentStatus) => {
    switch (status) {
      case 'SUCCESS':
        return 'Thành công';
      case 'PENDING':
        return 'Đang chờ';
      case 'FAILED':
        return 'Thất bại';
      default:
        return status;
    }
  };

  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      const statusMatch = statusFilter === 'ALL' || payment.status === statusFilter;
      const methodMatch = methodFilter === 'ALL' || payment.paymentMethod === methodFilter;
      return statusMatch && methodMatch;
    });
  }, [payments, statusFilter, methodFilter]);

  if (isLoading && payments.length === 0) {
    return <div>Đang tải danh sách thanh toán...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Lỗi</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quản lý Thanh toán</h2>
        <div className="flex space-x-2">
          <Select onValueChange={(value: PaymentStatus | 'ALL') => setStatusFilter(value)} defaultValue="ALL">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              <SelectItem value="PENDING">Đang chờ</SelectItem>
              <SelectItem value="SUCCESS">Thành công</SelectItem>
              <SelectItem value="FAILED">Thất bại</SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={(value: PaymentMethod | 'ALL') => setMethodFilter(value)} defaultValue="ALL">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc theo phương thức" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả phương thức</SelectItem>
              <SelectItem value="CASH">Tiền mặt</SelectItem>
              <SelectItem value="CREDIT_CARD">Thẻ tín dụng</SelectItem>
              <SelectItem value="DEBIT_CARD">Thẻ ghi nợ</SelectItem>
              <SelectItem value="BANK_TRANSFER">Chuyển khoản</SelectItem>
              <SelectItem value="VNPAY">VNPAY</SelectItem>
              <SelectItem value="MOMO">Ví Momo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {filteredPayments.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-600">Không có thanh toán nào</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã Thanh toán</TableHead>
                  <TableHead>Mã Đơn hàng</TableHead>
                  <TableHead>Số tiền</TableHead>
                  <TableHead>Phương thức</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment: PaymentResponse) => (
                  <TableRow key={payment.paymentId}>
                    <TableCell>{payment.paymentId}</TableCell>
                    <TableCell>{payment.orderId}</TableCell>
                    <TableCell>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(payment.amount)}</TableCell>
                    <TableCell>{translatePaymentMethod(payment.paymentMethod)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusVariant(payment.status)}
                        className={getClassNameForStatus(payment.status)}
                      >
                        {translateStatus(payment.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(payment.paymentDate).toLocaleString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Mở menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleStatusChange(payment.paymentId, 'SUCCESS')}>
                            Đánh dấu thành công
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(payment.paymentId, 'PENDING')}>
                            Đánh dấu chờ xử lý
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(payment.paymentId, 'FAILED')}>
                            Đánh dấu thất bại
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminPayments;

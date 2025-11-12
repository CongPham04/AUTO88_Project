import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CreditCard, Truck, Shield, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { useOrderStore } from '@/store/orderStore';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import orderService, { OrderRequest, PaymentMethod } from '@/services/orderService';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const order = useOrderStore((s) => s.order);
  const clearOrder = useOrderStore((s) => s.clearOrder);
  const user = useAuthStore((s) => s.user);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: '',
    district: '',
    ward: '',
    paymentMethod: 'CASH' as PaymentMethod,
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (order.length === 0) {
      navigate('/cars');
    }
  }, [order, navigate]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const calculateSubtotal = () => {
    return order.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shipping = 0; // Free shipping
    const tax = subtotal * 0.1; // 10% VAT
    return subtotal + shipping + tax;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    if (!user?.userId) {
      toast.error("Bạn phải đăng nhập để đặt hàng.");
      navigate('/auth?redirect=checkout');
      return;
    }

    setLoading(true);
    try {
      const orderDetails = order.map(item => ({
        carId: item.id,
        quantity: item.quantity,
        colorName: item.selectedColor.toUpperCase().replace(" ", "_"),
      }));

      const orderData: OrderRequest = {
        userId: user.userId,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        district: formData.district,
        ward: formData.ward,
        note: formData.notes,
        shippingFee: 0,
        tax: calculateSubtotal() * 0.1,
        paymentMethod: formData.paymentMethod,
        orderDetails,
      };

      await orderService.createOrder(orderData);
      
      clearOrder();
      toast.success('Đặt hàng thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.');
      navigate('/');
    } catch (error) {
      toast.error('Đã có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = [
    { id: 'CASH', name: 'Thanh toán khi nhận xe', description: 'Thanh toán bằng tiền mặt khi nhận xe', icon: Truck },
    { id: 'BANK_TRANSFER', name: 'Chuyển khoản ngân hàng', description: 'Chuyển khoản trực tiếp vào tài khoản', icon: CreditCard },
    { id: 'VNPAY', name: 'VNPAY', description: 'Thanh toán qua ví VNPAY', icon: Shield },
    { id: 'MOMO', name: 'MOMO', description: 'Thanh toán qua ví MOMO', icon: Shield },
  ];

  const steps = [
    { id: 1, name: 'Thông tin cá nhân', completed: step > 1 },
    { id: 2, name: 'Địa chỉ giao hàng', completed: step > 2 },
    { id: 3, name: 'Thanh toán', completed: step > 3 }
  ];

  const backAction = () => {
    const fromDetails = location.state?.fromDetails;
    if (fromDetails) {
      navigate(-1);
    } else {
      navigate('/cars');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" onClick={backAction} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Thanh toán</h1>

        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {steps.map((stepItem, index) => (
              <div key={stepItem.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  stepItem.completed ? 'bg-green-600 border-green-600 text-white' :
                  step === stepItem.id ? 'border-red-600 text-red-600' :
                  'border-gray-300 text-gray-300'
                }`}>
                  {stepItem.completed ? <CheckCircle className="w-5 h-5" /> : stepItem.id}
                </div>
                <span className={`ml-2 font-medium ${step >= stepItem.id ? 'text-gray-900' : 'text-gray-400'}`}>
                  {stepItem.name}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-20 h-0.5 mx-4 ${stepItem.completed ? 'bg-green-600' : 'bg-gray-300'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              {step === 1 && (
                <Card>
                  <CardHeader><CardTitle>Thông tin cá nhân</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName">Họ và tên *</Label>
                        <Input id="fullName" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required />
                      </div>
                      <div>
                        <Label htmlFor="phone">Số điện thoại *</Label>
                        <Input id="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                    </div>
                    <Button type="submit" className="w-full">Tiếp tục</Button>
                  </CardContent>
                </Card>
              )}

              {step === 2 && (
                <Card>
                  <CardHeader><CardTitle>Địa chỉ giao hàng</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="address">Địa chỉ chi tiết *</Label>
                      <Input id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Số nhà, tên đường..." required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">Tỉnh/Thành phố *</Label>
                        <Input id="city" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} required />
                      </div>
                      <div>
                        <Label htmlFor="district">Quận/Huyện *</Label>
                        <Input id="district" value={formData.district} onChange={(e) => setFormData({ ...formData, district: e.target.value })} required />
                      </div>
                      <div>
                        <Label htmlFor="ward">Phường/Xã *</Label>
                        <Input id="ward" value={formData.ward} onChange={(e) => setFormData({ ...formData, ward: e.target.value })} required />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="notes">Ghi chú giao hàng</Label>
                      <Textarea id="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Ghi chú thêm..." />
                    </div>
                    <div className="flex space-x-4">
                      <Button type="button" variant="outline" onClick={() => setStep(1)}>Quay lại</Button>
                      <Button type="submit" className="flex-1">Tiếp tục</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {step === 3 && (
                <Card>
                  <CardHeader><CardTitle>Phương thức thanh toán</CardTitle></CardHeader>
                  <CardContent className="space-y-6">
                    <RadioGroup value={formData.paymentMethod} onValueChange={(value) => setFormData({ ...formData, paymentMethod: value as PaymentMethod })}>
                      {paymentMethods.map((method) => {
                        const IconComponent = method.icon;
                        return (
                          <div key={method.id} className="flex items-center space-x-3 p-4 border rounded-lg">
                            <RadioGroupItem value={method.id} id={method.id} />
                            <IconComponent className="w-5 h-5 text-gray-600" />
                            <div className="flex-1">
                              <Label htmlFor={method.id} className="font-medium cursor-pointer">{method.name}</Label>
                              <p className="text-sm text-gray-600">{method.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </RadioGroup>
                    <div className="flex space-x-4">
                      <Button type="button" variant="outline" onClick={() => setStep(2)}>Quay lại</Button>
                      <Button type="submit" className="flex-1" disabled={loading}>
                        {loading ? 'Đang xử lý...' : 'Hoàn tất đặt hàng'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </form>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader><CardTitle>Đơn hàng của bạn</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {order.map((item) => (
                    <div key={`${item.id}-${item.selectedColor}`} className="flex space-x-3">
                      <div className="w-16 h-12 overflow-hidden rounded">
                        <ImageWithFallback src={item.image} alt={`${item.make} ${item.model}`} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.make} {item.model} {item.year}</h4>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>Màu: {item.selectedColor}</span>
                          <span>x{item.quantity}</span>
                        </div>
                        <div className="text-red-600 font-medium">{formatPrice(item.price * item.quantity)}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between"><span>Tạm tính:</span><span>{formatPrice(calculateSubtotal())}</span></div>
                  <div className="flex justify-between"><span>Phí vận chuyển:</span><span className="text-green-600">Miễn phí</span></div>
                  <div className="flex justify-between"><span>VAT (10%):</span><span>{formatPrice(calculateSubtotal() * 0.1)}</span></div>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Tổng cộng:</span>
                  <span className="text-red-600">{formatPrice(calculateTotal())}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

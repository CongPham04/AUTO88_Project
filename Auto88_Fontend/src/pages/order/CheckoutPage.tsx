import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CreditCard, Truck, Shield, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { useOrderStore } from '@/store/orderStore';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import { getColorName } from '@/services/carService';
import orderService, { OrderRequest, PaymentMethod } from '@/services/orderService';
import locationService, { LocationOption } from '@/services/locationService';

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

  // Location States
  const [provinces, setProvinces] = useState<LocationOption[]>([]);
  const [districts, setDistricts] = useState<LocationOption[]>([]);
  const [wards, setWards] = useState<LocationOption[]>([]);
  
  // Selected Codes (Để gọi API)
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<string>('');
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<string>('');
  const [selectedWardCode, setSelectedWardCode] = useState<string>('');

  // 1. Init Data (Load Tỉnh)
  useEffect(() => {
    const initData = async () => {
        const provinceList = await locationService.getProvinces();
        setProvinces(provinceList);
    };
    initData();
  }, []);

  useEffect(() => {
    if (order.length === 0) {
      navigate('/cars');
    }
  }, [order, navigate]);

  // --- HANDLERS ĐỊA CHỈ ---

  // Chọn Tỉnh -> Load Huyện
  const handleProvinceChange = async (value: string) => {
    const province = provinces.find(p => String(p.code) === value);
    if (!province) return;

    setSelectedProvinceCode(value);
    setSelectedDistrictCode('');
    setSelectedWardCode('');
    setDistricts([]);
    setWards([]);
    
    // Cập nhật form text
    setFormData(prev => ({ ...prev, city: province.name, district: '', ward: '' }));

    // Load Huyện
    const data = await locationService.getDistricts(Number(value));
    setDistricts(data);
  };

  // Chọn Huyện -> Load Xã
  const handleDistrictChange = async (value: string) => {
    const district = districts.find(d => String(d.code) === value);
    if (!district) return;

    setSelectedDistrictCode(value);
    setSelectedWardCode('');
    setWards([]);
    
    // Cập nhật form text
    setFormData(prev => ({ ...prev, district: district.name, ward: '' }));

    // Load Xã
    const data = await locationService.getWards(Number(value));
    setWards(data);
  };

  // Chọn Xã
  const handleWardChange = (value: string) => {
    const ward = wards.find(w => String(w.code) === value);
    if (!ward) return;

    setSelectedWardCode(value);
    // Cập nhật form text
    setFormData(prev => ({ ...prev, ward: ward.name }));
  };

  // ------------------------

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const calculateSubtotal = () => {
    return order.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shipping = 0; 
    const tax = subtotal * 0.1; 
    return subtotal + shipping + tax;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // --- KIỂM TRA VALIDATION CHO BƯỚC 2 ---
    if (step === 2) {
      if (!selectedProvinceCode) {
        toast.error("Vui lòng chọn Tỉnh/Thành phố.");
        return;
      }
      if (!selectedDistrictCode) {
        toast.error("Vui lòng chọn Quận/Huyện.");
        return;
      }
      if (!selectedWardCode) {
        toast.error("Vui lòng chọn Phường/Xã.");
        return;
      }
      if (!formData.address.trim()) {
        toast.error("Vui lòng nhập địa chỉ chi tiết.");
        return;
      }
    }
    // ----------------------------------------

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
    <div className="min-h-screen bg-gray-50 mt-2 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1 text-l text-gray-500 hover:text-gray-900 cursor-pointer w-fit transition-colors mb-6 text-xl hover:text-red-700" >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại danh sách xe
                  </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Thanh toán đơn hàng</h1>

        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 sm:space-x-8">
            {steps.map((stepItem, index) => (
              <div key={stepItem.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                  stepItem.completed ? 'bg-green-600 border-green-600 text-white' :
                  step === stepItem.id ? 'border-red-600 text-red-600 bg-white' :
                  'border-gray-300 text-gray-300 bg-white'
                }`}>
                  {stepItem.completed ? <CheckCircle className="w-5 h-5" /> : stepItem.id}
                </div>
                <span className={`ml-2 font-medium text-sm sm:text-base ${step >= stepItem.id ? 'text-gray-900' : 'text-gray-400'}`}>
                  {stepItem.name}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-12 sm:w-20 h-0.5 mx-2 sm:mx-4 transition-colors ${stepItem.completed ? 'bg-green-600' : 'bg-gray-300'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              {/* STEP 1: PERSONAL INFO */}
              {step === 1 && (
                <Card>
                  <CardHeader><CardTitle className='font-semibold'>Thông tin cá nhân</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Họ và tên <span className="text-red-500">*</span></Label>
                        <Input id="fullName" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required placeholder="Nguyễn Văn A" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Số điện thoại <span className="text-red-500">*</span></Label>
                        <Input id="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required placeholder="09xx xxx xxx" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                      <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required placeholder="example@gmail.com" />
                    </div>
                    <Button type="submit" className="w-full h-11 text-base mt-2">Tiếp tục: Địa chỉ giao hàng</Button>
                  </CardContent>
                </Card>
              )}

              {/* STEP 2: ADDRESS INFO (3 Cấp: Tỉnh -> Huyện -> Xã) */}
              {step === 2 && (
                <Card>
                  <CardHeader><CardTitle className='font-semibold'>Địa chỉ giao hàng</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    
                    {/* Chọn Tỉnh */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Tỉnh / Thành phố <span className="text-red-500">*</span></Label>
                            <Select 
                                value={selectedProvinceCode} 
                                onValueChange={handleProvinceChange}
                                required // Thêm thuộc tính required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn Tỉnh/Thành" />
                                </SelectTrigger>
                                <SelectContent>
                                    {provinces.map((p) => (
                                        <SelectItem key={p.code} value={String(p.code)}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        {/* Chọn Huyện */}
                        <div className="space-y-2">
                            <Label>Quận / Huyện <span className="text-red-500">*</span></Label>
                            <Select 
                                value={selectedDistrictCode} 
                                onValueChange={handleDistrictChange} 
                                disabled={!selectedProvinceCode}
                                required // Thêm thuộc tính required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn Quận/Huyện" />
                                </SelectTrigger>
                                <SelectContent>
                                    {districts.map((d) => (
                                        <SelectItem key={d.code} value={String(d.code)}>{d.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Chọn Xã */}
                        <div className="space-y-2">
                            <Label>Phường / Xã <span className="text-red-500">*</span></Label>
                            <Select 
                                value={selectedWardCode} 
                                onValueChange={handleWardChange} 
                                disabled={!selectedDistrictCode}
                                required // Thêm thuộc tính required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn Phường/Xã" />
                                </SelectTrigger>
                                <SelectContent>
                                    {wards.map((w) => (
                                        <SelectItem key={w.code} value={String(w.code)}>{w.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Địa chỉ chi tiết (Số nhà, tên đường) <span className="text-red-500">*</span></Label>
                      <Input 
                        id="address" 
                        value={formData.address} 
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })} 
                        placeholder="VD: Số 123 Đường Nguyễn Huệ" 
                        required 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Ghi chú giao hàng</Label>
                      <Textarea id="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Ghi chú thêm về thời gian giao hàng..." className="min-h-[100px]" />
                    </div>

                    <div className="flex space-x-4 pt-2">
                      <Button type="button" variant="outline" onClick={() => setStep(1)} className="h-11 w-1/3">Quay lại</Button>
                      <Button type="submit" className="flex-1 h-11">Tiếp tục: Thanh toán</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* STEP 3: PAYMENT INFO */}
              {step === 3 && (
                <Card>
                  <CardHeader><CardTitle className='font-semibold'>Phương thức thanh toán</CardTitle></CardHeader>
                  <CardContent className="space-y-6">
                    <RadioGroup value={formData.paymentMethod} onValueChange={(value) => setFormData({ ...formData, paymentMethod: value as PaymentMethod })} className="space-y-3">
                      {paymentMethods.map((method) => {
                        const IconComponent = method.icon;
                        return (
                          <div key={method.id} className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all ${formData.paymentMethod === method.id ? 'border-black bg-gray-50 ring-1 ring-black' : 'hover:bg-gray-50'}`}>
                            <RadioGroupItem value={method.id} id={method.id} />
                            <IconComponent className="w-5 h-5 text-gray-600" />
                            <div className="flex-1">
                              <Label htmlFor={method.id} className="font-medium cursor-pointer block">{method.name}</Label>
                              <p className="text-xs text-gray-500 mt-0.5">{method.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </RadioGroup>
                    <div className="flex space-x-4 pt-2">
                      <Button type="button" variant="outline" onClick={() => setStep(2)} className="h-11 w-1/3">Quay lại</Button>
                      <Button type="submit" className="flex-1 h-11 bg-red-600 hover:bg-red-700 text-white" disabled={loading}>
                        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Đang xử lý...</> : 'HOÀN TẤT ĐẶT HÀNG'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </form>
          </div>

          {/* RIGHT COLUMN: ORDER SUMMARY */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 shadow-sm border-none bg-white ring-1 ring-gray-200">
              <CardHeader className="bg-gray-50/50 border-b pb-4"><CardTitle className="text-lg">Đơn hàng của bạn</CardTitle></CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                  {order.map((item) => (
                    <div key={`${item.id}-${item.selectedColor}`} className="flex gap-3">
                      <div className="w-16 h-12 overflow-hidden rounded border flex-shrink-0">
                        <ImageWithFallback src={item.image} alt={`${item.make} ${item.model}`} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-gray-900 truncate" title={`${item.make} ${item.model}`}>{item.make} {item.model} {item.year}</h4>
                        <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                          {/* ✅ [2] Sử dụng getColorName để hiển thị tiếng Việt */}
                          <span>{getColorName(item.selectedColor)}</span>
                          <span>x{item.quantity}</span>
                        </div>
                        <div className="text-red-600 font-medium text-sm mt-1">{formatPrice(item.price * item.quantity)}</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600"><span>Tạm tính:</span><span>{formatPrice(calculateSubtotal())}</span></div>
                  <div className="flex justify-between text-gray-600"><span>Phí vận chuyển:</span><span className="text-green-600 font-medium">Miễn phí</span></div>
                  <div className="flex justify-between text-gray-600"><span>VAT (10%):</span><span>{formatPrice(calculateSubtotal() * 0.1)}</span></div>
                </div>
                
                <Separator />

                <div className="flex justify-between text-lg font-bold items-center">
                  <span>Tổng cộng:</span>
                  <span className="text-red-600 text-xl">{formatPrice(calculateTotal())}</span>
                </div>
                
                <div className="bg-yellow-50 p-3 rounded border border-yellow-100 text-xs text-yellow-800">
                    <p className="font-semibold mb-1">Lưu ý:</p>
                    Sau khi đặt hàng, nhân viên sẽ liên hệ xác nhận thông tin chi tiết trong vòng 24h.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import orderService, { OrderUpdateRequest } from '@/services/orderService';
import locationService, { LocationOption } from '@/services/locationService';

export default function OrderEditPage() {
    const navigate = useNavigate();
    const { orderId } = useParams();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    // Form Data
    const [formData, setFormData] = useState<OrderUpdateRequest>({
        fullName: '', email: '', phone: '', address: '',
        city: '', district: '', ward: '', note: '',
        shippingFee: 0, tax: 0,
    });

    // Location Data Lists
    const [provinces, setProvinces] = useState<LocationOption[]>([]);
    const [districts, setDistricts] = useState<LocationOption[]>([]);
    const [wards, setWards] = useState<LocationOption[]>([]);

    // Selected Codes (Dùng để điều khiển UI)
    const [selectedProvinceCode, setSelectedProvinceCode] = useState<string>('');
    const [selectedDistrictCode, setSelectedDistrictCode] = useState<string>('');
    const [selectedWardCode, setSelectedWardCode] = useState<string>('');

    // --- 1. INIT DATA & PRE-FILL ---
    useEffect(() => {
        const initData = async () => {
            if (!orderId) return;
            try {
                // Load thông tin đơn hàng và danh sách tỉnh
                const [orderData, provinceList] = await Promise.all([
                    orderService.getOrderById(orderId),
                    locationService.getProvinces()
                ]);

                setProvinces(provinceList);
                
                // Set dữ liệu vào form
                setFormData({
                    fullName: orderData.fullName,
                    email: orderData.email,
                    phone: orderData.phone,
                    address: orderData.address,
                    city: orderData.city,
                    district: orderData.district,
                    ward: orderData.ward,
                    note: orderData.note || '',
                    shippingFee: orderData.shippingFee,
                    tax: orderData.tax,
                });

                // --- LOGIC TỰ ĐỘNG ĐIỀN ĐỊA CHỈ (PRE-FILL) ---
                
                // 1. Tìm Tỉnh
                const foundProvince = provinceList.find(p => 
                    p.name === orderData.city || orderData.city.includes(p.name) || p.name.includes(orderData.city)
                );

                if (foundProvince) {
                    const pCode = String(foundProvince.code);
                    setSelectedProvinceCode(pCode);
                    
                    // 2. Load Huyện của Tỉnh đó
                    const districtList = await locationService.getDistricts(Number(pCode));
                    setDistricts(districtList);

                    // 3. Tìm Huyện
                    const foundDistrict = districtList.find(d => 
                        d.name === orderData.district || orderData.district.includes(d.name) || d.name.includes(orderData.district)
                    );

                    if (foundDistrict) {
                        const dCode = String(foundDistrict.code);
                        setSelectedDistrictCode(dCode);

                        // 4. Load Xã của Huyện đó
                        const wardList = await locationService.getWards(Number(dCode));
                        setWards(wardList);

                        // 5. Tìm Xã
                        const foundWard = wardList.find(w => 
                            w.name === orderData.ward || orderData.ward.includes(w.name) || w.name.includes(orderData.ward)
                        );
                        
                        if (foundWard) {
                            setSelectedWardCode(String(foundWard.code));
                        }
                    }
                }

            } catch (error) {
                toast.error('Lỗi tải dữ liệu');
                navigate('/admin/orders');
            } finally {
                setFetching(false);
            }
        };

        initData();
    }, [orderId, navigate]);

    // --- HANDLERS ---

    const handleProvinceChange = async (value: string) => {
        const province = provinces.find(p => String(p.code) === value);
        if (!province) return;

        setSelectedProvinceCode(value);
        // Reset cấp con
        setSelectedDistrictCode('');
        setSelectedWardCode('');
        setDistricts([]);
        setWards([]);
        
        // Update Form Text
        setFormData(prev => ({ ...prev, city: province.name, district: '', ward: '' }));

        // Load Districts
        const data = await locationService.getDistricts(Number(value));
        setDistricts(data);
    };

    const handleDistrictChange = async (value: string) => {
        const district = districts.find(d => String(d.code) === value);
        if (!district) return;

        setSelectedDistrictCode(value);
        // Reset cấp con
        setSelectedWardCode('');
        setWards([]);

        // Update Form Text
        setFormData(prev => ({ ...prev, district: district.name, ward: '' }));

        // Load Wards
        const data = await locationService.getWards(Number(value));
        setWards(data);
    };

    const handleWardChange = (value: string) => {
        const ward = wards.find(w => String(w.code) === value);
        if (!ward) return;

        setSelectedWardCode(value);
        // Update Form Text
        setFormData(prev => ({ ...prev, ward: ward.name }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await orderService.updateOrder(orderId!, formData);
            toast.success('Cập nhật đơn hàng thành công');
            navigate(`/admin/orders/view/${orderId}`);
        } catch (error: any) {
            toast.error(error.message || 'Lỗi cập nhật');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-10 py-4 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-start gap-4">
                <div 
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 cursor-pointer transition-colors" 
                    onClick={() => navigate('/admin/orders')}
                >
                    <ArrowLeft className="h-4 w-4" /> 
                    <span>Quay lại danh sách đơn hàng</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-4">
                    Chỉnh sửa đơn hàng <span className="text-gray-400 text-xl font-normal">#{orderId?.substring(0, 8)}</span>
                </h1>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* LEFT COLUMN (2/3): Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader className="border-b bg-gray-50/50">
                                <CardTitle className="text-lg font-semibold">Thông tin giao hàng</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-5 pt-6">
                                <div className="space-y-2">
                                    <Label>Họ tên người nhận <span className="text-red-500">*</span></Label>
                                    <Input value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} required />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <Label>Email <span className="text-red-500">*</span></Label>
                                        <Input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Số điện thoại <span className="text-red-500">*</span></Label>
                                        <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
                                    </div>
                                </div>

                                {/* === KHU VỰC CHỌN ĐỊA CHỈ (3 CẤP) === */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    
                                    {/* TỈNH / THÀNH */}
                                    <div className="space-y-2">
                                        <Label>Tỉnh / Thành phố <span className="text-red-500">*</span></Label>
                                        <Select value={selectedProvinceCode} onValueChange={handleProvinceChange}>
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
                                    
                                    {/* QUẬN / HUYỆN */}
                                    <div className="space-y-2">
                                        <Label>Quận / Huyện <span className="text-red-500">*</span></Label>
                                        <Select value={selectedDistrictCode} onValueChange={handleDistrictChange} disabled={!selectedProvinceCode}>
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

                                    {/* PHƯỜNG / XÃ */}
                                    <div className="space-y-2">
                                        <Label>Phường / Xã <span className="text-red-500">*</span></Label>
                                        <Select value={selectedWardCode} onValueChange={handleWardChange} disabled={!selectedDistrictCode}>
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
                                    <Label>Địa chỉ chi tiết <span className="text-red-500">*</span></Label>
                                    <Input 
                                        value={formData.address} 
                                        onChange={e => setFormData({...formData, address: e.target.value})} 
                                        required 
                                        placeholder="Ví dụ: Số 123 Đường ABC"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Ghi chú đơn hàng</Label>
                                    <Textarea 
                                        value={formData.note} 
                                        onChange={e => setFormData({...formData, note: e.target.value})} 
                                        className="min-h-[100px]"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* RIGHT COLUMN (1/3): Financials & Actions */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader className="border-b bg-gray-50/50">
                                <CardTitle className="text-lg font-semibold">Chi phí phát sinh</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-5 pt-6">
                                <div className="space-y-2">
                                    <Label>Phí vận chuyển (VND)</Label>
                                    <Input 
                                        type="number" 
                                        min="0"
                                        value={formData.shippingFee} 
                                        onChange={e => setFormData({...formData, shippingFee: Number(e.target.value)})} 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Thuế VAT (VND)</Label>
                                    <Input 
                                        type="number" 
                                        min="0"
                                        value={formData.tax} 
                                        onChange={e => setFormData({...formData, tax: Number(e.target.value)})} 
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex flex-col gap-3">
                            <Button 
                                type="submit" 
                                disabled={loading} 
                                className="w-full bg-black hover:bg-gray-800 text-white h-11"
                            >
                                {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />} 
                                Lưu thay đổi
                            </Button>
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => navigate(`/admin/orders/view/${orderId}`)}
                                className="w-full h-11"
                            >
                                Hủy bỏ
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import carService, { CarRequest, Brand, Category, Color } from '@/services/carService';

interface CarFormPageProps {
    mode: 'create' | 'edit';
}

export default function CarFormPage({ mode }: CarFormPageProps) {
    const navigate = useNavigate();
    const { carId } = useParams();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(mode === 'edit');

    const [formData, setFormData] = useState<CarRequest>({
        brand: Brand.TOYOTA,
        category: Category.SUV,
        model: '',
        manufactureYear: new Date().getFullYear(),
        price: 0,
        description: '',
        quantity: 1,
        colors: [Color.BLACK],
        detail: {
            engine: '', horsepower: 0, torque: 0, transmission: '',
            fuelType: '', fuelConsumption: 0, seats: 5, weight: 0, 
            dimensions: '' // Đã có trường dimensions
        }
    });

    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    useEffect(() => {
        if (mode === 'edit' && carId) {
            const fetchCar = async () => {
                try {
                    const car = await carService.getCarById(Number(carId));
                    setFormData({
                        brand: car.brand,
                        category: car.category,
                        model: car.model,
                        manufactureYear: car.manufactureYear,
                        price: car.price,
                        description: car.description,
                        quantity: car.quantity,
                        colors: car.colors || [],
                        detail: car.detail || { engine: '', horsepower: 0, torque: 0, transmission: '', fuelType: '', fuelConsumption: 0, seats: 0, weight: 0, dimensions: '' }
                    });
                    setImagePreviews(car.imageUrls || []);
                } catch (error) {
                    toast.error('Không tìm thấy xe');
                    navigate('/admin/cars');
                } finally {
                    setFetching(false);
                }
            };
            fetchCar();
        }
    }, [mode, carId, navigate]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            setImageFiles(prev => [...prev, ...newFiles]);
            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setImagePreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        const newPreviews = [...imagePreviews];
        newPreviews.splice(index, 1);
        setImagePreviews(newPreviews);
        
        const existingImagesCount = imagePreviews.length - imageFiles.length;
        if (index >= existingImagesCount) {
             const fileIndex = index - existingImagesCount;
             const newFiles = [...imageFiles];
             newFiles.splice(fileIndex, 1);
             setImageFiles(newFiles);
        }
    };

    const handleColorToggle = (color: Color) => {
        setFormData(prev => {
            const newColors = prev.colors.includes(color)
                ? prev.colors.filter(c => c !== color)
                : [...prev.colors, color];
            return { ...prev, colors: newColors };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.model.trim()) return toast.error('Tên xe không được trống');
        
        setLoading(true);
        try {
            const payload: CarRequest = { ...formData, imageFiles };
            if (mode === 'create') {
                await carService.createCar(payload);
                toast.success('Thêm xe thành công');
            } else {
                await carService.updateCar(Number(carId), payload);
                toast.success('Cập nhật thành công');
            }
            navigate('/admin/cars');
        } catch (error: any) {
            toast.error(error.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>;

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-10 py-4 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex flex-col space-y-2">
                <div className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 cursor-pointer w-fit transition-colors" onClick={() => navigate('/admin/cars')}>
                    <ArrowLeft className="h-4 w-4" /> <span>Quay lại danh sách xe</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">{mode === 'create' ? 'Thêm mới xe' : 'Chỉnh sửa thông tin xe'}</h1>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* LEFT COLUMN: BASIC INFO (8/12) */}
                    <div className="lg:col-span-8 space-y-6">
                        <Card>
                            <CardHeader><CardTitle className="text-lg">Thông tin cơ bản</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Hãng xe</Label>
                                        <Select value={formData.brand} onValueChange={(v: Brand) => setFormData({...formData, brand: v})}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>{Object.values(Brand).map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Loại xe</Label>
                                        <Select value={formData.category} onValueChange={(v: Category) => setFormData({...formData, category: v})}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>{Object.values(Category).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Tên mẫu xe (Model) <span className="text-red-500">*</span></Label>
                                    <Input value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} placeholder="VD: Camry 2.5Q" required />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Giá niêm yết (VND)</Label>
                                        <Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} min="0"/>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Năm sản xuất</Label>
                                        <Input type="number" value={formData.manufactureYear} onChange={e => setFormData({...formData, manufactureYear: Number(e.target.value)})} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Số lượng nhập</Label>
                                        <Input type="number" value={formData.quantity} onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} min="0" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Mô tả</Label>
                                    <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} placeholder='VD: Xe Toyota Vios 1.5E MT (Máy xăng) chính chủ.' />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle className="text-lg">Thông số kỹ thuật</CardTitle></CardHeader>
                            <CardContent className="space-y-4 bg-slate-50/50">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Động cơ</Label>
                                        <Input value={formData.detail.engine} onChange={e => setFormData({...formData, detail: {...formData.detail, engine: e.target.value}})} placeholder='VD: 2NR-FE 1.5L'/>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Hộp số</Label>
                                        <Input value={formData.detail.transmission} onChange={e => setFormData({...formData, detail: {...formData.detail, transmission: e.target.value}})} placeholder='VD: Số sàn 5 cấp'/>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Nhiên liệu</Label>
                                        <Input value={formData.detail.fuelType} onChange={e => setFormData({...formData, detail: {...formData.detail, fuelType: e.target.value}})} placeholder='VD: Xăng'/>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Công suất (HP)</Label>
                                        <Input type="number" value={formData.detail.horsepower} onChange={e => setFormData({...formData, detail: {...formData.detail, horsepower: Number(e.target.value)}})}/>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Momen (Nm)</Label>
                                        <Input type="number" value={formData.detail.torque} onChange={e => setFormData({...formData, detail: {...formData.detail, torque: Number(e.target.value)}})} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Tiêu thụ (L/100km)</Label>
                                        <Input type="number" step="0.1" value={formData.detail.fuelConsumption} onChange={e => setFormData({...formData, detail: {...formData.detail, fuelConsumption: Number(e.target.value)}})} />
                                    </div>
                                    
                                    {/* Hàng mới: Kích thước + Số chỗ + Trọng lượng */}
                                    <div className="space-y-2">
                                        <Label>Kích thước (DxRxC)</Label>
                                        <Input 
                                            value={formData.detail.dimensions} 
                                            onChange={e => setFormData({...formData, detail: {...formData.detail, dimensions: e.target.value}})} 
                                            placeholder="4900x1800x1450"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Số chỗ ngồi</Label>
                                        <Input type="number" value={formData.detail.seats} onChange={e => setFormData({...formData, detail: {...formData.detail, seats: Number(e.target.value)}})} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Trọng lượng (kg)</Label>
                                        <Input type="number" value={formData.detail.weight} onChange={e => setFormData({...formData, detail: {...formData.detail, weight: Number(e.target.value)}})} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* RIGHT COLUMN: IMAGES & COLORS (4/12) */}
                    <div className="lg:col-span-4 space-y-6">
                        <Card>
                            <CardHeader><CardTitle className="text-base">Hình ảnh xe</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex flex-wrap gap-3">
                                    {imagePreviews.map((src, idx) => (
                                        <div key={idx} className="relative w-26 h-22 group border rounded-md overflow-hidden bg-gray-100 shadow-sm transition-all hover:ring-2 hover:ring-offset-1 hover:ring-blue-500">
                                            <img src={src} className="w-17 h-16" alt="preview" />
                                            
                                            {/* 
                                                FIXED: Nút Xoá ảnh luôn hiển thị (hoặc dễ thấy hơn)
                                                - Đã thêm background trắng mờ để nổi bật
                                                - Loại bỏ opacity-0 để luôn nhìn thấy, hoặc giữ group-hover tùy ý bạn.
                                                - Ở đây tôi để luôn hiển thị cho dễ thao tác.
                                            */}
                                            <button 
                                                type="button" 
                                                onClick={() => removeImage(idx)} 
                                                className="cursor-pointer absolute top-2 right-3 bg-white/90 text-gray-600 w-6 h-6 flex items-center justify-center rounded-full shadow-md hover:bg-red-600 hover:text-red-600 transition-all z-10"
                                                title="Xoá ảnh này"
                                            >
                                                <X className="w-4 h-4 stroke-[2.5]" />
                                            </button>
                                        </div>
                                    ))}
                                    
                                    <label className="flex flex-col items-center justify-center w-27 h-26 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 hover:border-gray-400 transition-colors bg-white">
                                        <Upload className="w-2.5 h-2.5 text-gray-400 mt-1" />
                                        <span className="text-[3px] text-gray-500 font-medium">Thêm ảnh</span>
                                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                                    </label>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Hỗ trợ JPG, PNG. Ảnh đầu tiên sẽ là ảnh đại diện.</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle className="text-base">Màu sắc có sẵn</CardTitle></CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-3">
                                    {Object.values(Color).map(color => (
                                        <div key={color} className="flex items-center space-x-2">
                                            <Checkbox id={`c-${color}`} checked={formData.colors.includes(color)} onCheckedChange={() => handleColorToggle(color)} />
                                            <Label htmlFor={`c-${color}`} className="cursor-pointer text-sm">{color}</Label>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => navigate('/admin/cars')}>Hủy bỏ</Button>
                            <Button type="submit" disabled={loading} className="bg-black text-white hover:bg-gray-800">
                                {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                                {mode === 'create' ? 'Tạo mới' : 'Lưu thay đổi'}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
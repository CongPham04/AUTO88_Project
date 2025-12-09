import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Activity,
  Database,
  Truck,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Info,
  Calendar,
  Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import carService, { CarResponse } from '@/services/carService';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

export default function CarDetailPage() {
  const { carId } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState<CarResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Slider State
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (!carId) return;
    setLoading(true);
    carService
      .getCarById(Number(carId))
      .then((data) => {
        setCar(data);
        if (data.imageUrls && data.imageUrls.length > 0) setImages(data.imageUrls);
        else if (data.imageUrl) setImages([data.imageUrl]);
      })
      .catch(() => navigate('/admin/cars'))
      .finally(() => setLoading(false));
  }, [carId, navigate]);

  const nextImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const prevImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  if (loading)
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
      </div>
    );

  if (!car) return <div className="text-center py-20">Không tìm thấy thông tin xe.</div>;

  const getStatusBadgeColor = (status: string) => (status === 'AVAILABLE' ? 'bg-green-600' : 'bg-red-600');
  const getStatusText = (status: string) => (status === 'AVAILABLE' ? 'Còn xe' : 'Hết xe');

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10 py-4 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <div
          className="flex items-center gap-1 text-l text-gray-500 hover:text-gray-900 cursor-pointer w-fit transition-colors"
          onClick={() => navigate('/admin/cars')}
        >
          <ArrowLeft className="h-4 w-4" /> <span>Quay lại danh sách</span>
        </div>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Xem chi tiết xe #{car.carId}</h1>
          <Button onClick={() => navigate(`/admin/cars/edit/${car.carId}`)} className="bg-black text-white hover:bg-gray-800">
            <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
          </Button>
        </div>
      </div>

      {/* Top Row: Image (left) + Basic Info (right) */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Image Column (left) */}
        <div className="w-full lg:w-1/2 flex flex-col gap-3">
          <div className="relative w-full rounded-lg overflow-hidden bg-black aspect-[4/3] flex items-center justify-center">
            {images.length > 0 ? (
              <>
                <ImageWithFallback src={images[currentImageIndex]} alt={car.model} className="w-full h-full object-contain" />

                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        prevImage();
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition opacity-0 group-hover:opacity-100"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        nextImage();
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition opacity-0 group-hover:opacity-100"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>

                    <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center text-gray-500 gap-2">
                <Info className="w-10 h-10" /> <span>Chưa có ảnh</span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`relative w-20 h-14 flex-shrink-0 rounded overflow-hidden border-2 transition-all ${
                    idx === currentImageIndex ? 'border-red-600 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Basic Info Column (right) */}
        <div className="w-full lg:w-1/2">
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-6 space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                  {car.model} {car.manufactureYear}
                </h2>
                <p className="text-sm text-gray-500 mt-1 uppercase tracking-wide font-medium">
                  {car.brand} • {car.category}
                </p>
              </div>

              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-red-600">{formatPrice(car.price)}</span>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <InfoItem icon={<Calendar className="w-4 h-4 text-blue-500" />} label="Năm SX" value={car.manufactureYear} />
                <InfoItem icon={<Activity className="w-4 h-4 text-green-500" />} label="Tình trạng" value={getStatusText(car.status)} />
                <InfoItem icon={<Truck className="w-4 h-4 text-orange-500" />} label="Hộp số" value={car.detail?.transmission || 'Tự động'} />
                <InfoItem icon={<Database className="w-4 h-4 text-purple-500" />} label="Nhiên liệu" value={car.detail?.fuelType || 'Xăng'} />
              </div>

              <Separator />

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 font-medium">Kho hàng</span>
                  <Badge className={`${getStatusBadgeColor(car.status)} text-white shadow-none hover:opacity-90`}>
                    {getStatusText(car.status)}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Tồn kho: <span className="font-bold text-gray-900">{car.quantity}</span>
                  </span>
                  <span className="text-gray-500">
                    Đã bán: <span className="font-bold text-gray-900">{car.soldQuantity}</span>
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                  <Palette className="w-4 h-4 text-gray-500" />
                  <span>Màu sắc sẵn có</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {car.colors && car.colors.length > 0 ? (
                    car.colors.map((color) => (
                      <Badge key={color} variant="outline" className="px-3 py-1 bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
                        {color}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400 italic">Chưa cập nhật thông tin màu sắc</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* BELOW: Specs + Description span full width */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="border-none shadow-sm">
          <CardHeader className="border-b bg-gray-50/50">
            <CardTitle className="text-base font-semibold">Thông số kỹ thuật</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              <SpecRow label="Động cơ" value={car.detail?.engine} />
              <SpecRow label="Công suất" value={car.detail?.horsepower ? `${car.detail.horsepower} HP` : null} />
              <SpecRow label="Momen xoắn" value={car.detail?.torque ? `${car.detail.torque} Nm` : null} />
              <SpecRow label="Tiêu thụ nhiên liệu" value={car.detail?.fuelConsumption ? `${car.detail.fuelConsumption} L/100km` : null} />
              <SpecRow label="Kích thước" value={car.detail?.dimensions} />
              <SpecRow label="Số chỗ ngồi" value={car.detail?.seats} />
              <SpecRow label="Trọng lượng" value={car.detail?.weight ? `${car.detail.weight} kg` : null} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="border-b bg-gray-50/50">
            <CardTitle className="text-lg">Mô tả chi tiết</CardTitle>
          </CardHeader>
          <CardContent className="pr-6">
            <div className="text-gray-700 text-sm font-semibold">
              {car.description || <span className="text-gray-400 italic">Người bán chưa nhập mô tả cho xe này.</span>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// InfoItem component
function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number | undefined }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-gray-900">{value as any}</p>
      </div>
    </div>
  );
}

// SpecRow component
function SpecRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex justify-between py-3 px-6 hover:bg-gray-50 transition-colors">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value ?? '---'}</span>
    </div>
  );
}

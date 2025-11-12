import { useState, useEffect } from 'react';
// [SỬA ĐỔI] Thêm useLocation
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Share2, Heart, CreditCard, GitCompare, Star, Check, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
// [THÊM MỚI] Import các component Dialog
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { CarCard } from '@/components/CarCard';
import { useOrderStore } from '@/store/orderStore';
import { useCompareStore } from '@/store/compareStore';
import { toast } from 'sonner';
import carService, { CarResponse, CarDetailResponse } from '@/services/carService';
import { Skeleton } from '@/components/ui/skeleton';

// Skeleton cho thẻ xe liên quan
const SkeletonCarCard = () => (
  <Card className="overflow-hidden">
    <Skeleton className="h-48 w-full" />
    <CardContent className="p-4 space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-9 w-full" />
    </CardContent>
  </Card>
);

// Skeleton cho toàn bộ nội dung trang chi tiết
const CarDetailSkeleton = () => (
  <div className="animate-pulse">
    {/* Main Content Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* Image skeleton */}
      <div className="space-y-4">
        <Skeleton className="w-full h-[400px] rounded-lg" />
      </div>
      {/* Details skeleton */}
      <div className="space-y-6">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-12 w-1/2" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-10 w-full" />
        <div className="flex flex-col sm:flex-row gap-3">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>
    </div>
    {/* Tabs Skeleton */}
    <div className="mb-8">
      <Skeleton className="h-10 w-full mb-2" />
      <Skeleton className="h-48 w-full" />
    </div>
    {/* Related Cars Skeleton */}
    <div>
      <Skeleton className="h-8 w-1/4 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SkeletonCarCard />
        <SkeletonCarCard />
        <SkeletonCarCard />
        <SkeletonCarCard />
      </div>
    </div>
  </div>
);


export default function CarDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // [THÊM MỚI] Lấy vị trí (location) hiện tại
  const addToOrder = useOrderStore((s) => s.addToOrder);
  const clearOrder = useOrderStore((s) => s.clearOrder);
  const { addToCompare, compareList } = useCompareStore();

  const [car, setCar] = useState<CarResponse | null>(null);
  const [carDetail, setCarDetail] = useState<CarDetailResponse | null>(null);
  const [relatedCars, setRelatedCars] = useState<CarResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchCarData = async () => {
      if (id) {
        try {
          setLoading(true);
          setError(null); // Reset lỗi
          const carId = parseInt(id, 10);

          // Fetch car and car details in parallel
          const [carData, carDetailData] = await Promise.all([
            carService.getCarById(carId),
            carService.getCarDetailByCarId(carId)
          ]);

          setCar(carData);
          setCarDetail(carDetailData);
          setSelectedColor(carData.color);

          // Fetch related cars
          const allCars = await carService.getAllCars();
          const related = allCars
            .filter(c => c.carId !== carId)
            .filter(c => c.brand === carData.brand || c.category === carData.category)
            .slice(0, 4);
          setRelatedCars(related);

        } catch (err) {
          setError('Không tải được chi tiết xe. Vui lòng thử lại.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCarData();
  }, [id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleAddToCompare = (carId: number) => {
    const success = addToCompare(carId);
    if (success) {
      toast.success('Đã thêm xe vào danh sách so sánh');
    } else {
      toast.error('Chỉ có thể so sánh tối đa 3 xe');
    }
  };

  const handleBuyNow = () => {
    if (!car) return;
    const orderData = {
      id: car.carId,
      selectedColor: selectedColor || car.color,
      quantity,
      price: car.price,
      image: car.imageUrl,
      make: car.brand,
      model: car.model,
      year: car.manufactureYear,
      stockCount: 10, // Assuming a default stock count
      condition: car.status,
    };
    const token = localStorage.getItem('token');
    if (!token) {
      localStorage.setItem('pendingOrder', JSON.stringify(orderData));
      toast.warning('Vui lòng đăng nhập để tiếp tục mua hàng!');
      
      // [SỬA ĐỔI] Thêm state: { backgroundLocation: location }
      // Điều này sẽ báo cho router mở modal LÊN TRÊN trang hiện tại
      navigate('/auth?redirect=checkout', { state: { backgroundLocation: location } });
      return;
    }
    clearOrder();
    addToOrder(orderData);
    navigate('/order/checkout');
  };

  const handleViewDetails = (carId: number) => {
    navigate(`/cars/${carId}`);
  };

  // [THÊM MỚI] Hàm xử lý submit form liên hệ (Giả lập)
  const handleContactSubmit = () => {
    // Thêm logic gửi form ở đây
    toast.success("Đã gửi liên hệ, chúng tôi sẽ gọi lại cho bạn sớm!");
    // Dialog sẽ tự đóng khi bấm nút "Gửi liên hệ" (nhờ <DialogClose>)
  };


  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Button
          variant="ghost"
          onClick={() => navigate('/cars')}
          className="mb-6 cursor-pointer hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại danh sách
        </Button>

        {loading ? (
          <CarDetailSkeleton />
        ) : error || !car ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
            <p className="text-lg text-red-600 mb-4">{error || 'Không tìm thấy xe bạn yêu cầu.'}</p>
            <Button variant="outline" onClick={() => navigate('/cars')}>
              Quay lại danh sách
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Image gallery */}
              <div className="space-y-4">
                <div className="overflow-hidden rounded-lg bg-gray-100 border h-[400px] flex items-center justify-center">
                  <ImageWithFallback
                    src={car.imageUrl}
                    alt={`${car.brand} ${car.model}`}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Car details */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">
                        {car.brand} {car.model} {car.manufactureYear}
                      </h1>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                          <span className="ml-2 text-sm text-gray-600">(127 đánh giá)</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {car.status === 'AVAILABLE' && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Còn hàng
                      </Badge>
                    )}
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="text-3xl font-bold text-red-600 mb-2">
                      {formatPrice(car.price)}
                    </div>
                  </div>

                  {/* Quick specs */}
                  {carDetail && (
                    <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-100 rounded-lg">
                      <div>
                        <span className="text-gray-600">Năm:</span>
                        <span className="ml-2 font-medium">{car.manufactureYear}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Hộp số:</span>
                        <span className="ml-2 font-medium">{carDetail.transmission}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Nhiên liệu:</span>
                        <span className="ml-2 font-medium">{carDetail.fuelType}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Số chỗ:</span>
                        <span className="ml-2 font-medium">{carDetail.seats} chỗ</span>
                      </div>
                    </div>
                  )}

                  {/* Color selection */}
                  <div className="mb-6">
                    <Label className="block mb-3">Màu sắc:</Label>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        key={car.color}
                        variant={selectedColor === car.color ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedColor(car.color)}
                      >
                        {car.color}
                      </Button>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="mb-6">
                    <Label className="block mb-3">Số lượng:</Label>
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      >
                        -
                      </Button>
                      <span className="w-12 text-center">{quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(quantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={handleBuyNow}
                      className="flex-1 cursor-pointer hover:bg-red-700 transition-colors"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Mua Ngay
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleAddToCompare(car.carId)}
                      className="cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <GitCompare className="w-4 h-4 mr-2" />
                      So sánh
                    </Button>
                    
                    {/* (Phần Dialog Liên hệ giữ nguyên) */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          Liên hệ
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Liên hệ tư vấn</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div>
                            <Label htmlFor="contact-name">Họ và tên</Label>
                            <Input id="contact-name" placeholder="Nhập họ tên" />
                          </div>
                          <div>
                            <Label htmlFor="contact-phone">Số điện thoại</Label>
                            <Input id="contact-phone" placeholder="Nhập số điện thoại" />
                          </div>
                          <div>
                            <Label htmlFor="contact-message">Lời nhắn</Label>
                            <Textarea id="contact-message" placeholder="Nhập lời nhắn của bạn (ví dụ: tư vấn về xe...)" />
                          </div>
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button type="button" variant="outline">
                              Hủy
                            </Button>
                          </DialogClose>
                          <DialogClose asChild>
                            <Button type="button" onClick={handleContactSubmit}>
                              Gửi liên hệ
                            </Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                  </div>
                </div>
              </div>
            </div>

            {/* Detailed information tabs */}
            <div className="mb-8">
              <Tabs defaultValue="description" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger className="cursor-pointer hover:bg-gray-100 transition-colors" value="description">Mô tả</TabsTrigger>
                  <TabsTrigger className="cursor-pointer hover:bg-gray-100 transition-colors" value="specs">Thông số kỹ thuật</TabsTrigger>
                  <TabsTrigger className="cursor-pointer hover:bg-gray-100 transition-colors" value="reviews">Đánh giá</TabsTrigger>
                </TabsList>

                <TabsContent value="description">
                  <Card>
                    <CardHeader>
                      <CardTitle>Mô tả chi tiết</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 leading-relaxed">
                        {car.description}
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="specs">
                  <Card>
                    <CardHeader>
                      <CardTitle>Thông số kỹ thuật</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {carDetail ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold mb-3">Động cơ & Hiệu suất</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span>Động cơ:</span>
                                <span>{carDetail.engine}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Công suất:</span>
                                <span>{carDetail.horsepower} HP</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Mô-men xoắn:</span>
                                <span>{carDetail.torque} Nm</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Tiêu hao nhiên liệu:</span>
                                <span>{carDetail.fuelConsumption} L/100km</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-3">Kích thước & Trọng lượng</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span>Số chỗ ngồi:</span>
                                <span>{carDetail.seats} chỗ</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Trọng lượng:</span>
                                <span>{carDetail.weight} kg</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Kích thước:</span>
                                <span>{carDetail.dimensions}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p>Không có thông số kỹ thuật chi tiết.</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="reviews">
                  <Card>
                    <CardHeader>
                      <CardTitle>Đánh giá từ khách hàng</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="border-b pb-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">Nguyễn Văn A</span>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                ))}
                              </div>
                            </div>
                            <span className="text-sm text-gray-500">15/01/2024</span>
                          </div>
                          <p className="text-gray-600">
                            Xe chất lượng tốt, giao hàng nhanh. Đội ngũ tư vấn nhiệt tình. Rất hài lòng với dịch vụ của Auto 88.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Related cars */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Xe liên quan</h2>
              {relatedCars.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-h-72">
                  {relatedCars.map((relatedCar) => (
                    <CarCard
                      key={relatedCar.carId}
                      car={relatedCar}
                      onViewDetails={handleViewDetails}
                      onAddToCompare={handleAddToCompare}
                      isInCompareList={compareList.includes(relatedCar.carId)}
                      viewMode="grid"
                    />
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-8 min-h-72 flex items-center justify-center bg-gray-100 rounded-lg">
                  <p>Không có xe liên quan nào lúc này.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
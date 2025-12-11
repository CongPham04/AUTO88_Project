import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, Share2, Heart, CreditCard, GitCompare, Star, Phone, ShoppingCart,
  Loader2, ChevronLeft, ChevronRight, Info,
  // Icons cho thông số
  Activity, Truck, Fuel, Zap, Gauge, Armchair, Scale, Maximize, Settings2, Calendar, User, MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
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
import carService, { CarResponse, CarDetailResponse, Color, getColorName } from '@/services/carService';
import { Skeleton } from '@/components/ui/skeleton';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

// --- SKELETON COMPONENT ---
const CarDetailSkeleton = () => (
  <div className="animate-pulse">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <div className="space-y-4">
        <Skeleton className="w-full h-[450px] rounded-xl" />
        <div className="flex gap-2">
          <Skeleton className="w-24 h-20 rounded" />
          <Skeleton className="w-24 h-20 rounded" />
          <Skeleton className="w-24 h-20 rounded" />
        </div>
      </div>
      <div className="space-y-6">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-12 w-1/2" />
        <Skeleton className="h-24 w-full" />
        <div className="flex gap-3"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-32" /></div>
      </div>
    </div>
  </div>
);

export default function CarDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const addToOrder = useOrderStore((s) => s.addToOrder);
  const clearOrder = useOrderStore((s) => s.clearOrder);
  const { addToCompare } = useCompareStore();

  const [car, setCar] = useState<CarResponse | null>(null);
  const [carDetail, setCarDetail] = useState<CarDetailResponse | null>(null);
  const [relatedCars, setRelatedCars] = useState<CarResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  
  // State số lượng mua
  const [quantity, setQuantity] = useState<number | string>(1);

  // State quản lý ảnh
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [images, setImages] = useState<string[]>([]);

  // ========================================================================
  // ✅ [THÊM MỚI] Cập nhật Title Website theo tên xe
  // Logic: Nếu đã tải xong thông tin xe (car tồn tại) -> "Mercedes C300 2022 | Auto88"
  //        Nếu chưa tải xong -> "Chi tiết xe | Auto88"
  // ========================================================================
  const pageTitle = car ? `${car.brand} ${car.model} ${car.manufactureYear}` : 'Chi tiết xe';
  useDocumentTitle(pageTitle);
  // ========================================================================

  useEffect(() => {
    const fetchCarData = async () => {
      if (id) {
        try {
          setLoading(true);
          setError(null);
          const carId = parseInt(id, 10);

          const [carData, carDetailData] = await Promise.all([
            carService.getCarById(carId),
            carService.getCarDetailByCarId(carId)
          ]);

          setCar(carData);
          setCarDetail(carDetailData);

          // Màu mặc định
          const defaultColor = carData.colors && carData.colors.length > 0 ? carData.colors[0] : Color.BLACK;
          setSelectedColor(defaultColor);

          // Xử lý danh sách ảnh
          if (carData.imageUrls && carData.imageUrls.length > 0) {
            setImages(carData.imageUrls);
          } else if (carData.imageUrl) {
            setImages([carData.imageUrl]);
          }

          // Fetch related cars
          const allCars = await carService.getAllCars();
          const related = allCars
            .filter(c => c.carId !== carId)
            .filter(c => c.brand === carData.brand || c.category === carData.category)
            .slice(0, 4);
          setRelatedCars(related);

        } catch (err) {
          setError('Không tải được chi tiết xe.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCarData();
  }, [id]);

  // --- LOGIC SLIDER ẢNH ---
  const nextImage = useCallback(() => {
    setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  // --- LOGIC SỐ LƯỢNG MUA (Yêu cầu 1) ---
  const handleQuantityChange = (val: string) => {
    // Cho phép nhập rỗng để user xóa số cũ
    if (val === '') {
      setQuantity('');
      return;
    }
    const num = parseInt(val);
    if (!isNaN(num)) {
      setQuantity(num);
    }
  };

  const handleQuantityBlur = () => {
    // Khi focus out, validate lại số lượng
    let num = typeof quantity === 'string' ? parseInt(quantity) : quantity;
    if (isNaN(num) || num < 1) num = 1;
    if (car && num > car.quantity) num = car.quantity; // Không được mua quá tồn kho
    setQuantity(num);
  };

  const increaseQty = () => {
    const current = typeof quantity === 'string' ? parseInt(quantity) || 0 : quantity;
    if (car && current < car.quantity) setQuantity(current + 1);
  };

  const decreaseQty = () => {
    const current = typeof quantity === 'string' ? parseInt(quantity) || 0 : quantity;
    if (current > 1) setQuantity(current - 1);
  };

  // --- LOGIC MUA HÀNG ---
  const handleBuyNow = () => {
    if (!car) return;
    const finalColor = selectedColor || (car.colors && car.colors.length > 0 ? car.colors[0] : 'Mặc định');
    const finalQty = typeof quantity === 'string' ? parseInt(quantity) || 1 : quantity;

    const orderData = {
      id: car.carId,
      selectedColor: String(finalColor),
      quantity: finalQty,
      price: car.price,
      image: images[0] || '',
      make: car.brand,
      model: car.model,
      year: car.manufactureYear,
      stockCount: car.quantity,
      condition: car.status,
    };

    const token = localStorage.getItem('token');
    if (!token) {
      localStorage.setItem('pendingOrder', JSON.stringify(orderData));
      toast.warning('Vui lòng đăng nhập để mua hàng!');
      navigate('/auth?redirect=checkout', { state: { backgroundLocation: location } });
      return;
    }
    clearOrder();
    // @ts-ignore
    addToOrder(orderData);
    navigate('/order/checkout');
  };

  const handleAddToCompare = (carId: number) => {
    const success = addToCompare(carId);
    if (success) toast.success('Đã thêm vào so sánh');
    else toast.error('Danh sách so sánh đã đầy (tối đa 3)');
  };

  const handleContactSubmit = () => {
    toast.success("Đã gửi thông tin! Chúng tôi sẽ liên hệ lại sớm.");
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Back Button */}
        <div className="flex items-center gap-1 text-l text-gray-500 hover:text-gray-900 cursor-pointer w-fit transition-colors mb-3" onClick={() => navigate('/cars')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách xe
          </div>

        {loading ? (
          <CarDetailSkeleton />
        ) : error || !car ? (
          <div className="text-center py-20 text-red-600">{error || 'Xe không tồn tại.'}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              
              {/* --- LEFT: IMAGE GALLERY --- */}
              <div className="space-y-4">
                <div className="overflow-hidden rounded-xl border bg-white h-[450px] flex items-center justify-center relative group select-none">
                  <ImageWithFallback
                    src={images[selectedImageIndex]}
                    alt={`${car.brand} ${car.model}`}
                    className="w-full h-full object-contain p-2"
                  />
                  
                  {/* Điều hướng ảnh */}
                  {images.length > 1 && (
                    <>
                      <button onClick={prevImage} className="absolute left-2 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition">
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button onClick={nextImage} className="absolute right-2 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition">
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}

                  {car.status === 'SOLD' && (
                     <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-bold text-3xl uppercase border-4 border-white p-4 rotate-[-15deg]">Đã Bán Hết</span>
                     </div>
                  )}
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {images.map((img, idx) => (
                      <div 
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`w-24 h-20 flex-shrink-0 border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${selectedImageIndex === idx ? 'border-red-600 ring-2 ring-red-100' : 'border-gray-200 hover:border-gray-400'}`}
                      >
                        <ImageWithFallback src={img} alt="thumbnail" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* --- RIGHT: INFO --- */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm font-semibold text-blue-600 uppercase mb-1">{car.brand} • {car.category}</p>
                        <h1 className="text-3xl font-bold text-gray-900">{car.model}</h1>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-red-600"><Heart className="w-5 h-5" /></Button>
                        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-blue-600"><Share2 className="w-5 h-5" /></Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center"><Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1"/> 4.9 (128 đánh giá)</div>
                      <span>•</span>
                      <span>Năm SX: {car.manufactureYear}</span>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                   <div>
                      <p className="text-xs text-gray-500 font-medium uppercase mb-1">Giá niêm yết</p>
                      <div className="text-3xl font-bold text-red-600">{formatPrice(car.price)}</div>
                   </div>
                   <Badge className={`text-base px-4 py-1 ${car.status === 'AVAILABLE' ? 'bg-green-600' : 'bg-red-600'}`}>
                     {car.status === 'AVAILABLE' ? 'Có sẵn' : 'Hết'}
                   </Badge>
                </div>

                {/* --- [Yêu cầu 3] Thông số nhanh (Có Icon) --- */}
                {carDetail && (
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 bg-white border rounded-lg p-4">
                    <div className="flex items-center gap-2">
                        <Settings2 className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500">Hộp số:</span> 
                        <span className="font-medium">{carDetail.transmission}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Fuel className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500">Nhiên liệu:</span> 
                        <span className="font-medium">{carDetail.fuelType}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500">Động cơ:</span> 
                        <span className="font-medium">{carDetail.engine}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Armchair className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500">Chỗ ngồi:</span> 
                        <span className="font-medium">{carDetail.seats}</span>
                    </div>
                  </div>
                )}

                {/* Chọn màu */}
                <div>
                  <Label className="block mb-3 font-semibold">Màu sắc sẵn có:</Label>
                  <div className="flex flex-wrap gap-2">
                    {car.colors && car.colors.length > 0 ? (
                        car.colors.map(color => (
                            <Button
                                key={color}
                                variant={selectedColor === color ? "secondary" : "outline"}
                                className={`min-w-[80px] ${selectedColor === color ? 'ring-2 ring-offset-2 ring-black' : ''}`}
                                onClick={() => setSelectedColor(color)}
                            >
                                {getColorName(color)}
                            </Button>
                        ))
                    ) : <span className="text-gray-400 italic text-sm">Đang cập nhật màu</span>}
                  </div>
                </div>

                {/* --- [Yêu cầu 1] Chọn số lượng (Input + Button) --- */}
                {car.status === 'AVAILABLE' && (
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <Label className="font-semibold">Số lượng mua:</Label>
                            <div className="text-gray-500">
                                Tồn kho: <span className="font-bold text-gray-900">{car.quantity}</span> | 
                                Đã bán: <span className="font-bold text-green-600">{car.soldQuantity}</span>
                            </div>
                        </div>
                        
                        <div className="flex items-center w-fit">
                            <Button variant="outline" size="icon" onClick={decreaseQty} className="h-10 w-10 rounded-r-none border-r-0">
                                -
                            </Button>
                            <Input 
                                type="number" 
                                className="h-10 w-20 rounded-none text-center border-x-0 focus-visible:ring-0" 
                                value={quantity}
                                onChange={(e) => handleQuantityChange(e.target.value)}
                                onBlur={handleQuantityBlur}
                                min={1}
                                max={car.quantity}
                            />
                            <Button variant="outline" size="icon" onClick={increaseQty} className="h-10 w-10 rounded-l-none border-l-0">
                                +
                            </Button>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={handleBuyNow} 
                    className="flex-1 bg-gray-900 hover:bg-red-700 text-white h-12 text-lg shadow-md hover:shadow-lg transition-all"
                    disabled={car.status !== 'AVAILABLE'}
                  >
                    <CreditCard className="w-5 h-5 mr-2" /> 
                    {car.status === 'AVAILABLE' ? 'MUA NGAY' : 'TẠM HẾT XE'}
                  </Button>
                  
                  <Button variant="outline" onClick={() => handleAddToCompare(car.carId)} className="h-12 px-4 border-gray-300" title="So sánh">
                    <GitCompare className="w-6 h-6" />
                  </Button>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="h-12 px-4 border-gray-300"><Phone className="w-5 h-5" />Liên hệ</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Liên hệ tư vấn</DialogTitle></DialogHeader>
                      <div className="space-y-4 py-4">
                        <Input placeholder="Họ và tên của bạn" />
                        <Input placeholder="Số điện thoại" />
                        <Textarea placeholder="Tôi quan tâm đến xe này, vui lòng tư vấn..." />
                      </div>
                      <DialogFooter>
                        <DialogClose asChild><Button onClick={handleContactSubmit}>Gửi yêu cầu</Button></DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>

            {/* --- TABS DETAIL --- */}
            <Tabs defaultValue="desc" className="mb-12">
              <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-8">
                <TabsTrigger value="desc" className="cursor-pointer rounded-none border-b-2 border-transparent data-[state=active]:border-red-600 data-[state=active]:text-red-600 data-[state=active]:bg-transparent px-0 py-3 text-base">Mô tả chi tiết</TabsTrigger>
                <TabsTrigger value="specs" className=" cursor-pointer rounded-none border-b-2 border-transparent data-[state=active]:border-red-600 data-[state=active]:text-red-600 data-[state=active]:bg-transparent px-0 py-3 text-base">Thông số kỹ thuật</TabsTrigger>
                {/* --- [Yêu cầu 2] Tab Đánh giá --- */}
                <TabsTrigger value="reviews" className="cursor-pointer rounded-none border-b-2 border-transparent data-[state=active]:border-red-600 data-[state=active]:text-red-600 data-[state=active]:bg-transparent px-0 py-3 text-base">Đánh giá khách hàng</TabsTrigger>
              </TabsList>
              
              <TabsContent value="desc" className="mt-8">
                 <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-line text-justify">
                    {car.description || "Chưa có mô tả chi tiết."}
                 </div>
              </TabsContent>
              
              <TabsContent value="specs" className="mt-8">
                 {carDetail ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <Card>
                          <CardHeader><CardTitle className="flex items-center gap-2"><Zap className="w-5 h-5 text-red-500"/> Động cơ & Vận hành</CardTitle></CardHeader>
                          <CardContent className="space-y-4 text-sm">
                             <SpecRow label="Động cơ" value={carDetail.engine} icon={<Zap size={16}/>} />
                             <SpecRow label="Công suất" value={`${carDetail.horsepower} HP`} icon={<Gauge size={16}/>} />
                             <SpecRow label="Mô-men xoắn" value={`${carDetail.torque} Nm`} icon={<Activity size={16}/>} />
                             <SpecRow label="Hộp số" value={carDetail.transmission} icon={<Settings2 size={16}/>} />
                          </CardContent>
                       </Card>
                       <Card>
                          <CardHeader><CardTitle className="flex items-center gap-2"><Maximize className="w-5 h-5 text-blue-500"/> Kích thước & Tiêu hao</CardTitle></CardHeader>
                          <CardContent className="space-y-4 text-sm">
                             <SpecRow label="Kích thước" value={carDetail.dimensions} icon={<Maximize size={16}/>} />
                             <SpecRow label="Trọng lượng" value={`${carDetail.weight} kg`} icon={<Scale size={16}/>} />
                             <SpecRow label="Số chỗ" value={`${carDetail.seats} chỗ`} icon={<Armchair size={16}/>} />
                             <SpecRow label="Tiêu thụ nhiên liệu" value={carDetail.fuelConsumption} icon={<Fuel size={16}/>} />
                          </CardContent>
                       </Card>
                    </div>
                 ) : <p>Đang cập nhật thông số.</p>}
              </TabsContent>

              {/* --- [Yêu cầu 2] Nội dung Tab Đánh giá --- */}
              <TabsContent value="reviews" className="mt-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {/* Tổng quan đánh giá */}
                      <Card className="col-span-1 h-fit">
                          <CardContent className="pt-6 text-center">
                              <div className="text-5xl font-bold text-gray-900 mb-2">4.9</div>
                              <div className="flex justify-center gap-1 text-yellow-400 mb-2">
                                  <Star className="fill-current w-5 h-5" /><Star className="fill-current w-5 h-5" /><Star className="fill-current w-5 h-5" /><Star className="fill-current w-5 h-5" /><Star className="fill-current w-5 h-5" />
                              </div>
                              <p className="text-gray-500">Dựa trên 128 đánh giá</p>
                              
                              <div className="mt-6 space-y-2">
                                  <RatingBar stars={5} percent={85} />
                                  <RatingBar stars={4} percent={10} />
                                  <RatingBar stars={3} percent={3} />
                                  <RatingBar stars={2} percent={1} />
                                  <RatingBar stars={1} percent={1} />
                              </div>
                          </CardContent>
                      </Card>

                      {/* Danh sách bình luận */}
                      <div className="col-span-1 md:col-span-2 space-y-6">
                          {/* Mock Reviews */}
                          <ReviewItem 
                              name="Nguyễn Văn An" 
                              date="12/10/2024" 
                              rating={5} 
                              content="Xe đẹp, máy êm, giao hàng đúng hẹn. Nhân viên tư vấn rất nhiệt tình."
                          />
                          <ReviewItem 
                              name="Trần Thị Bích" 
                              date="05/11/2024" 
                              rating={4} 
                              content="Màu sắc bên ngoài nhìn đẹp hơn trong ảnh. Tuy nhiên thủ tục giấy tờ hơi lâu một chút."
                          />
                          <ReviewItem 
                              name="Le Hoang" 
                              date="20/11/2024" 
                              rating={5} 
                              content="Rất hài lòng với trải nghiệm mua hàng tại Auto88. Giá cả cạnh tranh."
                          />
                          
                          <Button variant="outline" className="w-full">Xem thêm đánh giá</Button>
                      </div>
                  </div>
              </TabsContent>
            </Tabs>

            {/* --- RELATED CARS --- */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Xe tương tự</h2>
              {relatedCars.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {relatedCars.map((related) => (
                    <CarCard
                      key={related.carId}
                      car={related}
                      onViewDetails={() => navigate(`/cars/${related.carId}`)}
                      onAddToCompare={() => addToCompare(related.carId)}
                      viewMode="grid"
                    />
                  ))}
                </div>
              ) : <p className="text-gray-500">Không có xe tương tự.</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// --- SUB COMPONENTS ---

function SpecRow({ label, value, icon }: { label: string, value: string | number, icon: React.ReactNode }) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
            <div className="flex items-center gap-2 text-gray-500">
                {icon} <span>{label}</span>
            </div>
            <span className="font-medium text-gray-900">{value}</span>
        </div>
    )
}

function RatingBar({ stars, percent }: { stars: number, percent: number }) {
    return (
        <div className="flex items-center gap-2 text-sm">
            <span className="w-3">{stars}</span> <Star className="w-3 h-3 text-gray-400" />
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-400" style={{ width: `${percent}%` }}></div>
            </div>
            <span className="w-8 text-right text-gray-400">{percent}%</span>
        </div>
    )
}

function ReviewItem({ name, date, rating, content }: { name: string, date: string, rating: number, content: string }) {
    return (
        <div className="border-b pb-6 last:border-0">
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${name}`} />
                        <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h4 className="font-bold text-sm">{name}</h4>
                        <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < rating ? 'fill-current' : 'text-gray-200 fill-gray-200'}`} />
                            ))}
                        </div>
                    </div>
                </div>
                <span className="text-xs text-gray-400">{date}</span>
            </div>
            <p className="text-gray-600 text-sm mt-2">{content}</p>
        </div>
    )
}
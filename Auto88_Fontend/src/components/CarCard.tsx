// import { Eye, GitCompare, Heart, Star } from 'lucide-react';
// import { Button } from './ui/button';
// import { Badge } from './ui/badge';
// import { Card, CardContent } from './ui/card';
// import { ImageWithFallback } from './figma/ImageWithFallback';

// interface Car {
//   id: number;
//   make: string;
//   model: string;
//   year: number;
//   price: number;
//   originalPrice?: number;
//   image: string;
//   condition: string;
//   promotion?: string;
//   inStock: boolean;
//   stockCount: number;
//   mileage?: number;
//   fuelType: string;
//   transmission: string;
// }

// interface CarCardProps {
//   car: Car;
//   onViewDetails: (carId: number) => void;
//   onAddToCompare: (carId: number) => void;
//   isInCompareList?: boolean;
//   viewMode?: 'grid' | 'list';
// }

// export function CarCard({ 
//   car, 
//   onViewDetails, 
//   onAddToCompare, 
//   isInCompareList = false,
//   viewMode = 'grid' 
// }: CarCardProps) {
//   const formatPrice = (price: number) => {
//     return new Intl.NumberFormat('vi-VN', {
//       style: 'currency',
//       currency: 'VND'
//     }).format(price);
//   };

//   const formatMileage = (mileage: number) => {
//     return new Intl.NumberFormat('vi-VN').format(mileage) + ' km';
//   };

//   if (viewMode === 'list') {
//     return (
//       <Card className="group hover:shadow-lg transition-all duration-300">
//         <CardContent className="p-0">
//           <div className="flex">
//             <div className="relative w-72 h-48 overflow-hidden">
//               <ImageWithFallback
//                 src={car.image}
//                 alt={`${car.make} ${car.model}`}
//                 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
//               />
              
//               {/* Badges */}
//               <div className="absolute top-3 left-3 space-y-2">
//                 {car.condition === 'Mới' && (
//                   <Badge className="bg-green-600">Mới</Badge>
//                 )}
//                 {car.promotion && (
//                   <Badge variant="destructive">Khuyến mãi</Badge>
//                 )}
//                 {!car.inStock && (
//                   <Badge variant="secondary">Hết hàng</Badge>
//                 )}
//               </div>
//             </div>

//             <div className="flex-1 p-6">
//               <div className="flex justify-between">
//                 <div className="flex-1">
//                   <h3 className="text-xl font-semibold text-gray-900 mb-2">
//                     {car.make} {car.model} {car.year}
//                   </h3>
                  
//                   {car.promotion && (
//                     <p className="text-sm text-red-600 mb-3">{car.promotion}</p>
//                   )}

//                   <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
//                     <div>Năm: {car.year}</div>
//                     <div>Hộp số: {car.transmission}</div>
//                     <div>Nhiên liệu: {car.fuelType}</div>
//                     {car.mileage !== undefined && <div>Km: {formatMileage(car.mileage)}</div>}
//                   </div>

//                   <div className="flex items-center gap-4">
//                     <div>
//                       <div className="text-2xl font-bold text-red-600">
//                         {formatPrice(car.price)}
//                       </div>
//                       {car.originalPrice && (
//                         <div className="text-sm text-gray-500 line-through">
//                           {formatPrice(car.originalPrice)}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 <div className="flex flex-col gap-2 ml-6">
//                   <Button
//                     size="sm"
//                     variant="outline"
//                     onClick={() => onAddToCompare(car.id)}
//                     disabled={isInCompareList}
//                     className="w-12 h-12 p-0"
//                   >
//                     <GitCompare className="w-4 h-4" />
//                   </Button>
                  
//                   <Button 
//                     onClick={() => onViewDetails(car.id)}
//                     size="sm"
//                     className="w-12 h-12 p-0"
//                   >
//                     <Eye className="w-4 h-4" />
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <Card className="group hover:shadow-lg transition-all duration-300">
//       <CardContent className="p-0">
//         <div className="relative overflow-hidden rounded-t-lg">
//           <ImageWithFallback
//             src={car.image}
//             alt={`${car.make} ${car.model}`}
//             className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
//           />
          
//           {/* Badges */}
//           <div className="absolute top-3 left-3 space-y-2">
//             {car.condition === 'Mới' && (
//               <Badge className="bg-green-600">Mới</Badge>
//             )}
//             {car.promotion && (
//               <Badge variant="destructive">Khuyến mãi</Badge>
//             )}
//             {!car.inStock && (
//               <Badge variant="secondary">Hết hàng</Badge>
//             )}
//           </div>

//           {/* Action buttons */}
//           <div className="absolute top-3 right-3 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
//             <Button
//               size="sm"
//               variant="secondary"
//               onClick={() => onAddToCompare(car.id)}
//               disabled={isInCompareList}
//               className="w-10 h-10 p-0"
//             >
//               <GitCompare className="w-4 h-4" />
//             </Button>
//           </div>

//           {/* Stock indicator */}
//           {car.inStock && car.stockCount <= 3 && (
//             <div className="absolute bottom-3 left-3">
//               <Badge variant="outline" className="bg-white/90">
//                 Chỉ còn {car.stockCount} xe
//               </Badge>
//             </div>
//           )}
//         </div>

//         <div className="p-4">
//           <h3 className="font-semibold text-lg text-gray-900 mb-2">
//             {car.make} {car.model} {car.year}
//           </h3>
          
//           {car.promotion && (
//             <p className="text-sm text-red-600 mb-2">{car.promotion}</p>
//           )}

//           <div className="grid grid-cols-2 gap-2 mb-3 text-sm text-gray-600">
//             <div>Năm: {car.year}</div>
//             <div>Hộp số: {car.transmission}</div>
//             <div>Nhiên liệu: {car.fuelType}</div>
//             {car.mileage !== undefined && <div>Km: {formatMileage(car.mileage)}</div>}
//           </div>

//           <div className="flex items-center justify-between mb-4">
//             <div>
//               <div className="text-xl font-bold text-red-600">
//                 {formatPrice(car.price)}
//               </div>
//               {car.originalPrice && (
//                 <div className="text-sm text-gray-500 line-through">
//                   {formatPrice(car.originalPrice)}
//                 </div>
//               )}
//             </div>
//           </div>

//           <Button 
//             onClick={() => onViewDetails(car.id)}
//             className="w-full"
//             size="sm"
//           >
//             <Eye className="w-4 h-4 mr-2" />
//             Xem chi tiết
//           </Button>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

import { Eye, GitCompare, Info } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';

// ⚙️ Kiểu dữ liệu khớp với backend Java entity
export interface Car {
  carId: number;
  brand: string;           // Enum Brand
  model: string;
  category: string;        // Enum Category
  manufactureYear: number;
  price: number;           // BigDecimal -> number
  color: string;           // Enum Color
  description?: string;
  status: string;          // Enum CarStatus
  imageUrl?: string;
}

interface CarCardProps {
  car: Car;
  onViewDetails: (carId: number) => void;
  onAddToCompare: (carId: number) => void;
  isInCompareList?: boolean;
  viewMode?: 'grid' | 'list';
}

export function CarCard({
  car,
  onViewDetails,
  onAddToCompare,
  isInCompareList = false,
  viewMode = 'grid'
}: CarCardProps) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const imageUrl = car.imageUrl
    ? car.imageUrl.startsWith('http')
      ? car.imageUrl
      : `/api/cars/image/${car.imageUrl}`
    : '/placeholder.png';

  // 🧱 View dạng danh sách
  if (viewMode === 'list') {
    return (
      <Card className="group hover:shadow-lg transition-all duration-300">
        <CardContent className="p-0 flex">
          <div className="relative w-72 h-48 overflow-hidden rounded-l-lg">
            <ImageWithFallback
              src={imageUrl}
              alt={`${car.brand} ${car.model}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />

            <div className="absolute top-3 left-3 space-y-2">
              <Badge className={
                car.status === 'AVAILABLE'
                  ? 'bg-green-600'
                  : car.status === 'SOLD'
                  ? 'bg-gray-500'
                  : 'bg-yellow-500'
              }>
                {car.status === 'AVAILABLE'
                  ? 'Còn hàng'
                  : car.status === 'SOLD'
                  ? 'Đã bán'
                  : 'Đang xử lý'}
              </Badge>
            </div>
          </div>

          <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                {car.brand} {car.model}
              </h3>
              <p className="text-sm text-gray-500 mb-2">
                {car.category} • Năm {car.manufactureYear}
              </p>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {car.description || 'Không có mô tả'}
              </p>
              <div className="text-sm text-gray-700">
                Màu: <span className="font-medium">{car.color}</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="text-2xl font-bold text-red-600">
                {formatPrice(car.price)}
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onAddToCompare(car.carId)}
                  disabled={isInCompareList}
                >
                  <GitCompare className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => onViewDetails(car.carId)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 🧱 View dạng lưới (grid)
  return (
    <Card className="group hover:shadow-lg transition-all duration-300">
      <CardContent className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <ImageWithFallback
            src={imageUrl}
            alt={`${car.brand} ${car.model}`}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 left-3">
            <Badge className={
              car.status === 'AVAILABLE'
                ? 'bg-green-600'
                : car.status === 'SOLD'
                ? 'bg-gray-500'
                : 'bg-yellow-500'
            }>
              {car.status === 'AVAILABLE'
                ? 'Còn hàng'
                : car.status === 'SOLD'
                ? 'Đã bán'
                : 'Đang xử lý'}
            </Badge>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-lg text-gray-900 mb-1">
            {car.brand} {car.model}
          </h3>
          <p className="text-sm text-gray-500 mb-2">
            {car.category} • {car.manufactureYear} • {car.color}
          </p>

          <div className="text-xl font-bold text-red-600 mb-3">
            {formatPrice(car.price)}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => onViewDetails(car.carId)}
              size="sm"
              className="flex-1"
            >
              <Info className="w-4 h-4 mr-2" /> Xem chi tiết
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAddToCompare(car.carId)}
              disabled={isInCompareList}
            >
              <GitCompare className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

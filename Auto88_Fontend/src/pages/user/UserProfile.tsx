import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Package, Heart, Edit, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { useAuthStore } from '@/store/useAuthStore';
import userService, { UserUpdateRequest } from '@/services/userService';
import { toast } from 'sonner';
import MyOrdersTab from '@/components/profile/MyOrdersTab';
import { Skeleton } from '@/components/ui/skeleton'; // [THÊM MỚI] Import Skeleton

type ProfileData = {
  fullName: string;
  email: string;
  avatar: string;
  phone: string;
  address: string;
  dob: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  password: string;
};

// [THÊM MỚI] Component Skeleton cho trang Profile
const UserProfileSkeleton = () => (
  <div className="min-h-screen bg-gray-50 py-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Skeleton cho nút "Quay lại" */}
      <Skeleton className="h-10 w-48 mb-6" />

      {/* Skeleton cho Tiêu đề */}
      <div className="mb-8">
        <Skeleton className="h-9 w-64 mb-2" />
        <Skeleton className="h-5 w-80" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Skeleton cho Sidebar (Thông tin user) */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6 text-center">
              <Skeleton className="w-20 h-20 rounded-full mx-auto mb-4" />
              <Skeleton className="h-6 w-3/4 mx-auto mb-2" />
              <Skeleton className="h-4 w-full mx-auto mb-4" />
              <Skeleton className="h-6 w-24 mx-auto" />
            </CardContent>
          </Card>
        </div>

        {/* Skeleton cho Nội dung chính (Tabs) */}
        <div className="lg:col-span-3">
          {/* Skeleton cho Tabs List */}
          <div className="grid w-full grid-cols-3 gap-2 mb-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Skeleton cho Tab Content (Profile) */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-7 w-48" /> {/* Title */}
                <Skeleton className="h-9 w-28" /> {/* Edit Button */}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-10 w-full" /></div>
                <div className="space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-10 w-full" /></div>
                <div className="space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-10 w-full" /></div>
                <div className="space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-10 w-full" /></div>
              </div>
              <div className="space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-10 w-full" /></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>
);


// Component chính của bạn
export default function UserProfile() {
  const navigate = useNavigate();
  const { user, isUserFetched, fetchUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: '',
    email: '',
    avatar: '',
    phone: '',
    address: '',
    dob: '',
    gender: 'MALE',
    password: '',
  });
  const [originalProfileData, setOriginalProfileData] = useState<ProfileData | null>(null);
  const [selectedFileName, setSelectedFileName] = useState('Chưa chọn ảnh!');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    if (isUserFetched && user) {
      setProfileData({
        fullName: user.fullName || '',
        email: user.email || '',
        avatar: user.avatarUrl || '',
        phone: user.phone || '',
        address: user.address || '',
        dob: user.dob ? user.dob.split('T')[0] : '', // Format date for input
        gender: user.gender || 'MALE',
        password: '',
      });
    }
  }, [user, isUserFetched]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const preview = URL.createObjectURL(file);
      setProfileData({ ...profileData, avatar: preview });
      setSelectedFileName(file.name);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      if (originalProfileData) {
        setProfileData(originalProfileData);
      }
      setSelectedFileName('Chưa chọn ảnh!');
      setAvatarFile(null);
    } else {
      setOriginalProfileData({ ...profileData });
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = async () => {
    if (!user?.userId) {
      toast.error('Không tìm thấy thông tin người dùng');
      return;
    }

    try {
      const updateData: UserUpdateRequest = {
        userId: user.userId,
        fullName: profileData.fullName,
        dob: profileData.dob,
        gender: profileData.gender,
        phone: profileData.phone,
        address: profileData.address,
        email: profileData.email,
        role: user.role,
        status: user.status,
        password: profileData.password || undefined,
      };

      await userService.updateUser(user.userId, updateData, avatarFile || undefined);
      
      // Refetch user data to update the store
      if (user.username) {
        await fetchUser(user.username);
      }

      toast.success('Cập nhật thông tin thành công');
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Lỗi khi cập nhật thông tin');
    }
  };

  // [THAY ĐỔI] Thay thế loading text bằng Skeleton
  if (!isUserFetched) {
    return <UserProfileSkeleton />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Không tìm thấy thông tin người dùng. Vui lòng đăng nhập.</p>
          <Button onClick={() => navigate('/auth')}>Go to Login</Button>
        </div>
      </div>
    );
  }

  const sidebarData = isEditing ? (originalProfileData || profileData) : profileData;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại trang chủ
          </Button>
        </div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tài khoản của tôi</h1>
          <p className="text-gray-600">Quản lý thông tin cá nhân và đơn hàng</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6 text-center">
                <ImageWithFallback
                  src={sidebarData.avatar}
                  alt={sidebarData.fullName}
                  className="w-20 h-20 rounded-full object-cover mx-auto mb-4"
                />
                <h3 className="font-semibold text-lg">{sidebarData.fullName}</h3>
                <p className="text-gray-600 text-sm mb-4">{sidebarData.email}</p>
                <Badge variant={user.role === 'ADMIN' ? 'destructive' : 'secondary'}>
                  {user.role === 'ADMIN' ? 'Quản trị viên' : 'Khách hàng'}
                </Badge>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile"><User className="w-4 h-4 mr-2" />Thông tin cá nhân</TabsTrigger>
                <TabsTrigger value="orders"><Package className="w-4 h-4 mr-2" />Đơn hàng</TabsTrigger>
                <TabsTrigger value="wishlist"><Heart className="w-4 h-4 mr-2" />Yêu thích</TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Thông tin cá nhân</CardTitle>
                      <Button variant="outline" size="sm" onClick={handleEditToggle}>
                        <Edit className="w-4 h-4 mr-2" />
                        {isEditing ? 'Hủy' : 'Chỉnh sửa'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="name">Họ và tên</Label>
                        <Input id="name" value={profileData.fullName} onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })} disabled={!isEditing} />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={profileData.email} onChange={(e) => setProfileData({ ...profileData, email: e.target.value })} disabled={!isEditing} />
                      </div>
                      <div>
                        <Label htmlFor="phone">Số điện thoại</Label>
                        <Input id="phone" value={profileData.phone} onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} disabled={!isEditing} />
                      </div>
                      <div>
                        <Label htmlFor="birthday">Ngày sinh</Label>
                        <Input id="birthday" type="date" value={profileData.dob} onChange={(e) => setProfileData({ ...profileData, dob: e.target.value })} disabled={!isEditing} />
                      </div>
                      <div>
                        <Label>Giới tính</Label>
                        <RadioGroup value={profileData.gender} onValueChange={(value) => setProfileData({ ...profileData, gender: value as 'MALE' | 'FEMALE' | 'OTHER' })} disabled={!isEditing} className="flex space-x-4 mt-2">
                          <div className="flex items-center space-x-2"><RadioGroupItem value="MALE" id="gender-nam" /><Label htmlFor="gender-nam">Nam</Label></div>
                          <div className="flex items-center space-x-2"><RadioGroupItem value="FEMALE" id="gender-nu" /><Label htmlFor="gender-nu">Nữ</Label></div>
                          <div className="flex items-center space-x-2"><RadioGroupItem value="OTHER" id="gender-khac" /><Label htmlFor="gender-khac">Khác</Label></div>
                        </RadioGroup>
                      </div>
                      <div>
                        <Label htmlFor="avatar">Ảnh đại diện</Label>
                        <Input id="avatar" type="file" accept="image/*" onChange={handleAvatarChange} disabled={!isEditing} className="hidden" />
                        <div className="flex items-center space-x-2 mt-2">
                          <Button type="button" variant="outline" size="sm" asChild disabled={!isEditing}><label htmlFor="avatar">Chọn ảnh</label></Button>
                          <p className="text-sm text-gray-600 truncate">{selectedFileName}</p>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="password">Mật khẩu mới</Label>
                        <Input id="password" type="password" value={profileData.password} onChange={(e) => setProfileData({ ...profileData, password: e.target.value })} disabled={!isEditing} placeholder="Để trống nếu không đổi" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="address">Địa chỉ</Label>
                      <Input id="address" value={profileData.address} onChange={(e) => setProfileData({ ...profileData, address: e.target.value })} disabled={!isEditing} />
                    </div>
                    {isEditing && (
                      <div className="flex justify-end space-x-4">
                        <Button variant="outline" onClick={handleEditToggle}>Hủy</Button>
                        <Button onClick={handleSaveProfile}>Lưu thay đổi</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="orders">
                <MyOrdersTab />
              </TabsContent>

              <TabsContent value="wishlist">
                <Card>
                  <CardHeader><CardTitle>Danh sách yêu thích</CardTitle></CardHeader>
                  <CardContent><p>Tính năng này sẽ được phát triển sớm.</p></CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Package, Heart, Edit, ArrowLeft, Lock, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { useUserStore } from '@/store/useUserStore';
import userService, { UserUpdateRequest, AccountStatus, Gender } from '@/services/userService';
import { toast } from 'sonner';
import MyOrdersTab from '@/components/profile/MyOrdersTab';
import { Skeleton } from '@/components/ui/skeleton';
import ChangePasswordDialog from '@/components/profile/ChangePasswordDialog';
import { url } from 'inspector';

// ... (UserProfileSkeleton giữ nguyên) ...
const UserProfileSkeleton = () => (
  <div className="min-h-screen bg-gray-50 py-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Skeleton className="h-10 w-48 mb-6" />
      <div className="mb-8"><Skeleton className="h-9 w-64 mb-2" /><Skeleton className="h-5 w-80" /></div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1"><Card><CardContent className="p-6 text-center"><Skeleton className="w-20 h-20 rounded-full mx-auto mb-4" /><Skeleton className="h-6 w-3/4 mx-auto mb-2" /><Skeleton className="h-4 w-full mx-auto mb-4" /><Skeleton className="h-6 w-24 mx-auto" /></CardContent></Card></div>
        <div className="lg:col-span-3"><Skeleton className="h-10 w-full mb-4" /><Card><CardContent className="h-64"></CardContent></Card></div>
      </div>
    </div>
  </div>
);

type ProfileData = {
  fullName: string;
  email: string;
  avatar: string;
  phone: string;
  address: string;
  dob: string;
  gender: Gender;
};

export default function UserProfile() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // ✅ SỬA LỖI: Chỉ lấy user, bỏ fetchUser (vì store không export nó)
  const { user } = useUserStore();

  const currentTab = searchParams.get('tab') || 'profile';
  const actionParam = searchParams.get('action');

  const [isEditing, setIsEditing] = useState(false);
  const [isChangePassOpen, setIsChangePassOpen] = useState(false);

  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: '', email: '', avatar: '', phone: '', address: '', dob: '', gender: 'MALE'
  });
  const [originalProfileData, setOriginalProfileData] = useState<ProfileData | null>(null);
  const [selectedFileName, setSelectedFileName] = useState('Chưa chọn ảnh!');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // --- Effects ---

  useEffect(() => {
    if (actionParam === 'change-password') setIsChangePassOpen(true);
    else setIsChangePassOpen(false);
  }, [actionParam]);

  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName || '',
        email: user.email || '',
        avatar: user.avatarUrl || '',
        phone: user.phone || '',
        address: user.address || '',
        dob: user.dob ? user.dob.split('T')[0] : '',
        gender: (user.gender as Gender) || 'MALE',
      });
    }
  }, [user]);

  // --- Handlers ---

  const handleOpenChangePass = (open: boolean) => {
    setIsChangePassOpen(open);
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      open ? newParams.set('action', 'change-password') : newParams.delete('action');
      return newParams;
    });
  };

  const handleTabChange = (value: string) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('tab', value);
      newParams.delete('action');
      return newParams;
    });
  };

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
      if (originalProfileData) setProfileData(originalProfileData);
      setSelectedFileName('Chưa chọn ảnh!');
      setAvatarFile(null);
    } else {
      setOriginalProfileData({ ...profileData });
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = async () => {
    if (!user?.userId) return;

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
        status: user.status as AccountStatus,
      };

      await userService.updateUser(user.userId, updateData, avatarFile || undefined);

      // ✅ SỬA LỖI: Thay fetchUser bằng initializeAuth
      await useUserStore.getState().initializeAuth();

      toast.success('Cập nhật thành công');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || 'Lỗi cập nhật');
    }
  };

  const getRoleText = (role: string) => role === 'ADMIN' ? 'Quản trị viên' : 'Khách hàng';

  // Helper màu sắc cho Role (Admin: Đỏ, User: Xanh)
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-600 text-white border-transparent';
      case 'USER': return 'bg-blue-600 text-white border-transparent';
      default: return 'bg-gray-500 text-white border-transparent';
    }
  };

  // ✅ Render Skeleton nếu chưa có user (đang load)
  if (!user) {
    return <UserProfileSkeleton />;
  }

  const sidebarData = isEditing ? profileData : (user as any);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-3">
          <div className="flex items-center gap-1 text-l text-gray-500 hover:text-gray-900 cursor-pointer w-fit transition-colors" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span>Quay lại trang chủ</span>
          </div>
        </div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Tài khoản của tôi</h1>
          <p className="text-gray-600">Quản lý thông tin cá nhân và đơn hàng</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6 text-center">
                {user.avatarUrl ? (
                  <ImageWithFallback
                    src={user.avatarUrl}
                    alt={sidebarData.fullName}
                    className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-2 border-gray-100"
                  />
                ) : (
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-5 text-red-600" />
                  </div>
                )}
                <h3 className="font-semibold text-lg">{sidebarData.fullName}</h3>
                <p className="text-gray-600 text-sm mb-4">{sidebarData.email}</p>
                <Badge variant={user.role === 'ADMIN' ? 'destructive' : 'secondary'} className={getRoleBadgeColor(user.role)}>
                  <ShieldCheck />
                  {getRoleText(user.role === 'ADMIN' ? 'Quản trị viên' : 'Khách hàng')}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile" className='cursor-pointer'><User className="w-4 h-4 mr-2" />Thông tin cá nhân</TabsTrigger>
                <TabsTrigger value="orders" className='cursor-pointer'><Package className="w-4 h-4 mr-2" />Đơn hàng</TabsTrigger>
                <TabsTrigger value="wishlist" className='cursor-pointer'><Heart className="w-4 h-4 mr-2" />Yêu thích</TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="font-semibold text-lg" >Thông tin cá nhân</CardTitle>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleOpenChangePass(true)}>
                          <Lock className="w-4 h-4 mr-2" /> Đổi mật khẩu
                        </Button>
                        <Button variant={isEditing ? "destructive" : "default"} size="sm" onClick={handleEditToggle}>
                          <Edit className="w-4 h-4 mr-2" /> {isEditing ? 'Hủy' : 'Chỉnh sửa'}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2"><Label>Họ và tên</Label><Input value={profileData.fullName} onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })} disabled={!isEditing} required placeholder="VD: Nguyễn Văn A" /></div>
                      <div className="space-y-2"><Label>Email<span className="text-red-500">*</span></Label><Input value={profileData.email} disabled className="bg-gray-100 cursor-not-allowed" /></div>
                      <div className="space-y-2"><Label>Số điện thoại<span className="text-red-500">*</span></Label><Input value={profileData.phone} onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} disabled={!isEditing} required placeholder="VD: 09xx xxx xxx" /></div>
                      <div className="space-y-2"><Label>Ngày sinh</Label><Input type="date" value={profileData.dob} onChange={(e) => setProfileData({ ...profileData, dob: e.target.value })} disabled={!isEditing} /></div>

                      <div className="space-y-2">
                        <Label>Giới tính <span className="text-red-500">*</span></Label>
                        <RadioGroup value={profileData.gender} onValueChange={(value) => setProfileData({ ...profileData, gender: value as Gender })} disabled={!isEditing} className="flex space-x-4 mt-2">
                          <div className="flex items-center space-x-2"><RadioGroupItem value="MALE" id="g-male" /><Label htmlFor="g-male">Nam</Label></div>
                          <div className="flex items-center space-x-2"><RadioGroupItem value="FEMALE" id="g-female" /><Label htmlFor="g-female">Nữ</Label></div>
                          <div className="flex items-center space-x-2"><RadioGroupItem value="OTHER" id="g-other" /><Label htmlFor="g-other">Khác</Label></div>
                        </RadioGroup>
                      </div>

                      {isEditing && (
                        <div>
                          <Label>Ảnh đại diện</Label>
                          <Input type="file" accept="image/*" onChange={handleAvatarChange} className="mt-1 text-sm" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Địa chỉ</Label>
                      <Input value={profileData.address} onChange={(e) => setProfileData({ ...profileData, address: e.target.value })} disabled={!isEditing} placeholder="VD: Số 123 Đường Nguyễn Huệ" />
                    </div>

                    {isEditing && (
                      <div className="flex justify-end space-x-4 pt-4">
                        <Button variant="outline" onClick={handleEditToggle}>Hủy bỏ</Button>
                        <Button onClick={handleSaveProfile}>Lưu thay đổi</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="orders"><MyOrdersTab /></TabsContent>
              <TabsContent value="wishlist"><Card><CardHeader><CardTitle className="font-semibold text-lg">Danh sách yêu thích</CardTitle></CardHeader><CardContent><p>Tính năng đang phát triển...</p></CardContent></Card></TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <ChangePasswordDialog open={isChangePassOpen} onOpenChange={handleOpenChangePass} />
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Edit, ArrowLeft } from 'lucide-react';
import { cn } from '@/components/ui/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { useUserStore } from '@/store/userStore';
import userService, { UserUpdateRequest } from '@/services/userService';
import { toast } from 'sonner';

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

export default function AdminProfile() {
  const navigate = useNavigate();
  const { user, updateProfile, initializeAuth } = useUserStore();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: user?.fullName || '',
    email: user?.email || '',
    avatar: user?.avatar || '',
    phone: user?.phone || '',
    address: user?.address || '',
    dob: user?.dob || '',
    gender: user?.gender || 'MALE',
    password: '',
  });
  const [originalProfileData, setOriginalProfileData] = useState<ProfileData | null>(null);
  const [selectedFileName, setSelectedFileName] = useState('Chưa chọn ảnh!');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName || '',
        email: user.email || '',
        avatar: user.avatar || '',
        phone: user.phone || '',
        address: user.address || '',
        dob: user.dob || '',
        gender: user.gender || 'MALE',
        password: '',
      });
    }
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const preview = URL.createObjectURL(file);
      setProfileData({ ...profileData, avatar: preview });
      const fullName = file.name;
      const truncatedName = fullName.length > 20 ? '...' + fullName.substring(fullName.length - 20) : fullName;
      setSelectedFileName(truncatedName);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // When canceling, reset to original
      if (originalProfileData) {
        setProfileData(originalProfileData);
      }
      setSelectedFileName('Chưa chọn ảnh!');
      setAvatarFile(null);
    } else {
      // When starting to edit, save original
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
      setIsSaving(true);

      // Build update request
      const updateData: UserUpdateRequest = {
        userId: user.userId,
        fullName: profileData.fullName,
        dob: profileData.dob,
        gender: profileData.gender,
        phone: profileData.phone,
        address: profileData.address,
        email: profileData.email,
        role: user.role === 'admin' ? 'ADMIN' : 'USER',
        status: 'ACTIVE',
        password: profileData.password || undefined,
      };

      // Call API to update user
      await userService.updateUser(user.userId, updateData, avatarFile || undefined);

      // ✅ Vì API không trả về dữ liệu, ta tự cập nhật store theo state hiện tại
      updateProfile({
        fullName: profileData.fullName,
        email: profileData.email,
        phone: profileData.phone,
        address: profileData.address,
        dob: profileData.dob,
        gender: profileData.gender,
        avatar: profileData.avatar, // preview hoặc URL hiện tại
      });

      toast.success('Cập nhật thông tin thành công');
      setIsEditing(false);
      setOriginalProfileData(null);
      setProfileData({ ...profileData, password: '' });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Lỗi khi cập nhật thông tin');
    } finally {
      setIsSaving(false);
    }
  };

  const getGenderText = (gender: 'MALE' | 'FEMALE' | 'OTHER') => {
    switch (gender) {
      case 'MALE':
        return 'Nam';
      case 'FEMALE':
        return 'Nữ';
      case 'OTHER':
        return 'Khác';
      default:
        return 'Không xác định';
    }
  };

  // Dữ liệu hiển thị cho sidebar: dùng original khi đang edit, profileData khi không
  const sidebarData = isEditing ? (originalProfileData || profileData) : profileData;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-gray-600">Không tìm thấy thông tin người dùng.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin')}
            className="cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại trang tổng quan
          </Button>
        </div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tài khoản của tôi</h1>
          <p className="text-gray-600 mt-2">Quản lý thông tin hồ sơ cá nhân của bạn</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile sidebar */}
          <div className="lg:col-span-1 w-full lg:w-64">
            <Card className="overflow-hidden w-full lg:w-64">
              <CardContent className="p-6 text-center">
                {sidebarData.avatar ? (
                  <ImageWithFallback
                    src={sidebarData.avatar}
                    alt={sidebarData.fullName}
                    className="w-20 h-20 rounded-full object-cover mx-auto mb-4"
                  />
                ) : (
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-10 h-10 text-red-600" />
                  </div>
                )}
                <h3 className="font-semibold text-lg mb-1 truncate overflow-hidden">{sidebarData.fullName}</h3>
                <p className="text-gray-600 text-sm mb-4 truncate overflow-hidden">{sidebarData.email}</p>
                <Badge className={user.role === 'admin' ? '!bg-purple-600 !text-white' : '!bg-blue-600 !text-white'}>
                  {user.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Thông tin cá nhân</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEditToggle}
                    disabled={isSaving}
                    className="cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    {isEditing ? 'Hủy' : 'Chỉnh sửa'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="fullName" className="mb-2">Họ và tên *</Label>
                    <Input
                      id="fullName"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="mb-2">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="mb-2">Số điện thoại *</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dob" className="mb-2">Ngày sinh *</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={profileData.dob}
                      onChange={(e) => setProfileData({ ...profileData, dob: e.target.value })}
                      disabled={!isEditing}
                      className={cn(
                        "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5",
                        isEditing ? "hover:bg-accent cursor-pointer" : "cursor-not-allowed"
                      )}
                    />
                  </div>
                  <div>
                    <Label className="mb-2">
                      Giới tính *</Label>
                    <Select
                      value={profileData.gender}
                      onValueChange={(value: 'MALE' | 'FEMALE' | 'OTHER') =>
                        setProfileData({ ...profileData, gender: value })
                      }
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue>{getGenderText(profileData.gender)}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Nam</SelectItem>
                        <SelectItem value="FEMALE">Nữ</SelectItem>
                        <SelectItem value="OTHER">Khác</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="password" className="mb-2">Mật khẩu mới (để trống nếu không đổi)</Label>
                    <Input
                      id="password"
                      type="password"
                      value={profileData.password}
                      onChange={(e) => setProfileData({ ...profileData, password: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Nhập mật khẩu mới (tùy chọn)"
                    />
                  </div>
                  {/* Upload avatar */}
                  <div className="flex flex-col mb-6 w-full">
                    <Label htmlFor="avatar" className="mb-2 text-left">
                      Ảnh đại diện
                    </Label>

                    <div className="flex items-center space-x-6">
                      {/* Nút chọn ảnh và tên file */}
                      <div className="flex flex-col space-y-2 w-full">
                        <Input
                          id="avatar"
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          disabled={!isEditing}
                          className="hidden"
                        />

                        <div className="flex items-center space-x-3">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            asChild
                            disabled={!isEditing}
                            className="cursor-pointer hover:bg-gray-100 transition-colors flex-shrink-0"
                          >
                            <label htmlFor="avatar">Chọn ảnh</label>
                          </Button>

                          <p className="text-sm text-gray-600 truncate max-w-[200px] overflow-hidden text-ellipsis">
                            {selectedFileName || 'Chưa chọn ảnh'}
                          </p>
                        </div>
                        {/* Ảnh preview */}
                        <div className="relative flex-shrink-0">
                          {profileData.avatar ? (
                            <img
                              src={profileData.avatar}
                              alt="Avatar Preview"
                              className="w-24 h-24 rounded-full object-cover border border-gray-200 shadow-sm"
                            />
                          ) : (
                            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                              <User className="w-10 h-10 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="address" className="mb-2">Địa chỉ</Label>
                  <Input
                    id="address"
                    value={profileData.address}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                {isEditing && (
                  <div className="flex justify-end space-x-4">
                    <Button variant="outline" onClick={handleEditToggle} className="cursor-pointer hover:bg-gray-100 transition-colors">
                      Hủy
                    </Button>
                    <Button onClick={handleSaveProfile} className="cursor-pointer hover:bg-red-700 transition-colors">
                      Lưu thay đổi
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
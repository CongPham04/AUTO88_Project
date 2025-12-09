import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Edit, ArrowLeft, Lock } from 'lucide-react';
import { cn } from '@/components/ui/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { useUserStore } from '@/store/useUserStore';
import userService, { UserUpdateRequest } from '@/services/userService';
import { toast } from 'sonner';
import ChangePasswordDialog from '@/components/profile/ChangePasswordDialog';

type ProfileData = {
  fullName: string;
  email: string;
  avatar: string;
  phone: string;
  address: string;
  dob: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
};

export default function AdminProfile() {
  const navigate = useNavigate();
  const { user, updateProfile } = useUserStore(); // Không cần initializeAuth vì store đã có user
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isChangePassOpen, setIsChangePassOpen] = useState(false); // ✅ State cho dialog đổi mật khẩu

  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: user?.fullName || '',
    email: user?.email || '',
    avatar: user?.avatarUrl || '',
    phone: user?.phone || '',
    address: user?.address || '',
    dob: user?.dob || '',
    gender: user?.gender || 'MALE',
  });

  const [originalProfileData, setOriginalProfileData] = useState<ProfileData | null>(null);
  const [selectedFileName, setSelectedFileName] = useState('Chưa chọn ảnh!');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName || '',
        email: user.email || '',
        avatar: user.avatarUrl || '',
        phone: user.phone || '',
        address: user.address || '',
        dob: user.dob || '',
        gender: user.gender || 'MALE',
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
      // Hủy bỏ: Khôi phục dữ liệu gốc
      if (originalProfileData) {
        setProfileData(originalProfileData);
      }
      setSelectedFileName('Chưa chọn ảnh!');
      setAvatarFile(null);
    } else {
      // Bắt đầu sửa: Lưu dữ liệu gốc để khôi phục nếu cần
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

      // Tạo object update (Không gửi password ở đây nữa)
      const updateData: UserUpdateRequest = {
        userId: user.userId,
        fullName: profileData.fullName,
        dob: profileData.dob,
        gender: profileData.gender,
        phone: profileData.phone,
        address: profileData.address,
        email: profileData.email,
        role: user.role === 'ADMIN' ? 'ADMIN' : 'USER',
        status: 'ACTIVE',
        // password: Bỏ qua trường này, dùng API riêng để đổi pass
      };

      // Gọi API cập nhật thông tin
      await userService.updateUser(user.userId, updateData, avatarFile || undefined);

      // ✅ Cập nhật lại Store Frontend ngay lập tức
      updateProfile({
        fullName: profileData.fullName,
        email: profileData.email,
        phone: profileData.phone,
        address: profileData.address,
        dob: profileData.dob,
        gender: profileData.gender,
        avatarUrl: profileData.avatar, // Dùng ảnh preview hoặc URL cũ
      });

      toast.success('Cập nhật thông tin thành công');
      setIsEditing(false);
      setOriginalProfileData(null);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Lỗi khi cập nhật thông tin');
    } finally {
      setIsSaving(false);
    }
  };

  const getGenderText = (gender: 'MALE' | 'FEMALE' | 'OTHER') => {
    switch (gender) {
      case 'MALE': return 'Nam';
      case 'FEMALE': return 'Nữ';
      case 'OTHER': return 'Khác';
      default: return 'Không xác định';
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
    <div className="space-y-6 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6 pb-10">
        <div className="mb-2">
          <div
            className="flex items-center gap-1 text-l text-gray-500 hover:text-gray-900 cursor-pointer w-fit transition-colors"
            onClick={() => navigate('/admin')}
          >
            <ArrowLeft className="h-4 w-4" /> <span>Quay lại trang tổng quan</span>
          </div>
        </div>
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Tài khoản của tôi</h1>
          <p className="text-gray-600 mt-2">Quản lý thông tin cá nhân và bảo mật</p>
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
                    className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-2 border-gray-100"
                  />
                ) : (
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-red-50">
                    <User className="w-10 h-10 text-red-600" />
                  </div>
                )}
                <h3 className="font-semibold text-lg mb-1 truncate overflow-hidden">{sidebarData.fullName}</h3>
                <p className="text-gray-600 text-sm mb-4 truncate overflow-hidden">{sidebarData.email}</p>
                <Badge className={user.role === 'ADMIN' ? '!bg-purple-600 !text-white' : '!bg-blue-600 !text-white'}>
                  {user.role === 'ADMIN' ? 'Quản trị viên' : 'Khách hàng'}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className='font-semibold'>Thông tin cá nhân</CardTitle>
                  <div className="flex gap-2">
                    {/* ✅ Nút Đổi mật khẩu tách riêng */}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsChangePassOpen(true)}
                      className="cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Đổi mật khẩu
                    </Button>
                    
                    {/* Nút Chỉnh sửa thông tin */}
                    <Button
                      variant={isEditing ? "destructive" : "default"} // Đổi màu đỏ khi đang sửa để hiện nút Hủy rõ hơn (tuỳ chọn)
                      size="sm"
                      onClick={handleEditToggle}
                      disabled={isSaving}
                      className="cursor-pointer transition-colors"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      {isEditing ? 'Hủy bỏ' : 'Chỉnh sửa'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="fullName" className="mb-2">Họ và tên <span className='text-red-600'>*</span> </Label>
                    <Input
                      id="fullName"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="mb-2">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      disabled={true} // Email thường không cho sửa, hoặc disable khi edit
                      className="bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="mb-2">Số điện thoại <span className='text-red-600'>*</span> </Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dob" className="mb-2">Ngày sinh <span className='text-red-600'>*</span> </Label>
                    <Input
                      id="dob"
                      type="date"
                      value={profileData.dob}
                      onChange={(e) => setProfileData({ ...profileData, dob: e.target.value })}
                      disabled={!isEditing}
                      className={cn(
                        "block w-full p-2.5",
                        isEditing ? "cursor-pointer" : "cursor-not-allowed bg-gray-50"
                      )}
                    />
                  </div>
                  <div>
                    <Label className="mb-2">Giới tính <span className='text-red-600'>*</span> </Label>
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
                  
                  {/* Upload avatar (Chỉ hiện khi Edit) */}
                  {isEditing && (
                    <div className="flex flex-col mb-6 w-full col-span-1 md:col-span-2">
                      <Label htmlFor="avatar" className="mb-2 text-left">
                        Ảnh đại diện
                      </Label>

                      <div className="flex items-center space-x-6">
                        <div className="flex flex-col space-y-2 w-full">
                          <Input
                            id="avatar"
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                          />

                          <div className="flex items-center space-x-3">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              asChild
                              className="cursor-pointer hover:bg-gray-100 transition-colors flex-shrink-0"
                            >
                              <label htmlFor="avatar">Chọn ảnh</label>
                            </Button>

                            <p className="text-sm text-gray-600 truncate max-w-[200px]">
                              {selectedFileName}
                            </p>
                          </div>
                          
                          {/* Preview ảnh nhỏ bên cạnh khi chọn */}
                          {profileData.avatar && (
                             <div className="mt-2">
                                <img src={profileData.avatar} alt="Preview" className="w-16 h-16 rounded-full object-cover border border-gray-200" />
                             </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
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
                  <div className="flex justify-end space-x-4 pt-4 border-t border-gray-100">
                    <Button variant="outline" onClick={handleEditToggle} className="cursor-pointer hover:bg-gray-100 transition-colors">
                      Hủy bỏ
                    </Button>
                    <Button onClick={handleSaveProfile} className="cursor-pointer hover:bg-blue-700 transition-colors">
                      Lưu thay đổi
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* ✅ Dialog Đổi mật khẩu */}
      <ChangePasswordDialog open={isChangePassOpen} onOpenChange={setIsChangePassOpen} />
    </div>
  );
}
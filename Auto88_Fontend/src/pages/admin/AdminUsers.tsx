import React, { useState, useEffect } from 'react';
import { Plus, Eye, Edit, Trash2, Search, Filter, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import userService, { UserResponse, UserUpdateRequest, CreateUserWithAccountRequest } from '@/services/userService';

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN');
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export default function AdminUsers() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Form states for create
  const [formData, setFormData] = useState<CreateUserWithAccountRequest>({
    username: '',
    email: '',
    password: '',
    fullName: '',
    dob: '',
    gender: 'MALE',
    phone: '',
    role: 'USER',
    address: '',
  });

  // Form states for edit
  const [editFormData, setEditFormData] = useState<UserUpdateRequest>({
    userId: '',
    fullName: '',
    dob: '',
    gender: 'MALE',
    phone: '',
    address: '',
    email: '',
    role: 'USER',
    status: 'ACTIVE',
    password: '', // Optional - leave empty to not change
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Apply filters when users, search, or filters change
  useEffect(() => {
    let result = [...users];

    // Search filter
    if (searchTerm) {
      result = result.filter(
        (user) =>
          user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phone.includes(searchTerm)
      );
    }

    // Role filter
    if (roleFilter !== 'ALL') {
      result = result.filter((user) => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      result = result.filter((user) => user.status === statusFilter);
    }

    setFilteredUsers(result);
  }, [users, searchTerm, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách người dùng');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      fullName: '',
      dob: '',
      gender: 'MALE',
      phone: '',
      role: 'USER',
      address: '',
    });
    setAvatarFile(null);
    setAvatarPreview('');
    setIsCreateDialogOpen(true);
  };

  const handleEdit = (user: UserResponse) => {
    setSelectedUser(user);
    setEditFormData({
      userId: user.userId,
      fullName: user.fullName,
      dob: user.dob,
      gender: user.gender,
      phone: user.phone,
      address: user.address,
      email: user.email,
      role: user.role,
      status: user.status,
      password: '', // Leave empty - only update if user enters new password
    });
    setAvatarFile(null);
    setAvatarPreview(user.avatarUrl || '');
    setIsEditDialogOpen(true);
  };

  const handleView = (user: UserResponse) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
  };

  const handleDeleteConfirm = (user: UserResponse) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const userData: CreateUserWithAccountRequest = {
        ...formData,
        avatarFile: avatarFile || undefined,
      };
      await userService.createUserWithAccount(userData);
      toast.success('Tạo người dùng thành công');
      setIsCreateDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error('Error creating user - Full error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);

      const errorMessage = error.response?.data?.message || error.message || 'Lỗi khi tạo người dùng';
      toast.error(errorMessage);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUser) return;

    try {
      await userService.updateUser(selectedUser.userId, editFormData, avatarFile || undefined);

      toast.success('Cập nhật người dùng thành công');

      setIsEditDialogOpen(false);

      // Reload lại toàn trang sau 1 chút delay để toast hiển thị
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi cập nhật người dùng');
      console.error('Error updating user:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      await userService.deleteUser(selectedUser.userId);
      toast.success('Xóa người dùng thành công');
      setIsDeleteDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi xóa người dùng');
      console.error('Error deleting user:', error);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-600 text-white border-transparent'; // Màu tím cho admin
      case 'USER':
        return 'bg-blue-600 text-white border-transparent'; // Màu xanh cho user
      default:
        return 'bg-gray-500 text-white border-transparent'; // Dự phòng
    }
  };

  const getRoleText = (role: string) => {
    return role === 'ADMIN' ? 'Quản trị viên' : 'Khách hàng';
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-600 text-white border-transparent';
      case 'INACTIVE':
        return 'bg-yellow-600 text-white border-transparent';
      case 'BANNED':
        return 'bg-red-600 text-white border-transparent';
      default:
        return 'bg-gray-600 text-white border-transparent';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Hoạt động';
      case 'INACTIVE':
        return 'Không được phép hoạt động';
      case 'BANNED':
        return 'Khóa';
      default:
        return status;
    }
  };

  const getGenderText = (gender: string) => {
    switch (gender) {
      case 'MALE':
        return 'Nam';
      case 'FEMALE':
        return 'Nữ';
      case 'OTHER':
        return 'Khác';
      default:
        return gender;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quản lý người dùng</h2>
        <Button
          onClick={handleCreate}
          className="cursor-pointer hover:bg-red-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Thêm người dùng
        </Button>
      </div>

      {/* Search and Filter Section */}
      <Card className="cursor-pointer hover:shadow-lg transition-shadow">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm theo tên, username, email, số điện thoại..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả vai trò</SelectItem>
                <SelectItem value="USER">Khách hàng</SelectItem>
                <SelectItem value="ADMIN">Quản trị viên</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                <SelectItem value="INACTIVE">Không được phép hoạt động</SelectItem>
                <SelectItem value="BANNED">Khóa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="cursor-pointer hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle>
            Danh sách người dùng ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Đang tải...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Không tìm thấy người dùng nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4">Avatar</th>
                    <th className="text-left p-4">Họ tên</th>
                    <th className="text-left p-4">Username</th>
                    <th className="text-left p-4">Email</th>
                    <th className="text-left p-4">Số điện thoại</th>
                    <th className="text-left p-4">Vai trò</th>
                    <th className="text-left p-4">Trạng thái</th>
                    <th className="text-left p-4">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => {
                    return (
                      <tr
                        key={user.userId}
                        className="border-b hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="w-10 h-10 rounded-full overflow-hidden">
                            <img
                              src={user.avatarUrl || '/default-avatar.png'}
                              alt={user.fullName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="font-medium">{user.fullName}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-sm text-gray-600">{user.username}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-sm">{user.phone}</p>
                        </td>
                        <td className="p-4">
                          {user.role ? (
                            <Badge className={getRoleBadgeColor(user.role)}>
                              {getRoleText(user.role)}
                            </Badge>
                          ) : (
                            <span className="text-gray-400 text-sm">Chưa có vai trò</span>
                          )}
                        </td>
                        <td className="p-4">
                          <Badge className={getStatusBadgeColor(user.status)}>
                            {getStatusText(user.status)}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleView(user)}
                              className="cursor-pointer hover:bg-gray-100 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(user)}
                              className="cursor-pointer hover:bg-gray-100 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteConfirm(user)}
                              className="cursor-pointer hover:bg-red-100 transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Thêm người dùng mới</DialogTitle>
            <DialogDescription>
              Điền thông tin để tạo người dùng mới
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitCreate}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Mật khẩu *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Họ và tên *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dob">Ngày sinh *</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={formData.dob}
                    onChange={(e) =>
                      setFormData({ ...formData, dob: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Giới tính *</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value: 'MALE' | 'FEMALE' | 'OTHER') =>
                      setFormData({ ...formData, gender: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Nam</SelectItem>
                      <SelectItem value="FEMALE">Nữ</SelectItem>
                      <SelectItem value="OTHER">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Vai trò *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: 'USER' | 'ADMIN') =>
                      setFormData({ ...formData, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">Khách hàng</SelectItem>
                      <SelectItem value="ADMIN">Quản trị viên</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Địa chỉ</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar">Avatar</Label>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
                {avatarPreview && (
                  <div className="mt-2">
                    <img
                      src={avatarPreview}
                      alt="Preview"
                      className="w-24 h-24 object-cover rounded"
                    />
                  </div>
                )}
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button type="submit">Tạo người dùng</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
            <DialogDescription>Cập nhật thông tin người dùng</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitEdit}>
            <div className="space-y-4">
              {/* Ảnh đại diện */}
              <div className="space-y-2">
                <Label>Ảnh đại diện</Label>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 border border-gray-300 flex items-center justify-center">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 text-gray-400" />
                    )}
                  </div>

                  <div>
                    <Input
                      id="edit-avatar"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Họ và tên */}
              <div className="space-y-2">
                <Label htmlFor="edit-fullName">Họ và tên *</Label>
                <Input
                  id="edit-fullName"
                  value={editFormData.fullName}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, fullName: e.target.value })
                  }
                  required
                />
              </div>

              {/* Email + Mật khẩu */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editFormData.email}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-password">Mật khẩu mới (để trống nếu không đổi)</Label>
                  <Input
                    id="edit-password"
                    type="password"
                    value={editFormData.password}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, password: e.target.value })
                    }
                    placeholder="Nhập mật khẩu mới (tùy chọn)"
                  />
                </div>
              </div>

              {/* Ngày sinh + Giới tính */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-dob">Ngày sinh *</Label>
                  <Input
                    id="edit-dob"
                    type="date"
                    value={editFormData.dob}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, dob: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-gender">Giới tính *</Label>
                  <Select
                    value={editFormData.gender}
                    onValueChange={(value: 'MALE' | 'FEMALE' | 'OTHER') =>
                      setEditFormData({ ...editFormData, gender: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Nam</SelectItem>
                      <SelectItem value="FEMALE">Nữ</SelectItem>
                      <SelectItem value="OTHER">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* SĐT + Vai trò */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Số điện thoại *</Label>
                  <Input
                    id="edit-phone"
                    value={editFormData.phone}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, phone: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Vai trò *</Label>
                  <Select
                    value={editFormData.role}
                    onValueChange={(value: 'USER' | 'ADMIN') =>
                      setEditFormData({ ...editFormData, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">Khách hàng</SelectItem>
                      <SelectItem value="ADMIN">Quản trị viên</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Trạng thái */}
              <div className="space-y-2">
                <Label htmlFor="edit-status">Trạng thái *</Label>
                <Select
                  value={editFormData.status}
                  onValueChange={(value: 'ACTIVE' | 'INACTIVE' | 'BANNED') =>
                    setEditFormData({ ...editFormData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                    <SelectItem value="INACTIVE">Không được phép hoạt động</SelectItem>
                    <SelectItem value="BANNED">Khóa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Địa chỉ */}
              <div className="space-y-2">
                <Label htmlFor="edit-address">Địa chỉ *</Label>
                <Textarea
                  id="edit-address"
                  value={editFormData.address}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, address: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button type="submit">Cập nhật</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View User Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết người dùng</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={selectedUser.avatarUrl} />
                  <AvatarFallback>
                    {getInitials(selectedUser.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold">{selectedUser.fullName}</h3>
                  <p className="text-gray-600">@{selectedUser.username}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Email</Label>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Số điện thoại</Label>
                  <p className="font-medium">{selectedUser.phone}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Ngày sinh</Label>
                  <p className="font-medium">{formatDate(selectedUser.dob)}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Giới tính</Label>
                  <p className="font-medium">{getGenderText(selectedUser.gender)}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Vai trò</Label>
                  <Badge className={getRoleBadgeColor(selectedUser.role)}>
                    {getRoleText(selectedUser.role)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-gray-600">Trạng thái</Label>
                  <Badge className={getStatusBadgeColor(selectedUser.status)}>
                    {getStatusText(selectedUser.status)}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-gray-600">Địa chỉ</Label>
                <p className="font-medium">{selectedUser.address}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa người dùng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa người dùng{' '}
              <span className="font-bold">{selectedUser?.fullName}</span>? Hành động này
              không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-black hover:bg-gray-800 text-white"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

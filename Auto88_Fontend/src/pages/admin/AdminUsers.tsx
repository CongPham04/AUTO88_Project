import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { User, Plus, Eye, Edit, Trash2, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
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
import { toast } from 'sonner';
import userService, { UserResponse } from '@/services/userService';

const getInitials = (name: string) => name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

const UserTableSkeleton = () => (
  <>
    {[...Array(10)].map((_, i) => (
      <tr key={i} className="border-b">
        <td className="p-4"><Skeleton className="h-10 w-10 rounded-full" /></td>
        <td className="p-4"><Skeleton className="h-4 w-32" /></td>
        <td className="p-4"><Skeleton className="h-4 w-48" /></td>
        <td className="p-4"><Skeleton className="h-4 w-24" /></td>
        <td className="p-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
        <td className="p-4"><Skeleton className="h-6 w-24 rounded-full" /></td>
        <td className="p-4"><div className="flex gap-2"><Skeleton className="h-8 w-8" /><Skeleton className="h-8 w-8" /></div></td>
      </tr>
    ))}
  </>
);

export default function AdminUsers() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialKeyword = searchParams.get('keyword') || '';
  const initialRole = searchParams.get('role') || 'ALL';
  const initialStatus = searchParams.get('status') || 'ALL';
  const initialPage = parseInt(searchParams.get('page') || '1', 10); // ✅ Lấy page từ URL

  const [users, setUsers] = useState<UserResponse[]>([]);
  const [paginatedUsers, setPaginatedUsers] = useState<UserResponse[]>([]); // ✅ Data đã phân trang
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(initialPage);
  const itemsPerPage = 10; // ✅ Cố định 10 users/trang

  const [tempSearchTerm, setTempSearchTerm] = useState(initialKeyword);
  const [roleFilter, setRoleFilter] = useState<string>(initialRole);
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await userService.searchUsers({
        keyword: initialKeyword,
        role: initialRole,
        status: initialStatus
      });
      // Sắp xếp người dùng mới nhất lên đầu (giả định có createdAt hoặc sort theo tên)
      // data.sort((a, b) => ...); 
      setUsers(data);
      // Reset về trang 1 nếu kết quả tìm kiếm thay đổi
      if (initialPage > Math.ceil(data.length / itemsPerPage) && data.length > 0) {
         setCurrentPage(1);
      }
    } catch (error) {
      toast.error('Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [initialKeyword, initialRole, initialStatus, initialPage]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // ✅ Pagination Logic: Cắt mảng users theo trang hiện tại
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedUsers(users.slice(startIndex, endIndex));
  }, [users, currentPage]);

  const handleSearch = () => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      tempSearchTerm.trim() ? newParams.set('keyword', tempSearchTerm.trim()) : newParams.delete('keyword');
      newParams.set('page', '1'); // Reset về trang 1
      return newParams;
    });
    setCurrentPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') handleSearch(); };

  const handleRoleChange = (value: string) => {
    setRoleFilter(value);
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      value !== 'ALL' ? newParams.set('role', value) : newParams.delete('role');
      newParams.set('page', '1');
      return newParams;
    });
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      value !== 'ALL' ? newParams.set('status', value) : newParams.delete('status');
      newParams.set('page', '1');
      return newParams;
    });
    setCurrentPage(1);
  };

  // ✅ Xử lý chuyển trang
  const totalPages = Math.ceil(users.length / itemsPerPage);
  
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.set('page', newPage.toString());
        return newParams;
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDeleteConfirm = (user: UserResponse) => { setSelectedUser(user); setIsDeleteDialogOpen(true); };

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      await userService.deleteUser(selectedUser.userId);
      toast.success('Xóa thành công');
      setIsDeleteDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Lỗi xóa');
    }
  };

  // Styles Helpers
  const getRoleBadgeColor = (role: string) => role === 'ADMIN' ? 'bg-red-600' : 'bg-blue-600';
  const getStatusBadgeColor = (status: string) => {
    if (status === 'ACTIVE') return 'bg-green-600';
    if (status === 'INACTIVE') return 'bg-yellow-600';
    return 'bg-gray-600';
  };
  const getStatusText = (status: string) => {
    if (status === 'ACTIVE') return 'Hoạt động';
    if (status === 'INACTIVE') return 'Không kích hoạt';
    if (status === 'BANNED') return 'Khóa';
    return 'Đã xóa';
  };

  return (
    <div className="space-y-6 py-4 px-4 sm:px-6 lg:px-8">
      {/* HEADER & TOOLBAR */}
      <div className="">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

          {/* Tiêu đề */}
          <h2 className="text-3xl font-bold text-gray-800 shrink-0">
            Quản Lý Người Dùng
          </h2>

          {/* Toolbar (Search + Filters + Add) */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto overflow-x-auto">

            {/* Search Box */}
            <div className="relative flex-1 min-w-[200px] border border-gray-300 rounded-md bg-white shadow-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm..."
                value={tempSearchTerm}
                onChange={(e) => setTempSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10 h-9 text-sm w-full bg-gray-50 focus:bg-white transition-colors"
              />
            </div>

            {/* Filter Groups */}
            <div className="flex gap-2 shrink-0">
              <Select value={roleFilter} onValueChange={handleRoleChange}>
                <SelectTrigger className="h-9 w-[110px] text-sm bg-gray-50 border border-gray-300 rounded-md bg-white shadow-sm px-3">
                  <div className="flex items-center truncate ">
                    <Filter className="w-3.5 h-3.5 mr-2 opacity-70" />
                    <SelectValue placeholder="Vai trò" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả</SelectItem>
                  <SelectItem value="USER">Khách hàng</SelectItem>
                  <SelectItem value="ADMIN">Quản trị</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger className="h-9 w-[120px] text-sm bg-gray-50 border border-gray-300 rounded-md bg-white shadow-sm px-3">
                  <div className="flex items-center truncate">
                    <Filter className="w-3.5 h-3.5 mr-2 opacity-70" />
                    <SelectValue placeholder="Trạng thái" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả</SelectItem>
                  <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                  <SelectItem value="INACTIVE">Không kích hoạt</SelectItem>
                  <SelectItem value="BANNED">Khóa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Nút Thêm Mới */}
            <Button onClick={() => navigate('/admin/users/create')} className="h-9 bg-black hover:bg-gray-800 text-white whitespace-nowrap shrink-0">
              <Plus className="w-4 h-4 mr-1.5" /> Thêm mới
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden border-gray-100 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 font-semibold text-gray-600">Avatar</th>
                  <th className="p-4 font-semibold text-gray-600">Họ tên</th>
                  <th className="p-4 font-semibold text-gray-600">Email</th>
                  <th className="p-4 font-semibold text-gray-600">SĐT</th>
                  <th className="p-4 font-semibold text-gray-600">Vai trò</th>
                  <th className="p-4 font-semibold text-gray-600">Trạng thái</th>
                  <th className="p-4 font-semibold text-gray-600 text-center ">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <UserTableSkeleton /> : paginatedUsers.length === 0 ? <tr><td colSpan={7} className="text-center py-10 text-gray-500">Không tìm thấy người dùng nào.</td></tr> : paginatedUsers.map((user) => (
                  <tr key={user.userId} className="border-b hover:bg-gray-50/50 transition-colors">
                    <td className="p-4"><div className="w-10 h-10 rounded-full overflow-hidden">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl || '/default-avatar.png'}
                          alt={user.fullName || user.email}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-red-600" />
                        </div>
                      )}
                    </div></td>
                    <td className="p-4 font-medium">{user.fullName}</td>
                    <td className="p-4 text-gray-600">{user.email}</td>
                    <td className="p-4">{user.phone}</td>
                    <td className="p-4"><Badge className={`${getRoleBadgeColor(user.role)} text-white shadow-none`}>{user.role === 'ADMIN' ? 'Quản trị' : 'Khách hàng'}</Badge></td>
                    <td className="p-4"><Badge className={`${getStatusBadgeColor(user.status)} text-white shadow-none`}>{getStatusText(user.status)}</Badge></td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/admin/users/view/${user.userId}`)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/admin/users/edit/${user.userId}`)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteConfirm(user)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ✅ PAGINATION UI */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-4 border-t bg-gray-50">
              <div className="text-xs text-gray-500 mt-2">
                Hiển thị <strong>{paginatedUsers.length}</strong> trên tổng số <strong>{users.length}</strong> người dùng
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-8 px-2 mt-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <div className="flex items-center gap-1 mt-2">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                     let p = i + 1;
                     if (totalPages > 5 && currentPage > 3) p = currentPage - 2 + i;
                     if (p > totalPages) return null;
                     
                     return (
                      <Button
                        key={p}
                        variant={p === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(p)}
                        className={`h-8 w-8 ${p === currentPage ? "bg-black text-white pointer-events-none" : "hover:bg-gray-100"}`}
                      >
                        {p}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="h-8 px-2 mt-2"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Xác nhận xóa?</AlertDialogTitle><AlertDialogDescription>Bạn có chắc chắn muốn xóa người dùng <span className="font-bold">{selectedUser?.fullName}</span>? Hành động này không thể hoàn tác.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Hủy</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-black hover:bg-gray-800 text-white">Xóa</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
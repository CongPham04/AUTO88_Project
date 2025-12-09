import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Mail, Phone, MapPin, Calendar, User as UserIcon, Loader2, Fingerprint, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import userService, { UserResponse } from '@/services/userService';

// --- HELPERS ---

const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
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

const getStatusText = (status: string) => {
    switch (status) {
        case 'ACTIVE': return 'Hoạt động';
        case 'INACTIVE': return 'Chưa kích hoạt';
        case 'BANNED': return 'Đã khóa';
        case 'DELETED': return 'Đã xóa';
        default: return status;
    }
};

// Helper màu sắc cho Status
const getStatusBadgeStyles = (status: string) => {
    switch (status) {
        case 'ACTIVE': return 'bg-green-600 text-white border-transparent';
        case 'INACTIVE': return 'bg-yellow-600 text-white border-transparent';
        case 'BANNED': return 'bg-red-600 text-white border-transparent';
        case 'DELETED': return 'bg-gray-600 text-white border-transparent';
        default: return 'bg-gray-600 text-white border-transparent';
    }
};

export default function UserDetailPage() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState<UserResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userId) {
            userService.getUserById(userId)
                .then(setUser)
                .catch(() => navigate('/admin/users'))
                .finally(() => setLoading(false));
        }
    }, [userId, navigate]);

    if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>;
    if (!user) return <div>Không tìm thấy người dùng</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-10 py-4 px-4 sm:px-6 lg:px-8">

            {/* --- HEADER --- */}
            <div className="flex flex-col space-y-2">
                <div
                    className="flex items-center gap-1 text-l text-gray-500 hover:text-gray-900 cursor-pointer w-fit transition-colors"
                    onClick={() => navigate('/admin/users')}
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Quay lại danh sách người dùng</span>
                </div>

                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Hồ sơ người dùng</h1>
                    <Button onClick={() => navigate(`/admin/users/edit/${user.userId}`)} className="bg-black text-white hover:bg-gray-800">
                        <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
                    </Button>
                </div>
            </div>

            {/* --- CONTENT GRID --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* CỘT TRÁI: ĐỊNH DANH (3/12) */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="shadow-sm border-t-4 border-t-black">
                        <CardContent className="pt-6 flex flex-col items-center text-center">

                            {/* Avatar */}
                            <div className="relative mb-4">
                                <Avatar className="h-20 w-20 border-2 border-gray-100 shadow-sm">
                                    <AvatarImage src={user.avatarUrl} className="object-cover" />
                                    <AvatarFallback className="text-2xl bg-gray-50 text-gray-500 font-bold">
                                        {user.fullName.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-[2px] border-white ${user.status === 'ACTIVE' ? 'bg-green-500' :
                                    user.status === 'INACTIVE' ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}></div>
                            </div>

                            <h2 className="text-xl font-bold text-gray-900 mb-2">{user.fullName}</h2>

                            {/* ✅ BADGES: Role & Status (Có màu sắc) */}
                            <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
                                <Badge variant="outline" className={getRoleBadgeColor(user.role)}>
                                    <ShieldCheck />
                                    {getRoleText(user.role)}
                                </Badge>

                                <Badge variant="outline" className={`${getStatusBadgeStyles(user.status)} px-2.5 py-0.5`}>
                                    {getStatusText(user.status)}
                                </Badge>
                            </div>

                            <Separator className="mb-4" />

                            {/* Thông tin tài khoản */}
                            <div className="w-full space-y-3 text-left">
                                <div className="group p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-900 mb-1">
                                        <Mail className="h-4 w-4" /> <Label>Email</Label>
                                    </div>
                                    <p className="text-l font-semibold text-gray-600 truncate">{user.email}</p>
                                </div>

                                <div className="group p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-900 mb-1">
                                        <Fingerprint className="h-4 w-4" /> <Label>ID</Label>
                                    </div>
                                    <p className="text-l font-semibold text-gray-600 truncate">{user.userId}</p>
                                </div>
                            </div>

                        </CardContent>
                    </Card>
                </div>

                {/* CỘT PHẢI: THÔNG TIN CÁ NHÂN (9/12) */}
                <div className="lg:col-span-8">
                    <Card className="shadow-sm h-full">
                        <CardHeader className="pb-2">
                            <CardTitle className="font-semibold text-lg flex items-center gap-2">
                                <UserIcon className="w-5 h-5 text-gray-900" />
                                <Label>Thông tin cá nhân</Label>
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="w-full space-y-3 text-left">
                                <div className="group p-2.5 rounded-lg hover:bg-gray-50 transition-colors space-y-2" >
                                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-900 mb-1">
                                        <Phone className="h-4 w-4" /> Số điện thoại
                                    </div>
                                    <p className="text-l font-semibold text-gray-600 truncate">
                                        {user.phone}
                                    </p>
                                </div>

                                <div className="group p-2.5 rounded-lg hover:bg-gray-50 transition-colors space-y-2">
                                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-900 mb-1">
                                        <Calendar className="h-4 w-4" /> Ngày sinh
                                    </div>
                                    <p className="text-l font-semibold text-gray-600 truncate">
                                            {formatDate(user.dob)}
                                    </p>
                                </div>

                                <div className="group p-2.5 rounded-lg hover:bg-gray-50 transition-colors space-y-2">
                                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-900 mb-1">
                                        <UserIcon className="h-4 w-4" /> Giới tính
                                    </div>
                                    <p className="text-l font-semibold text-gray-600 truncate">
                                            {user.gender === 'MALE' ? 'Nam' : user.gender === 'FEMALE' ? 'Nữ' : 'Khác'}
                                    </p>
                                </div>

                                <div className="group p-2.5 rounded-lg hover:bg-gray-50 transition-colors space-y-2">
                                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-900 mb-1">
                                       <MapPin className="h-4 w-4" /> Địa chỉ
                                    </div>
                                    <p className="text-l font-semibold text-gray-600 truncate">
                                            {user.address || <span className="text-gray-400 italic">Chưa cập nhật thông tin địa chỉ.</span>}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

// Component Label nội bộ để tái sử dụng style
function Label({ children, className }: { children: React.ReactNode, className?: string }) {
    return <span className={className}>{children}</span>
}
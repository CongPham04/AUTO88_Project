import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, User, Loader2, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import userService, { CreateUserWithAccountRequest, UserUpdateRequest } from '@/services/userService';

interface UserFormPageProps {
    mode: 'create' | 'edit';
}

export default function UserFormPage({ mode }: UserFormPageProps) {
    const navigate = useNavigate();
    const { userId } = useParams();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(mode === 'edit');

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        dob: '',
        gender: 'MALE',
        phone: '',
        role: 'USER',
        status: 'ACTIVE',
        address: '',
    });

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string>('');

    useEffect(() => {
        if (mode === 'edit' && userId) {
            const fetchUser = async () => {
                try {
                    const user = await userService.getUserById(userId);
                    setFormData({
                        ...user,
                        password: '',
                        dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
                    });
                    if (user.avatarUrl)
                        setAvatarPreview(user.avatarUrl);
                } catch (error) {
                    toast.error('Không tìm thấy người dùng');
                    navigate('/admin/users');
                } finally {
                    setFetching(false);
                }
            };
            fetchUser();
        }
    }, [mode, userId, navigate]);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setAvatarPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (mode === 'create') {
                const createData: CreateUserWithAccountRequest = { ...formData, avatarFile: avatarFile || undefined } as CreateUserWithAccountRequest;
                await userService.createUserWithAccount(createData);
                toast.success('Thêm người dùng thành công');
            } else {
                const updateData: UserUpdateRequest = { ...formData, userId: userId || '' } as UserUpdateRequest;
                await userService.updateUser(userId!, updateData, avatarFile || undefined);
                toast.success('Cập nhật thành công');
            }
            navigate('/admin/users');
        } catch (error: any) {
            toast.error(error.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>;
    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-10 py-4 px-4 sm:px-6 lg:px-8">

            {/* --- HEADER --- */}
            <div className="flex flex-col space-y-2">
                <div
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 cursor-pointer w-fit transition-colors"
                    onClick={() => navigate('/admin/users')}
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Quay lại danh sách người dùng</span>
                </div>
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                        {mode === 'create' ? 'Thêm mới người dùng' : 'Chỉnh sửa người dùng'}
                    </h1>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Cột trái: Avatar & Cấu hình (Chiếm 4/12) */}
                    <div className="lg:col-span-4 space-y-6">
                        <Card>
                            <CardHeader><CardTitle className="text-base">Ảnh đại diện</CardTitle></CardHeader>
                            <CardContent className="flex flex-col items-center gap-4">
                                {/* Ảnh nhỏ lại h-24 w-24 */}
                                <div className="relative group cursor-pointer">
                                    {avatarPreview ? (
                                        // Trường hợp 1: Có ảnh -> Hiển thị ảnh
                                        <img
                                            src={avatarPreview}
                                            alt="Avatar Preview"
                                            className="w-24 h-24 rounded-full object-cover"
                                        />
                                    ) : (
                                        // Trường hợp 2: Không có ảnh -> Hiển thị Icon mặc định bạn yêu cầu
                                        // (Đã chỉnh w-full h-full để lấp đầy khung tròn 32x32 của form)
                                        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
                                            <User className="w-10 h-10 text-red-600" />
                                        </div>
                                    )}

                                    {/* Overlay đổi ảnh */}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 rounded-full transition-all duration-200">
                                        <UploadCloud className="h-6 w-6" />
                                    </div>

                                    <Input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={handleAvatarChange}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 text-center">
                                    Nhấp vào ảnh để tải lên.<br />Hỗ trợ JPG, PNG (Max 5MB).
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle className="text-base">Thiết lập tài khoản</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Vai trò</Label>
                                    <Select value={formData.role} onValueChange={(val) => setFormData({ ...formData, role: val })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="USER">Khách hàng</SelectItem>
                                            <SelectItem value="ADMIN">Quản trị viên</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Trạng thái</Label>
                                    <RadioGroup value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })} className="flex flex-col gap-2">
                                        <div className={`flex items-center space-x-2 border p-3 rounded-md cursor-pointer transition-colors ${formData.status === 'ACTIVE' ? 'bg-green-50 border-green-200' : 'hover:bg-slate-50'}`}>
                                            <RadioGroupItem value="ACTIVE" id="st-active" className="text-green-600 cursor-pointer" />
                                            <Label htmlFor="st-active" className="flex-1 cursor-pointer font-medium text-sm text-green-600">Hoạt động</Label>
                                        </div>
                                        <div className={`flex items-center space-x-2 border p-3 rounded-md cursor-pointer transition-colors ${formData.status === 'INACTIVE' ? 'bg-yellow-50 border-yellow-200' : 'hover:bg-slate-50'}`}>
                                            <RadioGroupItem value="INACTIVE" id="st-inactive" className="text-yellow-400 cursor-pointer" />
                                            <Label htmlFor="st-inactive" className="flex-1 cursor-pointer font-medium text-sm text-yellow-400">Không kích hoạt</Label>
                                        </div>
                                        <div className={`flex items-center space-x-2 border p-3 rounded-md cursor-pointer transition-colors ${formData.status === 'BANNED' ? 'bg-red-50 border-red-200' : 'hover:bg-slate-50'}`}>
                                            <RadioGroupItem value="BANNED" id="st-banned" className="text-red-600 cursor-pointer" />
                                            <Label htmlFor="st-banned" className="flex-1 cursor-pointer font-medium text-sm text-red-600">Khóa</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Cột phải: Form nhập liệu chính (Chiếm 8/12) */}
                    <div className="lg:col-span-8 space-y-6">
                        <Card>
                            <CardHeader><CardTitle className="text-lg">Thông tin đăng nhập</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Email <span className="text-red-500">*</span></Label>
                                        <Input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            readOnly={mode === 'edit'}
                                            className={mode === 'edit' ? 'bg-gray-100 cursor-not-allowed' : ''}
                                            required
                                            placeholder='email@example.com'
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{mode === 'create' ? 'Mật khẩu *' : 'Mật khẩu mới'}</Label>
                                        <Input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            required={mode === 'create'}
                                            placeholder={mode === 'edit' ? 'Để trống nếu không đổi' : '*********'}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle className="text-lg">Thông tin cá nhân</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Họ và tên <span className="text-red-500">*</span></Label>
                                    <Input value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} placeholder='Nguyễn Văn A'/>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Số điện thoại <span className="text-red-500">*</span></Label>
                                        <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder='0987241231'/>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Ngày sinh <span className="text-red-500">*</span></Label>
                                        <Input type="date" value={formData.dob} onChange={(e) => setFormData({ ...formData, dob: e.target.value })} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Giới tính</Label>
                                    <RadioGroup value={formData.gender} onValueChange={(val) => setFormData({ ...formData, gender: val })} className="flex gap-6 pt-2">
                                        {['MALE', 'FEMALE', 'OTHER'].map((g) => (
                                            <div key={g} className="flex items-center space-x-2">
                                                <RadioGroupItem value={g} id={`g-${g}`} className="cursor-pointer" />
                                                <Label htmlFor={`g-${g}`} className="cursor-pointer font-normal">
                                                    {g === 'MALE' ? 'Nam' : g === 'FEMALE' ? 'Nữ' : 'Khác'}
                                                </Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </div>

                                <div className="space-y-2">
                                    <Label>Địa chỉ</Label>
                                    <Textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="min-h-[100px]" placeholder='Số Nhà 73B, TDP Số 4, Xã Hải Hậu, Tỉnh Nam Định' />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => navigate('/admin/users')} className="min-w-[100px]">Hủy bỏ</Button>
                            <Button type="submit" disabled={loading} className="bg-black text-white hover:bg-gray-800 min-w-[140px]">
                                {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                                {mode === 'create' ? 'Tạo mới' : 'Lưu thay đổi'}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/store/userStore';
import { Eye, EyeOff } from 'lucide-react';
import { FaFacebook, FaApple } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useAuthStore } from "@/store/useAuthStore";
import { useOrderStore } from '@/store/orderStore';
import { error } from 'console';

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, register } = useUserStore();
  const { setAuth } = useAuthStore();
  const { clearOrder, addToOrder } = useOrderStore();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({
    fullName: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSuccess = () => {
    // Kiểm tra có hành động mua hàng đang chờ không
    const pendingOrder = localStorage.getItem('pendingOrder');
    const redirect = new URLSearchParams(window.location.search).get('redirect');

    if (pendingOrder) {
      const orderData = JSON.parse(pendingOrder);
      localStorage.removeItem('pendingOrder'); // dọn sau khi xử lý

      clearOrder();
      addToOrder(orderData);

      toast.success('Tiếp tục thanh toán sản phẩm bạn đã chọn!');
      navigate('/order/checkout');
    } else if (redirect === 'checkout') {
      // Nếu chỉ là redirect checkout mà không có pendingOrder
      navigate('/order/checkout');
    } else {
      // Không có pendingOrder → về trang chủ
      navigate('/');
      toast.success('Đăng nhập thành công!');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Gọi login() — nếu lỗi, nó sẽ throw
      const success = await login(loginData.username, loginData.password);

      if (success) {
        const user = useUserStore.getState().user;
        const token = localStorage.getItem("token");
        await setAuth(token, loginData.username);

        if (user?.role === "admin") {
          toast.success('Đăng nhập thành công!');
          navigate("/admin");
        } else {
          handleLoginSuccess();
        }
      }
    } catch (error: any) {
      console.error("Đăng nhập lỗi:", error);

      // Lấy thông tin lỗi chi tiết từ backend
      const apiData = error.response?.data;
      const status = apiData?.status || error.response?.status;
      const message =
        apiData?.message ||
        error.response?.data?.error ||
        "Đăng nhập thất bại. Vui lòng thử lại.";
      // Xử lý các loại lỗi cụ thể
      if (status === 403) {
        toast.error(message);
      } else if (status === 400 || status === 401) {
        toast.error("Tên đăng nhập hoặc mật khẩu không đúng!");
      } else if(message === "Bad credentials") {
        toast.error("Thông tin đăng nhập không hợp lệ!");
      }else {
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!registerData.fullName.trim()) {
      toast.error('Vui lòng nhập họ và tên!');
      setIsLoading(false);
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp!');
      setIsLoading(false);
      return;
    }

    if (registerData.password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự!');
      setIsLoading(false);
      return;
    }

    const success = await register(
      registerData.username,
      registerData.password,
      registerData.fullName
    );

    if (success) {
      toast.success('Đăng ký thành công! Bạn có thể đăng nhập ngay.');
      setActiveTab('login');
      setRegisterData({
        fullName: '',
        username: '',
        password: '',
        confirmPassword: ''
      });
    } else {
      toast.error('Tên đăng nhập đã tồn tại!');
    }
    setIsLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, isRegister = false) => {
    const { name, value } = e.target;
    if (isRegister) {
      setRegisterData(prev => ({ ...prev, [name]: value }));
    } else {
      setLoginData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-4xl font-bold break-words">
            AUTO 88
          </CardTitle>
          <CardTitle className="text-center text-sm text-gray-500 break-words">
            Uy tín - Chất lượng - Giá tốt
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as 'login' | 'register')}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger className='cursor-pointer' value="login">Đăng nhập</TabsTrigger>
              <TabsTrigger className='cursor-pointer' value="register">Đăng ký tài khoản mới</TabsTrigger>
            </TabsList>

            {/* --- LOGIN TAB --- */}
            <TabsContent value="login" className="space-y-4 mt-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-username">Tên đăng nhập</Label>
                  <Input
                    id="login-username"
                    name="username"
                    type="text"
                    placeholder="Nhập tên đăng nhập"
                    value={loginData.username}
                    onChange={(e) => handleInputChange(e)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="login-password">Mật khẩu</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      name="password"
                      type={showLoginPassword ? "text" : "password"}
                      placeholder="Nhập mật khẩu"
                      value={loginData.password}
                      onChange={(e) => handleInputChange(e)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </Button>
              </form>

              <Separator className="my-4" />
              <div className="text-center text-sm text-gray-600">Hoặc đăng nhập bằng</div>
              <div className="flex space-x-2">
                <Button variant="outline" size="icon" className="flex-1 h-12"><FaFacebook /></Button>
                <Button variant="outline" size="icon" className="flex-1 h-12"><FcGoogle /></Button>
                <Button variant="outline" size="icon" className="flex-1 h-12"><FaApple /></Button>
              </div>
            </TabsContent>

            {/* --- REGISTER TAB --- */}
            <TabsContent value="register" className="space-y-4 mt-4">
              <form onSubmit={handleRegister} className="space-y-4">

                <div>
                  <Label htmlFor="register-fullname">Họ và tên</Label>
                  <Input
                    id="register-fullname"
                    name="fullName"
                    type="text"
                    placeholder="Nhập họ và tên"
                    value={registerData.fullName}
                    onChange={(e) => handleInputChange(e, true)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="register-username">Tên đăng nhập</Label>
                  <Input
                    id="register-username"
                    name="username"
                    type="text"
                    placeholder="Nhập tên đăng nhập"
                    value={registerData.username}
                    onChange={(e) => handleInputChange(e, true)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="register-password">Mật khẩu</Label>
                  <div className="relative">
                    <Input
                      id="register-password"
                      name="password"
                      type={showRegisterPassword ? "text" : "password"}
                      placeholder="Nhập mật khẩu"
                      value={registerData.password}
                      onChange={(e) => handleInputChange(e, true)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    >
                      {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirm-password">Xác nhận mật khẩu</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Nhập lại mật khẩu"
                      value={registerData.confirmPassword}
                      onChange={(e) => handleInputChange(e, true)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useUserStore } from '@/store/useUserStore';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { FaFacebook, FaApple } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useAuthStore } from "@/store/useAuthStore";
import { useOrderStore } from '@/store/orderStore';
import { getAccessToken } from "@/lib/tokenHelper";

type AuthView = 'login' | 'register' | 'forgot' | 'reset' | 'verify';

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  const { login, register, forgotPassword, resetPassword, verifyAccount, resendOtp } = useUserStore();
  const { setAuth } = useAuthStore();
  const { clearOrder, addToOrder } = useOrderStore();
  
  // Logic View
  const currentView: AuthView = useMemo(() => {
    const path = location.pathname;
    const token = searchParams.get('token');
    if (token) return 'reset';
    if (path.includes('/register')) return 'register';
    if (path.includes('/forgot-password')) return 'forgot';
    if (path.includes('/verify')) return 'verify';
    return 'login';
  }, [location.pathname, searchParams]);

  // States
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetData, setResetData] = useState({ newPassword: '', confirmPassword: '' });
  const [otpCode, setOtpCode] = useState('');
  
  const [rememberMe, setRememberMe] = useState(false);
  const pendingEmail = location.state?.email || registerData.email;

  // Toggle Password Visibility
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // ✅ Thêm State hiển thị mật khẩu cho phần Reset Password
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  // Helper
  const switchView = (view: 'login' | 'register' | 'forgot' | 'verify', stateData?: any) => {
    let targetPath = '/auth/login';
    if (view === 'register') targetPath = '/auth/register';
    else if (view === 'forgot') targetPath = '/auth/forgot-password';
    else if (view === 'verify') targetPath = '/auth/verify';
    
    navigate(targetPath, { 
      state: { ...location.state, ...stateData }, 
      replace: true 
    });
  };

  // --- Handlers ---
  const handleLoginSuccess = () => {
    const pendingOrder = localStorage.getItem('pendingOrder');
    const redirect = new URLSearchParams(window.location.search).get('redirect');

    if (pendingOrder) {
      const orderData = JSON.parse(pendingOrder);
      localStorage.removeItem('pendingOrder');
      clearOrder();
      addToOrder(orderData);
      toast.success('Tiếp tục thanh toán!');
      navigate('/order/checkout');
    } else if (redirect === 'checkout') {
      navigate('/order/checkout');
    } else {
      navigate('/');
      toast.success('Đăng nhập thành công!');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const success = await login(loginData.email, loginData.password, rememberMe);
      if (success) {
        const user = useUserStore.getState().user;
        const token = getAccessToken();
        await setAuth(token, loginData.email);

        if (user?.role === "ADMIN") {
          toast.success('Xin chào Admin!');
          navigate("/admin");
        } else {
          handleLoginSuccess();
        }
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "Email hoặc mật khẩu không đúng!";
      if (error.response?.data?.errorCode === "ACCOUNT_NOT_VERIFIED") {
        toast.warning("Tài khoản chưa kích hoạt. Vui lòng nhập mã OTP.");
        switchView('verify', { email: loginData.email });
      } else {
        toast.error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerData.fullName.trim()) return toast.error('Vui lòng nhập họ tên!');
    if (registerData.password !== registerData.confirmPassword) return toast.error('Mật khẩu xác nhận không khớp!');
    if (registerData.password.length < 6) return toast.error('Mật khẩu quá ngắn!');
    setIsLoading(true);
    try {
      await register(registerData.email, registerData.password, registerData.fullName);
      toast.success('Đăng ký thành công! Vui lòng kiểm tra email để lấy mã xác thực.');
      switchView('verify', { email: registerData.email });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Đăng ký thất bại!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) return toast.error("Mã xác thực phải có 6 số!");
    setIsLoading(true);
    try {
      await verifyAccount(otpCode);
      toast.success("Kích hoạt tài khoản thành công! Bạn có thể đăng nhập ngay.");
      switchView('login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Mã xác thực không đúng!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!pendingEmail) return toast.error("Không tìm thấy email để gửi lại!");
    setIsLoading(true);
    try {
      await resendOtp(pendingEmail);
      toast.success("Mã mới đã được gửi vào email của bạn (Hiệu lực 5 phút).");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gửi lại mã thất bại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return toast.error("Vui lòng nhập email!");
    setIsLoading(true);
    try {
      await forgotPassword(forgotEmail);
      toast.success("Link khôi phục đã được gửi tới email của bạn!");
      switchView('login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi gửi email.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = searchParams.get('token');
    if (!token) return toast.error("Token không hợp lệ!");
    if (resetData.newPassword !== resetData.confirmPassword) return toast.error("Mật khẩu không khớp!");
    setIsLoading(true);
    try {
      await resetPassword(token, resetData.newPassword);
      toast.success("Đổi mật khẩu thành công! Vui lòng đăng nhập.");
      navigate('/auth/login', { state: location.state });
      setLoginData(prev => ({ ...prev, password: '' }));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Token lỗi hoặc hết hạn.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, form: string) => {
    const { name, value } = e.target;
    if (form === 'register') setRegisterData(prev => ({ ...prev, [name]: value }));
    else if (form === 'login') setLoginData(prev => ({ ...prev, [name]: value }));
    else if (form === 'reset') setResetData(prev => ({ ...prev, [name]: value }));
  };

  // --- UI RENDER ---

  if (currentView === 'login' || currentView === 'register') {
    return (
      <div className="w-full max-w-lg mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-3xl font-bold text-primary">AUTO 88</CardTitle>
            <CardTitle className="text-center text-sm text-gray-500 font-normal">Uy tín - Chất lượng - Giá tốt</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={currentView} onValueChange={(v) => switchView(v as 'login' | 'register')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login" className='cursor-pointer'>Đăng nhập</TabsTrigger>
                <TabsTrigger value="register" className='cursor-pointer'>Đăng ký</TabsTrigger>
              </TabsList>

              {/* Login Form */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="login-email">Email</Label>
                    <Input id="login-email" name="email" type="email" placeholder="email@example.com" value={loginData.email} onChange={(e) => handleInputChange(e, 'login')} required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="login-password">Mật khẩu</Label>                                  
                    <div className="relative">
                      <Input id="login-password" name="password" type={showLoginPassword ? "text" : "password"} placeholder="••••••••••" value={loginData.password} onChange={(e) => handleInputChange(e, 'login')} required />
                      <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowLoginPassword(!showLoginPassword)}>
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="remember" 
                        checked={rememberMe} 
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)} 
                      />
                      <label
                        htmlFor="remember"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer select-none"
                      >
                        Ghi nhớ đăng nhập
                      </label>
                    </div>
                    <span className="text-xs text-primary cursor-pointer hover:underline" onClick={() => switchView('forgot')}>Quên mật khẩu?</span>
                  </div>

                  <Button type="submit" className="w-full mb-4" disabled={isLoading}>{isLoading ? 'Đang xử lý...' : 'Đăng nhập'}</Button>
                </form>
                <Separator className="my-4 mt-4" />
                <p className="text-center text-sm text-gray-500 mt-4">Hoặc đăng nhập bằng</p>
                <div className="flex gap-4 justify-center mt-4">
                  <Button variant="outline" size="icon"><FaFacebook className="text-blue-600" /></Button>
                  <Button variant="outline" size="icon"><FcGoogle /></Button>
                  <Button variant="outline" size="icon"><FaApple /></Button>
                </div>
              </TabsContent>

              {/* Register Form */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-1">
                    <Label>Họ và tên</Label>
                    <Input name="fullName" placeholder="Nguyễn Văn A" value={registerData.fullName} onChange={(e) => handleInputChange(e, 'register')} required />
                  </div>
                  <div className="space-y-1">
                    <Label>Email</Label>
                    <Input name="email" type="email" placeholder="email@example.com" value={registerData.email} onChange={(e) => handleInputChange(e, 'register')} required />
                  </div>
                  <div className="space-y-1">
                    <Label>Mật khẩu</Label>
                    <div className="relative">
                      <Input name="password" type={showRegisterPassword ? "text" : "password"} placeholder="••••••••••" value={registerData.password} onChange={(e) => handleInputChange(e, 'register')} required />
                      <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowRegisterPassword(!showRegisterPassword)}>
                        {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Xác nhận mật khẩu</Label>
                    <div className="relative">
                      <Input name="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="••••••••••" value={registerData.confirmPassword} onChange={(e) => handleInputChange(e, 'register')} required />
                      <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full mt-4 mb-4" disabled={isLoading}>{isLoading ? 'Đang xử lý...' : 'Đăng ký'}</Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Verify Form
  if (currentView === 'verify') {
    return (
      <div className="w-full max-w-md mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2" onClick={() => switchView('login')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle>Xác thực tài khoản</CardTitle>
            </div>
            <CardDescription>Vui lòng nhập mã OTP (6 số) đã gửi đến: <br/><span className="font-bold text-black">{pendingEmail}</span></CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-1">
                <Label>Mã xác thực</Label>
                <Input value={otpCode} onChange={(e) => setOtpCode(e.target.value.trim())} placeholder="123456" maxLength={6} className="text-center text-lg tracking-widest" required />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Đang xác thực...' : 'Kích hoạt'}</Button>
              <div className="text-center">
                <Button type="button" variant="outline" size="sm" onClick={handleResendOtp} disabled={isLoading}>Gửi lại mã OTP</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Forgot Password Form
  if (currentView === 'forgot') {
    return (
      <div className="w-full max-w-md mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2" onClick={() => switchView('login')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle>Tìm tài khoản</CardTitle>
            </div>
            <CardDescription>Hãy nhập email của bạn để nhận liên kết đặt lại mật khẩu.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-1"><Label>Email</Label><Input type="email" placeholder="email@example.com" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required /></div>
              <Button type="submit" className="w-full" disabled={isLoading}>Tiếp tục</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ✅ Reset Password Form (Có con mắt xem mật khẩu)
  if (currentView === 'reset') {
    return (
      <div className="w-full max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Đặt lại mật khẩu</CardTitle>
            <CardDescription>Nhập mật khẩu mới cho tài khoản của bạn.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              
              {/* Mật khẩu mới */}
              <div className="space-y-1">
                <Label>Mật khẩu mới</Label>
                <div className="relative">
                  <Input 
                    name="newPassword" 
                    type={showResetPassword ? "text" : "password"} 
                    placeholder="••••••••••" 
                    value={resetData.newPassword} 
                    onChange={(e) => handleInputChange(e, 'reset')} 
                    required 
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="absolute right-0 top-0 h-full px-3" 
                    onClick={() => setShowResetPassword(!showResetPassword)}
                  >
                    {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Xác nhận mật khẩu mới */}
              <div className="space-y-1">
                <Label>Xác nhận mật khẩu</Label>
                <div className="relative">
                  <Input 
                    name="confirmPassword" 
                    type={showResetConfirmPassword ? "text" : "password"} 
                    placeholder="••••••••••" 
                    value={resetData.confirmPassword} 
                    onChange={(e) => handleInputChange(e, 'reset')} 
                    required 
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="absolute right-0 top-0 h-full px-3" 
                    onClick={() => setShowResetConfirmPassword(!showResetConfirmPassword)}
                  >
                    {showResetConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>Xác nhận</Button>
              <Button 
                type="button" 
                variant="link" 
                className="w-full" 
                onClick={() => { navigate('/auth/login', { state: location.state }); }}
              >
                Quay lại đăng nhập
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
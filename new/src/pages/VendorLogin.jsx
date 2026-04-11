import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, EyeOff, Store, Mail, Lock, ArrowRight, 
  User, Phone, MapPin, Tag, CheckCircle2, ChevronLeft 
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '@/utils/api';

const NOISE_TEXTURE = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`;

export default function VendorLogin() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form States
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    password: '',
    contactNumber: '',
    businessCategory: '',
    storeAddress: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const resp = await fetch(`${API_URL}/vendors/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });
      const data = await resp.json();
      if (data.success) {
        toast.success("Welcome back to your dashboard!");
        localStorage.setItem("vendorUser", JSON.stringify(data.data.vendor));
        navigate("/vendor-dashboard");
      } else {
        toast.error(data.message || "Invalid credentials");
      }
    } catch (err) {
      toast.error("Server connection failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const resp = await fetch(`${API_URL}/vendors/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      });
      const data = await resp.json();
      if (data.success) {
        toast.success("Registration submitted! Awaiting admin approval.");
        setIsLogin(true);
      } else {
        toast.error(data.message || "Registration failed.");
      }
    } catch (err) {
      toast.error("Server connection failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4 lg:p-8 font-sans selection:bg-[#9a6bff]/30">
      <div className="w-full max-w-[1100px] h-full lg:min-h-[700px] bg-white rounded-[32px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col lg:flex-row border border-gray-100">
        
        {/* Left Side: Branding/Visual */}
        <div className="w-full lg:w-[45%] bg-[#151515] p-12 text-white flex flex-col justify-between relative overflow-hidden shrink-0">
          <div 
            className="absolute top-0 right-0 w-full h-full opacity-20 mix-blend-overlay"
            style={{ backgroundImage: NOISE_TEXTURE }}
          ></div>
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#9a6bff]/30 blur-[100px] rounded-full animate-pulse"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10 group cursor-pointer" onClick={() => navigate('/')}>
              <div className="h-10 w-10 bg-[#9a6bff] rounded-[10px] flex items-center justify-center shadow-lg shadow-[#9a6bff]/40">
                <Store className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-black uppercase tracking-tighter italic">OMW Market</span>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-black leading-[1.1] mb-6 tracking-tight">
              Grow Your <br />
              <span className="text-[#9a6bff]">Digital Presence</span> <br />
              With Texongo.
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed max-w-sm">
              The premium marketplace for vendors who demand excellence in every transaction.
            </p>
          </div>

          <div className="relative z-10 pt-10">
            <div className="space-y-6">
              {[
                "Real-time Analytics Dashboard",
                "Advanced Inventory Control",
                "Secure Payment Processing"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3 text-sm font-bold tracking-tight">
                  <div className="h-5 w-5 rounded-full bg-[#9a6bff]/20 flex items-center justify-center border border-[#9a6bff]/40">
                    <CheckCircle2 className="h-3 w-3 text-[#9a6bff]" />
                  </div>
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Forms */}
        <div className="flex-1 p-8 lg:p-16 relative overflow-y-auto max-h-[90vh] lg:max-h-none">
          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="max-w-md mx-auto h-full flex flex-col justify-center"
              >
                <header className="mb-10">
                  <h2 className="text-3xl font-black text-[#151515] tracking-tight mb-2 italic">Vendor Login</h2>
                  <p className="text-gray-500 font-medium">Welcome back! Please enter your store credentials.</p>
                </header>

                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest pl-1">Email Address</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-[#9a6bff] transition-colors" />
                      </div>
                      <input
                        type="email"
                        required
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 text-sm font-bold focus:ring-4 focus:ring-[#9a6bff]/10 focus:border-[#9a6bff] outline-none transition-all"
                        placeholder="store@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Secret Key</label>
                      <button 
                        type="button" 
                        onClick={() => toast.info("Recovery Access: Please contact the System Administrator to reset your vendor authority keys.", { duration: 6000 })}
                        className="text-[11px] font-black text-[#9a6bff] hover:underline uppercase tracking-widest"
                      >
                        Forgot?
                      </button>
                    </div>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#9a6bff] transition-colors" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-12 text-sm font-bold focus:ring-4 focus:ring-[#9a6bff]/10 focus:border-[#9a6bff] outline-none transition-all"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-[#151515] transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-14 bg-[#151515] text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-black hover:shadow-2xl hover:shadow-black/20 active:scale-95 transition-all disabled:opacity-50 mt-4 shadow-lg shadow-gray-200"
                  >
                    {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Sign In Authority <ArrowRight className="h-4 w-4" /></>}
                  </button>
                </form>

                <p className="mt-10 text-center text-sm font-bold text-gray-500">
                  New merchant?{" "}
                  <button onClick={() => setIsLogin(false)} className="text-[#9a6bff] hover:underline uppercase tracking-widest text-[11px] ml-1">Register as Vendor</button>
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="mx-auto"
              >
                <button 
                  onClick={() => setIsLogin(true)}
                  className="mb-6 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-[#151515] transition-colors"
                >
                  <ChevronLeft className="h-3 w-3" /> Back to Login
                </button>
                <header className="mb-8">
                  <h2 className="text-3xl font-black text-[#151515] tracking-tight mb-2 italic">Merchant Registry</h2>
                  <p className="text-gray-500 font-medium">Join our verified partner network.</p>
                </header>

                <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div className="space-y-1.5 col-span-2 md:col-span-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 leading-none">Business Name</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Store className="h-4 w-4 text-gray-400 group-focus-within:text-[#9a6bff]" />
                      </div>
                      <input
                        required
                        value={registerData.businessName}
                        onChange={(e) => setRegisterData({ ...registerData, businessName: e.target.value })}
                        className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 text-xs font-bold focus:ring-4 focus:ring-[#9a6bff]/10 focus:border-[#9a6bff] outline-none transition-all"
                        placeholder="Texongo Couture"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 col-span-2 md:col-span-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 leading-none">Owner Authority</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-gray-400 group-focus-within:text-[#9a6bff]" />
                      </div>
                      <input
                        required
                        value={registerData.ownerName}
                        onChange={(e) => setRegisterData({ ...registerData, ownerName: e.target.value })}
                        className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 text-xs font-bold focus:ring-4 focus:ring-[#9a6bff]/10 focus:border-[#9a6bff] outline-none transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 col-span-2 md:col-span-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 leading-none">Email Node</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-gray-400 group-focus-within:text-[#9a6bff]" />
                      </div>
                      <input
                        type="email"
                        required
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 text-xs font-bold focus:ring-4 focus:ring-[#9a6bff]/10 focus:border-[#9a6bff] outline-none transition-all"
                        placeholder="store@omw.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 col-span-2 md:col-span-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 leading-none">Secure Key</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-gray-400 group-focus-within:text-[#9a6bff]" />
                      </div>
                      <input
                        type="password"
                        required
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 text-xs font-bold focus:ring-4 focus:ring-[#9a6bff]/10 focus:border-[#9a6bff] outline-none transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 col-span-2 md:col-span-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 leading-none">Phone Contact</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Phone className="h-4 w-4 text-gray-400 group-focus-within:text-[#9a6bff]" />
                      </div>
                      <input
                        required
                        value={registerData.contactNumber}
                        onChange={(e) => setRegisterData({ ...registerData, contactNumber: e.target.value })}
                        className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 text-xs font-bold focus:ring-4 focus:ring-[#9a6bff]/10 focus:border-[#9a6bff] outline-none transition-all"
                        placeholder="+91 000 000 0000"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 col-span-2 md:col-span-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 leading-none">Business Sector</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Tag className="h-4 w-4 text-gray-400 group-focus-within:text-[#9a6bff]" />
                      </div>
                      <input
                        required
                        value={registerData.businessCategory}
                        onChange={(e) => setRegisterData({ ...registerData, businessCategory: e.target.value })}
                        className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 text-xs font-bold focus:ring-4 focus:ring-[#9a6bff]/10 focus:border-[#9a6bff] outline-none transition-all"
                        placeholder="Footwear & Fashion"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 leading-none">Base of Operations</label>
                    <div className="relative group">
                      <div className="absolute top-3 left-3.5 pointer-events-none">
                        <MapPin className="h-4 w-4 text-gray-400 group-focus-within:text-[#9a6bff]" />
                      </div>
                      <textarea
                        required
                        value={registerData.storeAddress}
                        onChange={(e) => setRegisterData({ ...registerData, storeAddress: e.target.value })}
                        className="w-full min-h-[80px] bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 pt-3 text-xs font-bold focus:ring-4 focus:ring-[#9a6bff]/10 focus:border-[#9a6bff] outline-none transition-all resize-none"
                        placeholder="123 Shopping Arcade, Mumbai, IN"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="col-span-2 w-full h-14 bg-[#151515] text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-black hover:shadow-2xl hover:shadow-black/20 active:scale-95 transition-all disabled:opacity-50 mt-4 shadow-lg shadow-gray-200"
                  >
                    {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Request Registry <ArrowRight className="h-4 w-4" /></>}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

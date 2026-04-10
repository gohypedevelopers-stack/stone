import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ShieldCheck, Mail, Lock, ArrowRight, Activity, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api'}/admin/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Welcome back, Admin!");
        localStorage.setItem("adminUser", JSON.stringify(data.data));
        if (onLoginSuccess) {
          onLoginSuccess(data.data);
        }
      } else {
        toast.error(data.message || "Invalid credentials");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred during login. Check server connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-black selection:bg-pink-500/30">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-[2px] bg-blue-600/20 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-[2px] bg-pink-600/20 blur-[140px] animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-[2px] bg-purple-600/20 blur-[100px] animate-pulse" style={{ animationDuration: '7s' }} />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[420px] p-8 relative z-10"
      >
        <div className="backdrop-blur-2xl bg-white/5 border border-white/10 p-10 rounded-[2px] shadow-[0_0_80px_rgba(0,0,0,0.8)] relative overflow-hidden">
          
          {/* Edge Highlights */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          
          <div className="flex flex-col items-center mb-10">
            <motion.div 
              initial={{ scale: 0.8, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
              className="w-16 h-16 rounded-[2px] bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mb-5 shadow-[0_0_30px_rgba(236,72,153,0.4)]"
            >
              <ShieldCheck className="text-white w-8 h-8" />
            </motion.div>
            <h1 className="text-3xl font-black text-white tracking-tight">Admin Portal</h1>
            <p className="text-stone-400 mt-2 text-sm text-center">Enter your credentials to access the command center.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-widest px-1">Email Space</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-stone-500 group-focus-within:text-pink-400 transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-stone-600 rounded-[2px] pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent transition-all backdrop-blur-md"
                  placeholder="admin@omw.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-widest px-1">Secret Key</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-stone-500 group-focus-within:text-purple-400 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-stone-600 rounded-[2px] pl-11 pr-12 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all backdrop-blur-md"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-stone-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full mt-8 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-[2px] py-4 flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] transition-all disabled:opacity-70 disabled:pointer-events-none"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-[2px] animate-spin" />
              ) : (
                <>
                  <span>Authenticate Access</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>

          {/* Decorative Tech Elements */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-30">
            <Activity className="w-4 h-4 text-green-400" />
            <span className="text-[10px] font-mono text-green-400 tracking-wider">SECURE</span>
          </div>
          <div className="absolute bottom-4 left-4 flex items-center gap-1 opacity-20">
            <Zap className="w-3 h-3 text-white" />
            <span className="text-[9px] font-mono text-white tracking-widest">OMW_SYS_V2</span>
          </div>

        </div>
      </motion.div>
    </div>
  );
}

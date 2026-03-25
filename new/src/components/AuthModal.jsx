import { useState, memo } from "react";
import { useAuth } from "../context/AuthContext";

const AuthModal = memo(({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let result;
    if (isRegistering) {
      if (!formData.name || !formData.mobile) {
        setError("Name and mobile are required");
        setLoading(false);
        return;
      }
      result = await register(formData.name, formData.mobile, formData.email);
    } else {
      if (!formData.mobile) {
        setError("Mobile number is required");
        setLoading(false);
        return;
      }
      result = await login(formData.mobile);
    }

    if (result.success) {
      onClose();
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-[420px] bg-white rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200 transform-gpu will-change-[transform,opacity]">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-black text-stone-900 leading-tight">
                {isRegistering ? "Create Account" : "Welcome Back"}
              </h2>
              <p className="text-stone-500 text-sm mt-1">
                {isRegistering ? "Join us for exclusive offers and rewards." : "Sign in with your mobile number."}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-stone-100 rounded-full transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 outline-none transition-all"
                  required
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">Mobile Number</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-medium">+91</span>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="XXXXXXXXXX"
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-stone-200 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 outline-none transition-all"
                  required
                />
              </div>
            </div>

            {isRegistering && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">Email <span className="text-stone-300 font-normal capitalize">(Optional)</span></label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 outline-none transition-all"
                />
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-stone-900 text-white font-bold hover:bg-stone-800 disabled:bg-stone-200 transition-all shadow-lg active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                isRegistering ? "Create Account" : "Sign In"
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-stone-100 flex flex-col items-center gap-2">
            <p className="text-stone-500 text-sm">
              {isRegistering ? "Already have an account?" : "Don't have an account yet?"}
            </p>
            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError(null);
              }}
              className="text-pink-600 font-bold hover:text-pink-700 transition-colors"
            >
              {isRegistering ? "Sign In Now" : "Register with Mobile"}
            </button>
          </div>
        </div>

        {/* Dynamic Decoration */}
        <div className="bg-stone-50 p-4 text-center">
          <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">
            Secure Authentication powered by OMW Loyalty
          </p>
        </div>
      </div>
    </div>
  );
});

export default AuthModal;

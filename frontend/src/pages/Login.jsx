import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const COUNTRY_CODES = [
  { code: '+1', label: 'US +1' },
  { code: '+44', label: 'UK +44' },
  { code: '+91', label: 'IN +91' },
  { code: '+61', label: 'AU +61' },
  { code: '+81', label: 'JP +81' },
  { code: '+86', label: 'CN +86' },
  { code: '+49', label: 'DE +49' },
  { code: '+33', label: 'FR +33' },
  { code: '+971', label: 'AE +971' },
  { code: '+966', label: 'SA +966' },
];

export default function Login() {
  const [activeTab, setActiveTab] = useState('password');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [countryCode, setCountryCode] = useState('+91');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState(null);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isEmail, setIsEmail] = useState(true);
  const otpRefs = useRef([]);

  const { login, sendOtp, verifyOtp, guestLogin } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await login(username, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const getIdentifier = () => {
    if (isEmail) return email.trim();
    return `${countryCode}${mobile.trim()}`;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const identifier = getIdentifier();
    if (!identifier) {
      toast.error('Please enter your email or phone number');
      return;
    }
    if (!isEmail && mobile.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }
    setOtpLoading(true);
    try {
      const res = await sendOtp(identifier);
      setUserId(res.userId);
      setOtpCode(res.otpCode || '');
      setOtpSent(true);
      toast.success(res.message || 'OTP sent successfully');
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!paste) return;
    const newOtp = [...otp];
    paste.split('').forEach((ch, i) => { if (i < 6) newOtp[i] = ch; });
    setOtp(newOtp);
    const nextIdx = Math.min(paste.length, 5);
    otpRefs.current[nextIdx]?.focus();
  };

  const handleVerifyOtp = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      toast.error('Please enter complete OTP');
      return;
    }
    setLoading(true);
    try {
      await verifyOtp(userId, code);
      toast.success('Login successful!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setOtpLoading(true);
    try {
      const res = await sendOtp(getIdentifier());
      setUserId(res.userId);
      setOtp(['', '', '', '', '', '']);
      toast.success('OTP resent successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    try {
      await guestLogin();
      toast.success('Continuing as guest');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to continue as guest');
    } finally {
      setLoading(false);
    }
  };

  const resetOtpForm = () => {
    setEmail('');
    setMobile('');
    setCountryCode('+91');
    setUserId(null);
    setOtp(['', '', '', '', '', '']);
    setOtpSent(false);
    setOtpCode('');
    setIsEmail(true);
  };

  const otpComplete = otp.join('').length === 6;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-8">
      <div className="w-full max-w-sm sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/40 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">POS System</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Sign in to your account</p>
          </div>

          <div className="flex mb-6 bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
            <button
              onClick={() => { setActiveTab('password'); resetOtpForm(); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === 'password'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Password
            </button>
            <button
              onClick={() => { setActiveTab('otp'); resetOtpForm(); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === 'otp'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              OTP Login
            </button>
          </div>

          {activeTab === 'password' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field"
                  placeholder="Enter your username"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pr-10"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          ) : (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Login via
                </label>
                <div className="flex bg-gray-100 dark:bg-gray-900 rounded-lg p-0.5 mb-4">
                  <button
                    onClick={() => { setIsEmail(true); setOtpSent(false); setOtp(['', '', '', '', '', '']); }}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                      isEmail
                        ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    Email
                  </button>
                  <button
                    onClick={() => { setIsEmail(false); setOtpSent(false); setOtp(['', '', '', '', '', '']); }}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                      !isEmail
                        ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    Mobile
                  </button>
                </div>

                {isEmail ? (
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setOtpSent(false); setOtp(['', '', '', '', '', '']); }}
                    className="input-field"
                    placeholder="Enter your registered email"
                    autoFocus
                  />
                ) : (
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="input-field w-[110px] flex-shrink-0"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>{c.label}</option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => { setMobile(e.target.value.replace(/\D/g, '')); setOtpSent(false); setOtp(['', '', '', '', '', '']); }}
                      className="input-field flex-1"
                      placeholder="Phone number"
                      autoFocus
                    />
                  </div>
                )}
              </div>

              {!otpSent ? (
                <button
                  onClick={handleSendOtp}
                  disabled={otpLoading}
                  className="btn-primary w-full"
                >
                  {otpLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sending OTP...
                    </span>
                  ) : 'Send OTP'}
                </button>
              ) : (
                <div className="space-y-4 animate-in">
                  <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-3 text-center">
                    <p className="text-sm text-primary-700 dark:text-primary-300 font-medium">
                      OTP sent to <span className="font-bold">{getIdentifier()}</span>
                    </p>
                    <p className="text-xs text-primary-500 dark:text-primary-400 mt-0.5">Enter the 6-digit code below</p>
                  </div>
                  {otpCode && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-center">
                      <p className="text-[10px] text-green-600 dark:text-green-400 font-medium uppercase tracking-wider">Dev Mode — OTP Code</p>
                      <p className="text-2xl font-bold text-green-700 dark:text-green-300 tracking-[8px] mt-1">{otpCode}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">
                      One-Time Password
                    </label>
                    <div className="flex justify-center gap-2">
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => { otpRefs.current[i] = el; }}
                          id={`otp-${i}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e)}
                          onPaste={i === 0 ? handleOtpPaste : undefined}
                          className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all duration-200"
                          autoFocus={i === 0}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleVerifyOtp}
                      disabled={loading || !otpComplete}
                      className="btn-primary flex-1"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Verifying...
                        </span>
                      ) : 'Verify & Sign In'}
                    </button>
                    <button
                      onClick={handleResendOtp}
                      disabled={otpLoading}
                      className="btn-secondary px-3 text-sm"
                      title="Resend OTP"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>

                  <button
                    onClick={() => { setOtpSent(false); setOtp(['', '', '', '', '', '']); setUserId(null); }}
                    className="w-full text-center text-sm text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    Change email / phone
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">or</span>
              </div>
            </div>
            <button
              onClick={handleGuestLogin}
              disabled={loading}
              className="btn-secondary w-full mt-4 text-sm"
            >
              {loading ? 'Loading...' : 'Continue as Guest'}
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:underline font-medium">Register</Link>
          </p>
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700/50">
            <p className="text-xs font-medium text-gray-500 mb-2">Demo Credentials:</p>
            <div className="space-y-1.5">
              <p className="text-xs text-gray-400"><span className="font-mono">Superadmin</span> / <span className="font-mono">Admin12345</span> <span className="text-gray-500">— Super Admin</span></p>
              <p className="text-xs text-gray-400"><span className="font-mono">bldmgr1</span> / <span className="font-mono">manager123</span> <span className="text-gray-500">— Building Manager</span></p>
              <p className="text-xs text-gray-400"><span className="font-mono">restmgr1</span> / <span className="font-mono">manager123</span> <span className="text-gray-500">— Restaurant Manager</span></p>
              <p className="text-xs text-gray-400"><span className="font-mono">restmgr2</span> / <span className="font-mono">manager123</span> <span className="text-gray-500">— Restaurant Manager</span></p>
              <p className="text-xs text-gray-400"><span className="font-mono">chef1</span> / <span className="font-mono">chef123</span> <span className="text-gray-500">— Chef</span></p>
              <p className="text-xs text-gray-400"><span className="font-mono">customer1</span> / <span className="font-mono">customer123</span> <span className="text-gray-500">— Customer</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

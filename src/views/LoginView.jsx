import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  User, 
  Lock, 
  Mail, 
  ArrowLeft, 
  Sun, 
  Moon, 
  AlertCircle, 
  Check, 
  KeyRound, 
  ShieldCheck, 
  Send, 
  Key
} from 'lucide-react';
import logoImg from '../assets/logo.png';

export const LoginView = () => {
  const { usersList, setCurrentUser, theme, toggleTheme, addUser, resetUserPassword } = useApp();
  
  // Views: 'login', 'register', 'forgot'
  const [view, setView] = useState('login');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  
  // OTP states (for Forgot Password)
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  
  // Forgot Password step 2 fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Feedback state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Reset form when view changes
  useEffect(() => {
    setError('');
    setSuccess('');
    setOtpSent(false);
    setOtpCode('');
    setGeneratedOtp('');
    setNewPassword('');
    setConfirmPassword('');
  }, [view]);

  // Helper to find user by email or username
  const findUserByIdentifier = (identifier) => {
    if (!identifier) return null;
    const clean = identifier.trim().toLowerCase();
    return usersList.find(
      (u) =>
        (u.email && u.email.toLowerCase() === clean) ||
        (u.username && u.username.toLowerCase() === clean)
    );
  };

  // --- LOGIN HANDLER ---
  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Email dan Password wajib diisi!');
      return;
    }

    setIsLoading(true);
    
    setTimeout(() => {
      const user = findUserByIdentifier(email);
      
      if (user && String(user.pin) === password.trim()) {
        setSuccess('Login Berhasil!');
        localStorage.setItem('currentUser', JSON.stringify(user));
        setTimeout(() => {
          setCurrentUser(user);
        }, 600);
      } else {
        setError('Email atau Password salah!');
      }
      setIsLoading(false);
    }, 600);
  };

  // --- REGISTER HANDLER ---
  const handleRegister = (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password || !name) {
      setError('Semua kolom wajib diisi!');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = (username || cleanEmail.split('@')[0]).trim().toLowerCase();

    // Validasi format email sederhana
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Format email tidak valid!');
      return;
    }

    setIsLoading(true);
    
    setTimeout(() => {
      if (usersList.some((u) => u.email?.toLowerCase() === cleanEmail)) {
        setError('Email sudah digunakan oleh akun lain!');
        setIsLoading(false);
        return;
      }

      if (usersList.some((u) => u.username?.toLowerCase() === cleanUsername)) {
        setError('Username sudah digunakan! Gunakan username lain.');
        setIsLoading(false);
        return;
      }

      const newUser = {
        name: name.trim(),
        email: cleanEmail,
        username: cleanUsername,
        role: 'kasir', // Default role
        pin: password.trim()
      };
      
      addUser(newUser);
      setSuccess('Registrasi berhasil! Silakan masuk.');
      
      setTimeout(() => {
        setView('login');
        setPassword('');
      }, 1200);

      setIsLoading(false);
    }, 700);
  };

  // --- FORGOT PASSWORD STEP 1: SEND OTP ---
  const handleForgotSendOtp = (e) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Masukkan email Anda!');
      return;
    }

    const user = findUserByIdentifier(email);
    if (!user) {
      setError('Email atau akun tidak ditemukan!');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const code = String(Math.floor(100000 + Math.random() * 900000));
      setGeneratedOtp(code);
      setOtpSent(true);
      setSuccess(`Kode verifikasi telah dikirim ke ${user.email || email}!`);
      setIsLoading(false);
    }, 700);
  };

  // --- FORGOT PASSWORD STEP 2: VERIFY & SET NEW PASSWORD ---
  const handleForgotResetPassword = (e) => {
    e.preventDefault();
    setError('');

    if (!otpCode) {
      setError('Masukkan kode OTP verifikasi!');
      return;
    }

    if (otpCode.trim() !== generatedOtp) {
      setError('Kode OTP salah! Periksa kembali kode Anda.');
      return;
    }

    if (!newPassword || newPassword.length < 4) {
      setError('Password baru minimal 4 karakter / angka!');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak cocok!');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const resetSuccess = resetUserPassword(email, newPassword.trim());
      if (resetSuccess) {
        setSuccess('Password baru berhasil disimpan! Silakan login.');
        setTimeout(() => {
          setView('login');
          setPassword('');
          setOtpSent(false);
          setGeneratedOtp('');
          setOtpCode('');
        }, 1200);
      } else {
        setError('Gagal memperbarui password. Silakan coba lagi.');
      }
      setIsLoading(false);
    }, 700);
  };

  // Auto-fill Demo Account
  const handleSelectDemo = (demoEmail, demoPin) => {
    setEmail(demoEmail);
    setPassword(demoPin);
    setError('');
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
      
      {/* Background Decorative Blobs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-orange-400/20 dark:bg-orange-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/20 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glassmorphism Container */}
      <div className="w-full max-w-md p-8 bg-white/80 dark:bg-slate-900/80 border border-white/60 dark:border-slate-800/40 shadow-neo dark:shadow-neo-dark-lg backdrop-blur-xl rounded-3xl relative z-10 flex flex-col justify-between min-h-[560px] transition-all duration-300">
        
        {/* Header Action: Theme toggle */}
        <div className="flex justify-between items-center select-none mb-3">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
            {view === 'login' ? 'Masuk dengan Email' : view === 'register' ? 'Buat Akun Baru' : 'Pemulihan Password'}
          </span>
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/40 dark:border-slate-700/50 shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Ganti Tema"
          >
            {theme === 'dark' ? <Sun size={13} className="text-amber-400" /> : <Moon size={13} className="text-slate-600" />}
          </button>
        </div>

        {/* Logo & Title */}
        <div className="flex flex-col items-center text-center gap-1.5 mb-4">
          <img src={logoImg} alt="Izy Store Logo" className="w-16 h-16 object-contain rounded-full shadow-md border border-slate-100 dark:border-slate-800" />
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100 mt-1">
              {view === 'login' ? 'Selamat Datang' : view === 'register' ? 'Daftar Akun Baru' : 'Lupa Password'}
            </h2>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
              {view === 'login' 
                ? 'Gunakan email Anda untuk mengakses sistem kasir.' 
                : view === 'register' 
                  ? 'Daftar akun kasir dengan email aktif Anda.' 
                  : 'Pulihkan akun dan ubah password melalui verifikasi email.'}
            </p>
          </div>
        </div>

        {/* Feedback Message */}
        <div className="min-h-6 mb-3 flex items-center justify-center text-center w-full">
          {error && (
            <span className="text-xs font-bold text-red-500 flex items-center gap-1.5 animate-pulse bg-red-50 dark:bg-red-950/30 px-3 py-1.5 rounded-lg border border-red-100 dark:border-red-900/50">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </span>
          )}
          {success && (
            <span className="text-xs font-black text-emerald-500 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
              <Check size={14} strokeWidth={3} className="shrink-0" />
              <span>{success}</span>
            </span>
          )}
        </div>

        {/* FORMS */}
        <div className="flex-1 flex flex-col justify-center">
          
          {/* ===================== LOGIN FORM ===================== */}
          {view === 'login' && (
            <div className="flex flex-col gap-3.5">
              <form onSubmit={handleLogin} className="flex flex-col gap-3.5">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail size={18} className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Email (atau username)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-semibold text-sm"
                  />
                </div>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock size={18} className="text-slate-400" />
                  </div>
                  <input
                    type="password"
                    placeholder="Password / PIN"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-semibold text-sm"
                  />
                </div>
                
                <div className="flex justify-end mt-[-4px]">
                  <button 
                    type="button" 
                    onClick={() => setView('forgot')}
                    className="text-xs font-bold text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 transition-colors cursor-pointer"
                  >
                    Lupa Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-1 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-orange-500/30 active:scale-[0.98] transition-all flex justify-center items-center h-12 cursor-pointer"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Masuk ke Akun'
                  )}
                </button>
              </form>

              {/* Demo Accounts Quick Chips */}
              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block text-center mb-1.5">
                  Akun Demo Siap Pakai (Klik untuk pilih):
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSelectDemo('admin@izystore.com', '1234')}
                    className="p-2 bg-orange-50 dark:bg-orange-950/30 hover:bg-orange-100 dark:hover:bg-orange-950/50 border border-orange-200/50 dark:border-orange-900/40 rounded-xl text-left transition-all cursor-pointer flex flex-col"
                  >
                    <span className="text-[11px] font-black text-orange-700 dark:text-orange-400">Owner (Admin)</span>
                    <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 truncate">admin@izystore.com</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectDemo('kasir1@izystore.com', '1111')}
                    className="p-2 bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/50 border border-blue-200/50 dark:border-blue-900/40 rounded-xl text-left transition-all cursor-pointer flex flex-col"
                  >
                    <span className="text-[11px] font-black text-blue-700 dark:text-blue-400">Kasir Satu</span>
                    <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 truncate">kasir1@izystore.com</span>
                  </button>
                </div>
              </div>

              <div className="mt-1 text-center">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Belum punya akun?{' '}
                </span>
                <button
                  type="button"
                  onClick={() => setView('register')}
                  className="text-xs font-black text-slate-800 dark:text-slate-200 hover:text-orange-500 dark:hover:text-orange-400 transition-colors cursor-pointer"
                >
                  Daftar Sekarang
                </button>
              </div>
            </div>
          )}

          {/* ===================== REGISTER FORM ===================== */}
          {view === 'register' && (
            <form onSubmit={handleRegister} className="flex flex-col gap-3.5">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User size={18} className="text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Nama Lengkap"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-semibold text-sm"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={18} className="text-slate-400" />
                </div>
                <input
                  type="email"
                  placeholder="Email Akun (contoh: budi@gmail.com)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-semibold text-sm"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Key size={18} className="text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Username (Opsional, cth: budi123)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-semibold text-sm"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-400" />
                </div>
                <input
                  type="password"
                  placeholder="Password / PIN (Minimal 4 Angka)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-semibold text-sm"
                />
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-1 py-3 bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 hover:from-slate-800 hover:to-slate-950 text-white rounded-2xl font-black text-sm shadow-lg active:scale-[0.98] transition-all flex justify-center items-center h-12 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Buat Akun Sekarang'
                )}
              </button>
              
              <div className="mt-2 text-center">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Sudah punya akun?{' '}
                </span>
                <button
                  type="button"
                  onClick={() => setView('login')}
                  className="text-xs font-black text-orange-500 dark:text-orange-400 hover:text-orange-600 transition-colors cursor-pointer"
                >
                  Masuk di sini
                </button>
              </div>
            </form>
          )}

          {/* ===================== FORGOT PASSWORD FORM ===================== */}
          {view === 'forgot' && (
            <div className="flex flex-col gap-3.5">
              
              {!otpSent ? (
                /* STEP 1: ENTER EMAIL TO RECEIVE OTP */
                <form onSubmit={handleForgotSendOtp} className="flex flex-col gap-3.5">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail size={18} className="text-slate-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Masukkan Email Akun Anda"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-semibold text-sm"
                    />
                  </div>

                  <p className="text-[11px] text-slate-400 dark:text-slate-500 text-left px-1">
                    Kami akan mengirimkan kode verifikasi ke alamat email Anda untuk mereset password secara aman.
                  </p>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-orange-500/30 active:scale-[0.98] transition-all flex justify-center items-center gap-2 h-12 cursor-pointer"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send size={15} />
                        <span>Kirim Kode Verifikasi</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* STEP 2: VERIFY OTP AND SET NEW PASSWORD */
                <form onSubmit={handleForgotResetPassword} className="flex flex-col gap-3">
                  
                  {/* Simulation Notification Card */}
                  <div className="bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/50 p-3 rounded-2xl flex flex-col gap-1.5 text-left text-xs">
                    <div className="flex items-center justify-between text-amber-800 dark:text-amber-300 font-bold">
                      <span>Kode Reset Terkirim</span>
                      <button
                        type="button"
                        onClick={() => setOtpCode(generatedOtp)}
                        className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-lg font-black hover:bg-amber-600 transition-all cursor-pointer"
                      >
                        Isi Otomatis
                      </button>
                    </div>
                    <div className="text-slate-600 dark:text-slate-300 text-[11px]">
                      Kode OTP pemulihan: <span className="font-mono font-black text-base text-amber-600 dark:text-amber-400 tracking-wider ml-1">{generatedOtp}</span>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <ShieldCheck size={18} className="text-slate-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Masukkan 6 Digit OTP"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-mono font-bold text-center tracking-widest text-sm"
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <KeyRound size={18} className="text-slate-400" />
                    </div>
                    <input
                      type="password"
                      placeholder="Password / PIN Baru (min 4 digit)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-semibold text-sm"
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock size={18} className="text-slate-400" />
                    </div>
                    <input
                      type="password"
                      placeholder="Konfirmasi Password Baru"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-semibold text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-emerald-500/30 active:scale-[0.98] transition-all flex justify-center items-center h-12 cursor-pointer"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Simpan Password Baru'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setOtpSent(false); setOtpCode(''); }}
                    className="text-[11px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors text-center cursor-pointer"
                  >
                    Kirim Ulang Kode OTP
                  </button>
                </form>
              )}

              <div className="mt-3 flex justify-center">
                <button
                  type="button"
                  onClick={() => setView('login')}
                  className="flex items-center gap-1.5 text-xs font-black text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  Kembali ke Halaman Login
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest text-center select-none mt-4">
          IZYSTORE ACCESS SYSTEM • EMAIL AUTH
        </div>

      </div>
    </div>
  );
};

export default LoginView;

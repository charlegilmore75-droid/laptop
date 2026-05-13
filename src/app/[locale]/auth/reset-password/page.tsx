'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Laptop, Lock, Loader2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { toast.error(locale === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match'); return; }
    if (password.length < 8) { toast.error(locale === 'ar' ? 'كلمة المرور قصيرة جداً' : 'Password too short'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error); }
      setSuccess(true);
      setTimeout(() => router.push(`/${locale}/auth/login`), 3000);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex w-16 h-16 bg-white/20 rounded-2xl items-center justify-center mb-4">
              <Laptop className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-black text-white">{t('resetPassword')}</h1>
          </div>

          {success ? (
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
              <p className="text-white/80">{locale === 'ar' ? 'تم تغيير كلمة المرور بنجاح. جاري التحويل...' : 'Password changed successfully. Redirecting...'}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Lock className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('password')} className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 rounded-xl px-4 py-3 ps-11 pe-11 outline-none focus:ring-2 focus:ring-white/30 transition-all" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute end-4 top-1/2 -translate-y-1/2 text-white/50">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder={t('confirmPassword')} className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 rounded-xl px-4 py-3 ps-11 outline-none focus:ring-2 focus:ring-white/30 transition-all" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-white text-blue-900 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-70">
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                {locale === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
              </button>
            </form>
          )}
          <Link href={`/${locale}/auth/login`} className="block text-center text-white/60 hover:text-white text-sm mt-4">{t('backToLogin')}</Link>
        </div>
      </motion.div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Laptop, Lock, ShieldCheck, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { signIn } from 'next-auth/react';
import { verifyOTPSchema, type VerifyOTPInput } from '@/lib/validations';

export default function VerifyPage() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<VerifyOTPInput>({
    resolver: zodResolver(verifyOTPSchema),
    defaultValues: { email },
  });

  const onSubmit = async (data: VerifyOTPInput) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Error');
      toast.success(t('emailVerified'));
      await signIn('credentials', { email: data.email, password: data.password, redirect: false });
      router.push(`/${locale}`);
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    setResending(true);
    try {
      await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, lang: locale }),
      });
      toast.success(t('otpSent'));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex w-16 h-16 bg-white/20 rounded-2xl items-center justify-center mb-4 backdrop-blur-sm border border-white/30">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-black text-white">{t('verifyOTP')}</h1>
            <p className="text-white/60 text-sm mt-2">{t('otpSent')}</p>
            <p className="text-white font-medium text-sm mt-1">{email}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input type="hidden" {...register('email')} value={email} />

            {/* OTP */}
            <div>
              <input
                {...register('otp')}
                type="text"
                maxLength={6}
                placeholder={t('otp')}
                className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 rounded-xl px-4 py-4 text-center text-2xl font-bold tracking-[0.5em] outline-none focus:ring-2 focus:ring-white/30 transition-all"
              />
              {errors.otp && <p className="text-red-400 text-xs mt-1 text-center">{errors.otp.message}</p>}
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder={t('password')}
                className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 rounded-xl px-4 py-3 ps-11 pe-11 outline-none focus:ring-2 focus:ring-white/30 transition-all"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute end-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-xs px-1">{errors.password.message}</p>}

            {/* Confirm Password */}
            <div className="relative">
              <Lock className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                {...register('confirmPassword')}
                type={showConfirm ? 'text' : 'password'}
                placeholder={t('confirmPassword')}
                className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 rounded-xl px-4 py-3 ps-11 pe-11 outline-none focus:ring-2 focus:ring-white/30 transition-all"
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute end-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white">
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-400 text-xs px-1">{errors.confirmPassword.message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-blue-900 py-3.5 rounded-xl font-bold text-base hover:bg-blue-50 transition-all flex items-center justify-center gap-2 shadow-xl disabled:opacity-70"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {t('createAccount')}
            </button>
          </form>

          <div className="text-center mt-4">
            <button onClick={resendOTP} disabled={resending} className="text-white/60 hover:text-white text-sm transition-colors disabled:opacity-50">
              {resending ? <Loader2 className="w-4 h-4 animate-spin inline me-1" /> : null}
              {t('resendOTP')}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

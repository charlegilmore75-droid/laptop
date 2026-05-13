'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Laptop, Mail, Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { loginSchema, type LoginInput } from '@/lib/validations';

export default function LoginPage() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email: data.email.toLowerCase(),
        password: data.password,
        redirect: false,
      });
      if (result?.error) {
        if (result.error === 'NOT_VERIFIED') toast.error(t('notVerified'));
        else if (result.error === 'BANNED') toast.error(t('banned'));
        else toast.error(t('loginError'));
      } else {
        toast.success(locale === 'ar' ? 'تم تسجيل الدخول بنجاح' : 'Logged in successfully');
        router.push(`/${locale}`);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animation: `pulse ${2 + Math.random() * 3}s infinite` }}
          />
        ))}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex w-16 h-16 bg-white/20 rounded-2xl items-center justify-center mb-4 backdrop-blur-sm border border-white/30">
              <Laptop className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-black text-white">LaptopStore</h1>
            <p className="text-white/60 text-sm mt-1">{t('login')}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <div className="relative">
                <Mail className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder={t('email')}
                  className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 rounded-xl px-4 py-3 ps-11 outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all"
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1 px-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <Lock className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('password')}
                  className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 rounded-xl px-4 py-3 ps-11 pe-11 outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1 px-1">{errors.password.message}</p>}
            </div>

            {/* Forgot Password */}
            <div className="text-end">
              <Link
                href={`/${locale}/auth/forgot-password`}
                className="text-white/60 hover:text-white text-sm transition-colors"
              >
                {t('forgotPassword')}
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-blue-900 py-3.5 rounded-xl font-bold text-base hover:bg-blue-50 transition-all duration-200 flex items-center justify-center gap-2 shadow-xl disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {t('login')}
            </button>
          </form>

          <p className="text-center text-white/60 text-sm mt-6">
            {t('dontHaveAccount')}{' '}
            <Link href={`/${locale}/auth/register`} className="text-white hover:underline font-semibold">
              {t('register')}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

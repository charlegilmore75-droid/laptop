'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Mail, Laptop, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { registerSchema, type RegisterInput } from '@/lib/validations';

export default function RegisterPage() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email.toLowerCase(), lang: locale }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Error');
      toast.success(t('otpSent'));
      router.push(`/${locale}/auth/verify?email=${encodeURIComponent(data.email.toLowerCase())}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex w-16 h-16 bg-white/20 rounded-2xl items-center justify-center mb-4 backdrop-blur-sm border border-white/30">
              <Laptop className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-black text-white">LaptopStore</h1>
            <p className="text-white/60 text-sm mt-1">{t('register')}</p>
          </div>

          <div className="bg-white/10 rounded-2xl p-4 mb-6 border border-white/20">
            <p className="text-white/80 text-sm text-center">
              {locale === 'ar'
                ? 'أدخل بريدك الإلكتروني، وسنرسل لك كود تحقق للتسجيل.'
                : "Enter your email and we'll send you a verification code to register."}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-blue-900 py-3.5 rounded-xl font-bold text-base hover:bg-blue-50 transition-all duration-200 flex items-center justify-center gap-2 shadow-xl disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
              {t('sendOTP')}
            </button>
          </form>

          <p className="text-center text-white/60 text-sm mt-6">
            {t('alreadyHaveAccount')}{' '}
            <Link href={`/${locale}/auth/login`} className="text-white hover:underline font-semibold">
              {t('login')}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

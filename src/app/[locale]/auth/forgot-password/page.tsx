'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Mail, Laptop, Loader2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { forgotPasswordSchema, type RegisterInput } from '@/lib/validations';

export default function ForgotPasswordPage() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email.toLowerCase(), lang: locale }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Error');
      setSent(true);
      toast.success(locale === 'ar' ? 'تم إرسال رابط إعادة التعيين' : 'Reset link sent');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
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

          {sent ? (
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
              <p className="text-white/80">
                {locale === 'ar' ? 'تحقق من بريدك الإلكتروني لإعادة تعيين كلمة المرور.' : 'Check your email to reset your password.'}
              </p>
              <Link href={`/${locale}/auth/login`} className="block text-white hover:underline">{t('backToLogin')}</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <div className="relative">
                  <Mail className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder={t('email')}
                    className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 rounded-xl px-4 py-3 ps-11 outline-none focus:ring-2 focus:ring-white/30 transition-all"
                  />
                </div>
                {errors.email && <p className="text-red-400 text-xs mt-1 px-1">{errors.email.message}</p>}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-blue-900 py-3.5 rounded-xl font-bold hover:bg-blue-50 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                {locale === 'ar' ? 'إرسال رابط الاسترداد' : 'Send Reset Link'}
              </button>
              <Link href={`/${locale}/auth/login`} className="block text-center text-white/60 hover:text-white text-sm mt-2">
                {t('backToLogin')}
              </Link>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

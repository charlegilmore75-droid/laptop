'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Camera, Save, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProfileUser {
  id: string; name?: string | null; email: string; phone?: string | null; address?: string | null; avatar?: string | null; role: string;
}

export default function ProfileClient({ user, locale }: { user: ProfileUser; locale: string }) {
  const t = useTranslations('profile');
  const isRTL = locale === 'ar';
  const [form, setForm] = useState({ name: user.name || '', phone: user.phone || '', address: user.address || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, phone: form.phone, address: form.address }),
      });
      if (!res.ok) throw new Error();
      toast.success(isRTL ? 'تم تحديث الملف الشخصي' : 'Profile updated');
    } catch { toast.error(isRTL ? 'حدث خطأ' : 'Error'); }
    finally { setSaving(false); }
  };

  const changePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error(isRTL ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
      return;
    }
    setChangingPassword(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      toast.success(isRTL ? 'تم تغيير كلمة المرور' : 'Password changed');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } finally { setChangingPassword(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-3xl font-black shadow-xl">
            {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
          </div>
          <button className="absolute -bottom-1 -end-1 w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors">
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>
        <div>
          <h1 className="text-xl font-black text-foreground">{user.name || (isRTL ? 'بدون اسم' : 'No name')}</h1>
          <p className="text-muted-foreground text-sm">{user.email}</p>
          <span className="inline-flex text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full mt-1">{user.role}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {[
          { key: 'profile', label: t('title'), icon: User },
          { key: 'security', label: isRTL ? 'الأمان' : 'Security', icon: Lock },
        ].map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as 'profile' | 'security')} className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-6 space-y-4">
          {[
            { key: 'name', label: t('name'), icon: User, placeholder: isRTL ? 'اسمك الكامل' : 'Your full name' },
            { key: 'phone', label: t('phone'), icon: Phone, placeholder: '+963...' },
            { key: 'address', label: t('address'), icon: MapPin, placeholder: isRTL ? 'عنوانك التفصيلي' : 'Your detailed address' },
          ].map((f) => (
            <div key={f.key}>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{f.label}</label>
              <div className="relative">
                <f.icon className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={form[f.key as keyof typeof form]}
                  onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="w-full border border-border rounded-xl px-4 py-3 ps-11 bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                />
              </div>
            </div>
          ))}

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t('email')}</label>
            <div className="relative">
              <Mail className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="email" value={user.email} disabled className="w-full border border-border rounded-xl px-4 py-3 ps-11 bg-muted text-muted-foreground text-sm cursor-not-allowed" />
            </div>
          </div>

          <button onClick={saveProfile} disabled={saving} className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-60">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {t('updateProfile')}
          </button>
        </motion.div>
      )}

      {activeTab === 'security' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-foreground">{t('changePassword')}</h3>
          {[
            { key: 'currentPassword', label: t('currentPassword'), show: showCurrent, toggle: () => setShowCurrent(!showCurrent) },
            { key: 'newPassword', label: t('newPassword'), show: showNew, toggle: () => setShowNew(!showNew) },
            { key: 'confirmPassword', label: t('confirmPassword'), show: showNew, toggle: () => setShowNew(!showNew) },
          ].map((f) => (
            <div key={f.key}>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{f.label}</label>
              <div className="relative">
                <Lock className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={f.show ? 'text' : 'password'}
                  value={passwordForm[f.key as keyof typeof passwordForm]}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full border border-border rounded-xl px-4 py-3 ps-11 pe-11 bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                />
                <button type="button" onClick={f.toggle} className="absolute end-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {f.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
          <button onClick={changePassword} disabled={changingPassword} className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-60">
            {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            {isRTL ? 'تغيير كلمة المرور' : 'Change Password'}
          </button>
        </motion.div>
      )}
    </div>
  );
}

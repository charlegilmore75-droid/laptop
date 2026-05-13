'use client';

import { useState } from 'react';
import { Loader2, Save, Globe, Wrench, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSettingsClient({ settings: initialSettings, locale }: { settings: Record<string, string | null>; locale: string }) {
  const isRTL = locale === 'ar';
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);

  const update = (key: string, value: string) => setSettings((p) => ({ ...p, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      await fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) });
      toast.success(isRTL ? 'تم حفظ الإعدادات' : 'Settings saved');
    } catch { toast.error('Error'); }
    finally { setSaving(false); }
  };

  const field = (key: string, label: string, type: string = 'text', placeholder?: string) => (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</label>
      {type === 'textarea' ? (
        <textarea value={settings[key] || ''} onChange={(e) => update(key, e.target.value)} rows={3} placeholder={placeholder} className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
      ) : (
        <input type={type} value={settings[key] || ''} onChange={(e) => update(key, e.target.value)} placeholder={placeholder} className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30" />
      )}
    </div>
  );

  const toggle = (key: string, label: string) => (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <span className="text-sm text-foreground">{label}</span>
      <button onClick={() => update(key, settings[key] === 'true' ? 'false' : 'true')} className={`w-12 h-6 rounded-full transition-colors ${settings[key] === 'true' ? 'bg-primary' : 'bg-muted'}`}>
        <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform m-0.5 ${settings[key] === 'true' ? 'translate-x-6' : 'translate-x-0'}`} />
      </button>
    </div>
  );

  const sections = [
    {
      icon: Globe,
      title: isRTL ? 'معلومات الموقع' : 'Site Information',
      fields: [
        { key: 'siteName', label: isRTL ? 'اسم الموقع' : 'Site Name', placeholder: 'LaptopStore' },
        { key: 'contactEmail', label: isRTL ? 'البريد الإلكتروني' : 'Contact Email', type: 'email' },
        { key: 'contactPhone', label: isRTL ? 'رقم الهاتف' : 'Phone Number' },
        { key: 'address', label: isRTL ? 'العنوان' : 'Address', type: 'textarea' },
      ],
    },
    {
      icon: Globe,
      title: isRTL ? 'وسائل التواصل' : 'Social Media',
      fields: [
        { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/...' },
        { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/...' },
        { key: 'twitter', label: 'Twitter/X', placeholder: 'https://twitter.com/...' },
        { key: 'whatsapp', label: 'WhatsApp', placeholder: '+963...' },
      ],
    },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-black text-foreground">{isRTL ? 'إعدادات الموقع' : 'Site Settings'}</h1>

      {sections.map((section) => (
        <div key={section.title} className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 p-5 border-b border-border bg-accent/30">
            <section.icon className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-foreground">{section.title}</h2>
          </div>
          <div className="p-5 grid grid-cols-1 gap-4">
            {section.fields.map((f) => field(f.key, f.label, f.type || 'text', f.placeholder))}
          </div>
        </div>
      ))}

      {/* Toggles */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 p-5 border-b border-border bg-accent/30">
          <Wrench className="w-5 h-5 text-primary" />
          <h2 className="font-bold text-foreground">{isRTL ? 'إعدادات عامة' : 'General Settings'}</h2>
        </div>
        <div className="p-5">
          {toggle('maintenanceMode', isRTL ? 'وضع الصيانة' : 'Maintenance Mode')}
          {toggle('walletEnabled', isRTL ? 'تفعيل المحفظة' : 'Enable Wallet')}
        </div>
      </div>

      <button onClick={save} disabled={saving} className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {isRTL ? 'حفظ الإعدادات' : 'Save Settings'}
      </button>
    </div>
  );
}

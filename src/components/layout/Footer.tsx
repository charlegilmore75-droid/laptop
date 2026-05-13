'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Laptop, Facebook, Instagram, Twitter, MessageCircle, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const t = useTranslations('footer');
  const nt = useTranslations('nav');
  const locale = useLocale();

  const quickLinks = [
    { href: `/${locale}`, label: nt('home') },
    { href: `/${locale}/products`, label: nt('products') },
    { href: `/${locale}/products?featured=true`, label: nt('offers') },
    { href: `/${locale}/support`, label: nt('support') },
  ];

  return (
    <footer className="bg-secondary/30 border-t border-border mt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <Link href={`/${locale}`} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-400 rounded-xl flex items-center justify-center shadow-lg">
                <Laptop className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-black text-gradient">LaptopStore</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              {t('description')}
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: Facebook, href: '#', label: 'Facebook' },
                { icon: Instagram, href: '#', label: 'Instagram' },
                { icon: Twitter, href: '#', label: 'Twitter' },
                { icon: MessageCircle, href: '#', label: 'WhatsApp' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 bg-card border border-border rounded-xl flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all duration-200 hover:scale-110"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-bold text-foreground">{t('quickLinks')}</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h4 className="font-bold text-foreground">{t('categories')}</h4>
            <ul className="space-y-2">
              {[
                { label: locale === 'ar' ? 'لابتوبات' : 'Laptops', href: `/${locale}/products?type=laptops` },
                { label: locale === 'ar' ? 'اكسسوارات' : 'Accessories', href: `/${locale}/products?type=accessories` },
                { label: locale === 'ar' ? 'فأرة وكيبورد' : 'Mouse & Keyboard', href: `/${locale}/products?type=peripherals` },
                { label: locale === 'ar' ? 'شاشات' : 'Monitors', href: `/${locale}/products?type=monitors` },
                { label: locale === 'ar' ? 'عروض خاصة' : 'Special Offers', href: `/${locale}/products?featured=true` },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground hover:text-primary text-sm transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-bold text-foreground">{t('contact')}</h4>
            <ul className="space-y-3">
              {[
                { icon: Mail, text: 'support@laptopstore.sy' },
                { icon: Phone, text: '+963 11 XXX XXXX' },
                { icon: MapPin, text: locale === 'ar' ? 'دمشق، سوريا' : 'Damascus, Syria' },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-muted-foreground text-sm">
                  <Icon className="w-4 h-4 text-primary flex-shrink-0" />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm text-center">
            © 2024 LaptopStore. {t('rights')}.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-muted-foreground hover:text-primary text-sm transition-colors">
              {t('privacy')}
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary text-sm transition-colors">
              {t('terms')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

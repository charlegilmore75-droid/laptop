'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, ShoppingBag, Users, Wallet, MessageSquare,
  Image as ImageIcon, Settings, CreditCard, ChevronRight, LogOut, Laptop, Menu, X, BarChart2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = (locale: string) => [
  { icon: LayoutDashboard, label: locale === 'ar' ? 'لوحة التحكم' : 'Dashboard', href: `/${locale}/admin` },
  { icon: Package, label: locale === 'ar' ? 'المنتجات' : 'Products', href: `/${locale}/admin/products` },
  { icon: ShoppingBag, label: locale === 'ar' ? 'الطلبات' : 'Orders', href: `/${locale}/admin/orders` },
  { icon: Users, label: locale === 'ar' ? 'المستخدمون' : 'Users', href: `/${locale}/admin/users` },
  { icon: Wallet, label: locale === 'ar' ? 'المحفظة' : 'Wallet', href: `/${locale}/admin/wallet` },
  { icon: MessageSquare, label: locale === 'ar' ? 'الرسائل' : 'Messages', href: `/${locale}/admin/messages` },
  { icon: ImageIcon, label: locale === 'ar' ? 'البنرات' : 'Banners', href: `/${locale}/admin/banners` },
  { icon: CreditCard, label: locale === 'ar' ? 'طرق الدفع' : 'Payment Methods', href: `/${locale}/admin/payment-methods` },
  { icon: Settings, label: locale === 'ar' ? 'الإعدادات' : 'Settings', href: `/${locale}/admin/settings` },
];

export default function AdminSidebar({ locale }: { locale: string }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isRTL = locale === 'ar';

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-border">
        <Link href={`/${locale}/admin`} className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-400 rounded-xl flex items-center justify-center">
            <Laptop className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-black text-sm text-foreground">LaptopStore</p>
            <p className="text-xs text-muted-foreground">{isRTL ? 'لوحة الإدارة' : 'Admin Panel'}</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems(locale).map((item) => {
          const isActive = pathname === item.href || (item.href !== `/${locale}/admin` && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {item.label}
              {isActive && <ChevronRight className={cn('w-4 h-4 ms-auto', isRTL && 'rotate-180')} />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border space-y-1">
        <Link href={`/${locale}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
          <Laptop className="w-5 h-5" />
          {isRTL ? 'عرض الموقع' : 'View Site'}
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: `/${locale}` })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          {isRTL ? 'تسجيل الخروج' : 'Logout'}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0 border-e border-border bg-card min-h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 start-4 z-40 w-10 h-10 bg-card border border-border rounded-xl flex items-center justify-center shadow-lg"
      >
        <Menu className="w-5 h-5 text-foreground" />
      </button>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: isRTL ? 300 : -300 }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? 300 : -300 }}
              transition={{ type: 'spring', damping: 25 }}
              className={cn('fixed top-0 bottom-0 z-50 w-72 bg-card border-e border-border', isRTL ? 'right-0' : 'left-0')}
            >
              <button onClick={() => setMobileOpen(false)} className="absolute top-4 end-4">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

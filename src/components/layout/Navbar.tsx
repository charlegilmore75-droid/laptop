'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Heart, GitCompare, Bell, Search, Menu, X,
  Sun, Moon, Globe, User, LogOut, Package, Wallet, Settings,
  ChevronDown, Laptop
} from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const itemCount = useCartStore((s) => s.itemCount());
  const isRTL = locale === 'ar';
  const otherLocale = locale === 'ar' ? 'en' : 'ar';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const switchLanguage = () => {
    const newPath = pathname.replace(`/${locale}`, `/${otherLocale}`);
    router.push(newPath);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/${locale}/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { href: `/${locale}`, label: t('home') },
    { href: `/${locale}/products`, label: t('products') },
    { href: `/${locale}/products?category=laptops`, label: t('laptops') },
    { href: `/${locale}/products?featured=true`, label: t('offers') },
    { href: `/${locale}/support`, label: t('support') },
  ];

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-background/95 backdrop-blur-lg border-b border-border shadow-lg'
            : 'bg-background/80 backdrop-blur-sm'
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo */}
            <Link href={`/${locale}`} className="flex items-center gap-2 flex-shrink-0">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-400 rounded-xl flex items-center justify-center shadow-lg">
                <Laptop className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black text-gradient hidden sm:block">LaptopStore</span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    pathname === link.href
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Language */}
              <button
                onClick={switchLanguage}
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
              >
                <Globe className="w-4 h-4" />
                <span>{otherLocale === 'ar' ? 'عربي' : 'EN'}</span>
              </button>

              {/* Wishlist */}
              <Link
                href={`/${locale}/wishlist`}
                className="hidden sm:flex p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              >
                <Heart className="w-5 h-5" />
              </Link>

              {/* Cart */}
              <Link
                href={`/${locale}/cart`}
                className="relative p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              {session?.user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                      {session.user.name?.[0]?.toUpperCase() || session.user.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
                  </button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -8 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -8 }}
                          transition={{ duration: 0.15 }}
                          className={cn(
                            'absolute top-full mt-2 w-56 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-20',
                            isRTL ? 'left-0' : 'right-0'
                          )}
                        >
                          <div className="p-3 border-b border-border bg-accent/50">
                            <p className="font-semibold text-sm text-foreground">{session.user.name || 'المستخدم'}</p>
                            <p className="text-xs text-muted-foreground">{session.user.email}</p>
                          </div>
                          <div className="p-2">
                            {[
                              { href: `/${locale}/profile`, icon: User, label: t('profile') },
                              { href: `/${locale}/orders`, icon: Package, label: t('orders') },
                              { href: `/${locale}/wallet`, icon: Wallet, label: t('wallet') },
                              { href: `/${locale}/wishlist`, icon: Heart, label: t('wishlist') },
                              ...(session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN'
                                ? [{ href: `/${locale}/admin`, icon: Settings, label: t('admin') }]
                                : []),
                            ].map((item) => (
                              <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-foreground hover:bg-accent transition-colors"
                              >
                                <item.icon className="w-4 h-4 text-muted-foreground" />
                                {item.label}
                              </Link>
                            ))}
                            <button
                              onClick={() => { setUserMenuOpen(false); signOut({ callbackUrl: `/${locale}` }); }}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                              {t('logout')}
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  href={`/${locale}/auth/login`}
                  className="hidden sm:flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  <User className="w-4 h-4" />
                  {t('login')}
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-border bg-background overflow-hidden"
            >
              <div className="container mx-auto px-4 py-4 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <button
                    onClick={switchLanguage}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-foreground hover:bg-accent transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    {otherLocale === 'ar' ? 'عربي' : 'English'}
                  </button>
                </div>
                {!session?.user && (
                  <Link
                    href={`/${locale}/auth/login`}
                    onClick={() => setMobileOpen(false)}
                    className="block text-center bg-primary text-primary-foreground px-4 py-3 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
                  >
                    {t('login')}
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-2xl bg-card rounded-2xl shadow-2xl overflow-hidden border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleSearch} className="flex items-center gap-3 p-4">
                <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isRTL ? 'ابحث عن منتج...' : 'Search for a product...'}
                  className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-lg"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="p-1 rounded-lg hover:bg-accent text-muted-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div className="h-16 lg:h-18" />
    </>
  );
}

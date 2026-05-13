'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Shield, Truck, Headphones, ChevronDown } from 'lucide-react';
import type { Banner } from '@/types';

interface HeroSectionProps {
  banners?: Banner[];
}

const defaultSlides = [
  {
    titleAr: 'اكتشف عالم اللابتوبات',
    titleEn: 'Discover the World of Laptops',
    subtitleAr: 'أحدث الموديلات بأفضل الأسعار. جودة مضمونة، وشحن سريع إلى باب منزلك.',
    subtitleEn: 'Latest models at the best prices. Guaranteed quality, fast shipping to your door.',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1600&q=80',
    color: 'from-blue-900/80 to-blue-600/40',
  },
  {
    titleAr: 'تشكيلة واسعة من الاكسسوارات',
    titleEn: 'Wide Range of Accessories',
    subtitleAr: 'كل ما تحتاجه لإكمال تجربتك التقنية في مكان واحد.',
    subtitleEn: 'Everything you need to complete your tech experience in one place.',
    image: 'https://images.unsplash.com/photo-1593640408182-31c228522b74?w=1600&q=80',
    color: 'from-slate-900/80 to-indigo-600/40',
  },
  {
    titleAr: 'عروض حصرية لا تفوتها',
    titleEn: 'Exclusive Deals You Cannot Miss',
    subtitleAr: 'خصومات كبيرة على أشهر الماركات العالمية. محدود لفترة معينة فقط!',
    subtitleEn: 'Huge discounts on the most popular global brands. Limited time only!',
    image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1600&q=80',
    color: 'from-purple-900/80 to-pink-600/40',
  },
];

export default function HeroSection({ banners }: HeroSectionProps) {
  const locale = useLocale();
  const t = useTranslations('hero');
  const isRTL = locale === 'ar';
  const [current, setCurrent] = useState(0);

  const slides = banners && banners.length > 0
    ? banners.map((b) => ({
        titleAr: b.titleAr || '',
        titleEn: b.titleEn || '',
        subtitleAr: b.subtitleAr || '',
        subtitleEn: b.subtitleEn || '',
        image: b.image,
        color: 'from-blue-900/80 to-blue-600/40',
        link: b.link,
      }))
    : defaultSlides;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent((c) => (c + 1) % slides.length);

  const slide = slides[current];
  const title = locale === 'ar' ? slide.titleAr : slide.titleEn;
  const subtitle = locale === 'ar' ? slide.subtitleAr : slide.subtitleEn;

  const features = [
    { icon: Shield, title: t('feature1'), desc: t('feature1Desc') },
    { icon: Truck, title: t('feature2'), desc: t('feature2Desc') },
    { icon: Headphones, title: t('feature3'), desc: t('feature3Desc') },
  ];

  return (
    <section className="relative">
      {/* Main Slider */}
      <div className="relative h-[70vh] min-h-[500px] max-h-[800px] overflow-hidden rounded-3xl mx-4 lg:mx-8 mt-4 shadow-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute inset-0"
          >
            <div
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.image})` }}
            />
            <div className={`absolute inset-0 bg-gradient-to-${isRTL ? 'l' : 'r'} ${slide.color}`} />
          </motion.div>
        </AnimatePresence>

        {/* Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-6 lg:px-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: isRTL ? 60 : -60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isRTL ? -60 : 60 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="max-w-2xl space-y-6"
              >
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold border border-white/30"
                >
                  ✨ {t('badge')}
                </motion.span>
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight"
                >
                  {title}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-white/80 text-lg leading-relaxed max-w-lg"
                >
                  {subtitle}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center gap-4 flex-wrap"
                >
                  <Link
                    href={`/${locale}/products`}
                    className="bg-white text-blue-700 px-8 py-3.5 rounded-2xl font-bold text-base hover:bg-blue-50 transition-all duration-200 shadow-xl active:scale-95"
                  >
                    {t('shopNow')}
                  </Link>
                  <Link
                    href={`/${locale}/products?featured=true`}
                    className="bg-white/20 backdrop-blur-sm text-white border border-white/40 px-8 py-3.5 rounded-2xl font-bold text-base hover:bg-white/30 transition-all duration-200"
                  >
                    {t('exploreOffers')}
                  </Link>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation Arrows */}
        {slides.length > 1 && (
          <>
            <button
              onClick={isRTL ? next : prev}
              className="absolute start-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white flex items-center justify-center hover:bg-white/30 transition-all"
            >
              {isRTL ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
            </button>
            <button
              onClick={isRTL ? prev : next}
              className="absolute end-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white flex items-center justify-center hover:bg-white/30 transition-all"
            >
              {isRTL ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
            </button>
          </>
        )}

        {/* Dots */}
        {slides.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`transition-all duration-300 rounded-full ${
                  i === current ? 'w-8 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Feature Cards */}
      <div className="container mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="flex items-center gap-4 bg-card border border-border rounded-2xl p-4 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-sm">{feature.title}</h3>
                <p className="text-muted-foreground text-xs">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

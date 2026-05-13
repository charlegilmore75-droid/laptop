import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Site Settings ──────────────────────────────────────────────────
  const settings = [
    { key: 'siteName', value: 'LaptopStore' },
    { key: 'walletEnabled', value: 'true' },
    { key: 'maintenanceMode', value: 'false' },
    { key: 'currency', value: 'SYP' },
    { key: 'contactEmail', value: 'support@laptopstore.sy' },
    { key: 'contactPhone', value: '+963 11 XXX XXXX' },
    { key: 'address', value: 'دمشق، سوريا' },
    { key: 'facebook', value: 'https://facebook.com/laptopstore' },
    { key: 'whatsapp', value: '+963XXXXXXXXX' },
  ];

  for (const s of settings) {
    await prisma.siteSettings.upsert({ where: { key: s.key }, update: {}, create: s });
  }
  console.log('✅ Site settings seeded');

  // ── Super Admin ────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('admin123456', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@laptopstore.sy' },
    update: {},
    create: {
      email: 'admin@laptopstore.sy',
      name: 'Super Admin',
      passwordHash: adminHash,
      emailVerified: new Date(),
      role: 'SUPER_ADMIN',
    },
  });
  console.log('✅ Super admin seeded — email: admin@laptopstore.sy | password: admin123456');

  // ── Test User ─────────────────────────────────────────────────────
  const userHash = await bcrypt.hash('user123456', 12);
  const testUser = await prisma.user.upsert({
    where: { email: 'user@test.com' },
    update: {},
    create: {
      email: 'user@test.com',
      name: 'Test User',
      passwordHash: userHash,
      emailVerified: new Date(),
      role: 'USER',
    },
  });

  await prisma.wallet.upsert({
    where: { userId: testUser.id },
    update: {},
    create: { userId: testUser.id, balance: 500000 },
  });
  console.log('✅ Test user seeded — email: user@test.com | password: user123456 | wallet: 500,000 SYP');

  // ── Categories ────────────────────────────────────────────────────
  const categories = [
    { nameAr: 'لابتوبات', nameEn: 'Laptops', slug: 'laptops', sortOrder: 1 },
    { nameAr: 'لابتوبات للألعاب', nameEn: 'Gaming Laptops', slug: 'gaming-laptops', sortOrder: 2 },
    { nameAr: 'لابتوبات للأعمال', nameEn: 'Business Laptops', slug: 'business-laptops', sortOrder: 3 },
    { nameAr: 'اكسسوارات', nameEn: 'Accessories', slug: 'accessories', sortOrder: 4 },
    { nameAr: 'شاشات', nameEn: 'Monitors', slug: 'monitors', sortOrder: 5 },
    { nameAr: 'ذاكرة وتخزين', nameEn: 'Memory & Storage', slug: 'memory-storage', sortOrder: 6 },
  ];

  const savedCategories: Record<string, string> = {};
  for (const cat of categories) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { ...cat, isActive: true },
    });
    savedCategories[cat.slug] = c.id;
  }
  console.log('✅ Categories seeded');

  // ── Payment Methods ───────────────────────────────────────────────
  const paymentMethods = [
    {
      nameAr: 'سيريتل كاش',
      nameEn: 'Syriatel Cash',
      description: 'الدفع عبر سيريتل كاش',
      accountInfo: 'حول المبلغ إلى الرقم: 0933XXXXXX\nاكتب في الملاحظة: "شحن محفظة LaptopStore"\nأرسل رقم العملية بعد التحويل',
      sortOrder: 1,
    },
    {
      nameAr: 'شام كاش',
      nameEn: 'Sham Cash',
      description: 'الدفع عبر شام كاش',
      accountInfo: 'حول المبلغ إلى الرقم: 0944XXXXXX\nاكتب في الملاحظة: "شحن محفظة LaptopStore"\nأرسل رقم العملية بعد التحويل',
      sortOrder: 2,
    },
    {
      nameAr: 'إم تي إن كاش',
      nameEn: 'MTN Cash',
      description: 'الدفع عبر MTN كاش',
      accountInfo: 'حول المبلغ إلى الرقم: 0988XXXXXX\nاكتب في الملاحظة: "شحن محفظة LaptopStore"',
      sortOrder: 3,
    },
  ];

  for (const pm of paymentMethods) {
    const existing = await prisma.paymentMethod.findFirst({ where: { nameEn: pm.nameEn } });
    if (!existing) {
      await prisma.paymentMethod.create({ data: { ...pm, isActive: true } });
    }
  }
  console.log('✅ Payment methods seeded');

  // ── Products ──────────────────────────────────────────────────────
  const products = [
    {
      nameAr: 'لابتوب Dell Inspiron 15',
      nameEn: 'Dell Inspiron 15 Laptop',
      descriptionAr: 'لابتوب مثالي للاستخدام اليومي مع معالج Intel Core i5 قوي وذاكرة RAM سعة 8GB وتخزين SSD سريع 512GB.',
      descriptionEn: 'Perfect everyday laptop with powerful Intel Core i5 processor, 8GB RAM and fast 512GB SSD storage.',
      price: 8500000,
      discountPrice: 7200000,
      stock: 15,
      categoryId: savedCategories['laptops'],
      brand: 'Dell',
      model: 'Inspiron 15 3511',
      slug: 'dell-inspiron-15-laptop',
      sku: 'DELL-INS-15-001',
      isFeatured: true,
      isActive: true,
      images: ['https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80'],
      thumbnail: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80',
      specsAr: { 'المعالج': 'Intel Core i5-1135G7', 'الذاكرة': '8GB DDR4', 'التخزين': '512GB SSD', 'الشاشة': '15.6 بوصة FHD', 'نظام التشغيل': 'Windows 11' },
      specsEn: { 'Processor': 'Intel Core i5-1135G7', 'Memory': '8GB DDR4', 'Storage': '512GB SSD', 'Display': '15.6" FHD', 'OS': 'Windows 11' },
      tags: ['dell', 'inspiron', 'laptop', 'i5'],
    },
    {
      nameAr: 'لابتوب Gaming ASUS ROG',
      nameEn: 'ASUS ROG Gaming Laptop',
      descriptionAr: 'لابتوب ألعاب احترافي مع بطاقة رسوميات RTX 3060 ومعالج Ryzen 7 قوي. تجربة ألعاب لا مثيل لها.',
      descriptionEn: 'Professional gaming laptop with RTX 3060 graphics and powerful Ryzen 7 processor. Unmatched gaming experience.',
      price: 18000000,
      discountPrice: null,
      stock: 8,
      categoryId: savedCategories['gaming-laptops'],
      brand: 'ASUS',
      model: 'ROG Strix G15',
      slug: 'asus-rog-gaming-laptop',
      sku: 'ASUS-ROG-G15-001',
      isFeatured: true,
      isActive: true,
      images: ['https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&q=80'],
      thumbnail: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&q=80',
      specsAr: { 'المعالج': 'AMD Ryzen 7 5800H', 'الذاكرة': '16GB DDR4', 'التخزين': '1TB NVMe SSD', 'كرت الشاشة': 'RTX 3060 6GB', 'الشاشة': '15.6 بوصة 144Hz' },
      specsEn: { 'Processor': 'AMD Ryzen 7 5800H', 'Memory': '16GB DDR4', 'Storage': '1TB NVMe SSD', 'GPU': 'RTX 3060 6GB', 'Display': '15.6" 144Hz' },
      tags: ['asus', 'rog', 'gaming', 'rtx'],
    },
    {
      nameAr: 'لابتوب MacBook Pro 14',
      nameEn: 'MacBook Pro 14 inch',
      descriptionAr: 'أقوى لابتوب من Apple مع شريحة M2 Pro المذهلة. أداء استثنائي وعمر بطارية لا يصدق.',
      descriptionEn: 'Apple\'s most powerful laptop with amazing M2 Pro chip. Exceptional performance and incredible battery life.',
      price: 35000000,
      discountPrice: 32000000,
      stock: 5,
      categoryId: savedCategories['business-laptops'],
      brand: 'Apple',
      model: 'MacBook Pro 14 M2',
      slug: 'macbook-pro-14',
      sku: 'APPLE-MBP14-M2',
      isFeatured: true,
      isActive: true,
      images: ['https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600&q=80'],
      thumbnail: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600&q=80',
      specsAr: { 'المعالج': 'Apple M2 Pro', 'الذاكرة': '16GB Unified Memory', 'التخزين': '512GB SSD', 'الشاشة': '14.2 بوصة Liquid Retina XDR', 'البطارية': 'حتى 18 ساعة' },
      specsEn: { 'Processor': 'Apple M2 Pro', 'Memory': '16GB Unified Memory', 'Storage': '512GB SSD', 'Display': '14.2" Liquid Retina XDR', 'Battery': 'Up to 18 hours' },
      tags: ['apple', 'macbook', 'pro', 'm2'],
    },
    {
      nameAr: 'لابتوب Lenovo ThinkPad X1',
      nameEn: 'Lenovo ThinkPad X1 Carbon',
      descriptionAr: 'لابتوب الأعمال الأخف وزناً مع أداء ممتاز. مثالي للمحترفين المتنقلين.',
      descriptionEn: 'Lightest business laptop with excellent performance. Perfect for mobile professionals.',
      price: 22000000,
      discountPrice: 19500000,
      stock: 12,
      categoryId: savedCategories['business-laptops'],
      brand: 'Lenovo',
      model: 'ThinkPad X1 Carbon Gen 11',
      slug: 'lenovo-thinkpad-x1-carbon',
      sku: 'LEN-X1C-G11',
      isFeatured: false,
      isActive: true,
      images: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&q=80'],
      thumbnail: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&q=80',
      specsAr: { 'المعالج': 'Intel Core i7-1365U', 'الذاكرة': '16GB LPDDR5', 'التخزين': '512GB SSD', 'الوزن': '1.12 كغ', 'الشاشة': '14 بوصة IPS' },
      specsEn: { 'Processor': 'Intel Core i7-1365U', 'Memory': '16GB LPDDR5', 'Storage': '512GB SSD', 'Weight': '1.12 kg', 'Display': '14" IPS' },
      tags: ['lenovo', 'thinkpad', 'business', 'ultrabook'],
    },
    {
      nameAr: 'ماوس لاسلكي Logitech MX Master',
      nameEn: 'Logitech MX Master 3S Mouse',
      descriptionAr: 'ماوس احترافي لاسلكي مع سكرول ماغنتي رائع وعمر بطارية طويل.',
      descriptionEn: 'Professional wireless mouse with amazing magnetic scroll and long battery life.',
      price: 1200000,
      discountPrice: 999000,
      stock: 30,
      categoryId: savedCategories['accessories'],
      brand: 'Logitech',
      model: 'MX Master 3S',
      slug: 'logitech-mx-master-3s',
      sku: 'LOG-MXM3S',
      isFeatured: true,
      isActive: true,
      images: ['https://images.unsplash.com/photo-1527814050087-3793815479db?w=600&q=80'],
      thumbnail: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=600&q=80',
      specsAr: { 'الاتصال': 'Bluetooth + USB', 'دقة الاستشعار': '8000 DPI', 'البطارية': '70 يوم', 'التوافق': 'Windows / Mac / Linux' },
      specsEn: { 'Connectivity': 'Bluetooth + USB', 'DPI': '8000 DPI', 'Battery': '70 days', 'Compatibility': 'Windows / Mac / Linux' },
      tags: ['logitech', 'mouse', 'wireless', 'accessories'],
    },
    {
      nameAr: 'شاشة Samsung 27 بوصة 4K',
      nameEn: 'Samsung 27" 4K Monitor',
      descriptionAr: 'شاشة احترافية بدقة 4K مع تقنية HDR10 وسرعة تحديث 60Hz. مثالية للتصميم والعمل.',
      descriptionEn: 'Professional 4K monitor with HDR10 technology and 60Hz refresh rate. Perfect for design and work.',
      price: 5500000,
      discountPrice: 4800000,
      stock: 10,
      categoryId: savedCategories['monitors'],
      brand: 'Samsung',
      model: 'S27A800NMU',
      slug: 'samsung-27-4k-monitor',
      sku: 'SAM-S27A800',
      isFeatured: false,
      isActive: true,
      images: ['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80'],
      thumbnail: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80',
      specsAr: { 'المقاس': '27 بوصة', 'الدقة': '3840x2160 (4K)', 'معدل التحديث': '60Hz', 'نوع اللوحة': 'IPS', 'الحجم': 'HDR10' },
      specsEn: { 'Size': '27"', 'Resolution': '3840x2160 (4K)', 'Refresh Rate': '60Hz', 'Panel': 'IPS', 'HDR': 'HDR10' },
      tags: ['samsung', 'monitor', '4k', 'display'],
    },
    {
      nameAr: 'HP Spectre x360 14',
      nameEn: 'HP Spectre x360 14',
      descriptionAr: 'لابتوب 2-في-1 فاخر مع شاشة OLED قابلة للطي وأداء رائع. لمسة قلم تفاعلية.',
      descriptionEn: 'Luxury 2-in-1 laptop with foldable OLED screen and great performance. Interactive pen touch.',
      price: 28000000,
      discountPrice: 25000000,
      stock: 7,
      categoryId: savedCategories['laptops'],
      brand: 'HP',
      model: 'Spectre x360 14',
      slug: 'hp-spectre-x360-14',
      sku: 'HP-SPX360-14',
      isFeatured: true,
      isActive: true,
      images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80'],
      thumbnail: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80',
      specsAr: { 'المعالج': 'Intel Core i7-1255U', 'الذاكرة': '16GB LPDDR4X', 'التخزين': '1TB SSD', 'الشاشة': '13.5 بوصة OLED', 'التصميم': '2-in-1' },
      specsEn: { 'Processor': 'Intel Core i7-1255U', 'Memory': '16GB LPDDR4X', 'Storage': '1TB SSD', 'Display': '13.5" OLED', 'Design': '2-in-1' },
      tags: ['hp', 'spectre', '2in1', 'oled'],
    },
    {
      nameAr: 'MSI Gaming Laptop Titan GT77',
      nameEn: 'MSI Titan GT77 Gaming Laptop',
      descriptionAr: 'وحش الألعاب MSI Titan بمعالج Intel i9 وكرت RTX 3080 Ti. للاعبين المحترفين فقط.',
      descriptionEn: 'MSI Titan gaming beast with Intel i9 and RTX 3080 Ti. For professional gamers only.',
      price: 45000000,
      discountPrice: null,
      stock: 3,
      categoryId: savedCategories['gaming-laptops'],
      brand: 'MSI',
      model: 'Titan GT77 HX',
      slug: 'msi-titan-gt77',
      sku: 'MSI-TIT-GT77',
      isFeatured: true,
      isActive: true,
      images: ['https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=80'],
      thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=80',
      specsAr: { 'المعالج': 'Intel Core i9-13980HX', 'الذاكرة': '64GB DDR5', 'التخزين': '2TB NVMe SSD', 'كرت الشاشة': 'RTX 3080 Ti 16GB', 'الشاشة': '17.3 بوصة 4K' },
      specsEn: { 'Processor': 'Intel Core i9-13980HX', 'Memory': '64GB DDR5', 'Storage': '2TB NVMe SSD', 'GPU': 'RTX 3080 Ti 16GB', 'Display': '17.3" 4K' },
      tags: ['msi', 'titan', 'gaming', 'rtx3080'],
    },
  ];

  for (const prod of products) {
    const existing = await prisma.product.findUnique({ where: { slug: prod.slug } });
    if (!existing) {
      await prisma.product.create({ data: prod as Parameters<typeof prisma.product.create>[0]['data'] });
    }
  }
  console.log('✅ Products seeded (8 products)');

  // ── Banners ───────────────────────────────────────────────────────
  const banners = [
    {
      titleAr: 'اكتشف عالم اللابتوبات',
      titleEn: 'Discover the World of Laptops',
      subtitleAr: 'أحدث الموديلات بأفضل الأسعار',
      subtitleEn: 'Latest models at the best prices',
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1600&q=80',
      link: '/ar/products',
      isActive: true,
      sortOrder: 1,
    },
    {
      titleAr: 'لابتوبات الألعاب',
      titleEn: 'Gaming Laptops',
      subtitleAr: 'تجربة ألعاب لا مثيل لها',
      subtitleEn: 'Unmatched gaming experience',
      image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=1600&q=80',
      link: '/ar/products?category=gaming-laptops',
      isActive: true,
      sortOrder: 2,
    },
  ];

  for (const banner of banners) {
    const existing = await prisma.banner.findFirst({ where: { titleEn: banner.titleEn } });
    if (!existing) {
      await prisma.banner.create({ data: banner });
    }
  }
  console.log('✅ Banners seeded');

  // ── Coupons ───────────────────────────────────────────────────────
  await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      discountType: 'PERCENT',
      discountValue: 10,
      minOrderValue: 1000000,
      maxUses: 100,
      isActive: true,
    },
  });

  await prisma.coupon.upsert({
    where: { code: 'SAVE500K' },
    update: {},
    create: {
      code: 'SAVE500K',
      discountType: 'FIXED',
      discountValue: 500000,
      minOrderValue: 5000000,
      isActive: true,
    },
  });
  console.log('✅ Coupons seeded — WELCOME10 (10%), SAVE500K (500K SYP off)');

  console.log('\n🎉 Seeding complete!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📧 Admin: admin@laptopstore.sy | 🔑 admin123456');
  console.log('📧 User: user@test.com | 🔑 user123456');
  console.log('🏷️  Coupon: WELCOME10 (10% off) | SAVE500K (500K SYP)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

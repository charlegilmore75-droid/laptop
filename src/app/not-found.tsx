import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 px-4">
        <div className="text-9xl font-black text-primary opacity-20">404</div>
        <h1 className="text-4xl font-bold text-foreground">الصفحة غير موجودة</h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم حذفها
        </p>
        <Link
          href="/ar"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
        >
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}

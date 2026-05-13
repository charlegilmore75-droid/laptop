'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Shield, ShieldOff, Loader2, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate, formatPrice, cn } from '@/lib/utils';

interface UserItem {
  id: string; name?: string | null; email: string; role: string; isBanned: boolean;
  emailVerified?: string | null; createdAt: string;
  _count: { orders: number };
  wallet?: { balance: number } | null;
}

export default function AdminUsersClient({ users: initialUsers, locale }: { users: UserItem[]; locale: string }) {
  const isRTL = locale === 'ar';
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return !q || u.email.toLowerCase().includes(q) || u.name?.toLowerCase().includes(q);
  });

  const toggleBan = async (userId: string, isBanned: boolean) => {
    setTogglingId(userId);
    try {
      await fetch(`/api/admin/users/${userId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isBanned: !isBanned }) });
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, isBanned: !isBanned } : u));
      toast.success(isRTL ? (!isBanned ? 'تم حظر المستخدم' : 'تم رفع الحظر') : (!isBanned ? 'User banned' : 'User unbanned'));
    } catch { toast.error('Error'); }
    finally { setTogglingId(null); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-foreground">{isRTL ? 'المستخدمون' : 'Users'}</h1>
      <div className="relative">
        <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={isRTL ? 'بحث...' : 'Search...'} className="w-full border border-border rounded-xl px-4 py-3 ps-11 bg-card text-foreground outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-accent/50 border-b border-border">
                {[isRTL ? 'المستخدم' : 'User', isRTL ? 'الدور' : 'Role', isRTL ? 'الطلبات' : 'Orders', isRTL ? 'رصيد المحفظة' : 'Wallet', isRTL ? 'انضم في' : 'Joined', isRTL ? 'الحالة' : 'Status', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-start text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground"><User className="w-10 h-10 mx-auto mb-2 opacity-30" /></td></tr>
              ) : filtered.map((user, i) => (
                <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="border-b border-border hover:bg-accent/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{user.name || '—'}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('px-2 py-1 rounded-full text-xs font-semibold', user.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' : user.role === 'ADMIN' ? 'bg-blue-100 text-blue-700' : 'bg-secondary text-muted-foreground')}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">{user._count.orders}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{formatPrice(user.wallet?.balance || 0)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(user.createdAt, locale)}</td>
                  <td className="px-4 py-3">
                    <span className={cn('px-2 py-1 rounded-full text-xs font-semibold', user.isBanned ? 'bg-red-100 text-red-700' : user.emailVerified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700')}>
                      {user.isBanned ? (isRTL ? 'محظور' : 'Banned') : user.emailVerified ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'غير متحقق' : 'Unverified')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {user.role === 'USER' && (
                      <button
                        onClick={() => toggleBan(user.id, user.isBanned)}
                        disabled={togglingId === user.id}
                        className={cn('flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors', user.isBanned ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-red-50 text-red-700 hover:bg-red-100')}
                      >
                        {togglingId === user.id ? <Loader2 className="w-3 h-3 animate-spin" /> : user.isBanned ? <ShieldOff className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                        {user.isBanned ? (isRTL ? 'رفع الحظر' : 'Unban') : (isRTL ? 'حظر' : 'Ban')}
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import { useSession } from 'next-auth/react';

export function useAuth() {
  const { data: session, status } = useSession();

  return {
    user: session?.user,
    isAuthenticated: !!session?.user,
    isAdmin: session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN',
    isSuperAdmin: session?.user?.role === 'SUPER_ADMIN',
    isLoading: status === 'loading',
  };
}

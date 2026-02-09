'use client';

import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { Sidebar } from '@/components/Layouts/sidebar';
import { Header } from '@/components/Layouts/header';
import { getUser } from '@/lib/user-store';

export default function HomeLayout({ children }: PropsWithChildren) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const user = getUser();

    // ⛔ ni prijavljen → na login
    if (!user) {
      router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [router, pathname]);

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="w-full bg-gray-2 dark:bg-[#020d1a]">
        <Header />

        <main className="isolate mx-auto w-full max-w-screen-2xl overflow-hidden p-4 md:p-6 2xl:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}

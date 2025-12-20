import type { PropsWithChildren } from "react";
import { Header } from "@/components/Layouts/header";
import { SidebarPlayer } from "@/components/Layouts/sidebar copy";

export default function HomeLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen">
      <SidebarPlayer />

      <div className="w-full bg-gray-2 dark:bg-[#020d1a]">
        <Header />

        <main className="isolate mx-auto w-full max-w-screen-2xl overflow-hidden p-4 md:p-6 2xl:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}

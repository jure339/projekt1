"use client";

import { useEffect, useState } from "react";
import { SearchIcon } from "@/assets/icons";
import Image from "next/image";
import Link from "next/link";
import { useSidebarContext } from "../sidebar/sidebar-context";
import { MenuIcon } from "./icons";
import { ThemeToggleSwitch } from "./theme-toggle";

import { clearUser, getUser, type StoredUser } from "@/lib/user-store";

export function Header() {
  const { toggleSidebar, isMobile } = useSidebarContext();
  const [user, setUser] = useState<StoredUser | null>(null);

  // ✅ preberi userja iz localStorage (takoj ko se header naloži)
  useEffect(() => {
    setUser(getUser());

    // če userja spremeniš v drugi strani (login/logout), poskusimo osvežit
    // (deluje, če boš ob loginu/logoutu sprožil "storage" event v istem tabu - spodaj pokažem kako)
    const onStorage = () => setUser(getUser());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function logout() {
    clearUser();

    // opcijsko: sproži event, da se header posodobi tudi brez refresh-a
    window.dispatchEvent(new Event("storage"));

    window.location.href = "/auth/login";
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-stroke bg-white px-4 py-5 shadow-1 dark:border-stroke-dark dark:bg-gray-dark md:px-5 2xl:px-10">
      <button
        onClick={toggleSidebar}
        className="rounded-lg border px-1.5 py-1 dark:border-stroke-dark dark:bg-[#020D1A] hover:dark:bg-[#FFFFFF1A] lg:hidden"
      >
        <MenuIcon />
        <span className="sr-only">Toggle Sidebar</span>
      </button>

      {isMobile && (
        <Link href={"/"} className="ml-2 max-[430px]:hidden min-[375px]:ml-4">
          <Image
            src={"/images/logo/logo-icon.svg"}
            width={32}
            height={32}
            alt=""
            role="presentation"
          />
        </Link>
      )}

      <div className="max-xl:hidden">
        <h1 className="mb-0.5 text-heading-5 font-bold text-dark dark:text-white">
          Team-Manager
        </h1>
      </div>

      <div className="flex flex-1 items-center justify-end gap-2 min-[375px]:gap-4">
        <div className="relative w-full max-w-[300px]">

          
        </div>

        <ThemeToggleSwitch />

        {/* ✅ DODANO: IZPIS UPORABNIKA (ime+priimek) */}
        <div className="flex items-center gap-3">
          <div className="text-right leading-tight">
            <div className="text-sm font-semibold text-dark dark:text-white">
              {user ? `${user.ime} ${user.priimek}` : "Gost"}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {user ? user.role : "neprijavljen"}
            </div>
          </div>

          {user ? (
            <button
              onClick={logout}
              className="rounded-md border px-3 py-1 text-sm hover:bg-gray-100 dark:border-stroke-dark dark:hover:bg-dark-3"
            >
              Odjava
            </button>
          ) : (
            <Link
              href="/auth/login"
              className="rounded-md border px-3 py-1 text-sm hover:bg-gray-100 dark:border-stroke-dark dark:hover:bg-dark-3"
            >
              Prijava
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

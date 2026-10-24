"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Poppins } from "next/font/google";
import {
  AlignLeft,
  Bell,
  BookOpen,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  MessageSquare,
  Search,
  Settings,
  TrendingUp,
  UserRound,
  Users,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { avatarOrDefault } from "@/lib/avatars";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/client";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const NAV = [
  { label: "Dashboard", href: "/teacher/dashboard", icon: LayoutDashboard },
  { label: "My Classes", href: "/teacher/classes", icon: Users },
  { label: "Students", href: "/teacher/students", icon: UserRound },
  { label: "Curriculum", href: "/teacher/curriculum", icon: BookOpen },
  { label: "Assignments", href: "/teacher/assignments", icon: ClipboardList },
  { label: "Progress", href: "/teacher/progress", icon: TrendingUp },
  { label: "Messages", href: "/teacher/messages", icon: MessageSquare },
  { label: "Calendar", href: "/teacher/calendar", icon: CalendarDays },
  { label: "Settings", href: "/teacher/settings", icon: Settings },
];

export default function TeacherLayout({ children }: { children: ReactNode }) {
  const { t, dir } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const userName = user ? [user.firstName, user.lastName].filter(Boolean).join(" ") : t("Ms. Mona Hassan");

  const avatar = avatarOrDefault(user?.photoUrl, 0, user?.gender);

  function toggleSidebar() {
    if (window.matchMedia("(min-width: 1024px)").matches) {
      setCollapsed((c) => !c);
    } else {
      setMobileOpen((o) => !o);
    }
  }

  const closeMobile = () => setMobileOpen(false);

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  // The sidebar, the top bar and the content all use --sb, so they always line up (in both directions)
  const frameVars = {
    "--fw": "calc(100vw - 1.5rem)",
    "--fh": "calc(100svh - 1.5rem)",
    "--sw": "min(var(--fw), calc(var(--fh) * 1.40625))",
    "--u": "calc(var(--sw) / 100)",
    "--c": "min(calc(var(--fw) / 100), calc((var(--fh) - 90px) / 50.08))",
    "--t": "max(0px, calc(var(--c) * 70.7 - var(--fh) - 90px))",
    "--sb": collapsed ? "calc(var(--u) * 8.3)" : "calc(var(--u) * 19.4)",
    "--cx": dir === "rtl" ? "calc((100% - var(--sb)) / 2)" : "calc((100% + var(--sb)) / 2)",
    "--hl": "calc(var(--sb) + var(--u) * 2)",
    "--bgw": "max(var(--fw), calc(var(--fh) * 1.40625))",
    "--bgh": "calc(var(--bgw) / 1.40625)",
  } as CSSProperties;

  return (
    <div dir={dir} className={cn(poppins.className, "min-h-screen bg-white lg:h-svh lg:overflow-hidden lg:p-1")}>
      <div
        style={frameVars}
        className="relative min-h-screen w-full overflow-hidden bg-white lg:h-full lg:min-h-0 lg:rounded-[28px] lg:shadow-[0_24px_70px_rgba(20,54,90,0.22)]"
      >
        {/* Mobile overlay */}
        {mobileOpen && (
          <button
            type="button"
            aria-label={t("Close menu")}
            onClick={closeMobile}
            className="absolute inset-0 z-20 bg-black/30 lg:hidden"
          />
        )}

        <aside
          className={cn(
            "absolute inset-y-0 start-0 z-30 flex flex-col overflow-hidden border-e border-white/70 bg-[linear-gradient(180deg,rgba(198,236,255,0.78)_0%,rgba(217,243,255,0.45)_55%,rgba(203,233,252,0.6)_100%)] pb-5 shadow-[0_8px_40px_rgba(20,54,90,0.10)] backdrop-blur-xl transition-[width,transform] duration-300",
            mobileOpen ? "w-64 rounded-e-[2rem] px-4 pt-5" : "w-14 rounded-e-[2rem] px-2 pt-5",
            "lg:w-[var(--sb)]",
            collapsed ? "lg:px-[0.6em]" : "lg:px-[1.2em]",
            mobileOpen ? "translate-x-0" : "-translate-x-[120%] rtl:translate-x-[120%]",
            // lg:rtl:translate-x-0 is needed so the Arabic sidebar is not pushed off the screen on desktop
            "lg:translate-x-0 lg:rtl:translate-x-0 lg:rounded-ee-[4.7em] lg:rounded-se-[6.5em] lg:pt-[2.8em] lg:[font-size:clamp(9px,var(--u),16px)]"
          )}
        >
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[40%]">
            <div className="absolute -start-[35%] top-[22%] h-[140%] w-[150%] rounded-[50%] bg-[#9fd3f6]/80" />
            <div className="absolute -end-[45%] top-[48%] h-[120%] w-[150%] rounded-[50%] bg-[#c3e7fb]/90" />
          </div>

          <Link
            href="/"
            onClick={closeMobile}
            aria-label={t("Junior Hub home")}
            className={cn("mb-6 flex h-16 shrink-0 items-center gap-2 rounded-xl px-1", collapsed && "lg:justify-center lg:px-0")}
          >
            <Image
              src="/images/Auth/logo.png"
              alt={t("Junior Hub")}
              width={160}
              height={32}
              priority
              style={{ height: "2em", width: "auto" }}
              className={cn("max-w-full object-contain", collapsed && "lg:hidden")}
            />
            <GraduationCap className={cn("hidden size-6 shrink-0 text-[#14365a]", collapsed && "lg:block")} />
          </Link>

          <nav aria-label={t("Teacher navigation")} className="flex flex-1 flex-col gap-1 py-2">
            {NAV.map(({ label, href, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);

              return (
                <Link
                  key={href}
                  href={href as Route}
                  title={t(label)}
                  onClick={closeMobile}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-10 items-center gap-3 rounded-xl px-3 py-2.5 text-xs text-[#1B2D54] transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12939b]/40",
                    active ? "bg-[#7fdcb8]/80 font-bold text-[#14365a] shadow-sm" : "font-medium hover:bg-white/50",
                    collapsed && "lg:justify-center lg:px-0"
                  )}
                >
                  <Icon aria-hidden className="size-4 shrink-0" strokeWidth={1.8} />
                  <span className={cn("whitespace-nowrap", collapsed && "lg:hidden")}>{t(label)}</span>
                </Link>
              );
            })}
          </nav>

          <div className={cn("mt-auto shrink-0 px-1 pb-2 pt-5", collapsed && "lg:hidden")}>
            <div className="flex items-center gap-2 text-[#1B2D54]">
              <GraduationCap className="size-5 shrink-0" />
              <div className="leading-tight">
                <p className="text-[11px] font-extrabold">JUNIOR HUB</p>
                <p className="text-[9px] font-semibold uppercase tracking-wide text-[#1B2D54]/60 rtl:normal-case rtl:tracking-normal">
                  {t("BUILD YOUR DREAMS")}
                </p>
              </div>
            </div>
          </div>
        </aside>

        <header
          className={cn(
            "relative z-40 flex items-center gap-3 py-4 pe-4 ps-[4rem]",
            "lg:absolute lg:start-[var(--hl)] lg:end-[calc(var(--u)*1.6)] lg:top-[3.8%] lg:gap-[1.2em] lg:p-0 lg:transition-[inset-inline-start] lg:duration-300 lg:[font-size:clamp(9px,var(--u),16px)]"
          )}
        >
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={t("Toggle sidebar")}
            className={cn(
              "grid h-[2.7em] w-[2.7em] shrink-0 place-items-center rounded-full backdrop-blur transition-colors",
              collapsed ? "bg-white/70 text-[#14365a] lg:bg-[#14365a] lg:text-white" : "bg-white/70 text-[#14365a]"
            )}
          >
            <AlignLeft className="h-[1.2em] w-[1.2em]" />
          </button>

          <form
            role="search"
            onSubmit={(e) => e.preventDefault()}
            className="hidden h-[2.8em] max-w-[34em] flex-1 items-center gap-[0.8em] rounded-full border border-white/70 bg-white/55 px-[1.1em] backdrop-blur focus-within:ring-2 focus-within:ring-[#12939b]/40 sm:flex"
          >
            <Search aria-hidden className="h-[1.1em] w-[1.1em] shrink-0 text-[#14365a]/60" />
            <input
              type="search"
              placeholder={t("Search anything....")}
              className="min-w-0 flex-1 bg-transparent text-start text-[0.95em] text-[#14365a] outline-none placeholder:text-[#14365a]/55"
            />
            <kbd
              dir="ltr"
              className="shrink-0 rounded-full bg-[#4a9df8]/25 px-[0.8em] py-[0.25em] font-sans text-[0.8em] font-semibold text-[#2f7fd6]"
            >
              ⌘K
            </kbd>
          </form>

          <LanguageSwitcher className="h-[2.8em] gap-[0.5em] rounded-full border border-white/70 bg-white/55 px-[1em] text-[0.95em] font-medium text-[#14365a] backdrop-blur" />

          {/* me-[1.6em] moves the bell and the teacher name a bit away from the screen edge (both languages) */}
          <div className="ms-auto flex items-center gap-[1.2em] me-[1.6em]">
            <button
              type="button"
              aria-label={t("Notifications")}
              title={t("Notifications")}
              className="grid h-[2.8em] w-[2.8em] place-items-center rounded-full border border-white/70 bg-white/55 text-[#14365a] backdrop-blur"
            >
              <Bell className="h-[1.2em] w-[1.2em]" />
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                aria-expanded={menuOpen}
                className="flex h-[2.8em] items-center gap-[0.7em] rounded-full border border-white/70 bg-white/55 ps-[0.3em] pe-[1em] text-[0.95em] font-medium text-[#14365a] backdrop-blur"
              >
                <span
                  className="relative h-[2.2em] w-[2.2em] shrink-0 overflow-hidden rounded-full ring-2 ring-white"
                  style={{ backgroundColor: avatar.bg }}
                >
                  <Image src={avatar.src} alt={t(avatar.label)} fill sizes="40px" className="object-cover" />
                </span>
                <span className="hidden sm:inline">{userName}</span>
                <ChevronDown className="h-[1em] w-[1em]" />
              </button>

              {menuOpen && (
                <div className="absolute end-0 top-full z-50 mt-2 w-48 rounded-xl border border-white/60 bg-white p-1 text-base shadow-lg">
                  {user?.email && (
                    <p dir="ltr" className="truncate px-3 py-2 text-[11px] text-slate-500">
                      {user.email}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full rounded-lg px-3 py-2 text-start text-xs text-[#14365a] hover:bg-slate-100"
                  >
                    {t("Log out")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main
          className={cn(
            "relative z-10 flex flex-col ps-[4rem] pe-4",
            "lg:absolute lg:inset-0 lg:overflow-y-auto lg:pe-6 lg:pt-20 lg:transition-[padding] lg:duration-300",
            "lg:ps-[calc(var(--sb)+var(--u)*2)]"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

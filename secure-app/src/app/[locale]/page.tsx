import Link from "next/link";
import { ShieldCheck, Monitor, Users } from "lucide-react";
import { useTranslations } from 'next-intl';
import LanguageSwitcher from "@/components/common/LanguageSwitcher";

export default function GatewayPage() {
  const t = useTranslations('Gateway');

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* minimal header */}
      <header className="px-6 h-16 flex items-center justify-between border-b border-slate-200 bg-white">
        <div className="flex items-center gap-2 font-bold text-xl text-slate-900">
          <ShieldCheck className="w-6 h-6 text-indigo-600" />
          <span>SecureApp</span>
        </div>
        <LanguageSwitcher />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">{t('title')}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
          {/* Staff Access Card */}
          <Link href="/login" className="group relative bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-indigo-200 transition-all flex flex-col items-center text-center" data-testid="staff-access-card">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Users className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">{t('staffLogin')}</h2>
            <p className="text-slate-500">{t('staffDesc')}</p>
          </Link>

          {/* Kiosk Mode Card */}
          <Link href="/kiosk" className="group relative bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-emerald-200 transition-all flex flex-col items-center text-center" data-testid="kiosk-mode-card">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Monitor className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">{t('kioskMode')}</h2>
            <p className="text-slate-500">{t('kioskDesc')}</p>
          </Link>
        </div>
      </main>

      <footer className="py-6 text-center text-slate-400 text-sm">
        © 2026 SecureApp Inc.
      </footer>
    </div>
  );
}

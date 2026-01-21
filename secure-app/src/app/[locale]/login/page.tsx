import { LoginForm } from "@/features/auth/LoginForm";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useTranslations } from 'next-intl';

export default function LoginPage() {
    const t = useTranslations('Auth');

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
            <div className="mb-8 text-center">
                <Link href="/" className="inline-flex items-center gap-2 mb-4">
                    <ShieldCheck className="w-8 h-8 text-indigo-600" />
                    <span className="font-bold text-2xl text-slate-900">SecureApp</span>
                </Link>
                <h1 className="text-2xl font-bold text-slate-900">{t('welcomeBack')}</h1>
                <p className="text-slate-600 mt-2">{t('signInSubtitle')}</p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 w-full max-w-md">
                <LoginForm />
            </div>
        </div>
    );
}

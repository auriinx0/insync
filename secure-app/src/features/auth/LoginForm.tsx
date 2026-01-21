"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { LoginSchema, loginSchema } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Mail, AlertCircle } from "lucide-react";

import { useTranslations } from 'next-intl';
import { AuthStorage } from "@/lib/auth-storage";
import { Link } from '@/i18n/routing';

export function LoginForm() {
    const t = useTranslations('Auth');
    const tVal = useTranslations('Validation');
    const router = useRouter();
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginSchema>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginSchema) => {
        setServerError(null);

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        // 1. Check Hardcoded Admin
        if (data.email === "admin@company.com" && data.password === "password123") {
            router.push("/dashboard");
            return;
        }

        // 2. Check Persistent Storage
        const user = AuthStorage.login(data.email, data.password);
        if (user) {
            router.push("/dashboard");
        } else {
            setServerError(t('invalidCredentials'));
        }
    };

    return (
        <div className="w-full max-w-md mx-auto space-y-6">
            {/* Toast Notification (Simulated) */}
            {serverError && (
                <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4">
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3" data-testid="error-toast">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <span className="font-medium text-sm">{serverError}</span>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">{t('emailLabel')}</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            type="email"
                            placeholder={t('emailPlaceholder')}
                            className="pl-9"
                            error={!!errors.email}
                            data-testid="email-input"
                            {...register("email")}
                        />
                    </div>
                    {errors.email && (
                        <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {tVal('invalidEmail')}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">{t('passwordLabel')}</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            type="password"
                            placeholder={t('passwordPlaceholder')}
                            className="pl-9"
                            error={!!errors.password}
                            data-testid="password-input"
                            {...register("password")}
                        />
                    </div>
                    {errors.password && (
                        <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {tVal('passwordTooShort')}
                        </p>
                    )}
                </div>

                <Button type="submit" className="w-full mt-2" isLoading={isSubmitting} data-testid="login-button">
                    {t('signInButton')}
                </Button>
            </form>

            <div className="mt-4 p-4 bg-blue-50 text-blue-800 text-xs rounded border border-blue-100 text-center">
                <p className="font-bold mb-2">{t('demoCredentials')}</p>
                <div className="space-y-1 font-mono bg-white/50 p-2 rounded">
                    <p>admin@company.com</p>
                    <p>password123</p>
                </div>

                <div className="mt-4 pt-4 border-t border-blue-200">
                    <p className="text-slate-600 mb-2">{t('haveAccount')} (No?)</p>
                    <Link href="/signup" className="text-indigo-600 font-bold hover:underline">
                        {t('signUpButton')}
                    </Link>
                </div>
            </div>
        </div>
    );
}

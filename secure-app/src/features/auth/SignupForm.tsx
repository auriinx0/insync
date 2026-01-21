'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Loader2, Mail, Lock, User, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthStorage } from '@/lib/auth-storage';
import { Link } from '@/i18n/routing';

const signupSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupForm() {
    const t = useTranslations('Auth');
    const tVal = useTranslations('Validation');
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignupFormValues>({
        resolver: zodResolver(signupSchema),
    });

    const onSubmit = async (data: SignupFormValues) => {
        setIsLoading(true);
        setError(null);

        // Simulate API delay
        await new Promise(r => setTimeout(r, 800));

        const result = AuthStorage.register({
            email: data.email,
            name: data.name,
            password: data.password,
            role: 'admin' // Default to admin for personal signups
        });

        if (result.success) {
            router.push('/dashboard');
        } else {
            setError(result.error || 'Registration failed');
        }

        setIsLoading(false);
    };

    return (
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                    {t('signUpTitle')}
                </h1>
                <p className="text-gray-500">
                    {t('signUpSubtitle')}
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="name">{t('nameLabel')}</Label>
                    <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                            id="name"
                            placeholder={t('namePlaceholder')}
                            className="pl-10 h-12 bg-gray-50 border-gray-200 focus:bg-white transition-all duration-200"
                            {...register('name')}
                            data-testid="name-input"
                        />
                    </div>
                    {errors.name && (
                        <p className="text-sm text-red-500">{errors.name.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">{t('emailLabel')}</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                            id="email"
                            type="email"
                            placeholder={t('emailPlaceholder')}
                            className="pl-10 h-12 bg-gray-50 border-gray-200 focus:bg-white transition-all duration-200"
                            {...register('email')}
                            data-testid="email-input"
                        />
                    </div>
                    {errors.email && (
                        <p className="text-sm text-red-500">{errors.email.message || tVal('invalidEmail')}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">{t('passwordLabel')}</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                            id="password"
                            type="password"
                            placeholder={t('passwordPlaceholder')}
                            className="pl-10 h-12 bg-gray-50 border-gray-200 focus:bg-white transition-all duration-200"
                            {...register('password')}
                            data-testid="password-input"
                        />
                    </div>
                    {errors.password && (
                        <p className="text-sm text-red-500">{errors.password.message || tVal('passwordTooShort')}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{t('confirmPasswordLabel')}</Label>
                    <div className="relative">
                        <CheckCircle className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                            id="confirmPassword"
                            type="password"
                            placeholder={t('passwordPlaceholder')}
                            className="pl-10 h-12 bg-gray-50 border-gray-200 focus:bg-white transition-all duration-200"
                            {...register('confirmPassword')}
                            data-testid="confirm-password-input"
                        />
                    </div>
                    {errors.confirmPassword && (
                        <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                    )}
                </div>

                {error && (
                    <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm text-center font-medium animate-in fade-in zoom-in-95">
                        {error}
                    </div>
                )}

                <Button
                    type="submit"
                    className="w-full h-12 text-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 transition-all duration-200"
                    disabled={isLoading}
                    data-testid="signup-button"
                >
                    {isLoading ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                        t('signUpButton')
                    )}
                </Button>
            </form>

            <div className="text-center text-sm text-gray-500">
                {t('haveAccount')}{' '}
                <Link
                    href="/login"
                    className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
                >
                    {t('signInLink')}
                </Link>
            </div>
        </div>
    );
}

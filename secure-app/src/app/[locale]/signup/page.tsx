import { getTranslations } from 'next-intl/server';
import SignupForm from '@/features/auth/SignupForm';
import { Shield } from 'lucide-react';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
    const t = await getTranslations({ locale, namespace: 'Auth' });
    return {
        title: t('signUpTitle'),
    };
}

export default function SignupPage() {
    return (
        <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
            <div className="m-auto w-full max-w-md p-6">
                <div className="flex justify-center mb-8">
                    <div className="flex items-center gap-2 text-indigo-600">
                        <Shield className="h-8 w-8" />
                        <span className="text-2xl font-bold tracking-tight">SecureApp</span>
                    </div>
                </div>
                <SignupForm />
            </div>
        </div>
    );
}

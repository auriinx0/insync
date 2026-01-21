import { useTranslations } from 'next-intl';

export default function DashboardPage() {
    const t = useTranslations('Dashboard');

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-slate-900 mb-4">{t('title')}</h1>
                <div className="bg-white p-6 rounded-lg shadow border border-slate-200">
                    <p className="text-xl text-green-600 font-medium">{t('welcome', { name: 'Admin' })}</p>
                    <p className="text-slate-500 mt-2">{t('successMessage')}</p>
                </div>
            </div>
        </div>
    );
}

'use client';

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { clsx } from 'clsx';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const onSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const nextLocale = e.target.value;
        startTransition(() => {
            // Simple path replacement for locale switching
            const currentPath = window.location.pathname;
            const segments = currentPath.split('/');
            // segments[0] is empty, segments[1] is the locale (e.g., 'en' or 'ko')
            segments[1] = nextLocale;
            const newPath = segments.join('/');
            router.push(newPath);
        });
    };

    return (
        <div className="relative inline-flex items-center">
            <Globe className="w-4 h-4 absolute left-2 text-slate-500 pointer-events-none" />
            <select
                defaultValue={locale}
                className={clsx(
                    'appearance-none bg-white border border-slate-300 text-slate-700 py-1 pl-8 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-slate-500 text-sm h-8',
                    isPending && 'opacity-50'
                )}
                onChange={onSelectChange}
                disabled={isPending}
            >
                <option value="en">English</option>
                <option value="ko">한국어</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
            </div>
        </div>
    );
}

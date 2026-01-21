'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Monitor, Clock, UserCheck, AlertCircle, Shield, Download, Trash } from "lucide-react";
import { ShiftStorage } from '@/lib/shift-storage';

export default function KioskPage() {
    const t = useTranslations('Kiosk');

    // State
    const [pin, setPin] = useState('');
    const [isAuth, setIsAuth] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false); // Admin State
    const [employeeName, setEmployeeName] = useState('');
    const [status, setStatus] = useState<'idle' | 'clocked-in' | 'clocked-out'>('idle');
    const [activeShiftId, setActiveShiftId] = useState<string | null>(null);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Mock API Call Handler
    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Simulate Network
        await new Promise(r => setTimeout(r, 600));

        if (pin === "9999") { // Admin Backup Mode
            setIsAdmin(true);
            setPin('');
        } else if (pin === "1234") { // Mock Valid PIN
            setIsAuth(true);
            setEmployeeName("John Doe");
            setStatus("idle");
        } else {
            setError("Invalid Code");
        }
        setLoading(false);
    };

    const handleClockIn = async () => {
        setLoading(true);
        const start = new Date();

        // FAILSAFE: Save to LocalStorage
        const shiftId = ShiftStorage.addShift(employeeName, start);
        setActiveShiftId(shiftId);

        // Simulate API
        await new Promise(r => setTimeout(r, 600));
        setStartTime(start);
        setStatus('clocked-in');
        setLoading(false);
    };

    const handleClockOut = async () => {
        if (!startTime) return;
        setLoading(true);

        const endTime = new Date();

        // FAILSAFE: Complete in LocalStorage
        ShiftStorage.completeShift(activeShiftId, endTime);

        // In a real app, this payload goes to the server
        const payload = {
            employeeName,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
        };

        console.log("ClockOut Payload:", payload);

        // Simulate API
        await new Promise(r => setTimeout(r, 600));

        setStatus('clocked-out');

        // Reset after delay
        setTimeout(() => {
            setIsAuth(false);
            setPin('');
            setStatus('idle');
            setStartTime(null);
            setActiveShiftId(null);
        }, 3000);
        setLoading(false);
    };

    // Admin Actions
    const handleExport = () => {
        ShiftStorage.downloadCSV();
    };

    const handleExitAdmin = () => {
        setIsAdmin(false);
        setPin('');
    };

    if (isAdmin) {
        return (
            <div className="min-h-screen bg-slate-900 text-white p-6">
                <div className="max-w-2xl mx-auto mt-20">
                    <div className="flex items-center gap-3 mb-8 border-b border-slate-700 pb-4">
                        <Shield className="w-8 h-8 text-amber-500" />
                        <h1 className="text-2xl font-bold">Admin Recovery Mode</h1>
                    </div>

                    <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 space-y-6">
                        <p className="text-slate-300">
                            This device stores a local backup of all shifts. Use this if the server is down.
                        </p>

                        <div className="flex flex-col gap-4">
                            <Button onClick={handleExport} className="h-14 text-lg bg-blue-600 hover:bg-blue-700 flex items-center gap-3 justify-center">
                                <Download className="w-5 h-5" />
                                Download Backup CSV
                            </Button>
                            <Button variant="outline" onClick={handleExitAdmin} className="h-12 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
                                Exit Admin Mode
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-6">
            <div className="w-full max-w-md bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700 relative overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <Monitor className="w-8 h-8 text-emerald-400" />
                    <h1 className="text-2xl font-bold">{t('welcome')}</h1>
                </div>

                {/* STEP 1: AUTH */}
                {!isAuth && (
                    <form onSubmit={handleAuth} className="space-y-6">
                        <div className="text-center">
                            <p className="text-slate-400 mb-4">Enter your 4-digit Employee Code</p>
                            <Input
                                type="password"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                placeholder="••••"
                                className="bg-slate-900 border-slate-600 text-center text-2xl tracking-widest h-14"
                                maxLength={4}
                                data-testid="pin-input"
                            />
                        </div>
                        {error && (
                            <div className="flex items-center justify-center gap-2 text-red-400 bg-red-400/10 p-3 rounded" data-testid="error-message">
                                <AlertCircle className="w-4 h-4" />
                                <span>{error}</span>
                            </div>
                        )}
                        <Button
                            type="submit"
                            className="w-full h-12 text-lg bg-emerald-600 hover:bg-emerald-700"
                            disabled={pin.length < 4 || loading}
                            isLoading={loading}
                            data-testid="auth-button"
                        >
                            Next
                        </Button>

                        {/* Subtle Hint for Admin */}
                        <p className="text-xs text-slate-700 mt-4 text-center">Device ID: KIOSK-001</p>
                    </form>
                )}

                {/* STEP 2: ACTION */}
                {isAuth && (
                    <div className="space-y-8 text-center animate-in fade-in slide-in-from-bottom-4">
                        <div>
                            <div className="w-16 h-16 bg-slate-700 rounded-full mx-auto flex items-center justify-center mb-3">
                                <UserCheck className="w-8 h-8 text-emerald-400" />
                            </div>
                            <h2 className="text-xl font-bold">{employeeName}</h2>
                            <p className="text-slate-400">Ready to record time</p>
                        </div>

                        {status === 'idle' && (
                            <Button
                                onClick={handleClockIn}
                                className="w-full h-16 text-xl bg-emerald-600 hover:bg-emerald-700"
                                isLoading={loading}
                                data-testid="clock-in-button"
                            >
                                Clock In
                            </Button>
                        )}

                        {status === 'clocked-in' && (
                            <div className="space-y-4">
                                <div className="bg-emerald-400/10 text-emerald-400 p-4 rounded-lg flex items-center justify-center gap-2">
                                    <Clock className="w-5 h-5" />
                                    <span className="font-bold">Clocked In at {startTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <Button
                                    onClick={handleClockOut}
                                    className="w-full h-16 text-xl bg-red-600 hover:bg-red-700"
                                    isLoading={loading}
                                    data-testid="clock-out-button"
                                >
                                    Clock Out & Finish
                                </Button>
                            </div>
                        )}

                        {status === 'clocked-out' && (
                            <div className="bg-slate-700/50 p-6 rounded-lg">
                                <p className="text-lg font-bold text-emerald-400 mb-2">Shift Recorded Successfully!</p>
                                <p className="text-slate-400 text-sm">Resettings in 3 seconds...</p>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}

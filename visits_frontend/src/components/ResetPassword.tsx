import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { doctorApi } from '../services/api';
import { toast } from 'sonner@2.0.3';

interface ResetPasswordProps {
    token: string;
    onSuccess: () => void;
}

export function ResetPassword({ token, onSuccess }: ResetPasswordProps) {
    const { t, language, dir } = useLanguage();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError(t('passwords_not_match') || 'Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError(t('password_too_short') || 'Password must be at least 8 characters');
            return;
        }

        setLoading(true);

        try {
            await doctorApi.resetPassword({ token, new_password: password });
            setSubmitted(true);
            toast.success(t('password_reset_success') || 'Password reset successfully');
            setTimeout(onSuccess, 3000);
        } catch (error: any) {
            setError(error.message || t('error_resetting_password'));
            toast.error(error.message || t('error_resetting_password'));
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen soft-background flex items-center justify-center p-4" dir={dir}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-effect p-8 rounded-3xl shadow-medium max-w-md w-full text-center border border-white/50"
                >
                    <div className="inline-flex p-4 rounded-2xl bg-green-100 text-green-600 mb-6">
                        <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <h2 className="text-2xl font-bold mb-4">{t('reset_success')}</h2>
                    <p className="text-gray-600 mb-8">
                        {t('password_reset_confirmation')}
                    </p>
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-gray-500">{t('redirecting_to_login')}</p>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen soft-background flex items-center justify-center p-4" dir={dir}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-effect p-8 rounded-3xl shadow-medium max-w-md w-full border border-white/50"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex p-4 rounded-2xl gradient-primary mb-4 text-white">
                        <Lock className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold">{t('reset_password_title')}</h2>
                    <p className="text-gray-600">
                        {t('reset_password_subtitle')}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('new_password')}
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('confirm_password')}
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-700 p-3 rounded-xl flex gap-2 text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full gradient-primary text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            t('reset_password_button')
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}

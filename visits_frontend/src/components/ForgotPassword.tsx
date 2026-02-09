import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { doctorApi } from '../services/api';
import { toast } from 'sonner@2.0.3';

interface ForgotPasswordProps {
    onBack: () => void;
}

export function ForgotPassword({ onBack }: ForgotPasswordProps) {
    const { t, language, dir } = useLanguage();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await doctorApi.forgotPassword(email);
            setSubmitted(true);
            toast.success(t('reset_link_sent') || 'Reset link sent to your email');
        } catch (error: any) {
            toast.error(error.message || t('error_sending_reset_link'));
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
                    <h2 className="text-2xl font-bold mb-4">{t('check_email')}</h2>
                    <p className="text-gray-600 mb-8">
                        {t('reset_instructions_sent')}
                    </p>
                    <button
                        onClick={onBack}
                        className="w-full gradient-primary text-white py-3 rounded-xl flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        {t('back_to_login')}
                    </button>
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
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    {t('back_to_login')}
                </button>

                <div className="text-center mb-8">
                    <div className="inline-flex p-4 rounded-2xl gradient-primary mb-4 text-white">
                        <Mail className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold">{t('forgot_password_title')}</h2>
                    <p className="text-gray-600">
                        {t('forgot_password_subtitle')}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('email_address')}
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                            placeholder="name@example.com"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full gradient-primary text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            t('send_reset_link')
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}

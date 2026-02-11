import React, { useState } from 'react';
import { User } from '../App';
import { useLanguage } from '../contexts/LanguageContext';
import {
  LogIn,
  Globe,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import logo from 'figma:asset/26fdc8a84af1bdd50de5261850b9d1bc61210158.png';
import { doctorApi } from '../services/api';
import { toast } from 'sonner@2.0.3';

interface LoginScreenProps {
  onLogin: (user: User) => void;
  onForgotPassword: () => void;
}

export function LoginScreen({ onLogin, onForgotPassword }: LoginScreenProps) {
  const { language, toggleLanguage, t, dir } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await doctorApi.login(username, password);

      if (response.token) {
        const expiryDate = new Date();
        expiryDate.setTime(expiryDate.getTime() + 8 * 60 * 60 * 1000);
        document.cookie = `auth_token=${encodeURIComponent(
          response.token
        )}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict`;
      }

      const user: User = {
        id: String(response.id ?? response.name ?? username),
        name: response.name ?? username,
        role: response.role ?? 1,
        email: response.email ?? username
      };

      localStorage.setItem('user_info', JSON.stringify(user));
      onLogin(user);
      toast.success(t('login_success') || 'Login successful');
    } catch (err: any) {
      setError(err.message || t('login_error'));
      toast.error(err.message || t('login_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gray-100"
      dir={dir}
    >
      {/* Background Image (Optional Light Pattern) */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1583324113626-70df0f4deaab?auto=format&fit=crop&w=1920&q=80')"
        }}
      />

      {/* Login Card */}
      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 flex flex-col gap-6">

          {/* Language Switch */}
          <div className={`flex ${dir === 'rtl' ? 'justify-start' : 'justify-end'}`}>
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition"
            >
              <Globe className="w-4 h-4" />
              {language === 'ar' ? 'English' : 'العربية'}
            </button>
          </div>

          {/* Logo + Title */}
          <div className="text-center mb-4">
            <div className="inline-flex p-4 rounded-2xl bg-gradient-to-r from-blue-400 to-blue-600 mb-4 shadow-md">
              <img src={logo} alt="Logo" className="w-20 h-20" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t('login_title')}
            </h1>
            <p className="text-gray-700">{t('login_subtitle')}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t('username')}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none bg-white text-gray-900 placeholder-gray-400"
              required
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('password')}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none bg-white text-gray-900 placeholder-gray-400"
              required
            />

            <div className={`flex ${dir === 'rtl' ? 'justify-start' : 'justify-end'}`}>
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                {t('forgot_password_link')}
              </button>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-xl flex gap-2 items-center">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-400 to-blue-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50"
            >
              <LogIn className="w-5 h-5" />
              {loading ? t('loading') : t('login_button')}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

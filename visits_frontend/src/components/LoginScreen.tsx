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
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
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
      const message = err.message || t('login_error');
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen soft-background bg-pattern flex items-center justify-center p-4 relative overflow-hidden"
      dir={dir}
    >
      {/* Floating background blobs */}
      <motion.div
        className="absolute top-20 left-20 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-96 h-96 bg-green-400/10 rounded-full blur-3xl"
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      {/* Centered Login Card */}
      <div className="w-full max-w-md relative z-10">
        <motion.div
          className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Language Toggle */}
          <div
            className={`flex ${
              dir === 'rtl' ? 'justify-start' : 'justify-end'
            } mb-6`}
          >
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white shadow hover:shadow-md transition"
            >
              <Globe className="w-4 h-4" />
              {language === 'ar' ? 'English' : 'العربية'}
            </button>
          </div>

          {/* Logo + Title */}
          <div className="text-center mb-8">
            <div className="inline-flex p-4 rounded-2xl gradient-primary mb-4">
              <img src={logo} alt="Logo" className="w-20 h-20" />
            </div>
            <h1 className="text-2xl font-bold">{t('login_title')}</h1>
            <p className="text-gray-600">{t('login_subtitle')}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t('username')}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('password')}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />

            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-xl flex gap-2 items-center">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-primary text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-60"
            >
              <LogIn className="w-5 h-5" />
              {loading ? t('loading') : t('login_button')}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

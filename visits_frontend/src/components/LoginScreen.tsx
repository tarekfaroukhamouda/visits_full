import React, { useState } from 'react';
import { User } from '../App';
import { useLanguage } from '../contexts/LanguageContext';
import {
  LogIn,
  Globe,
  Shield,
  CheckCircle2,
  BarChart3,
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
      setError(err.message || t('login_error'));
      toast.error(err.message || t('login_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen soft-background bg-pattern flex items-center justify-center p-4 relative overflow-hidden"
      dir={dir}
    >
      {/* floating blobs */}
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

      {/* === TWO PANELS === */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10 items-stretch">
        {/* LEFT PANEL */}
        <motion.div
          className="hidden lg:flex h-full"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="glass-effect rounded-3xl p-8 shadow-medium border border-white/50 h-full w-full">
            <motion.img
              src="https://images.unsplash.com/photo-1583324113626-70df0f4deaab?auto=format&fit=crop&w=1080&q=80"
              alt="Healthcare"
              className="w-full h-64 object-cover rounded-2xl mb-6"
            />

            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {language === 'ar'
                ? 'نظام متكامل لإدارة الزيارات الميدانية'
                : 'Complete Field Visits Management System'}
            </h2>

            <div className="space-y-3">
              {[
                {
                  icon: CheckCircle2,
                  title:
                    language === 'ar'
                      ? 'إدارة زيارات مكافحة العدوى'
                      : 'Infection Control Visits Management',
                  desc:
                    language === 'ar'
                      ? 'تتبع وجدولة الزيارات الميدانية بكفاءة'
                      : 'Track and schedule field visits efficiently',
                  gradient: 'gradient-success'
                },
                {
                  icon: Shield,
                  title:
                    language === 'ar'
                      ? 'نظام صلاحيات متقدم'
                      : 'Advanced Permissions System',
                  desc:
                    language === 'ar'
                      ? 'إدارة آمنة للمستخدمين والبيانات'
                      : 'Secure user and data management',
                  gradient: 'gradient-primary'
                },
                {
                  icon: BarChart3,
                  title:
                    language === 'ar'
                      ? 'تقارير وإحصائيات تفاعلية'
                      : 'Interactive Reports & Statistics',
                  desc:
                    language === 'ar'
                      ? 'لوحات تحكم ورسوم بيانية متقدمة'
                      : 'Advanced dashboards and charts',
                  gradient: 'gradient-accent'
                }
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex gap-3 bg-white p-3 rounded-xl shadow-soft"
                >
                  <div className={`${item.gradient} p-2 rounded-lg`}>
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">{item.title}</p>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* RIGHT PANEL */}
        <motion.div
          className="w-full h-full"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="glass-effect rounded-3xl shadow-medium p-8 border border-white/50 h-full flex flex-col justify-center">
            <div
              className={`flex ${
                dir === 'rtl' ? 'justify-start' : 'justify-end'
              } mb-4`}
            >
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-2 px-4 py-2 rounded-xl glass-effect"
              >
                <Globe className="w-4 h-4" />
                {language === 'ar' ? 'English' : 'العربية'}
              </button>
            </div>

            <div className="text-center mb-8">
              <div className="inline-flex p-4 rounded-2xl gradient-primary mb-4">
                <img src={logo} alt="Logo" className="w-20 h-20" />
              </div>
              <h1 className="text-2xl font-bold">{t('login_title')}</h1>
              <p className="text-gray-600">{t('login_subtitle')}</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t('username')}
                className="w-full px-4 py-3 border rounded-xl"
                required
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('password')}
                className="w-full px-4 py-3 border rounded-xl"
                required
              />

              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-xl flex gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full gradient-primary text-white py-3 rounded-xl flex items-center justify-center gap-2"
              >
                <LogIn className="w-5 h-5" />
                {loading ? t('loading') : t('login_button')}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

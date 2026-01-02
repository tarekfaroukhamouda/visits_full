import { useState } from 'react';
import { User } from '../App';
import { useLanguage } from '../contexts/LanguageContext';
import { LogIn, Globe } from 'lucide-react';
import logo from 'figma:asset/1b4c1bab65c575027790a25e5b25300d49265bc6.png';
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
      
      // Store token
      if (response.token) {
        localStorage.setItem('auth_token', response.token);
      }

      // Create user object
      // Backend: role 0 = admin, role 1 = manager/regular user
      const user: User = {
        id: response.name || username,
        name: response.name || username,
        role: response.role ?? 1, // Default to 1 (manager) if role is not provided
        email: response.email || username,
      };

      console.log('Login response:', response);
      console.log('User role:', user.role);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4" dir={dir}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Language Toggle */}
        <div className={`flex ${dir === 'rtl' ? 'justify-start' : 'justify-end'} mb-4`}>
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm"
          >
            <Globe className="w-4 h-4" />
            <span>{language === 'ar' ? 'English' : 'العربية'}</span>
          </button>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img src={logo} alt="Logo" className="w-24 h-24 object-contain" />
          </div>
          <h1 className="text-gray-900 mb-2">{t('login_title')}</h1>
          <p className="text-gray-600">{t('login_subtitle')}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2">
              {t('username')}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t('username')}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">
              {t('password')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t('password')}
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1565C0] text-white py-3 rounded-lg hover:bg-[#0d47a1] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogIn className="w-5 h-5" />
            <span>{loading ? (t('loading') || 'Loading...') : t('login_button')}</span>
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center mb-2">
            {language === 'ar' ? 'بيانات الدخول التجريبية:' : 'Demo Credentials:'}
          </p>
          <div className="space-y-1 text-sm text-gray-700">
            <p className={`${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
              <span className="font-medium">{t('admin_credentials')}</span>
            </p>
            <p className={`${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
              <span className="font-medium">{t('manager_credentials')}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
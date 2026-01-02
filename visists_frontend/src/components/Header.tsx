import { User } from '../App';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { LogOut, User as UserIcon, RotateCcw, Globe } from 'lucide-react';
import logo from 'figma:asset/26fdc8a84af1bdd50de5261850b9d1bc61210158.png';
import { toast } from 'sonner@2.0.3';

interface HeaderProps {
  user: User;
  onLogout: () => void;
}

export function Header({ user, onLogout }: HeaderProps) {
  const { resetData } = useData();
  const { language, toggleLanguage, t, dir } = useLanguage();

  const handleReset = () => {
    if (window.confirm(t('reset_confirm'))) {
      resetData();
      toast.success(t('reset_success'));
    }
  };

  return (
    <header className="bg-gradient-to-r from-[#1565C0] via-[#1976D2] to-[#42A5F5] border-b border-blue-700/20 px-4 lg:px-6 py-3 lg:py-4 shadow-md">
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-2 lg:gap-3 ${dir === 'ltr' ? 'flex-row' : ''}`}>
          <div className="bg-white p-1.5 rounded-lg shadow-sm">
            <img src={logo} alt="Logo" className="w-8 h-8 lg:w-10 lg:h-10 object-contain" />
          </div>
          <div>
            <h1 className="text-white text-sm lg:text-base">{t('system_title')}</h1>
            <p className="text-xs lg:text-sm text-blue-100 hidden sm:block">{t('system_subtitle')}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-4">
          <div className="hidden md:flex items-center gap-3 px-3 lg:px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
            <UserIcon className="w-4 lg:w-5 h-4 lg:h-5 text-white" />
            <div className={`${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
              <p className="text-xs lg:text-sm text-white">{user.name}</p>
              <p className="text-xs text-blue-100">
                {user.role === 0 ? t('admin') : t('manager')}
              </p>
            </div>
          </div>
          
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 lg:gap-2 px-3 lg:px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors backdrop-blur-sm border border-white/20"
            title={language === 'ar' ? 'English' : 'العربية'}
          >
            <Globe className="w-4 lg:w-5 h-4 lg:h-5" />
            <span className="hidden sm:inline text-sm lg:text-base">{language === 'ar' ? 'EN' : 'ع'}</span>
          </button>
          
          {user.role === 0 && (
            <button
              onClick={handleReset}
              className="hidden lg:flex items-center gap-1 lg:gap-2 px-3 lg:px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors backdrop-blur-sm border border-white/20"
              title={t('reset_data')}
            >
              <RotateCcw className="w-4 lg:w-5 h-4 lg:h-5" />
              <span className="text-sm lg:text-base">{t('reset_data')}</span>
            </button>
          )}
          
          <button
            onClick={onLogout}
            className="flex items-center gap-1 lg:gap-2 px-3 lg:px-4 py-2 text-white hover:bg-red-500/20 rounded-lg transition-colors backdrop-blur-sm border border-white/20"
          >
            <LogOut className="w-4 lg:w-5 h-4 lg:h-5" />
            <span className="hidden sm:inline text-sm lg:text-base">{t('logout')}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
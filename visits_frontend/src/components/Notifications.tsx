import React, { useEffect, useState } from 'react';
import { Bell, Check } from 'lucide-react';
import { notificationsApi } from '../services/api';
import { getAuthToken } from '../services/api';
import { formatHijriDate } from '../utils/hijriUtils';
import { useLanguage } from '../contexts/LanguageContext';

interface NotificationItem {
  id: number;
  visit_id?: number;
  message: string;
  created_at?: string;
  seen: boolean;
}

export function Notifications({ doctorId: propDoctorId }: { doctorId?: number | string } ) {
  const { language } = useLanguage();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);

  const doctorId = propDoctorId
    ? (typeof propDoctorId === 'string' ? parseInt(propDoctorId) : propDoctorId)
    : (() => {
        // try to get current doctor id from cookie or localStorage
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
          const [name, value] = cookie.trim().split('=');
          if (name === 'doctor_id') return parseInt(decodeURIComponent(value));
        }
        const v = localStorage.getItem('doctor_id');
        return v ? parseInt(v) : null;
      })();

  const fetchUnseen = async () => {
    if (!doctorId) return;
    try {
      console.log('Notifications.fetchUnseen calling for doctorId=', doctorId);
      const res = await notificationsApi.getUnseen(doctorId as number);
      console.log('Notifications.fetchUnseen response=', res);
      setNotifications(res || []);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    fetchUnseen();
    const interval = setInterval(fetchUnseen, 15000); // poll every 15s
    return () => clearInterval(interval);
  }, [doctorId]);

  const markSeen = async (id: number) => {
    try {
      await notificationsApi.markSeen(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('Failed to mark seen', err);
    }
  };

  const markAllSeen = async () => {
    if (!doctorId) return;
    try {
      console.log('Notifications.markAllSeen calling for doctorId=', doctorId);
      await notificationsApi.markAllSeen(doctorId);
      setNotifications([]);
    } catch (err) {
      console.error('Failed to mark all seen', err);
    }
  };

  const unseenCount = notifications.length;

  return (
    <div className="relative">
      <button
        aria-haspopup="true"
        aria-expanded={open}
        className="relative flex items-center justify-center w-10 h-10 bg-white/10 text-white hover:bg-white/20 rounded-full transition-shadow shadow-sm ring-0 focus:outline-none"
        onClick={() => { setOpen(!open); if (!open) fetchUnseen(); }}
        title="Notifications"
      >
        <span className="sr-only">Open notifications</span>
        <Bell className="w-5 h-5" />
        {unseenCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full text-xs font-semibold w-5 h-5 flex items-center justify-center shadow-lg">{unseenCount}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-2xl border border-gray-100 z-50">
          <div className="p-3 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-gray-700" />
              <strong className="text-gray-800">Notifications</strong>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={markAllSeen} className="text-sm text-blue-600 hover:underline">Mark all seen</button>
              <button onClick={() => setOpen(false)} className="text-sm text-gray-500">Close</button>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 && (
              <div className="p-6 text-center text-sm text-gray-500">No new notifications</div>
            )}

            {notifications.map(n => (
              <div key={n.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 border-b last:border-b-0">
                <div className="flex-shrink-0 w-9 h-9 bg-blue-50 text-blue-700 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18.6 14.6V11a6 6 0 0 0-5-5.917V4a1 1 0 0 0-2 0v1.083A6 6 0 0 0 6 11v3.6c0 .538-.214 1.055-.595 1.445L4 17h5"/></svg>
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-800">{n.message}</div>
                  <div className="text-xs text-gray-400 mt-1">{n.created_at ? formatHijriDate(new Date(n.created_at), language === 'ar' ? 'ar' : 'en', 'long') : ''}</div>
                </div>
                <div className="flex-shrink-0 ml-2">
                  <button onClick={() => markSeen(n.id)} className="text-green-600 hover:text-green-800 p-1 rounded" title="Mark seen">
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

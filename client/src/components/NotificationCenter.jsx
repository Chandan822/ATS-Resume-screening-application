import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../hooks/useAuth';
import {
  Bell,
  Check,
  CheckCheck,
  Calendar,
  FileText,
  Award,
  AlertCircle,
  AtSign,
  Sparkles,
  X,
} from 'lucide-react';

export function NotificationCenter() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL'); // ALL | UNREAD

  // Fetch Notifications & Unread Count
  const { data: responseData } = useQuery({
    queryKey: ['userNotifications'],
    queryFn: async () => {
      const res = await notificationService.getNotifications();
      return res;
    },
    refetchInterval: 10000, // Poll fallback every 10s
  });

  const notifications = responseData?.data || [];
  const unreadCount = responseData?.unreadCount || 0;

  // Socket.io Real-time WebSocket Listener
  useEffect(() => {
    if (!user?.id) return;

    const socket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
    });

    socket.emit('join_user_room', user.id);

    socket.on('new_notification', (newNotif) => {
      queryClient.invalidateQueries({ queryKey: ['userNotifications'] });
    });

    return () => {
      socket.disconnect();
    };
  }, [user?.id, queryClient]);

  // Mutations
  const markReadMut = useMutation({
    mutationFn: (id) => notificationService.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['userNotifications'] }),
  });

  const markAllReadMut = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['userNotifications'] }),
  });

  const testTriggerMut = useMutation({
    mutationFn: (type) => notificationService.triggerTestNotification(type),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['userNotifications'] }),
  });

  const filteredNotifs =
    activeFilter === 'UNREAD'
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  const getTypeBadge = (type) => {
    switch (type) {
      case 'INTERVIEW_SCHEDULE':
        return { label: 'Interview', bg: 'bg-amber-100 text-amber-800 border-amber-300', icon: Calendar };
      case 'OFFER_LETTER':
        return { label: 'Offer Letter', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: Award };
      case 'APPLICATION_REJECTED':
        return { label: 'Rejection Notice', bg: 'bg-rose-100 text-rose-800 border-rose-300', icon: AlertCircle };
      case 'MENTION':
        return { label: 'Mention', bg: 'bg-cyan-100 text-cyan-800 border-cyan-300', icon: AtSign };
      default:
        return { label: 'Application Update', bg: 'bg-indigo-100 text-indigo-800 border-indigo-300', icon: FileText };
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon Trigger with Live Unread Counter Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
        title="Notification Center"
      >
        <Bell className="w-5 h-5 text-slate-700" />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-600 text-white rounded-full text-[10px] font-black flex items-center justify-center border-2 border-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Center Dropdown Drawer */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-3xl border border-slate-200 shadow-2xl z-50 overflow-hidden text-xs space-y-3 p-4">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-sm">Notification Center</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                  {unreadCount} Unread
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllReadMut.mutate()}
                  className="text-indigo-600 hover:text-indigo-800 text-[11px] font-bold flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Mark All Read
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Tabs & Test Triggers */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 text-[11px] font-bold">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveFilter('ALL')}
                className={`px-3 py-1 rounded-xl transition ${
                  activeFilter === 'ALL' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setActiveFilter('UNREAD')}
                className={`px-3 py-1 rounded-xl transition ${
                  activeFilter === 'UNREAD' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            <button
              onClick={() => testTriggerMut.mutate('INTERVIEW_SCHEDULE')}
              className="text-amber-600 hover:text-amber-800 font-bold text-[10px] flex items-center gap-1"
              title="Trigger Test Notification"
            >
              <Sparkles className="w-3 h-3" /> Test Alert
            </button>
          </div>

          {/* Notification Items List */}
          <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
            {filteredNotifs.length === 0 ? (
              <div className="py-8 text-center text-slate-400 space-y-1">
                <Bell className="w-8 h-8 mx-auto text-slate-300" />
                <p className="font-bold text-slate-600">No notifications yet</p>
                <p className="text-[11px]">You're all caught up on alerts!</p>
              </div>
            ) : (
              filteredNotifs.map((notif) => {
                const badge = getTypeBadge(notif.type);
                const Icon = badge.icon;

                return (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-2xl border transition ${
                      notif.isRead
                        ? 'bg-white border-slate-200/80 text-slate-600'
                        : 'bg-indigo-50/40 border-indigo-200/90 text-slate-900 font-medium'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border inline-flex items-center gap-1 ${badge.bg}`}>
                          <Icon className="w-2.5 h-2.5" /> {badge.label}
                        </span>
                        <h5 className="font-extrabold text-slate-900 leading-snug">{notif.title}</h5>
                        <p className="text-[11px] text-slate-600 leading-normal">{notif.message}</p>
                        <span className="text-[10px] text-slate-400 block">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {!notif.isRead && (
                        <button
                          onClick={() => markReadMut.mutate(notif.id)}
                          className="p-1 rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition shrink-0"
                          title="Mark as Read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationCenter;

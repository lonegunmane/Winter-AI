import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-20 left-4 z-40 flex items-center gap-2 rounded-xl bg-amber-500/90 text-slate-950 px-3.5 py-2 text-xs font-medium shadow-lg backdrop-blur-xs animate-in slide-in-from-bottom-2 duration-200">
      <WifiOff className="w-4 h-4 shrink-0 text-slate-950" />
      <span>Offline Mode — Previous chats are available locally.</span>
    </div>
  );
};

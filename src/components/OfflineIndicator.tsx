import React from 'react';
import { WifiOff, Shield } from 'lucide-react';

interface OfflineIndicatorProps {
  isOfflineModeActive: boolean;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ isOfflineModeActive }) => {
  if (!isOfflineModeActive) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-20 left-4 z-40 flex items-center gap-2 rounded-xl bg-slate-900/90 border border-amber-500/40 text-amber-300 px-3.5 py-1.5 text-xs font-medium shadow-lg backdrop-blur-md animate-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <span className="font-semibold text-white">Offline Mode:</span>
      </div>
      <span className="text-amber-200/90">Using Winter Local Brain on-device</span>
    </div>
  );
};

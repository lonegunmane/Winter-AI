import React, { useState } from 'react';
import { Download, Share, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'header' | 'banner' | 'settings';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'header',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA on home screen, hide
  if (isInstalled) {
    return null;
  }

  // Chromium / Windows 11 / Android flow
  if (isInstallable) {
    if (variant === 'settings') {
      return (
        <button
          onClick={install}
          className={`flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-medium text-sm shadow-md hover:from-sky-400 hover:to-blue-500 transition-all ${className}`}
        >
          <Download className="w-4 h-4" />
          <span>Install Winter App (PWA)</span>
        </button>
      );
    }

    return (
      <button
        onClick={install}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 border border-sky-500/30 text-xs font-medium transition-colors ${className}`}
        title="Install Winter as a standalone app"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Install App</span>
      </button>
    );
  }

  // iOS Safari flow (iPhone X / iPad)
  if (isIOS) {
    return (
      <>
        {variant === 'settings' ? (
          <button
            onClick={() => setShowIOSGuide(true)}
            className={`flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-sky-500/40 text-sky-300 hover:bg-sky-500/10 font-medium text-sm transition-all ${className}`}
          >
            <Share className="w-4 h-4" />
            <span>Install on iPhone / iPad</span>
          </button>
        ) : (
          <button
            onClick={() => setShowIOSGuide(true)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-sky-500/15 text-sky-300 hover:bg-sky-500/25 border border-sky-500/30 text-xs font-medium transition-colors ${className}`}
            title="Install on iPhone / iPad"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Install</span>
          </button>
        )}

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xl">❄️</span>
                  <h3 className="font-semibold text-base text-white">Install Winter on iOS</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-4 text-sm text-slate-300">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400 shrink-0">
                    <Share className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-white">1. Tap the Share button</p>
                    <p className="text-xs text-slate-400">Located in the Safari bottom toolbar on your iPhone.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400 shrink-0">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-white">2. Select &apos;Add to Home Screen&apos;</p>
                    <p className="text-xs text-slate-400">Scroll down in the share sheet and tap &quot;Add to Home Screen&quot;.</p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-medium text-white transition-colors"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Smartphone,
  Bell,
  Mic,
  Battery,
  Volume2,
  Clock,
  Vibrate,
  Phone,
  MessageCircle,
  Lightbulb,
  Check,
  Play,
  RotateCcw,
} from 'lucide-react';
import {
  getDeviceStatus,
  isNativeApp,
  getRuntimePlatform,
  triggerHapticFeedback,
  scheduleNotification,
} from '../../utils/capacitorBridge';
import { NativeDeviceStatus } from '../../types';

export const ToolsView: React.FC = () => {
  const [deviceStatus, setDeviceStatus] = useState<NativeDeviceStatus | null>(null);
  const [notificationStatus, setNotificationStatus] = useState<string>('');
  const [ttsText, setTtsText] = useState('Winter is ready to assist you.');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Simple Focus Timer state
  const [timerSeconds, setTimerSeconds] = useState(1500); // 25 mins
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    getDeviceStatus().then(setDeviceStatus);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && timerRunning) {
      setTimerRunning(false);
      scheduleNotification('❄️ Winter Timer', 'Focus session completed!');
      triggerHapticFeedback('success');
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  const handleTestHaptic = async () => {
    await triggerHapticFeedback('medium');
  };

  const handleTestNotification = async () => {
    const success = await scheduleNotification(
      '❄️ Winter Notification',
      'This notification is running through the Capacitor native bridge.'
    );
    if (success) {
      setNotificationStatus('Notification dispatched!');
      setTimeout(() => setNotificationStatus(''), 3000);
    } else {
      setNotificationStatus('Permission required or unsupported.');
      setTimeout(() => setNotificationStatus(''), 3000);
    }
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(ttsText);
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-4xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
        <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Wrench className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Tools &amp; Native Bridge</h2>
          <p className="text-xs text-slate-400">
            System privileges, hardware diagnostics, and Android APK integration hooks
          </p>
        </div>
      </div>

      {/* Device & Capacitor Status Card */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-sky-400" />
            <h3 className="font-semibold text-white text-sm">Runtime Environment</h3>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-sky-300 font-mono">
            Platform: {getRuntimePlatform().toUpperCase()} {isNativeApp() ? '(Capacitor APK)' : '(Web PWA)'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-slate-400 block mb-1">Battery Status</span>
            <div className="flex items-center gap-1.5 font-semibold text-white">
              <Battery className="w-4 h-4 text-emerald-400" />
              <span>
                {deviceStatus?.batteryLevel !== undefined ? `${deviceStatus.batteryLevel}%` : 'Standard'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-slate-400 block mb-1">Push Notifications</span>
            <div className="flex items-center gap-1.5 font-semibold text-white capitalize">
              <Bell className="w-4 h-4 text-sky-400" />
              <span>{deviceStatus?.permissions.notifications || 'Active'}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-slate-400 block mb-1">Microphone Privilege</span>
            <div className="flex items-center gap-1.5 font-semibold text-white">
              <Mic className="w-4 h-4 text-blue-400" />
              <span>Speech Ready</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-slate-400 block mb-1">Haptic Engine</span>
            <div className="flex items-center gap-1.5 font-semibold text-white">
              <Vibrate className="w-4 h-4 text-amber-400" />
              <span>Supported</span>
            </div>
          </div>
        </div>

        {/* Quick Test Actions */}
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={handleTestHaptic}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            <Vibrate className="w-3.5 h-3.5 text-amber-400" />
            <span>Test Vibration (Haptic)</span>
          </button>
          <button
            onClick={handleTestNotification}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            <Bell className="w-3.5 h-3.5 text-sky-400" />
            <span>Test Local Notification</span>
          </button>
          {notificationStatus && (
            <span className="text-xs text-sky-300 flex items-center gap-1 py-1">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              {notificationStatus}
            </span>
          )}
        </div>
      </div>

      {/* Focus Timer & Voice Synthesizer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Focus Timer */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-400" />
            <h3 className="font-semibold text-white text-sm">Calm Focus Timer</h3>
          </div>
          <div className="text-center py-2">
            <span className="text-4xl font-mono font-bold text-white tracking-widest">
              {formatTime(timerSeconds)}
            </span>
          </div>
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setTimerRunning(!timerRunning)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{timerRunning ? 'Pause' : 'Start'}</span>
            </button>
            <button
              onClick={() => {
                setTimerRunning(false);
                setTimerSeconds(1500);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Offline Voice Synthesizer */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <h3 className="font-semibold text-white text-sm">Voice Synthesizer</h3>
            </div>
            <span className="text-[10px] text-slate-500">Offline TTS</span>
          </div>
          <input
            type="text"
            value={ttsText}
            onChange={(e) => setTtsText(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
          />
          <button
            onClick={handleSpeak}
            className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-medium transition-colors"
          >
            <Volume2 className="w-4 h-4" />
            <span>{isSpeaking ? 'Stop Speaking' : 'Read Aloud'}</span>
          </button>
        </div>
      </div>

      {/* Capacitor Android Native Plugins Architecture Hooks */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <h3 className="font-semibold text-white text-sm flex items-center gap-2">
          <span>⚡ Capacitor Native Intent Architecture Hooks</span>
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          These native action hooks are prepared for when Winter is packaged as an Android APK. In Capacitor, they bridge to native Android telecommunication and system intents.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Call Intent Hook */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs">
              <Phone className="w-4 h-4" />
              <span>Voice Call Intent</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Hook: <code className="text-slate-300">window.open(&apos;tel:...&apos;)</code> or Capacitor Call plugin.
            </p>
          </div>

          {/* SMS Intent Hook */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
              <MessageCircle className="w-4 h-4" />
              <span>SMS Intent</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Hook: <code className="text-slate-300">window.open(&apos;sms:...&apos;)</code> or Native SMS Sender.
            </p>
          </div>

          {/* Flashlight Hook */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
              <Lightbulb className="w-4 h-4" />
              <span>Flashlight Hook</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Hook: <code className="text-slate-300">@capgo/capacitor-flash</code> for camera torch control.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

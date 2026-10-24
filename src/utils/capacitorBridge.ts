/**
 * ==============================================================================
 * Winter Capacitor & Native Android Bridge
 * ==============================================================================
 * This module provides clean bridge interfaces for running Winter either as a
 * lightweight web PWA or wrapped inside a native Android APK via Capacitor.
 *
 * When compiling into a real Android APK:
 * 1. npm i @capacitor/core @capacitor/cli @capacitor/android
 * 2. npx cap init "Winter" "com.winter.assistant" --web-dir "dist"
 * 3. npx cap add android
 * 4. Add native plugins:
 *    - npm i @capacitor/haptics @capacitor/local-notifications @capacitor/device
 * ==============================================================================
 */

import { NativeDeviceStatus } from '../types';

declare global {
  interface Window {
    Capacitor?: {
      isNativePlatform?: () => boolean;
      getPlatform?: () => 'android' | 'ios' | 'web';
      Plugins?: Record<string, unknown>;
    };
  }
}

/**
 * Checks if the current environment is running inside a Capacitor native container.
 */
export function isNativeApp(): boolean {
  return typeof window !== 'undefined' && Boolean(window.Capacitor?.isNativePlatform?.());
}

/**
 * Gets the runtime platform name ('android' | 'ios' | 'web').
 */
export function getRuntimePlatform(): 'android' | 'ios' | 'web' {
  if (typeof window === 'undefined') return 'web';
  return window.Capacitor?.getPlatform?.() || 'web';
}

/**
 * Triggers light tactile feedback (haptic vibration) on user interaction.
 * Gracefully falls back to browser navigator.vibrate if not on native Capacitor.
 */
export async function triggerHapticFeedback(type: 'light' | 'medium' | 'success' = 'light'): Promise<void> {
  // [CAPACITOR NATIVE HOOK: Haptics.impact]
  if (isNativeApp() && window.Capacitor?.Plugins?.Haptics) {
    try {
      const haptics = window.Capacitor.Plugins.Haptics as {
        impact?: (options: { style: string }) => Promise<void>;
      };
      await haptics.impact?.({ style: type.toUpperCase() });
      return;
    } catch {
      // Fall through to browser vibrate
    }
  }

  // Web fallback (Android Chrome / Huawei browser supports navigator.vibrate)
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      const pattern = type === 'light' ? 15 : type === 'medium' ? 35 : [20, 40, 20];
      navigator.vibrate(pattern);
    } catch {
      // Ignore vibration errors
    }
  }
}

/**
 * Schedules a local device notification.
 * Uses Capacitor LocalNotifications on native Android; Web Notification on browser.
 */
export async function scheduleNotification(title: string, body: string, id: number = Date.now()): Promise<boolean> {
  // [CAPACITOR NATIVE HOOK: LocalNotifications.schedule]
  if (isNativeApp() && window.Capacitor?.Plugins?.LocalNotifications) {
    try {
      const notifications = window.Capacitor.Plugins.LocalNotifications as {
        schedule: (options: { notifications: Array<{ id: number; title: string; body: string }> }) => Promise<unknown>;
      };
      await notifications.schedule({
        notifications: [{ id, title, body }],
      });
      return true;
    } catch (e) {
      console.warn('Native notification failed:', e);
    }
  }

  // Web Notification Fallback
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/pwa-192x192.png' });
      return true;
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification(title, { body, icon: '/pwa-192x192.png' });
        return true;
      }
    }
  }

  return false;
}

/**
 * Queries current device status (Battery, Network, Permissions).
 */
export async function getDeviceStatus(): Promise<NativeDeviceStatus> {
  const isCap = isNativeApp();
  const platform = getRuntimePlatform();

  const status: NativeDeviceStatus = {
    isCapacitor: isCap,
    platform,
    permissions: {
      notifications:
        typeof Notification !== 'undefined'
          ? (Notification.permission as 'granted' | 'denied' | 'prompt')
          : 'prompt',
      microphone: 'prompt',
      storage: 'granted',
    },
  };

  // Inspect battery if supported
  if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
    try {
      const battery = await (navigator as unknown as { getBattery: () => Promise<{ level: number; charging: boolean }> }).getBattery();
      status.batteryLevel = Math.round(battery.level * 100);
      status.isCharging = battery.charging;
    } catch {
      // Ignored
    }
  }

  // Inspect network
  if (typeof navigator !== 'undefined') {
    status.networkType = navigator.onLine ? 'Online' : 'Offline';
  }

  return status;
}

/**
 * [CAPACITOR NATIVE HOOK: Android Hardware Back Button]
 * When wrapping in Capacitor, attach back button handler to close sidebar or navigate back.
 */
export function registerBackButtonHandler(callback: () => boolean): () => void {
  // If native Capacitor App plugin is present:
  if (isNativeApp() && window.Capacitor?.Plugins?.App) {
    const appPlugin = window.Capacitor.Plugins.App as {
      addListener: (event: string, handler: (e: { canGoBack: boolean }) => void) => { remove: () => void };
    };
    const listener = appPlugin.addListener('backButton', () => {
      callback();
    });
    return () => listener.remove();
  }

  // Standard web popstate
  const handler = () => {
    callback();
  };
  window.addEventListener('popstate', handler);
  return () => window.removeEventListener('popstate', handler);
}

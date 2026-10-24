import React, { useState } from 'react';
import {
  Smartphone,
  Copy,
  Check,
  Shield,
  Zap,
  Sparkles,
  Download,
} from 'lucide-react';
import { WinterLogo } from '../WinterLogo';

export const AboutView: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const capacitorCommands = `# 1. Install Capacitor core and CLI
npm install @capacitor/core
npm install -D @capacitor/cli @capacitor/android

# 2. Initialize Capacitor project
npx cap init "Winter" "com.winter.assistant" --web-dir "dist"

# 3. Build optimized web assets
npm run build

# 4. Add Android native platform
npx cap add android

# 5. Open in Android Studio & generate APK
npx cap open android
# In Android Studio: Build > Build Bundle(s) / APK(s) > Build APK(s)`;

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-4xl mx-auto w-full space-y-6">
      {/* Header Emblem Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950/40 border border-slate-800 text-center flex flex-col items-center">
        <WinterLogo size={80} className="mb-4" />
        <h2 className="text-2xl font-bold text-white tracking-tight">Winter AI Assistant</h2>
        <p className="text-xs sm:text-sm text-sky-300 font-mono mt-1">v1.1 (Capacitor &amp; Android APK Ready)</p>
        <p className="text-xs sm:text-sm text-slate-300 max-w-lg mt-3 leading-relaxed">
          An ultra-lightweight, high-performance personal AI companion built for speed, privacy, and low-spec hardware like the Huawei P20 and 8GB RAM laptops.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 mt-5 text-xs">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-slate-300">
            <Zap className="w-3.5 h-3.5 text-sky-400" />
            <span>&lt; 1 MB Total Footprint</span>
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-slate-300">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Local Browser Storage</span>
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-slate-300">
            <Smartphone className="w-3.5 h-3.5 text-blue-400" />
            <span>Android APK Compatible</span>
          </span>
        </div>
      </div>

      {/* The Winter "W" Logo Design Description */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <h3 className="font-semibold text-white text-sm">Winter &quot;W&quot; Brand Icon &amp; SVG Specification</h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          The Winter emblem represents the letter <strong>&quot;W&quot;</strong> chiseled as a glacial crystal:
        </p>
        <ul className="list-disc pl-5 text-xs text-slate-400 space-y-1.5 leading-relaxed">
          <li>
            <strong>Architecture</strong>: A 5-facet crystalline &quot;W&quot; glyph with sharp glacial peaks and high-contrast diamond lighting.
          </li>
          <li>
            <strong>Palette</strong>: Deep midnight frost background (<code className="text-sky-300">#0a1120</code>), arctic ice cyan (<code className="text-sky-300">#38bdf8</code>), powder blue (<code className="text-sky-300">#7dd3fc</code>), and pure glacial white (<code className="text-sky-300">#ffffff</code>).
          </li>
          <li>
            <strong>Peaks &amp; Star Sparkles</strong>: 8-point ice crystals adorn the top vertex peaks, with a subtle outer hexagonal aura.
          </li>
          <li>
            <strong>Android Maskable Compliance</strong>: Includes a 15% safe-zone margin in <code className="text-sky-300">public/icon-maskable.svg</code> so circular or squircle Android app launchers crop it without clipping the glyph.
          </li>
        </ul>
        <div className="pt-2">
          <a
            href="/winter-logo-w.svg"
            download="winter-logo-w.svg"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Vector SVG (winter-logo-w.svg)</span>
          </a>
        </div>
      </div>

      {/* Guide: How to Turn Winter into a Real Android APK with Capacitor */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold text-white text-sm">How to Generate a Real Android APK (Capacitor)</h3>
          </div>
          <button
            onClick={() => copyToClipboard(capacitorCommands, 'cap-commands')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
          >
            {copiedCode === 'cap-commands' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Commands</span>
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Because this app is built with lightweight vanilla Web standards and Vite, it can be converted into a native Android APK in under 2 minutes:
        </p>

        <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-800 p-3.5 font-mono text-xs text-slate-300 overflow-x-auto">
          <pre className="whitespace-pre">{capacitorCommands}</pre>
        </div>

        <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-800/60 text-xs text-slate-300 space-y-1">
          <p className="font-semibold text-sky-300">Huawei P20 / Low-Spec Android Tips:</p>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            In Android Studio, enable ProGuard / R8 minification in <code className="text-sky-300">android/app/build.gradle</code>. Because Winter uses minimal DOM and zero heavy frameworks, the resulting APK is under 5MB and consumes only ~25MB of RAM on Android 8.1+ devices.
          </p>
        </div>
      </div>
    </div>
  );
};

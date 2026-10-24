import React, { useState } from 'react';
import {
  Smartphone,
  Copy,
  Check,
  Shield,
  Sparkles,
  Download,
  WifiOff,
  CloudLightning,
} from 'lucide-react';
import { FrostySnowflakeLogo } from '../FrostySnowflakeLogo';

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
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-3xl mx-auto w-full space-y-5">
      {/* Header Emblem Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#030712] via-[#070c18] to-sky-950/30 border border-sky-950/60 text-center flex flex-col items-center shadow-xl">
        <FrostySnowflakeLogo size={72} className="mb-3" />
        <h2 className="text-2xl font-bold text-white tracking-tight">Winter</h2>
        <p className="text-xs text-sky-300 font-mono mt-0.5">Personal AI Assistant</p>
        <p className="text-xs sm:text-sm text-slate-300 max-w-md mt-2.5 leading-relaxed">
          Calm, intelligent, and designed with crystalline elegance. Operates seamlessly both online with fast cloud intelligence and completely offline on low-spec hardware.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300">
            <CloudLightning className="w-3.5 h-3.5 text-sky-400" />
            <span>Winter Cloud</span>
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300">
            <WifiOff className="w-3.5 h-3.5 text-amber-400" />
            <span>Winter Offline Brain</span>
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>IndexedDB Local Storage</span>
          </span>
        </div>
      </div>

      {/* Architecture Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#0c1424]/90 border border-sky-950/60 space-y-1.5">
          <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs">
            <CloudLightning className="w-4 h-4" />
            <span>Primary Cloud Intelligence</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Ultra-fast flash streaming intelligence with sub-second response times for deep reasoning, STEM, and synthesis.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0c1424]/90 border border-amber-950/50 space-y-1.5">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
            <WifiOff className="w-4 h-4" />
            <span>On-Device Offline Engine</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Seamlessly handles text summarization, daily planning, message drafting, and conversation recall without any network connection.
          </p>
        </div>
      </div>

      {/* Frosty Snowflake ❄️ Icon */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0c1424]/90 border border-slate-800/80 space-y-2.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <h3 className="font-semibold text-white text-xs sm:text-sm">Frosty Ice Emblem (❄️)</h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Engineered with 6-fold radial symmetry, crystalline spines, and glowing diamond facets on a deep space black canvas with soft cyan accents.
        </p>
        <div className="pt-1">
          <a
            href="/icon.svg"
            download="winter-icon.svg"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-300 text-xs font-medium border border-slate-800 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Vector SVG</span>
          </a>
        </div>
      </div>

      {/* Capacitor Android APK Guide */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0c1424]/90 border border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold text-white text-xs sm:text-sm">Android APK Build Guide</h3>
          </div>
          <button
            onClick={() => copyToClipboard(capacitorCommands, 'cap-commands')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-medium text-slate-300 transition-colors border border-slate-800"
          >
            {copiedCode === 'cap-commands' ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400 text-[11px]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span className="text-[11px]">Copy</span>
              </>
            )}
          </button>
        </div>

        <div className="rounded-xl overflow-hidden bg-[#02050e] border border-slate-800/80 p-3 font-mono text-[11px] text-slate-300 overflow-x-auto">
          <pre className="whitespace-pre">{capacitorCommands}</pre>
        </div>
      </div>
    </div>
  );
};

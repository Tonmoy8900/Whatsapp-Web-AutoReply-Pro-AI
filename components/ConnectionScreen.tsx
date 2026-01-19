
import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ConnectionStatus, LinkedDevice, WhatsAppCloudConfig } from '../types';

interface ConnectionScreenProps {
  status: ConnectionStatus;
  onConnect: (customName: string) => void;
  onDisconnect: (id: string) => void;
  linkedDevices: LinkedDevice[];
  showQR: boolean;
  setShowQR: (show: boolean) => void;
  cloudConfig: WhatsAppCloudConfig;
  onCloudUpdate: (val: Partial<WhatsAppCloudConfig>) => void;
  setStatus: (status: ConnectionStatus) => void;
}

const ConnectionScreen: React.FC<ConnectionScreenProps> = ({ 
  status, 
  onConnect, 
  onDisconnect, 
  linkedDevices,
  showQR,
  setShowQR,
  cloudConfig,
  onCloudUpdate,
  setStatus
}) => {
  const [activeMode, setActiveMode] = useState<'web' | 'cloud'>(cloudConfig.isEnabled ? 'cloud' : 'web');
  const [qrValue, setQrValue] = useState(`DEMO_PURPOSES_ONLY_${Math.random().toString(36).substr(2, 10)}`);
  const [loadingStep, setLoadingStep] = useState('');
  
  const rotationInterval = useRef<any>(null);

  useEffect(() => {
    if (status === 'disconnected' && activeMode === 'web') {
      rotationInterval.current = setInterval(() => {
        setQrValue(`DEMO_PURPOSES_ONLY_${Math.random().toString(36).substr(2, 10)}`);
      }, 15000);
    }
    return () => clearInterval(rotationInterval.current);
  }, [status, activeMode]);

  const handleBypass = () => {
    setStatus('connecting');
    setLoadingStep("Starting AI Practice Mode...");
    setTimeout(() => {
      onConnect("Demo-User");
      setStatus('connected');
    }, 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-20 px-4">
      {/* Header Explanation */}
      <div className="text-center space-y-3 pt-6">
        <h2 className="text-3xl font-black text-gray-800">Choose Your Connection</h2>
        <p className="text-gray-500 text-sm max-w-xl mx-auto">Do you want to practice with the AI, or are you ready to reply to real people?</p>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Option 1: Simulation */}
        <div 
          onClick={() => { setActiveMode('web'); onCloudUpdate({ isEnabled: false }); }}
          className={`relative p-8 rounded-[3rem] cursor-pointer transition-all border-4 ${activeMode === 'web' ? 'bg-white border-[#008069] shadow-2xl scale-[1.02]' : 'bg-gray-50 border-transparent grayscale opacity-70 hover:grayscale-0 hover:opacity-100'}`}
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-3xl">🧪</div>
            <h3 className="text-xl font-black text-gray-800 uppercase tracking-tighter">1. Practice Mode</h3>
            <p className="text-xs text-gray-500 font-medium">Use this to see how the AI works. No real messages are sent to anyone.</p>
            <ul className="text-[11px] text-left w-full space-y-2 font-bold text-gray-400 pt-4">
              <li className="flex items-center gap-2">✅ No WhatsApp account needed</li>
              <li className="flex items-center gap-2">✅ Instant setup in 1 second</li>
              <li className="flex items-center gap-2">❌ Real customers cannot see this</li>
            </ul>
          </div>
          {activeMode === 'web' && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#008069] text-white px-4 py-1 rounded-full text-[10px] font-black uppercase">Selected</div>}
        </div>

        {/* Option 2: Real Customers */}
        <div 
          onClick={() => { setActiveMode('cloud'); onCloudUpdate({ isEnabled: true }); }}
          className={`relative p-8 rounded-[3rem] cursor-pointer transition-all border-4 ${activeMode === 'cloud' ? 'bg-white border-blue-600 shadow-2xl scale-[1.02]' : 'bg-gray-50 border-transparent grayscale opacity-70 hover:grayscale-0 hover:opacity-100'}`}
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-3xl">🚀</div>
            <h3 className="text-xl font-black text-gray-800 uppercase tracking-tighter">2. Real Customers</h3>
            <p className="text-xs text-gray-500 font-medium">Use this for your business. The AI will reply to people on your real phone number.</p>
            <ul className="text-[11px] text-left w-full space-y-2 font-bold text-gray-400 pt-4">
              <li className="flex items-center gap-2">✅ AI replies to anyone who texts you</li>
              <li className="flex items-center gap-2">✅ Professional & Official (Meta)</li>
              <li className="flex items-center gap-2">❌ Requires Meta Setup (5 mins)</li>
            </ul>
          </div>
          {activeMode === 'cloud' && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase">Selected</div>}
        </div>
      </div>

      {/* Action Area */}
      <div className="bg-white rounded-[3.5rem] p-8 md:p-12 shadow-sm border border-gray-100 animate-fade-in">
        {activeMode === 'web' ? (
          <div className="flex flex-col items-center gap-10">
            {status === 'connected' ? (
              <div className="text-center py-10 space-y-6">
                 <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-4xl mx-auto border-2 border-green-100 animate-bounce">⚡</div>
                 <h4 className="text-2xl font-black text-gray-800">Practice Mode is LIVE</h4>
                 <p className="text-sm text-gray-400">Go to the <b>Live Engine</b> tab to see the AI auto-reply to fake messages.</p>
                 <button onClick={() => setStatus('disconnected')} className="text-red-500 font-bold text-xs uppercase tracking-widest border-b border-red-200">Reset Practice</button>
              </div>
            ) : (
              <>
                <div className="relative group">
                  <div className="opacity-10 blur-md pointer-events-none">
                    <QRCodeSVG value={qrValue} size={180} />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-red-600 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl -rotate-12 border-4 border-white">
                      Not Scannable
                    </div>
                  </div>
                </div>
                <div className="text-center max-w-sm space-y-6">
                  <h4 className="text-xl font-black text-gray-800 leading-tight">Practice mode does not need your phone!</h4>
                  <button 
                    onClick={handleBypass}
                    className="w-full bg-[#008069] text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3 active:scale-95"
                  >
                    <span>🚀</span> START PRACTICE NOW
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-12 items-start">
             <div className="flex-1 space-y-8">
                <div className="space-y-2">
                  <h4 className="text-2xl font-black text-gray-800">Link Your Real Number</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">To talk to <b>Real Customers</b>, copy your credentials from your Meta Developer Dashboard into the boxes below.</p>
                </div>

                <div className="space-y-4">
                   <div className="space-y-1">
                     <p className="text-[10px] font-black text-gray-400 uppercase ml-4">Permanent Token</p>
                     <input type="password" placeholder="e.g. EAAG..." className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl text-xs font-mono" />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase ml-4">Phone ID</p>
                        <input type="text" placeholder="10594..." className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl text-xs" />
                     </div>
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase ml-4">WABA ID</p>
                        <input type="text" placeholder="28391..." className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl text-xs" />
                     </div>
                   </div>
                   <button onClick={() => alert("This demo saves logic. To connect real customers, a backend server is required.")} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all">Save & Start Serving Customers</button>
                </div>
             </div>

             <div className="w-full md:w-72 bg-blue-50/50 p-8 rounded-[2.5rem] border border-blue-100 space-y-6">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Where to get keys?</p>
                <div className="space-y-4">
                  {[
                    "1. Go to developers.facebook.com",
                    "2. Create a Business App",
                    "3. Add 'WhatsApp' product",
                    "4. Copy Token & IDs from Dashboard"
                  ].map((step, i) => (
                    <p key={i} className="text-[11px] font-bold text-blue-800/70">{step}</p>
                  ))}
                </div>
                <div className="pt-4">
                  <a href="https://developers.facebook.com" target="_blank" className="text-[10px] font-black text-blue-600 underline">OPEN META DASHBOARD ↗</a>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionScreen;

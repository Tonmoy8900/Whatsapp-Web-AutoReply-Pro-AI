
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
  const [qrValue, setQrValue] = useState(`DEMO_MODE_${Math.random().toString(36).substr(2, 10)}`);
  const [loadingStep, setLoadingStep] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  
  const rotationInterval = useRef<any>(null);

  useEffect(() => {
    if (status === 'disconnected' && activeMode === 'web') {
      rotationInterval.current = setInterval(() => {
        setQrValue(`DEMO_MODE_${Math.random().toString(36).substr(2, 10)}`);
      }, 20000);
    }
    return () => clearInterval(rotationInterval.current);
  }, [status, activeMode]);

  useEffect(() => {
    if (status === 'connecting') {
      const steps = ["Securing Tunnel...", "Generating Demo Key...", "Syncing UI State..."];
      let currentStep = 0;
      const stepInterval = setInterval(() => {
        if (currentStep < steps.length) {
          setLoadingStep(steps[currentStep]);
          currentStep++;
        }
      }, 800);
      const finishTimeout = setTimeout(() => {
        clearInterval(stepInterval);
        onConnect("Simulated-Device-01");
        setStatus('connected');
      }, 3000);
      return () => { clearInterval(stepInterval); clearTimeout(finishTimeout); };
    }
  }, [status, onConnect, setStatus]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-20 px-4">
      {/* Tab Selector */}
      <div className="flex bg-white p-1.5 rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <button 
          onClick={() => { setActiveMode('web'); onCloudUpdate({ isEnabled: false }); }}
          className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeMode === 'web' ? 'bg-[#008069] text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
        >
          Demo Simulator
        </button>
        <button 
          onClick={() => { setActiveMode('cloud'); onCloudUpdate({ isEnabled: true }); }}
          className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeMode === 'cloud' ? 'bg-[#008069] text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
        >
          Real Connection (Cloud API)
        </button>
      </div>

      {activeMode === 'cloud' ? (
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100 animate-fade-in">
           <div className="max-w-2xl mx-auto space-y-8">
              <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                <span className="text-2xl">⚡</span>
                <p className="text-xs text-blue-800 font-medium leading-relaxed">
                  <b>Production Mode:</b> Use the official WhatsApp Cloud API to connect your real business phone number. This works 24/7 without needing your phone to be online.
                </p>
              </div>
              
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Meta Access Token</label>
                  <input 
                    type="password" 
                    placeholder="EAAB..." 
                    value={cloudConfig.accessToken}
                    onChange={(e) => onCloudUpdate({ accessToken: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl text-sm font-mono focus:outline-none focus:border-[#008069]" 
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number ID</label>
                    <input 
                      type="text" 
                      placeholder="104523..." 
                      value={cloudConfig.phoneNumberId}
                      onChange={(e) => onCloudUpdate({ phoneNumberId: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl text-sm focus:outline-none focus:border-[#008069]" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">WABA ID</label>
                    <input 
                      type="text" 
                      placeholder="928374..." 
                      value={cloudConfig.wabaId}
                      onChange={(e) => onCloudUpdate({ wabaId: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl text-sm focus:outline-none focus:border-[#008069]" 
                    />
                  </div>
                </div>
              </div>
              
              <p className="text-center text-[10px] text-gray-400 font-medium">
                Don't have these? Visit <a href="https://developers.facebook.com" className="text-[#008069] underline">Meta for Developers</a> to set up your WhatsApp Business account.
              </p>
           </div>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          {status === 'connected' ? (
            <div className="p-12 text-center animate-fade-in">
              <div className="w-20 h-20 bg-[#e7f3f2] rounded-full flex items-center justify-center text-4xl mx-auto mb-6">✅</div>
              <h3 className="text-2xl font-black text-gray-800 tracking-tight">Simulator Online</h3>
              <p className="text-gray-400 text-sm mt-2 max-w-sm mx-auto">The AI engine is now active in "Demo Mode". You can trigger simulated messages in the Live Monitor tab.</p>
              <button onClick={() => setStatus('disconnected')} className="mt-8 bg-gray-50 text-gray-500 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-100 transition-all">Disconnect Simulator</button>
            </div>
          ) : (
            <div className="p-8 md:p-16 flex flex-col items-center">
              {/* Troubleshooter Info */}
              <div className="mb-12 p-5 bg-red-50 border border-red-100 rounded-[2rem] max-w-2xl w-full">
                <div className="flex gap-4 items-start">
                  <span className="text-2xl">🚫</span>
                  <div>
                    <h4 className="text-sm font-black text-red-800 uppercase tracking-tight mb-1">Why is my phone showing "Invalid QR Code"?</h4>
                    <p className="text-[11px] text-red-700 leading-relaxed mb-3">
                      This app is a <b>Frontend Prototype</b>. To connect a real phone, you need a backend server (Node.js/Python) to handle the complex WhatsApp encryption. 
                    </p>
                    <div className="flex gap-2">
                      <button onClick={() => setActiveMode('cloud')} className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest">Switch to Real Mode</button>
                      <button onClick={() => setShowHelp(!showHelp)} className="bg-white text-red-600 border border-red-200 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest">Learn More</button>
                    </div>
                  </div>
                </div>
                {showHelp && (
                  <div className="mt-4 pt-4 border-t border-red-100 text-[10px] text-red-800 space-y-2 animate-fade-in">
                    <p>• <b>Demo Mode:</b> Used to test the AI reply logic visually.</p>
                    <p>• <b>Production Mode:</b> Uses the <i>Cloud API</i> to actually send/receive messages on a real phone.</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col md:flex-row gap-16 items-center w-full justify-center">
                <div className="max-w-xs space-y-6 text-center md:text-left">
                  <h3 className="text-3xl font-black text-gray-800 tracking-tight">Test Simulator</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">Link this demo session to see how the AI handles your customized "Professional" auto-reply rules.</p>
                </div>

                <div className="relative group">
                  <div className={`relative p-10 bg-white rounded-[3.5rem] shadow-2xl border border-gray-100 transition-all ${status === 'connecting' ? 'opacity-20 blur-xl' : ''}`}>
                    <div className="scan-line"></div>
                    <QRCodeSVG value={qrValue} size={200} />
                    <div className="absolute inset-0 flex items-center justify-center rotate-12 pointer-events-none opacity-10">
                       <span className="text-4xl font-black text-gray-300">DEMO ONLY</span>
                    </div>
                  </div>

                  {status === 'connecting' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                       <div className="w-12 h-12 border-4 border-[#008069] border-t-transparent rounded-full animate-spin mb-4"></div>
                       <p className="text-[10px] font-black text-[#008069] uppercase tracking-widest">{loadingStep}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-16 text-center">
                <button 
                  onClick={() => setStatus('connecting')} 
                  className="bg-[#008069] text-white px-12 py-5 rounded-[1.8rem] font-black text-sm shadow-2xl hover:bg-[#075e54] transition-all flex items-center gap-3 animate-pulse"
                >
                  <span className="text-xl">📱</span>
                  ACTIVATE SIMULATOR
                </button>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-4">Safe & Encrypted Environment</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConnectionScreen;

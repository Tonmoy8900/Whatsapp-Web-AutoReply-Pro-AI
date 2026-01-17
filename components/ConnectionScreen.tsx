
import React, { useState, useEffect } from 'react';
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
  const [qrValue, setQrValue] = useState(`wa-link-${Math.random().toString(36).substr(2, 9)}`);
  const [customDeviceName, setCustomDeviceName] = useState('My Browser');
  const [loadingStep, setLoadingStep] = useState('');
  const [qrExpiry, setQrExpiry] = useState(60); // 60 seconds simulated expiry

  useEffect(() => {
    let timer: any;
    if (showQR && status === 'disconnected' && qrExpiry > 0) {
      timer = setInterval(() => {
        setQrExpiry(prev => {
          if (prev <= 1) {
            setStatus('expired');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showQR, status, qrExpiry]);

  useEffect(() => {
    if (status === 'connecting') {
      const steps = [
        "Initializing secure channel...",
        "Validating device handshake...",
        "Fetching account profile...",
        "Synchronizing message history..."
      ];
      
      let stepIdx = 0;
      const stepTimer = setInterval(() => {
        if (stepIdx < steps.length) {
          setLoadingStep(steps[stepIdx]);
          stepIdx++;
        }
      }, 700);

      const completionTimer = setTimeout(() => {
        // Simulated random failure (1 in 5 chance)
        if (Math.random() < 0.2) {
          setStatus('failed');
          setLoadingStep("Error: Connection handshake timed out.");
        } else {
          onConnect(customDeviceName);
          setShowQR(false);
          setQrExpiry(60);
        }
        clearInterval(stepTimer);
      }, 3500);

      return () => {
        clearInterval(stepTimer);
        clearTimeout(completionTimer);
      };
    }
  }, [status, onConnect, setShowQR, customDeviceName]);

  const refreshQR = () => {
    setQrValue(`wa-link-${Math.random().toString(36).substr(2, 9)}`);
    setQrExpiry(60);
    setStatus('disconnected');
    setLoadingStep("");
  };

  const getIcon = (platform: LinkedDevice['platform']) => {
    switch (platform) {
      case 'Chrome': return '🌐';
      case 'Windows': return '💻';
      case 'macOS': return '🍎';
      case 'Safari': return '🧭';
      default: return '📱';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Mode Toggle */}
      <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
        <button 
          onClick={() => { setActiveMode('web'); onCloudUpdate({ isEnabled: false }); }}
          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${activeMode === 'web' ? 'bg-[#008069] text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
        >
          WhatsApp Web (Legacy)
        </button>
        <button 
          onClick={() => { setActiveMode('cloud'); onCloudUpdate({ isEnabled: true }); }}
          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${activeMode === 'cloud' ? 'bg-[#008069] text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
        >
          WhatsApp Cloud API (Official)
        </button>
      </div>

      {activeMode === 'cloud' ? (
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 space-y-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-gray-800 tracking-tight">Cloud API Credentials</h2>
              <p className="text-gray-400 text-sm">Automate at scale with official infrastructure.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Access Token</label>
                <input 
                  type="password" 
                  value={cloudConfig.accessToken}
                  onChange={(e) => onCloudUpdate({ accessToken: e.target.value })}
                  placeholder="EAAB..."
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-[#008069] transition-all text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Phone ID</label>
                <input 
                  type="text" 
                  value={cloudConfig.phoneNumberId}
                  onChange={(e) => onCloudUpdate({ phoneNumberId: e.target.value })}
                  placeholder="e.g. 104592..."
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-[#008069] transition-all text-sm"
                />
              </div>
            </div>
            <div className="bg-blue-50 rounded-[1.5rem] p-6 border border-blue-100">
               <h4 className="font-bold text-blue-800 text-sm mb-3 flex items-center gap-2">
                 <span>🚀</span> Direct Enterprise Link
               </h4>
               <p className="text-xs text-blue-600 leading-relaxed mb-4">
                 Unlike Web Simulation, Cloud API stays online 24/7 without needing an open browser tab or active phone connection.
               </p>
               <a href="https://developers.facebook.com" target="_blank" className="inline-block text-[10px] bg-blue-600 text-white px-4 py-2 rounded-lg font-black uppercase tracking-tighter hover:bg-blue-700 transition-colors">Open Dashboard</a>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden animate-fade-in relative">
          {status === 'connected' && !showQR ? (
            <div className="p-8">
               <div className="flex flex-col items-center text-center mb-8">
                  <div className="w-16 h-16 bg-[#e7f3f2] rounded-full flex items-center justify-center text-3xl mb-4 shadow-inner border border-[#d1e8e6]">💻</div>
                  <h3 className="text-xl font-bold text-gray-800 tracking-tight">Active Link: {linkedDevices[0]?.name}</h3>
                  <p className="text-xs text-gray-400 font-medium mt-1">AI is monitoring this session for incoming messages.</p>
                  <button onClick={() => setShowQR(true)} className="mt-6 bg-gray-50 border border-gray-200 px-6 py-2 rounded-xl text-[#008069] font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all">Relink Device</button>
               </div>
               <div className="space-y-3">
                 {linkedDevices.map(device => (
                   <div key={device.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group">
                     <div className="flex items-center gap-4">
                        <span className="text-2xl">{getIcon(device.platform)}</span>
                        <div>
                          <p className="font-bold text-sm text-gray-800">{device.name}</p>
                          <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest">Linked • NY Office Node</p>
                        </div>
                     </div>
                     <button onClick={() => onDisconnect(device.id)} className="text-[10px] font-black text-red-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Disconnect</button>
                   </div>
                 ))}
               </div>
            </div>
          ) : (
            <div className="p-10 flex flex-col items-center">
               {status === 'failed' && (
                 <div className="w-full max-w-lg mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 animate-shake">
                    <span className="text-xl">⚠️</span>
                    <div className="flex-1">
                      <p className="text-xs font-black text-red-800 uppercase tracking-widest">Connection Failed</p>
                      <p className="text-[11px] text-red-600">The QR scan simulation was interrupted. This usually happens due to a network timeout.</p>
                    </div>
                    <button onClick={refreshQR} className="bg-red-600 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest">Retry</button>
                 </div>
               )}

               <div className="flex flex-col md:flex-row gap-12 items-center justify-center w-full">
                  <div className="space-y-6 max-w-sm text-center md:text-left">
                    <h3 className="text-2xl font-black text-gray-800 tracking-tight">Link Your Account</h3>
                    <p className="text-gray-500 text-sm font-medium leading-relaxed">
                      Follow the prompts to connect your professional WhatsApp number to the AI Auto-Reply engine.
                    </p>
                    <div className="space-y-2">
                       <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Device Label</label>
                       <input 
                         type="text" 
                         value={customDeviceName}
                         onChange={(e) => setCustomDeviceName(e.target.value)}
                         className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-[#008069] transition-all"
                       />
                    </div>
                  </div>

                  <div className="relative">
                    <div className="relative p-6 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                      {status === 'connecting' && <div className="scan-line"></div>}
                      
                      <div className={`transition-all duration-500 ${status === 'connecting' ? 'opacity-20 blur-md scale-95' : status === 'expired' ? 'opacity-10 blur-xl' : ''}`}>
                        <QRCodeSVG value={qrValue} size={220} />
                      </div>

                      {status === 'connecting' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                          <div className="w-12 h-12 border-4 border-[#008069] border-t-transparent rounded-full animate-spin mb-4"></div>
                          <p className="text-sm font-black text-[#008069] uppercase tracking-widest animate-pulse">{loadingStep}</p>
                        </div>
                      )}

                      {status === 'expired' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                          <p className="text-sm font-black text-gray-800 uppercase tracking-widest mb-4">QR Expired</p>
                          <button onClick={refreshQR} className="bg-[#008069] text-white p-3 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                          </button>
                        </div>
                      )}

                      <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-100">
                        <div 
                          className="h-full bg-[#008069] transition-all duration-1000 ease-linear"
                          style={{ width: `${(qrExpiry / 60) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    {status === 'disconnected' && (
                       <div className="absolute -top-3 -right-3 bg-[#25D366] text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg animate-bounce">
                         {qrExpiry}s left
                       </div>
                    )}
                  </div>
               </div>

               {status === 'disconnected' && (
                 <div className="mt-12 flex flex-col items-center gap-4">
                    <button 
                      onClick={() => setStatus('connecting')} 
                      className="bg-[#008069] text-white px-12 py-4 rounded-[1.5rem] font-black text-sm shadow-xl shadow-[#008069]/20 hover:bg-[#075e54] transition-all active:scale-95 group flex items-center gap-3"
                    >
                      <span className="group-hover:translate-x-1 transition-transform">📸</span>
                      SCAN QR CODE
                    </button>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Click to simulate a successful mobile scan</p>
                 </div>
               )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConnectionScreen;

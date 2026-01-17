
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
  const [qrValue, setQrValue] = useState(`wa-v3-${Math.random().toString(36).substr(2, 12)}`);
  const [customDeviceName, setCustomDeviceName] = useState('Marketing-Node-01');
  const [loadingStep, setLoadingStep] = useState('');
  const [qrExpiry, setQrExpiry] = useState(60);
  const [progress, setProgress] = useState(0);
  
  const expiryInterval = useRef<any>(null);

  // QR Expiry Countdown
  useEffect(() => {
    if ((status === 'disconnected' || status === 'expired') && activeMode === 'web') {
      if (status === 'disconnected') {
        expiryInterval.current = setInterval(() => {
          setQrExpiry(prev => {
            if (prev <= 1) {
              setStatus('expired');
              clearInterval(expiryInterval.current);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }
    return () => clearInterval(expiryInterval.current);
  }, [status, activeMode, setStatus]);

  // Connection Handshake Simulation
  useEffect(() => {
    if (status === 'connecting') {
      const steps = [
        "Initializing secure websocket...",
        "Generating encryption keys...",
        "Validating device signature...",
        "Syncing message index..."
      ];
      
      let currentStep = 0;
      const stepInterval = setInterval(() => {
        if (currentStep < steps.length) {
          setLoadingStep(steps[currentStep]);
          setProgress(((currentStep + 1) / steps.length) * 100);
          currentStep++;
        }
      }, 800);

      const finishTimeout = setTimeout(() => {
        clearInterval(stepInterval);
        // Random failure simulation for realism
        if (Math.random() < 0.1) {
          setStatus('failed');
        } else {
          onConnect(customDeviceName);
          setStatus('connected');
        }
      }, 3500);

      return () => {
        clearInterval(stepInterval);
        clearTimeout(finishTimeout);
      };
    }
  }, [status, customDeviceName, onConnect, setStatus]);

  const handleRefreshQR = () => {
    setQrValue(`wa-v3-${Math.random().toString(36).substr(2, 12)}`);
    setQrExpiry(60);
    setProgress(0);
    setStatus('disconnected');
  };

  const startScanSimulation = () => {
    setStatus('connecting');
  };

  const getPlatformIcon = (platform: LinkedDevice['platform']) => {
    switch (platform) {
      case 'Chrome': return '🌐';
      case 'Windows': return '💻';
      case 'macOS': return '🍎';
      case 'Safari': return '🧭';
      default: return '📱';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-20">
      {/* Tab Switcher */}
      <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
        <button 
          onClick={() => { setActiveMode('web'); onCloudUpdate({ isEnabled: false }); }}
          className={`flex-1 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeMode === 'web' ? 'bg-[#008069] text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
        >
          WhatsApp Web
        </button>
        <button 
          onClick={() => { setActiveMode('cloud'); onCloudUpdate({ isEnabled: true }); }}
          className={`flex-1 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeMode === 'cloud' ? 'bg-[#008069] text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
        >
          Cloud API
        </button>
      </div>

      {activeMode === 'cloud' ? (
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100 animate-fade-in">
          <div className="flex flex-col md:flex-row gap-10">
            <div className="flex-1 space-y-6">
              <h2 className="text-2xl font-black text-gray-800 tracking-tight">Cloud Connection</h2>
              <p className="text-gray-500 text-sm leading-relaxed">Connect directly to Meta's infrastructure for 24/7 reliability without a physical phone requirement.</p>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Access Token</label>
                  <input 
                    type="password" 
                    placeholder="EAAB..." 
                    value={cloudConfig.accessToken}
                    onChange={(e) => onCloudUpdate({ accessToken: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl text-sm font-mono focus:outline-none focus:border-[#008069]" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone ID</label>
                    <input 
                      type="text" 
                      placeholder="1045..." 
                      value={cloudConfig.phoneNumberId}
                      onChange={(e) => onCloudUpdate({ phoneNumberId: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl text-sm focus:outline-none focus:border-[#008069]" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">WABA ID</label>
                    <input 
                      type="text" 
                      placeholder="9283..." 
                      value={cloudConfig.wabaId}
                      onChange={(e) => onCloudUpdate({ wabaId: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl text-sm focus:outline-none focus:border-[#008069]" 
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full md:w-72 bg-blue-50 border border-blue-100 rounded-[2rem] p-6 space-y-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">🔹</div>
              <h4 className="font-black text-blue-800 text-xs uppercase tracking-widest">Dev Resources</h4>
              <p className="text-[11px] text-blue-600/80 leading-relaxed">Access your tokens via the Meta for Developers portal. Ensure you have the <code>whatsapp_business_messaging</code> permission enabled.</p>
              <a href="https://developers.facebook.com" target="_blank" className="block text-center py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all">Go to Dashboard</a>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          {status === 'connected' ? (
            <div className="p-10 text-center animate-fade-in">
              <div className="w-20 h-20 bg-[#e7f3f2] rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner border border-[#d1e8e6]">✅</div>
              <h3 className="text-2xl font-black text-gray-800 tracking-tight">Linked & Synchronized</h3>
              <p className="text-gray-400 text-sm mt-2 max-w-sm mx-auto">Your WhatsApp Web session is active. AI is monitoring incoming traffic on this node.</p>
              
              <div className="mt-10 space-y-3 max-w-md mx-auto">
                {linkedDevices.map(device => (
                  <div key={device.id} className="flex items-center justify-between p-5 bg-gray-50 rounded-3xl border border-gray-100 group">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{getPlatformIcon(device.platform)}</span>
                      <div className="text-left">
                        <p className="font-black text-sm text-gray-800">{device.name}</p>
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Linked: {new Date(device.lastActive).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    <button onClick={() => onDisconnect(device.id)} className="text-[10px] font-black text-red-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Disconnect</button>
                  </div>
                ))}
              </div>
              <button onClick={handleRefreshQR} className="mt-10 text-[#008069] font-black text-[10px] uppercase tracking-widest hover:underline">Link Another Device</button>
            </div>
          ) : (
            <div className="p-10 md:p-16 flex flex-col items-center">
              {status === 'failed' && (
                <div className="w-full max-w-md mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 animate-shake">
                   <span className="text-xl">⚠️</span>
                   <div className="flex-1">
                     <p className="text-xs font-black text-red-800 uppercase tracking-widest">Sync Interrupted</p>
                     <p className="text-[11px] text-red-600">The mobile scan couldn't be verified. Please try again.</p>
                   </div>
                   <button onClick={handleRefreshQR} className="bg-red-600 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest">Retry</button>
                </div>
              )}

              <div className="flex flex-col md:flex-row gap-16 items-center w-full justify-center">
                <div className="max-w-xs space-y-6 text-center md:text-left">
                  <h3 className="text-3xl font-black text-gray-800 tracking-tight">Scan QR Code</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <span className="w-5 h-5 bg-[#008069] text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                      <p className="text-sm text-gray-500">Open WhatsApp on your phone.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="w-5 h-5 bg-[#008069] text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                      <p className="text-sm text-gray-500">Tap <b>Menu</b> or <b>Settings</b> and select <b>Linked Devices</b>.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="w-5 h-5 bg-[#008069] text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                      <p className="text-sm text-gray-500">Point your phone to this screen to capture the code.</p>
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-gray-100">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Session Identity</label>
                    <input 
                      type="text" 
                      value={customDeviceName} 
                      onChange={(e) => setCustomDeviceName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 p-4 rounded-2xl text-sm font-bold focus:outline-none focus:border-[#008069]" 
                    />
                  </div>
                </div>

                <div className="relative group">
                  <div className={`relative p-8 bg-white rounded-[3rem] shadow-2xl border border-gray-50 transition-all duration-700 ${status === 'connecting' ? 'scale-90 opacity-20 blur-xl' : status === 'expired' ? 'opacity-10 blur-2xl' : ''}`}>
                    <div className="scan-line"></div>
                    <QRCodeSVG value={qrValue} size={240} level="H" includeMargin={false} />
                  </div>

                  {status === 'connecting' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                       <div className="w-16 h-16 border-4 border-[#008069] border-t-transparent rounded-full animate-spin mb-6"></div>
                       <p className="text-sm font-black text-[#008069] uppercase tracking-widest animate-pulse">{loadingStep}</p>
                       <div className="w-full h-1 bg-gray-100 rounded-full mt-6 overflow-hidden max-w-[200px]">
                         <div className="h-full bg-[#008069] transition-all duration-300" style={{ width: `${progress}%` }}></div>
                       </div>
                    </div>
                  )}

                  {status === 'expired' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                      <p className="text-lg font-black text-gray-800 uppercase tracking-widest mb-4">Token Expired</p>
                      <button onClick={handleRefreshQR} className="bg-[#008069] text-white p-4 rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                      </button>
                    </div>
                  )}

                  {status === 'disconnected' && (
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-[#075e54] text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2">
                       <span className="w-1.5 h-1.5 bg-[#25D366] rounded-full animate-pulse"></span>
                       Refresh in {qrExpiry}s
                    </div>
                  )}
                </div>
              </div>

              {status === 'disconnected' && (
                <div className="mt-16 flex flex-col items-center gap-4">
                  <button 
                    onClick={startScanSimulation} 
                    className="bg-[#008069] text-white px-14 py-4 rounded-[1.5rem] font-black text-sm shadow-2xl shadow-[#008069]/20 hover:bg-[#075e54] transition-all active:scale-95 group flex items-center gap-3"
                  >
                    <span className="text-xl group-hover:scale-125 transition-transform">📱</span>
                    SIMULATE MOBILE SCAN
                  </button>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Simulate a phone capturing the QR code above</p>
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


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
}

const ConnectionScreen: React.FC<ConnectionScreenProps> = ({ 
  status, 
  onConnect, 
  onDisconnect, 
  linkedDevices,
  showQR,
  setShowQR,
  cloudConfig,
  onCloudUpdate
}) => {
  const [activeMode, setActiveMode] = useState<'web' | 'cloud'>(cloudConfig.isEnabled ? 'cloud' : 'web');
  const [qrValue] = useState(`wa-link-${Math.random().toString(36).substr(2, 9)}`);
  const [customDeviceName, setCustomDeviceName] = useState('My Browser');

  useEffect(() => {
    if (status === 'connecting') {
      const timer = setTimeout(() => {
        onConnect(customDeviceName);
        setShowQR(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, onConnect, setShowQR, customDeviceName]);

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
              <h2 className="text-2xl font-black text-gray-800">Business Cloud API</h2>
              <p className="text-gray-400 text-sm">Official Meta Enterprise connection.</p>
            </div>
            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${cloudConfig.accessToken ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
              {cloudConfig.accessToken ? 'Active Status' : 'Needs Config'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Permanent Access Token</label>
                <input 
                  type="password" 
                  value={cloudConfig.accessToken}
                  onChange={(e) => onCloudUpdate({ accessToken: e.target.value })}
                  placeholder="EAAB..."
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-[#008069] transition-all text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Phone Number ID</label>
                <input 
                  type="text" 
                  value={cloudConfig.phoneNumberId}
                  onChange={(e) => onCloudUpdate({ phoneNumberId: e.target.value })}
                  placeholder="e.g. 1045920..."
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-[#008069] transition-all text-sm"
                />
              </div>
            </div>
            <div className="bg-blue-50 rounded-[1.5rem] p-6 border border-blue-100">
               <h4 className="font-bold text-blue-800 text-sm mb-2 flex items-center gap-2">
                 <span>ℹ️</span> How to get these?
               </h4>
               <ul className="text-[11px] text-blue-600 space-y-3 leading-relaxed">
                 <li>1. Create an app at <b>developers.facebook.com</b></li>
                 <li>2. Add <b>WhatsApp</b> product to your app.</li>
                 <li>3. Navigate to <b>API Setup</b> in the sidebar.</li>
                 <li>4. Copy your Temporary/Permanent Token and Phone ID.</li>
               </ul>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3">
             <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">🚀</div>
             <p className="text-[11px] text-gray-500 font-medium">Cloud API enables 100% reliable auto-replies even when this browser tab is closed.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
          {status === 'connected' && !showQR ? (
            <div className="p-8">
               <div className="flex flex-col items-center text-center mb-8">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-3xl mb-4 shadow-inner">💻</div>
                  <h3 className="text-xl font-bold text-gray-800">Linked Web Session</h3>
                  <button onClick={() => setShowQR(true)} className="mt-4 text-[#008069] font-bold text-xs hover:underline">Link New Device</button>
               </div>
               <div className="space-y-3">
                 {linkedDevices.map(device => (
                   <div key={device.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group">
                     <div className="flex items-center gap-3">
                        <span className="text-xl">{getIcon(device.platform)}</span>
                        <div>
                          <p className="font-bold text-sm text-gray-800">{device.name}</p>
                          <p className="text-[9px] text-gray-400 uppercase tracking-widest">Active • {device.location}</p>
                        </div>
                     </div>
                     <button onClick={() => onDisconnect(device.id)} className="text-xs font-bold text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">Logout</button>
                   </div>
                 ))}
               </div>
            </div>
          ) : (
            <div className="p-10 flex flex-col items-center">
               <div className="flex flex-col md:flex-row gap-12 items-center justify-center w-full">
                  <div className="space-y-6 max-w-sm">
                    <h3 className="text-2xl font-light text-gray-700">Scan for Instant Link</h3>
                    <ol className="space-y-3 text-sm text-gray-500 list-decimal list-inside">
                      <li>Open WhatsApp on your phone</li>
                      <li>Go to <b>Linked Devices</b> in Settings</li>
                      <li>Point camera to this screen</li>
                    </ol>
                    <input 
                      type="text" 
                      value={customDeviceName}
                      onChange={(e) => setCustomDeviceName(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none"
                    />
                  </div>
                  <div className="relative p-6 bg-white rounded-2xl shadow-2xl border border-gray-100">
                    {status === 'connecting' && <div className="scan-line"></div>}
                    <div className={status === 'connecting' ? 'opacity-30 blur-sm' : ''}>
                      <QRCodeSVG value={qrValue} size={200} />
                    </div>
                    {status === 'connecting' && <div className="absolute inset-0 flex items-center justify-center font-bold text-[#008069]">Syncing...</div>}
                  </div>
               </div>
               <button onClick={() => onConnect(customDeviceName)} className="mt-10 bg-[#008069] text-white px-10 py-3.5 rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all">
                  Simulate Web Scan
               </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConnectionScreen;


import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ConnectionStatus, LinkedDevice } from '../types';

interface ConnectionScreenProps {
  status: ConnectionStatus;
  onConnect: (customName: string) => void;
  onDisconnect: (id: string) => void;
  linkedDevices: LinkedDevice[];
  showQR: boolean;
  setShowQR: (show: boolean) => void;
}

const ConnectionScreen: React.FC<ConnectionScreenProps> = ({ 
  status, 
  onConnect, 
  onDisconnect, 
  linkedDevices,
  showQR,
  setShowQR
}) => {
  const [qrValue, setQrValue] = useState(`wa-link-${Math.random().toString(36).substr(2, 9)}`);
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

  // If we are currently scanning or disconnected and want to link
  if (showQR || status === 'disconnected' || status === 'connecting') {
    return (
      <div className="bg-white overflow-hidden rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center animate-fade-in">
        <div className="w-full bg-[#008069] text-white px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
             {status === 'connected' && (
               <button onClick={() => setShowQR(false)} className="hover:bg-black/10 p-2 rounded-full transition-colors">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
               </button>
             )}
             <h2 className="text-xl font-medium">Link a device</h2>
          </div>
        </div>

        <div className="p-10 flex flex-col items-center w-full">
          <div className="flex flex-col md:flex-row gap-12 items-center w-full max-w-4xl justify-center">
            <div className="space-y-8 max-w-sm order-2 md:order-1">
              <div className="space-y-2">
                <h3 className="text-2xl font-light text-gray-700">Use AutoReply Pro on WhatsApp</h3>
                <p className="text-gray-500 text-sm">Open WhatsApp on your phone to scan the code</p>
              </div>
              
              <ol className="space-y-4 text-sm text-gray-600 list-decimal list-inside marker:font-bold">
                <li>Open WhatsApp on your phone</li>
                <li>Tap <b>Menu</b> or <b>Settings</b> and select <b>Linked Devices</b></li>
                <li>Tap on <b>Link a Device</b></li>
                <li>Point your phone to this screen to capture the code</li>
              </ol>
            </div>

            <div className="flex flex-col items-center gap-6 order-1 md:order-2">
              <div className="w-full max-w-[240px]">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Device Name</label>
                <input 
                  type="text" 
                  value={customDeviceName}
                  onChange={(e) => setCustomDeviceName(e.target.value)}
                  placeholder="e.g. My Chrome Browser"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#25D366] transition-colors"
                  disabled={status === 'connecting'}
                />
              </div>

              <div className="relative p-8 bg-white rounded-xl shadow-xl border border-gray-50">
                {status === 'connecting' && <div className="scan-line"></div>}
                <div className={`transition-all duration-500 ${status === 'connecting' ? 'scale-95 opacity-50 blur-[2px]' : 'scale-100'}`}>
                  <QRCodeSVG 
                    value={qrValue} 
                    size={240} 
                    fgColor="#1c1e21" 
                    level="H"
                    includeMargin={false}
                  />
                </div>
                {status === 'connecting' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/90 p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center gap-3">
                       <div className="w-10 h-10 border-4 border-[#25D366] border-t-transparent rounded-full animate-spin"></div>
                       <span className="font-bold text-gray-800">Connecting...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {status !== 'connecting' && (
            <div className="mt-12 w-full max-w-sm">
              <button 
                onClick={() => onConnect(customDeviceName)}
                className="w-full py-4 bg-[#008069] hover:bg-[#00a884] text-white rounded-lg font-bold shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-3"
              >
                Simulate QR Scan
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Management Screen (Status is connected)
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner border border-gray-100">
            💻
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Linked devices</h2>
          <p className="text-gray-500 text-sm mt-2 max-w-md">
            Use AutoReply Pro on other devices without keeping your phone online.
          </p>
          <button 
            onClick={() => setShowQR(true)}
            className="mt-8 bg-[#008069] text-white px-8 py-3 rounded-full font-bold hover:bg-[#00a884] transition-all shadow-lg shadow-[#008069]/20"
          >
            Link a device
          </button>
        </div>

        <div className="bg-gray-50/50 p-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 ml-2">Device Status</h3>
          <div className="space-y-3">
            {linkedDevices.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No active sessions found.</p>
            ) : (
              linkedDevices.map((device) => (
                <div key={device.id} className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center justify-between group hover:border-[#008069]/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      {getIcon(device.platform)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{device.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="w-1.5 h-1.5 bg-[#25D366] rounded-full"></span>
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">
                          Active • {device.location} • {new Date(device.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => onDisconnect(device.id)}
                    className="opacity-0 group-hover:opacity-100 bg-red-50 text-red-500 text-xs font-bold px-4 py-2 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                  >
                    Log out
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center gap-4">
        <div className="w-10 h-10 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center text-xl shrink-0">
          🔒
        </div>
        <div>
          <p className="text-xs font-bold text-gray-800">End-to-end encrypted</p>
          <p className="text-[10px] text-gray-400">Your personal messages are end-to-end encrypted on all your devices.</p>
        </div>
      </div>
    </div>
  );
};

export default ConnectionScreen;

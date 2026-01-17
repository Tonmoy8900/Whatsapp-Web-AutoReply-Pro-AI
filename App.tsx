
import React, { useState, useEffect } from 'react';
import { generateWhatsAppReply, generateDynamicWhatsAppReply } from './services/geminiService';
import { GeneratorConfig, ReplyType, ConnectionStatus, ActivityLog, LinkedDevice } from './types';
import PhonePreview from './components/PhonePreview';
import ConnectionScreen from './components/ConnectionScreen';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generator' | 'connection' | 'monitor'>('generator');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [linkedDevices, setLinkedDevices] = useState<LinkedDevice[]>([]);
  const [showQR, setShowQR] = useState(false);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const [config, setConfig] = useState<GeneratorConfig>({
    companyName: 'Acme Business Solutions',
    workingHours: '9:00 AM to 5:00 PM',
    workingDays: 'Monday to Friday',
    context: 'We are a creative agency specialized in digital branding.',
    replyType: ReplyType.PROFESSIONAL,
    includeContactInfo: false,
  });

  const [generatedMessage, setGeneratedMessage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!generatedMessage && config.companyName) {
      handleGenerate();
    }
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateWhatsAppReply(config);
      setGeneratedMessage(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'AutoReply Pro AI',
      text: 'Check out this Professional WhatsApp AI Auto-Responder developed by Tonmoy (Bumba)!',
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled or failed');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    }
  };

  const handleConnect = (customName: string) => {
    const platforms: LinkedDevice['platform'][] = ['Chrome', 'Windows', 'macOS', 'Safari'];
    const newDevice: LinkedDevice = {
      id: Math.random().toString(36).substr(2, 9),
      name: customName || 'Unknown Device',
      platform: platforms[Math.floor(Math.random() * platforms.length)],
      lastActive: Date.now(),
      location: 'New York, USA'
    };
    
    setLinkedDevices(prev => [newDevice, ...prev]);
    setConnectionStatus('connected');
    setShowQR(false);
  };

  const handleDisconnect = (id: string) => {
    const updated = linkedDevices.filter(d => d.id !== id);
    setLinkedDevices(updated);
    if (updated.length === 0) {
      setConnectionStatus('disconnected');
    }
  };

  const simulateIncomingMessage = async () => {
    if (connectionStatus !== 'connected') return;

    const scenarios = [
      "How much does a logo design cost?",
      "Can I schedule a meeting for next Tuesday?",
      "What are your agency hours today?",
      "I have a problem with my current project.",
      "Do you provide social media management services?",
      "Hi, can I speak to the manager about an urgent matter?"
    ];

    const incomingText = scenarios[Math.floor(Math.random() * scenarios.length)];
    const newLogId = Math.random().toString(36).substr(2, 9);
    
    const newLog: ActivityLog = {
      id: newLogId,
      from: `+1 (555) ${Math.floor(100 + Math.random() * 899)}-${Math.floor(1000 + Math.random() * 8999)}`,
      incomingMessage: incomingText,
      outboundReply: "...", 
      timestamp: Date.now()
    };

    setActivityLogs(prev => [newLog, ...prev]);

    const dynamicReply = await generateDynamicWhatsAppReply(incomingText, config);
    
    setActivityLogs(prev => prev.map(log => 
      log.id === newLogId ? { ...log, outboundReply: dynamicReply } : log
    ));
  };

  useEffect(() => {
    let interval: any;
    if (isSimulating && connectionStatus === 'connected') {
      interval = setInterval(() => {
        simulateIncomingMessage();
      }, 10000);
    }
    return () => clearInterval(interval);
  }, [isSimulating, connectionStatus, config]);

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col font-sans selection:bg-[#25D366]/30">
      {/* Navbar */}
      <nav className="bg-[#075e54] text-white py-4 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1.5 rounded-lg shadow-inner">
               <svg className="w-6 h-6 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight">AutoReply Pro <span className="text-[10px] bg-[#25D366] px-1.5 py-0.5 rounded text-white ml-1 font-black">AI V3</span></h1>
          </div>
          <div className="flex gap-4 md:gap-8 text-[11px] md:text-sm font-semibold">
            <button onClick={() => setActiveTab('generator')} className={`pb-2 border-b-2 transition-all ${activeTab === 'generator' ? 'border-white text-white' : 'border-transparent text-white/70 hover:text-white'}`}>AI Knowledge</button>
            <button onClick={() => setActiveTab('connection')} className={`pb-2 border-b-2 transition-all ${activeTab === 'connection' ? 'border-white text-white' : 'border-transparent text-white/70 hover:text-white'}`}>Connectivity</button>
            <button onClick={() => setActiveTab('monitor')} className={`pb-2 border-b-2 transition-all ${activeTab === 'monitor' ? 'border-white text-white' : 'border-transparent text-white/70 hover:text-white'}`}>Live Engine</button>
          </div>
          <div className="flex items-center gap-3">
             <button 
                onClick={handleShare}
                className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-all relative flex items-center justify-center"
                title="Share App Link"
             >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                {copyFeedback && (
                  <span className="absolute -bottom-10 right-0 bg-black text-white text-[10px] py-1 px-2 rounded whitespace-nowrap animate-fade-in">Link Copied!</span>
                )}
             </button>
             <div className="hidden sm:flex px-4 py-1.5 rounded-full text-[11px] uppercase tracking-wider font-extrabold items-center gap-2 bg-white/10 text-white/50">
                <span className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-[#25D366] animate-pulse' : 'bg-gray-400'}`}></span>
                {connectionStatus === 'connected' ? 'Bot Live' : 'Offline'}
             </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 max-w-6xl mt-8 md:mt-12 flex-grow">
        {activeTab === 'generator' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 animate-fade-in">
            <div className="space-y-6">
              <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-8">
                   <h2 className="text-xl font-bold text-gray-800">Bot Logic Setup</h2>
                   <div className="text-[10px] font-bold text-[#128c7e] bg-[#e7f3f2] px-3 py-1 rounded-full uppercase">Dynamic Learning</div>
                </div>
                
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3 items-start animate-shake">
                    <span className="text-red-500 text-lg">⚠️</span>
                    <div>
                      <p className="text-sm font-bold text-red-800">AI Sync Error</p>
                      <p className="text-xs text-red-600">{error}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Business Information</label>
                    <input type="text" placeholder="Organization Name" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-[#25D366] outline-none transition-all" value={config.companyName} onChange={(e) => setConfig({ ...config, companyName: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input type="text" placeholder="Hours (e.g. 9am-5pm)" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none" value={config.workingHours} onChange={(e) => setConfig({ ...config, workingHours: e.target.value })} />
                    <input type="text" placeholder="Days (e.g. Mon-Fri)" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none" value={config.workingDays} onChange={(e) => setConfig({ ...config, workingDays: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Core AI Context</label>
                    <textarea placeholder="Describe current situation..." rows={4} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none resize-none focus:bg-white transition-all" value={config.context} onChange={(e) => setConfig({ ...config, context: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Bot Personality</label>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.values(ReplyType).map((type) => (
                        <button key={type} onClick={() => setConfig({ ...config, replyType: type })} className={`p-3 rounded-2xl border-2 text-sm font-bold transition-all ${config.replyType === type ? 'bg-[#25D366] border-[#25D366] text-white shadow-md' : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'}`}>{type}</button>
                      ))}
                    </div>
                  </div>
                  <button onClick={handleGenerate} disabled={isGenerating} className="w-full bg-[#128c7e] hover:bg-[#075e54] text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-[#128c7e]/20 transition-all flex items-center justify-center gap-3 active:scale-95">
                    {isGenerating ? <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div> : 'Update Bot Profile'}
                  </button>
                </div>
              </section>
            </div>
            <div className="flex flex-col items-center lg:sticky lg:top-28 pb-12 lg:pb-0">
              <PhonePreview message={generatedMessage} loading={isGenerating} />
            </div>
          </div>
        )}

        {activeTab === 'connection' && (
          <div className="animate-fade-in pb-12 space-y-6">
            <div className="bg-[#075e54] text-white p-6 rounded-3xl shadow-lg flex items-center justify-between border border-white/10">
              <div>
                 <h3 className="text-lg font-bold">Public Share Link</h3>
                 <p className="text-white/70 text-xs mt-1">Deploy this app to Vercel to get a link you can share with anyone.</p>
              </div>
              <button 
                onClick={handleShare}
                className="bg-white text-[#075e54] px-6 py-2 rounded-xl font-bold hover:bg-[#25D366] hover:text-white transition-all shadow-md active:scale-95"
              >
                Copy My Link
              </button>
            </div>
            <ConnectionScreen 
              status={connectionStatus} 
              onConnect={(name) => {
                setConnectionStatus('connecting');
                setTimeout(() => handleConnect(name), 2000);
              }}
              onDisconnect={handleDisconnect}
              linkedDevices={linkedDevices}
              showQR={showQR}
              setShowQR={setShowQR}
            />
          </div>
        )}

        {activeTab === 'monitor' && (
          <div className="space-y-8 animate-fade-in pb-12">
            <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-sm border border-gray-100">
              <div className="flex flex-col md:flex-row items-center justify-between mb-10 pb-8 border-b border-gray-50 gap-6">
                <div className="text-center md:text-left">
                  <h2 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight">AI Traffic Monitor</h2>
                  <p className="text-gray-400 font-medium italic text-sm">Gemini AI is analyzing and replying to every unique question.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                  <button 
                    onClick={() => setIsSimulating(!isSimulating)}
                    disabled={connectionStatus !== 'connected'}
                    className={`w-full sm:w-auto px-6 py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${isSimulating ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-[#25D366] text-white shadow-lg shadow-[#25D366]/20'}`}
                  >
                    {isSimulating ? '⏹ Stop Engine' : '▶ Start AI Traffic'}
                  </button>
                  <button 
                    onClick={simulateIncomingMessage}
                    disabled={connectionStatus !== 'connected'}
                    className="w-full sm:w-auto px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all disabled:opacity-30 flex items-center justify-center gap-2"
                  >
                    <span>💬</span> Send Test Message
                  </button>
                </div>
              </div>

              {activityLogs.length === 0 ? (
                <div className="text-center py-24 md:py-32 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-sm border border-gray-100 animate-pulse">💡</div>
                  <h3 className="text-xl font-black text-gray-700 mb-2">No active messages</h3>
                  <p className="text-gray-400 max-w-sm mx-auto px-6">Start AI Traffic to simulate real customers asking questions about your business.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {activityLogs.map((log) => (
                    <div key={log.id} className="p-6 md:p-8 bg-white rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 flex flex-col hover:border-[#25D366]/40 transition-all shadow-sm group">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-[#075e54] to-[#128c7e] rounded-xl md:rounded-2xl flex items-center justify-center font-bold text-white shadow-lg text-sm md:text-base">
                             {log.from.charAt(log.from.length - 2)}
                           </div>
                           <div>
                             <span className="font-black text-gray-800 text-lg md:text-xl tracking-tight">{log.from}</span>
                             <div className="text-[9px] md:text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">{new Date(log.timestamp).toLocaleTimeString()}</div>
                           </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                           <span className={`text-[8px] md:text-[9px] font-black px-2 md:px-3 py-1 rounded-full uppercase tracking-widest ${log.outboundReply === '...' ? 'bg-blue-50 text-blue-500 animate-pulse' : 'bg-green-50 text-green-600'}`}>
                             {log.outboundReply === '...' ? 'Analyzing' : 'Smart Reply Sent'}
                           </span>
                           <div className={`${log.outboundReply === '...' ? 'text-gray-200' : 'text-[#25D366]'} text-xl md:text-2xl`}>✓✓</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start relative">
                        <div className="space-y-2">
                           <span className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Customer Question</span>
                           <div className="bg-gray-50 p-4 md:p-6 rounded-2xl border border-gray-100 min-h-[80px] md:min-h-[100px]">
                             <p className="text-gray-700 font-bold italic text-base md:text-lg leading-tight">"{log.incomingMessage}"</p>
                           </div>
                        </div>

                        <div className="space-y-2">
                           <span className="text-[9px] md:text-[10px] font-black text-[#128c7e] uppercase tracking-widest ml-1">AI Smart Answer</span>
                           {log.outboundReply === "..." ? (
                             <div className="bg-[#e7f3f2] p-4 md:p-6 rounded-2xl border border-[#d1e8e6] flex gap-2 items-center h-[80px] md:h-[100px]">
                                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#128c7e] rounded-full animate-bounce"></div>
                                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#128c7e] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#128c7e] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                             </div>
                           ) : (
                             <div className="bg-[#dcf8c6] p-4 md:p-6 rounded-2xl border border-[#c1e6a1] shadow-inner relative min-h-[80px] md:min-h-[100px]">
                               <p className="text-gray-800 leading-relaxed font-medium text-sm md:text-base">{log.outboundReply}</p>
                             </div>
                           )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer with Developer Credit */}
      <footer className="mt-auto py-8 text-center text-gray-400 border-t border-gray-200 bg-white/50 backdrop-blur-sm px-4">
        <div className="flex flex-col items-center gap-2">
          <p className="text-[10px] font-medium tracking-widest uppercase mb-1">
            AutoReply Pro AI — Professional Dynamic Assistant
          </p>
          <p className="text-sm font-semibold text-gray-500">
            Developed by <span className="text-[#075e54] font-bold">Tonmoy (Bumba)</span>
          </p>
          <div className="flex gap-4 mt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-200"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-200"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-200"></span>
          </div>
          <p className="text-[9px] text-gray-300 mt-4 italic">© 2024 AutoReply Pro AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;

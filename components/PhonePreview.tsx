
import React from 'react';

interface PhonePreviewProps {
  message: string;
  loading?: boolean;
}

const PhonePreview: React.FC<PhonePreviewProps> = ({ message, loading }) => {
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-xl overflow-hidden">
      <div className="h-[32px] w-[3px] bg-gray-800 absolute -left-[17px] top-[72px] rounded-l-lg"></div>
      <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[124px] rounded-l-lg"></div>
      <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[178px] rounded-l-lg"></div>
      <div className="h-[64px] w-[3px] bg-gray-800 absolute -right-[17px] top-[142px] rounded-r-lg"></div>
      
      {/* Screen Content */}
      <div className="rounded-[2rem] overflow-hidden w-full h-full bg-[#e5ddd5] flex flex-col">
        {/* Status Bar */}
        <div className="h-6 bg-[#075e54] w-full flex justify-between items-center px-6 pt-1 text-white text-[10px]">
          <span>{currentTime}</span>
          <div className="flex gap-1">
            <span>📶</span>
            <span>🔋</span>
          </div>
        </div>

        {/* Header */}
        <div className="h-14 bg-[#075e54] w-full flex items-center px-3 gap-2 text-white">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
             <img src="https://picsum.photos/seed/user/100" alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col flex-1">
            <span className="text-sm font-semibold">Your Customer</span>
            <span className="text-[10px] opacity-80">online</span>
          </div>
          <div className="flex gap-3">
             <span className="text-lg">📞</span>
             <span className="text-lg">⋮</span>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
          {/* Incoming Message */}
          <div className="self-start max-w-[80%] bg-white p-2 rounded-lg shadow-sm text-xs relative">
            <p>Hello, is anyone there? I have a question about my order.</p>
            <span className="text-[9px] text-gray-500 float-right ml-2 mt-1">{currentTime}</span>
            <div className="absolute top-0 -left-2 w-0 h-0 border-t-[8px] border-t-white border-l-[8px] border-l-transparent"></div>
          </div>

          {/* Outgoing Auto-Reply */}
          {loading ? (
            <div className="self-end max-w-[80%] bg-[#dcf8c6] p-3 rounded-lg shadow-sm text-xs animate-pulse">
               Generating...
            </div>
          ) : message && (
            <div className="self-end max-w-[80%] bg-[#dcf8c6] p-2 rounded-lg shadow-sm text-xs relative">
              <p className="whitespace-pre-wrap">{message}</p>
              <div className="flex justify-end items-center gap-1 mt-1">
                <span className="text-[9px] text-gray-500">{currentTime}</span>
                <span className="text-[10px] text-blue-500">✓✓</span>
              </div>
              <div className="absolute top-0 -right-2 w-0 h-0 border-t-[8px] border-t-[#dcf8c6] border-r-[8px] border-r-transparent"></div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="h-16 bg-transparent w-full p-2 flex items-center gap-2">
           <div className="bg-white flex-1 h-10 rounded-full flex items-center px-4 shadow-sm">
             <span className="text-gray-400 text-sm">Message</span>
           </div>
           <div className="w-10 h-10 bg-[#128c7e] rounded-full flex items-center justify-center text-white shadow-md">
             🎤
           </div>
        </div>
      </div>
    </div>
  );
};

export default PhonePreview;

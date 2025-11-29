import React, { useEffect, useRef, memo } from 'react';
import { ChatMessage } from '../molecules';
import { Interaction } from '../types';

interface ChatContainerProps {
  interactions: Interaction[];
  darkMode?: boolean;
}

export const ChatContainer: React.FC<ChatContainerProps> = memo(({
  interactions,
  darkMode = false,
}) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [interactions]);

  return (
    <div
      ref={chatContainerRef}
      className={`flex-1 overflow-y-auto ${darkMode ? 'bg-[#0a0a0a]' : 'bg-[#e8e2d5]'}`}
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <div className="pl-3 pr-3 md:pl-4 md:pr-4 lg:pl-4 lg:pr-4 py-3 md:py-4 lg:py-4 space-y-3 min-h-full flex flex-col">
        {interactions.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center px-4">
              <div className={`text-6xl mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>📔</div>
              <h2 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                당신의 첫 번째 일기를 작성해보세요 ✨
              </h2>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                오늘 하루의 생각과 감정을 자유롭게 기록해보세요.
              </p>
            </div>
          </div>
        ) : (
          interactions.map((interaction) => (
            <ChatMessage
              key={interaction.id}
              interaction={interaction}
              darkMode={darkMode}
            />
          ))
        )}
      </div>
    </div>
  );
});


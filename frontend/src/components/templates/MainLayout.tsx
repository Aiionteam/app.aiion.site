import React, { memo } from 'react';
import { Sidebar, ChatContainer, PromptInput, AvatarMode } from '../organisms';
import { MenuItem, Category, Interaction } from '../types';

interface MainLayoutProps {
  // Sidebar props
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  currentCategory: Category;
  setCurrentCategory: (category: Category) => void;
  menuItems: MenuItem[];
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;

  // Content props
  avatarMode: boolean;
  isListening: boolean;
  interactions: Interaction[];
  
  // Prompt input props
  inputText: string;
  setInputText: (text: string) => void;
  loading: boolean;
  micAvailable: boolean;
  handleMicClick: () => void;
  handleSubmit: () => void;

  // Children (category-specific content)
  children?: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = memo(({
  sidebarOpen,
  setSidebarOpen,
  darkMode,
  setDarkMode,
  currentCategory,
  setCurrentCategory,
  menuItems,
  isDragging,
  setIsDragging,
  avatarMode,
  isListening,
  interactions,
  inputText,
  setInputText,
  loading,
  micAvailable,
  handleMicClick,
  handleSubmit,
  children,
}) => {
  return (
    <div className="flex h-screen bg-[#e8e2d5] overflow-hidden">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        currentCategory={currentCategory}
        setCurrentCategory={setCurrentCategory}
        menuItems={menuItems}
        isDragging={isDragging}
        setIsDragging={setIsDragging}
      />

      <div className={`flex-1 flex flex-col overflow-hidden ${darkMode ? 'bg-gray-900' : ''}`}>
        {avatarMode ? (
          <>
            <AvatarMode isListening={isListening} />
            <PromptInput
              inputText={inputText}
              setInputText={setInputText}
              loading={loading}
              avatarMode={avatarMode}
              micAvailable={micAvailable}
              onMicClick={handleMicClick}
              onSubmit={handleSubmit}
              darkMode={darkMode}
            />
          </>
        ) : currentCategory === 'home' ? (
          <>
            <ChatContainer interactions={interactions} darkMode={darkMode} />
            <PromptInput
              inputText={inputText}
              setInputText={setInputText}
              loading={loading}
              avatarMode={avatarMode}
              micAvailable={micAvailable}
              onMicClick={handleMicClick}
              onSubmit={handleSubmit}
              darkMode={darkMode}
            />
          </>
        ) : (
          <>
            {children}
          </>
        )}
      </div>
    </div>
  );
});


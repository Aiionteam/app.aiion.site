/**
 * 공통 타입 정의
 */

export interface Interaction {
  id: string;
  date: string;
  dayOfWeek: string;
  userInput: string;
  categories: string[];
  aiResponse: string;
}

export interface Event {
  id: string;
  date: string;
  text: string;
  time?: string;
  isAllDay: boolean;
  notification?: boolean;
  alarmOn?: boolean;
}

export interface Task {
  id: string;
  text: string;
  completed?: boolean;
}

export interface Diary {
  id: string;
  date: string;
  title: string;
  content: string;
  emotion: string;
  emotionScore: number;
}

export interface Transaction {
  id: string;
  date: string;
  title: string;
  totalAmount: number;
  expanded: boolean;
  categories: Array<{ name: string; amount: number }>;
  aiMessage?: string;
  details?: string;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
}

export type Category = "home" | "calendar" | "diary" | "health" | "culture" | "account" | "path";

export type DiaryView = 'home' | 'write' | 'list' | 'detail' | 'analysis';
export type AccountView = 'home' | 'data' | 'daily' | 'monthly' | 'income' | 'tax';
export type CultureView = 'home' | 'travel' | 'movie' | 'performance' | 'records' | 'wishlist';
export type HealthView = 'home' | 'exercise' | 'health' | 'records' | 'scan' | 'exercise-detail';
export type PathfinderView = 'home' | 'learning' | 'new-learning' | 'career' | 'roadmap';

// Speech Recognition 타입
export interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

export interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

export interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

export interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

export interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
  isFinal: boolean;
}

export interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

declare var webkitSpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof webkitSpeechRecognition;
  }
}


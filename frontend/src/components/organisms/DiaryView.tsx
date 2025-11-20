import React, { useState } from 'react';
import { Button, Input } from '../atoms';
import { DiaryView as DiaryViewType, Diary } from '../types';

interface DiaryViewProps {
  diaryView: DiaryViewType;
  setDiaryView: (view: DiaryViewType) => void;
  darkMode?: boolean;
}

export const DiaryView: React.FC<DiaryViewProps> = ({
  diaryView,
  setDiaryView,
  darkMode = false,
}) => {
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [selectedDiary, setSelectedDiary] = useState<Diary | null>(null);
  const [newDiaryTitle, setNewDiaryTitle] = useState('');
  const [newDiaryContent, setNewDiaryContent] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState('😊');
  const [selectedDate, setSelectedDate] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDate(),
    dayOfWeek: ['일', '월', '화', '수', '목', '금', '토'][new Date().getDay()]
  });
  const [errorMessage, setErrorMessage] = useState('');

  // Home 뷰
  if (diaryView === 'home') {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="text-center py-4">
              <h1 className="text-3xl font-bold text-gray-900">일기</h1>
            </div>

            <div className="bg-white rounded-2xl border-2 border-[#8B7355] p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center border-b-2 border-[#d4c4a8] pb-3">
                📊 종합감정 분석
              </h2>
              <div className="text-gray-900 leading-relaxed text-sm">
                <p className="text-center text-gray-500 py-4">
                  {diaries.length === 0 
                    ? '아직 작성된 일기가 없습니다. 첫 일기를 작성해보세요!'
                    : `총 ${diaries.length}개의 일기가 작성되었습니다.`}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <Button
                onClick={() => {
                  // 새 일기 작성 모드: 상태 초기화
                  setSelectedDiary(null);
                  setNewDiaryTitle('');
                  setNewDiaryContent('');
                  setSelectedEmotion('😊');
                  setSelectedDate({
                    year: new Date().getFullYear(),
                    month: new Date().getMonth() + 1,
                    day: new Date().getDate(),
                    dayOfWeek: ['일', '월', '화', '수', '목', '금', '토'][new Date().getDay()]
                  });
                  setErrorMessage('');
                  setDiaryView('write');
                }}
                className="bg-gradient-to-br from-white to-[#f5f0e8] rounded-2xl border-2 border-[#8B7355] p-12 hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                <div className="flex flex-col items-center space-y-3">
                  <span className="text-4xl">✍️</span>
                  <p className="text-2xl font-bold text-gray-900">일기쓰기</p>
                </div>
              </Button>
              <Button
                onClick={() => setDiaryView('list')}
                className="bg-gradient-to-br from-white to-[#f5f0e8] rounded-2xl border-2 border-[#8B7355] p-12 hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                <div className="flex flex-col items-center space-y-3">
                  <span className="text-4xl">📋</span>
                  <p className="text-2xl font-bold text-gray-900">일기리스트</p>
                </div>
              </Button>
            </div>

            <Button
              onClick={() => setDiaryView('analysis')}
              className="w-full bg-gradient-to-br from-white to-[#f5f0e8] rounded-2xl border-2 border-[#8B7355] p-12 hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              <div className="flex flex-col items-center space-y-3">
                <span className="text-4xl">📈</span>
                <p className="text-2xl font-bold text-gray-900">감정분석 그래프</p>
              </div>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 날짜 유효성 검사
  const validateDate = () => {
    if (selectedDate.year < 1000 || selectedDate.year > 9999) {
      setErrorMessage('년도는 1000년부터 9999년까지 입력 가능합니다.');
      return false;
    }
    if (selectedDate.month < 1 || selectedDate.month > 12) {
      setErrorMessage('월은 1부터 12까지 입력 가능합니다.');
      return false;
    }
    if (selectedDate.day < 1 || selectedDate.day > 31) {
      setErrorMessage('일은 1부터 31일까지 입력 가능합니다.');
      return false;
    }
    setErrorMessage('');
    return true;
  };

  const handleSave = () => {
    // 날짜와 제목만 있으면 저장 가능 (내용은 선택사항)
    if (!validateDate()) {
      return;
    }
    
    if (!newDiaryTitle.trim()) {
      setErrorMessage('제목을 입력해주세요.');
      return;
    }

    if (newDiaryContent.length > 9999) {
      setErrorMessage('텍스트가 너무 길어 저장할 수 없습니다.');
      return;
    }

    // 수정 모드인 경우
    if (selectedDiary) {
      const updatedDiary: Diary = {
        ...selectedDiary,
        date: `${selectedDate.year}-${String(selectedDate.month).padStart(2, '0')}-${String(selectedDate.day).padStart(2, '0')}`,
        title: newDiaryTitle,
        content: newDiaryContent,
        emotion: selectedEmotion,
      };
      setDiaries(diaries.map(diary => diary.id === selectedDiary.id ? updatedDiary : diary));
    } else {
      // 새로 작성하는 경우
      const newDiary: Diary = {
        id: Date.now().toString(),
        date: `${selectedDate.year}-${String(selectedDate.month).padStart(2, '0')}-${String(selectedDate.day).padStart(2, '0')}`,
        title: newDiaryTitle,
        content: newDiaryContent,
        emotion: selectedEmotion,
        emotionScore: 5,
      };
      setDiaries([...diaries, newDiary]);
    }
    
    setNewDiaryTitle('');
    setNewDiaryContent('');
    setSelectedEmotion('😊');
    setSelectedDiary(null);
    setErrorMessage('');
    setDiaryView('home');
  };

  // Write 뷰
  if (diaryView === 'write') {
    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-[#f5f1e8] to-[#e8dcc8]">
        {/* 상단 헤더 - 뒤로가기 + 날짜 */}
        <div className="bg-white border-b border-[#d4c4a8] shadow-sm">
          <div className="max-w-5xl mx-auto p-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setNewDiaryTitle('');
                  setNewDiaryContent('');
                  setSelectedDiary(null);
                  setSelectedEmotion('😊');
                  setErrorMessage('');
                  setDiaryView('home');
                }}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-[#f5f1e8] rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-medium">돌아가기</span>
              </button>
              <div className="flex items-center gap-2 bg-gradient-to-r from-[#8B7355] to-[#6d5943] text-white px-4 py-2 rounded-lg shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <input
                  type="number"
                  value={selectedDate.year}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value >= 1000 && value <= 9999) {
                      setSelectedDate({...selectedDate, year: value});
                      setErrorMessage('');
                    } else if (e.target.value === '') {
                      setSelectedDate({...selectedDate, year: new Date().getFullYear()});
                    }
                  }}
                  min={1000}
                  max={9999}
                  className="w-16 bg-transparent text-center focus:outline-none text-white font-medium"
                />
                <span className="text-white/80">/</span>
                <input
                  type="number"
                  value={selectedDate.month}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value >= 1 && value <= 12) {
                      setSelectedDate({...selectedDate, month: value});
                      setErrorMessage('');
                    } else if (e.target.value === '') {
                      setSelectedDate({...selectedDate, month: new Date().getMonth() + 1});
                    }
                  }}
                  min={1}
                  max={12}
                  className="w-10 bg-transparent text-center focus:outline-none text-white font-medium"
                />
                <span className="text-white/80">/</span>
                <input
                  type="number"
                  value={selectedDate.day}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value >= 1 && value <= 31) {
                      setSelectedDate({...selectedDate, day: value});
                      setErrorMessage('');
                    } else if (e.target.value === '') {
                      setSelectedDate({...selectedDate, day: new Date().getDate()});
                    }
                  }}
                  min={1}
                  max={31}
                  className="w-10 bg-transparent text-center focus:outline-none text-white font-medium"
                />
                <select
                  value={selectedDate.dayOfWeek}
                  onChange={(e) => setSelectedDate({...selectedDate, dayOfWeek: e.target.value})}
                  className="bg-transparent focus:outline-none text-white font-medium cursor-pointer"
                >
                  {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                    <option key={day} value={day} className="bg-[#8B7355] text-white">{`${day}요일`}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg border border-[#d4c4a8] overflow-hidden">
              {/* 제목 입력 */}
              <div className="p-6 border-b border-[#d4c4a8]">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-6 h-6 text-[#8B7355]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="오늘의 제목을 입력하세요..."
                    value={newDiaryTitle}
                    onChange={(e) => {
                      if (e.target.value.length <= 30) {
                        setNewDiaryTitle(e.target.value);
                        setErrorMessage('');
                      }
                    }}
                    maxLength={30}
                    className="flex-1 text-2xl font-bold focus:outline-none text-gray-900 placeholder-gray-400"
                  />
                  <span className="text-sm text-gray-400 whitespace-nowrap">
                    {newDiaryTitle.length}/30
                  </span>
                </div>
                {errorMessage && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errorMessage}
                  </p>
                )}
              </div>

              {/* 내용 입력 */}
              <div className="p-6">
                <textarea
                  placeholder="오늘 하루는 어땠나요? 자유롭게 기록해보세요..."
                  value={newDiaryContent}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 9999) {
                      setNewDiaryContent(value);
                      setErrorMessage('');
                    } else {
                      setErrorMessage('텍스트가 너무 길어 저장할 수 없습니다.');
                    }
                  }}
                  maxLength={9999}
                  className="w-full h-96 focus:outline-none resize-none text-gray-900 leading-relaxed placeholder-gray-400"
                />
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#d4c4a8]">
                  <span className="text-sm text-gray-400">
                    {newDiaryContent.length}/9999 자
                  </span>
                  <button
                    onClick={handleSave}
                    disabled={!newDiaryTitle.trim()}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#8B7355] to-[#6d5943] text-white font-medium rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {selectedDiary ? '수정하기' : '저장하기'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List 뷰
  if (diaryView === 'list') {
    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-[#f5f1e8]">
        <div className="bg-white border-b border-[#d4c4a8] shadow-sm p-4">
          <div className="max-w-5xl mx-auto flex items-center gap-4">
            <button
              onClick={() => setDiaryView('home')}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-[#f5f1e8] rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">돌아가기</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">일기 리스트</h1>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-lg border-2 border-[#8B7355] shadow-lg overflow-hidden">
              {/* 테이블 */}
              {diaries.length === 0 ? (
                <div className="p-8">
                  <p className="text-center text-gray-500">작성된 일기가 없습니다.</p>
                </div>
              ) : (
                <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                  <table className="w-full">
                    <tbody>
                      {diaries.map((diary, index) => {
                        const dateObj = new Date(diary.date);
                        const year = dateObj.getFullYear();
                        const month = dateObj.getMonth() + 1;
                        const day = dateObj.getDate();
                        const dayOfWeek = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'][dateObj.getDay()];
                        
                        return (
                          <tr
                            key={diary.id}
                            className="border-b border-[#d4c4a8] hover:bg-[#f5f1e8] cursor-pointer transition-colors last:border-b-0"
                            onClick={() => {
                              // 수정 모드로 진입: 기존 일기 데이터를 로드
                              setSelectedDiary(diary);
                              setNewDiaryTitle(diary.title);
                              setNewDiaryContent(diary.content);
                              setSelectedEmotion(diary.emotion);
                              
                              // 날짜 파싱
                              const dateParts = diary.date.split('-');
                              const dateObj = new Date(diary.date);
                              setSelectedDate({
                                year: parseInt(dateParts[0]),
                                month: parseInt(dateParts[1]),
                                day: parseInt(dateParts[2]),
                                dayOfWeek: ['일', '월', '화', '수', '목', '금', '토'][dateObj.getDay()]
                              });
                              
                              setDiaryView('write');
                            }}
                          >
                            <td className="border-r border-[#d4c4a8] p-4">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-[#8B7355] font-medium">제목:</span>
                                <span className="text-gray-900">
                                  {diary.title.length > 40 ? `${diary.title.substring(0, 40)}...` : diary.title}
                                </span>
                              </div>
                            </td>
                            <td className="border-r border-[#d4c4a8] p-4 text-center w-24">
                              <span className="text-gray-700">{year}</span>
                            </td>
                            <td className="border-r border-[#d4c4a8] p-4 text-center w-20">
                              <span className="text-gray-700">{month}</span>
                            </td>
                            <td className="border-r border-[#d4c4a8] p-4 text-center w-20">
                              <span className="text-gray-700">{day}</span>
                            </td>
                            <td className="p-4 text-center w-28">
                              <span className="text-gray-700">{dayOfWeek}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Detail 뷰
  if (diaryView === 'detail' && selectedDiary) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-[#f5f1e8]">
        <div className="bg-white border-b border-[#d4c4a8] shadow-sm p-4">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <button
              onClick={() => {
                setSelectedDiary(null);
                setDiaryView('list');
              }}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-[#f5f1e8] rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">돌아가기</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">일기 상세</h1>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-4">

            <div className="bg-white rounded-2xl border-2 border-[#8B7355] p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b-2 border-[#d4c4a8]">
                <span className="text-4xl">{selectedDiary.emotion}</span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedDiary.title}</h2>
                  <p className="text-sm text-gray-500">{selectedDiary.date}</p>
                </div>
              </div>
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {selectedDiary.content}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Analysis 뷰
  if (diaryView === 'analysis') {
    // 샘플 데이터
    const mbtiData = [
      { label: 'E vs I', value: 65 },
      { label: 'S vs N', value: 72 },
      { label: 'T vs F', value: 48 },
      { label: 'J vs P', value: 58 }
    ];

    const bigFiveData = [
      { label: '외향성', value: 52 },
      { label: '친화성', value: 75 },
      { label: '성실성', value: 68 },
      { label: '신경성', value: 45 },
      { label: '개방성', value: 62 }
    ];

    const weeklyData = [
      { day: '월', score: -0.5 },
      { day: '화', score: 0.3 },
      { day: '수', score: -0.2 },
      { day: '목', score: 0.5 },
      { day: '금', score: 0.8 },
      { day: '토', score: 0.6 },
      { day: '일', score: 0.2 }
    ];

    const monthlyData = [
      { date: '01월 17일', score: 0 },
      { date: '01월 27일', score: -0.3 },
      { date: '02월 07일', score: 0.5 },
      { date: '02월 17일', score: 0.2 },
      { date: '02월 27일', score: -0.2 },
      { date: '03월 07일', score: 0.7 },
      { date: '03월 17일', score: -0.4 },
      { date: '03월 27일', score: 0.4 }
    ];

    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-[#f5f1e8]">
        <div className="bg-white border-b border-[#d4c4a8] shadow-sm p-4">
          <div className="max-w-7xl mx-auto flex items-center gap-4">
            <button
              onClick={() => setDiaryView('home')}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-[#f5f1e8] rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">돌아가기</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">감정 분석 그래프</h1>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* MBTI 그래프 */}
            <div className="bg-white rounded-2xl border-2 border-[#8B7355] p-6 shadow-lg">
              <h2 className="text-xl font-bold text-center mb-6 border-b-2 border-[#d4c4a8] pb-3 text-gray-900">MBTI</h2>
              <div className="space-y-4">
                {mbtiData.map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-20 text-sm font-medium text-[#8B7355]">{item.label}</div>
                    <div className="flex-1 h-8 bg-[#f5f1e8] rounded relative">
                      <div
                        className="h-full bg-[#8B7355] rounded transition-all"
                        style={{ width: `${item.value}%` }}
                      ></div>
                    </div>
                    <div className="w-12 text-sm text-gray-700 text-right">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 빅 파이브 그래프 */}
            <div className="bg-white rounded-2xl border-2 border-[#8B7355] p-6 shadow-lg">
              <h2 className="text-xl font-bold text-center mb-6 border-b-2 border-[#d4c4a8] pb-3 text-gray-900">빅 파이브</h2>
              <div className="space-y-4">
                {bigFiveData.map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-20 text-sm font-medium text-[#8B7355]">{item.label}</div>
                    <div className="flex-1 h-8 bg-[#f5f1e8] rounded relative">
                      <div
                        className="h-full bg-[#8B7355] rounded transition-all"
                        style={{ width: `${item.value}%` }}
                      ></div>
                    </div>
                    <div className="w-12 text-sm text-gray-700 text-right">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 감정 분석 그래프 */}
            <div className="grid grid-cols-2 gap-6">
              {/* 주간 그래프 */}
              <div className="bg-white rounded-2xl border-2 border-[#8B7355] p-6 shadow-lg">
                <h2 className="text-xl font-bold text-center mb-6 border-b-2 border-[#d4c4a8] pb-3 text-gray-900">감정 분석(주간)</h2>
                <div className="relative h-64">
                  <svg className="w-full h-full" viewBox="0 0 400 250">
                    {/* 격자선 */}
                    <line x1="40" y1="200" x2="380" y2="200" stroke="#e5e7eb" strokeWidth="1" />
                    <line x1="40" y1="150" x2="380" y2="150" stroke="#e5e7eb" strokeWidth="1" />
                    <line x1="40" y1="100" x2="380" y2="100" stroke="#e5e7eb" strokeWidth="1" />
                    <line x1="40" y1="50" x2="380" y2="50" stroke="#e5e7eb" strokeWidth="1" />
                    
                    {/* X축 */}
                    <line x1="40" y1="125" x2="380" y2="125" stroke="#374151" strokeWidth="2" />
                    {/* Y축 */}
                    <line x1="40" y1="20" x2="40" y2="200" stroke="#374151" strokeWidth="2" />
                    
                    {/* 데이터 선 */}
                    <polyline
                      fill="none"
                      stroke="#8B7355"
                      strokeWidth="3"
                      points={weeklyData.map((item, i) => {
                        const x = 70 + (i * 45);
                        const y = 125 - (item.score * 100);
                        return `${x},${y}`;
                      }).join(' ')}
                    />
                    
                    {/* 데이터 포인트 */}
                    {weeklyData.map((item, i) => {
                      const x = 70 + (i * 45);
                      const y = 125 - (item.score * 100);
                      return (
                        <circle key={i} cx={x} cy={y} r="5" fill="#8B7355" />
                      );
                    })}
                    
                    {/* X축 레이블 */}
                    {weeklyData.map((item, i) => (
                      <text key={i} x={70 + (i * 45)} y="220" textAnchor="middle" fontSize="12" fill="#374151">
                        {item.day}
                      </text>
                    ))}
                  </svg>
                </div>
              </div>

              {/* 월간 그래프 */}
              <div className="bg-white rounded-2xl border-2 border-[#8B7355] p-6 shadow-lg">
                <h2 className="text-xl font-bold text-center mb-6 border-b-2 border-[#d4c4a8] pb-3 text-gray-900">감정 분석(월간)</h2>
                <div className="relative h-64">
                  <svg className="w-full h-full" viewBox="0 0 400 250">
                    {/* 격자선 */}
                    <line x1="40" y1="200" x2="380" y2="200" stroke="#e5e7eb" strokeWidth="1" />
                    <line x1="40" y1="150" x2="380" y2="150" stroke="#e5e7eb" strokeWidth="1" />
                    <line x1="40" y1="100" x2="380" y2="100" stroke="#e5e7eb" strokeWidth="1" />
                    <line x1="40" y1="50" x2="380" y2="50" stroke="#e5e7eb" strokeWidth="1" />
                    
                    {/* X축 */}
                    <line x1="40" y1="125" x2="380" y2="125" stroke="#374151" strokeWidth="2" />
                    {/* Y축 */}
                    <line x1="40" y1="20" x2="40" y2="200" stroke="#374151" strokeWidth="2" />
                    
                    {/* 데이터 선 */}
                    <polyline
                      fill="none"
                      stroke="#8B7355"
                      strokeWidth="3"
                      points={monthlyData.map((item, i) => {
                        const x = 60 + (i * 40);
                        const y = 125 - (item.score * 100);
                        return `${x},${y}`;
                      }).join(' ')}
                    />
                    
                    {/* 데이터 포인트 */}
                    {monthlyData.map((item, i) => {
                      const x = 60 + (i * 40);
                      const y = 125 - (item.score * 100);
                      return (
                        <circle key={i} cx={x} cy={y} r="4" fill="#8B7355" />
                      );
                    })}
                    
                    {/* X축 레이블 (간격을 두고 표시) */}
                    {monthlyData.map((item, i) => (
                      i % 2 === 0 && (
                        <text key={i} x={60 + (i * 40)} y="220" textAnchor="middle" fontSize="10" fill="#374151">
                          {item.date}
                        </text>
                      )
                    ))}
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

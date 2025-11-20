import React, { useState } from 'react';
import { Button, Input } from '../atoms';
import { Event, Task } from '../types';
import { getLocalDateStr } from '../../lib';

interface CalendarViewProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
  events: Event[];
  setEvents: (events: Event[]) => void;
  todayTasks: Task[];
  setTodayTasks: (tasks: Task[]) => void;
  darkMode?: boolean;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  selectedDate,
  setSelectedDate,
  currentMonth,
  setCurrentMonth,
  events,
  setEvents,
  todayTasks,
  setTodayTasks,
  darkMode = false,
}) => {
  const [newEventText, setNewEventText] = useState('');
  const [newEventTime, setNewEventTime] = useState('');
  const [isAllDay, setIsAllDay] = useState(false);
  const [showTimeSelector, setShowTimeSelector] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'event' | 'task'; id: string } | null>(null);

  const handleAddEvent = () => {
    if (!newEventText.trim()) {
      alert('텍스트를 작성해주세요');
      return;
    }
    if (!isAllDay && !newEventTime) {
      alert('시간설정과 텍스트를 작성해주세요');
      return;
    }

    if (events.length >= 100) {
      alert('일정은 최대 100개까지 저장할 수 있습니다.');
      return;
    }

    const newEvent: Event = {
      id: Date.now().toString(),
      date: getLocalDateStr(selectedDate),
      text: newEventText,
      time: isAllDay ? '하루종일' : newEventTime,
      isAllDay: isAllDay,
      alarmOn: true,
    };

    setEvents([...events, newEvent]);
    setNewEventText('');
    setNewEventTime('');
    setIsAllDay(false);
    setShowTimeSelector(false);
  };

  const handleAddTask = () => {
    if (!newTaskText.trim() || newTaskText.length > 20) return;

    if (todayTasks.length >= 100) {
      alert('할 일은 최대 100개까지 저장할 수 있습니다.');
      return;
    }

    const newTask: Task = {
      id: Date.now().toString(),
      text: newTaskText,
      completed: false,
    };

    setTodayTasks([...todayTasks, newTask]);
    setNewTaskText('');
  };

  const handleToggleAlarm = (eventId: string) => {
    setEvents(events.map(e => 
      e.id === eventId ? { ...e, alarmOn: !e.alarmOn } : e
    ));
  };

  const handleDeleteTask = (taskId: string) => {
    setTodayTasks(todayTasks.filter(t => t.id !== taskId));
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    
    if (deleteTarget.type === 'event') {
      setEvents(events.filter(e => e.id !== deleteTarget.id));
    } else {
      setTodayTasks(todayTasks.filter(t => t.id !== deleteTarget.id));
    }
    setDeleteTarget(null);
  };

  // 일정을 시간순으로 정렬 (하루종일이 맨 위)
  const sortedEvents = [...events]
    .filter(e => e.date === getLocalDateStr(selectedDate))
    .sort((a, b) => {
      if (a.isAllDay && !b.isAllDay) return -1;
      if (!a.isAllDay && b.isAllDay) return 1;
      if (a.isAllDay && b.isAllDay) return 0;
      return (a.time || '').localeCompare(b.time || '');
    });

  return (
    <div className={`flex-1 overflow-y-auto ${darkMode ? 'bg-gray-900' : 'bg-[#e8e2d5]'}`}>
      <div className="p-6 max-w-6xl mx-auto space-y-4">
        {/* 종합 분석 카드 */}
        <div className="bg-white rounded-2xl border-2 border-[#8B7355] p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-3 text-center border-b-2 border-[#d4c4a8] pb-2">
            📊 일정 알림 보드
          </h2>
          <div className="text-center text-gray-500 py-2 text-sm">
            {events.length === 0 
              ? '이번 주 일정이 없습니다. 첫 일정을 추가해보세요!'
              : `총 ${events.length}개의 일정이 등록되었습니다.`}
          </div>
        </div>

        {/* 캘린더 */}
        <div className="bg-white rounded-2xl border-2 border-[#8B7355] shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() =>
                setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
              }
              className="px-4 py-2 text-2xl text-gray-700 hover:bg-[#f5f1e8] rounded-lg transition-colors"
            >
              ←
            </button>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">📅 캘린더</h2>
              <p className="text-lg text-gray-600 mt-1">
                {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
              </p>
            </div>
            <button
              onClick={() =>
                setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
              }
              className="px-4 py-2 text-2xl text-gray-700 hover:bg-[#f5f1e8] rounded-lg transition-colors"
            >
              →
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
              <div key={day} className={`text-center text-base font-bold py-3 ${day === '일' ? 'text-red-500' : 'text-gray-700'}`}>
                {day}
              </div>
            ))}
            {Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() }).map((_, index) => (
              <div key={`empty-${index}`} className="p-4"></div>
            ))}
            {Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate() }).map((_, index) => {
              const day = index + 1;
              const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
              const dateStr = getLocalDateStr(date);
              const todayStr = getLocalDateStr(new Date());
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === getLocalDateStr(selectedDate);
              const hasEvents = events.some((e) => e.date === dateStr);
              const dayOfWeek = date.getDay();

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(date)}
                  className={`p-4 rounded-lg text-base font-medium transition-all min-h-[60px] flex flex-col items-center justify-center relative ${
                    isSelected
                      ? 'bg-[#8B7355] text-white scale-105'
                      : isToday
                      ? 'bg-[#d4cdc0] text-gray-900 font-bold ring-2 ring-[#8B7355]'
                      : 'hover:bg-[#f5f1e8]'
                  } ${dayOfWeek === 0 ? 'text-red-500' : ''}`}
                >
                  <span className={isSelected ? 'text-white' : ''}>{day}</span>
                  {hasEvents && (
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-1 animate-pulse"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 일정 목록 */}
        <div className="bg-white rounded-2xl border-2 border-[#8B7355] shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b-2 border-[#d4c4a8]">
            📋 {selectedDate.getFullYear()}/{selectedDate.getMonth() + 1}월/{selectedDate.getDate()}일
          </h3>

          {/* 일정 입력 */}
          <div className="mb-6 p-4 bg-[#f5f1e8] rounded-xl">
            <input
              type="text"
              value={newEventText}
              onChange={(e) => setNewEventText(e.target.value.slice(0, 20))}
              placeholder="일정을 입력하세요 (최대 20자)"
              className="w-full px-4 py-3 border-2 border-[#d4cdc0] rounded-lg mb-3 focus:outline-none focus:border-[#8B7355]"
              maxLength={20}
            />
            
            <div className="flex items-center gap-3 mb-3">
              <button
                onClick={() => setShowTimeSelector(!showTimeSelector)}
                className="flex-1 px-4 py-2 bg-white border-2 border-[#d4cdc0] rounded-lg hover:border-[#8B7355] transition-colors"
              >
                {newEventTime || '시간 설정'}
              </button>
              <button
                onClick={() => {
                  setIsAllDay(!isAllDay);
                  if (!isAllDay) setNewEventTime('');
                }}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  isAllDay 
                    ? 'bg-[#8B7355] text-white' 
                    : 'bg-white border-2 border-[#d4cdc0] hover:border-[#8B7355]'
                }`}
              >
                하루종일
              </button>
            </div>

            {showTimeSelector && !isAllDay && (
              <div className="mb-3 p-3 bg-white rounded-lg border-2 border-[#d4cdc0]">
                <input
                  type="time"
                  value={newEventTime}
                  onChange={(e) => setNewEventTime(e.target.value)}
                  className="w-full px-3 py-2 text-lg focus:outline-none"
                />
              </div>
            )}

            <Button
              onClick={handleAddEvent}
              className="w-full py-3 text-lg"
              disabled={!newEventText.trim() || (!isAllDay && !newEventTime)}
            >
              완료
            </Button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              일정 저장: {events.length}/100 | 휴지통 버튼을 눌러 삭제
            </p>
          </div>

          {/* 일정 리스트 */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {sortedEvents.map((event) => (
              <div
                key={event.id}
                className="p-4 bg-gradient-to-br from-white to-[#f5f1e8] rounded-xl border-2 border-[#d4cdc0] hover:border-[#8B7355] transition-all"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-[#8B7355] text-white rounded-full text-sm font-medium">
                        {event.isAllDay ? '하루종일' : event.time}
                      </span>
                      {event.isAllDay && (
                        <span className="text-xs text-gray-500">00:00부터 1시간마다 알림</span>
                      )}
                    </div>
                    <div className="font-medium text-gray-900 text-lg">{event.text}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleAlarm(event.id);
                      }}
                      className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                        event.alarmOn
                          ? 'bg-[#8B7355] text-white'
                          : 'bg-gray-300 text-gray-600'
                      }`}
                    >
                      알림 {event.alarmOn ? 'ON' : 'OFF'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget({ type: 'event', id: event.id });
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="삭제"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {sortedEvents.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">일정이 없습니다</p>
                <p className="text-sm mt-2">위에서 일정을 추가해보세요!</p>
              </div>
            )}
          </div>
        </div>

        {/* 오늘 할 일 (캡션) */}
        <div className="bg-white rounded-2xl border-2 border-[#8B7355] shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b-2 border-[#d4c4a8]">
            ✅ 오늘 할 일
          </h3>

          <div className="mb-4 flex gap-2">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value.slice(0, 20))}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
              placeholder="오늘 할 일을 입력하세요 (최대 20자)"
              className="flex-1 px-4 py-3 border-2 border-[#d4cdc0] rounded-lg focus:outline-none focus:border-[#8B7355]"
              maxLength={20}
            />
            <Button
              onClick={handleAddTask}
              className="px-6"
              disabled={!newTaskText.trim()}
            >
              추가
            </Button>
          </div>
          <p className="text-xs text-gray-500 mb-3 text-center">
            할 일 저장: {todayTasks.length}/100 | 체크 버튼을 눌러 삭제
          </p>

          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {todayTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-3 bg-[#f5f1e8] rounded-lg hover:bg-[#e8dcc8] transition-colors"
              >
                <span className="flex-1 text-gray-900">{task.text}</span>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="w-6 h-6 border-2 border-[#8B7355] rounded hover:bg-[#8B7355] hover:text-white transition-colors flex items-center justify-center text-sm font-bold flex-shrink-0"
                >
                  ✓
                </button>
              </div>
            ))}
            {todayTasks.length === 0 && (
              <p className="text-center py-8 text-gray-500">할 일이 없습니다</p>
            )}
          </div>
        </div>

        {/* 삭제 확인 모달 */}
        {deleteTarget && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-sm mx-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">삭제하시겠습니까?</h3>
              <div className="flex gap-3">
                <Button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-500 hover:bg-red-600"
                >
                  Yes
                </Button>
                <Button
                  onClick={() => setDeleteTarget(null)}
                  variant="secondary"
                  className="flex-1"
                >
                  No
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

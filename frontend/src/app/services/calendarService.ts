/**
 * 캘린더 서비스 레이어
 * CalendarView 컴포넌트의 비즈니스 로직을 서비스로 분리
 */

import { Event, Task } from '../../components/types';
import { getLocalDateStr } from '../../lib';

export interface AddEventParams {
  text: string;
  time: string;
  isAllDay: boolean;
  selectedDate: Date;
  existingEvents: Event[];
}

export interface AddEventResult {
  success: boolean;
  errorMessage?: string;
  event?: Event;
}

export interface AddTaskParams {
  text: string;
  selectedDate: Date;
  existingTasks: Task[];
}

export interface AddTaskResult {
  success: boolean;
  errorMessage?: string;
  task?: Task;
}

export interface ToggleAlarmParams {
  eventId: string;
  events: Event[];
}

export interface DeleteItemParams {
  type: 'event' | 'task';
  id: string;
  events: Event[];
  tasks: Task[];
}

/**
 * 일정 추가 유효성 검사
 */
export function validateAddEvent(params: AddEventParams): {
  isValid: boolean;
  errorMessage: string;
} {
  const { text, time, isAllDay } = params;

  if (!text.trim()) {
    return {
      isValid: false,
      errorMessage: '텍스트를 작성해주세요',
    };
  }

  if (!isAllDay && !time) {
    return {
      isValid: false,
      errorMessage: '시간설정과 텍스트를 작성해주세요',
    };
  }

  if (params.existingEvents.length >= 100) {
    return {
      isValid: false,
      errorMessage: '일정은 최대 100개까지 저장할 수 있습니다.',
    };
  }

  return {
    isValid: true,
    errorMessage: '',
  };
}

/**
 * 할 일 추가 유효성 검사
 */
export function validateAddTask(params: AddTaskParams): {
  isValid: boolean;
  errorMessage: string;
} {
  const { text, selectedDate, existingTasks } = params;

  if (!text.trim()) {
    return {
      isValid: false,
      errorMessage: '텍스트를 작성해주세요',
    };
  }

  if (text.length > 20) {
    return {
      isValid: false,
      errorMessage: '할 일은 최대 20자까지 입력 가능합니다.',
    };
  }

  const selectedDateStr = getLocalDateStr(selectedDate);
  const dateTasks = existingTasks.filter(t => t.date === selectedDateStr);

  if (dateTasks.length >= 100) {
    return {
      isValid: false,
      errorMessage: '할 일은 최대 100개까지 저장할 수 있습니다.',
    };
  }

  return {
    isValid: true,
    errorMessage: '',
  };
}

/**
 * 일정 추가 서비스
 */
export function addEventService(params: AddEventParams): AddEventResult {
  const validation = validateAddEvent(params);

  if (!validation.isValid) {
    return {
      success: false,
      errorMessage: validation.errorMessage,
    };
  }

  const newEvent: Event = {
    id: Date.now().toString(),
    date: getLocalDateStr(params.selectedDate),
    text: params.text,
    time: params.isAllDay ? '하루종일' : params.time,
    isAllDay: params.isAllDay,
    alarmOn: true,
  };

  return {
    success: true,
    event: newEvent,
  };
}

/**
 * 할 일 추가 서비스
 */
export function addTaskService(params: AddTaskParams): AddTaskResult {
  const validation = validateAddTask(params);

  if (!validation.isValid) {
    return {
      success: false,
      errorMessage: validation.errorMessage,
    };
  }

  const selectedDateStr = getLocalDateStr(params.selectedDate);
  const newTask: Task = {
    id: Date.now().toString(),
    date: selectedDateStr,
    text: params.text,
    completed: false,
  };

  return {
    success: true,
    task: newTask,
  };
}

/**
 * 알람 토글 서비스
 */
export function toggleAlarmService(params: ToggleAlarmParams): Event[] {
  return params.events.map(e =>
    e.id === params.eventId ? { ...e, alarmOn: !e.alarmOn } : e
  );
}

/**
 * 할 일 삭제 서비스
 */
export function deleteTaskService(taskId: string, tasks: Task[]): Task[] {
  return tasks.filter(t => t.id !== taskId);
}

/**
 * 일정 삭제 서비스
 */
export function deleteEventService(eventId: string, events: Event[]): Event[] {
  return events.filter(e => e.id !== eventId);
}

/**
 * 항목 삭제 서비스 (일정 또는 할 일)
 */
export function deleteItemService(params: DeleteItemParams): {
  events: Event[];
  tasks: Task[];
} {
  if (params.type === 'event') {
    return {
      events: deleteEventService(params.id, params.events),
      tasks: params.tasks,
    };
  } else {
    return {
      events: params.events,
      tasks: deleteTaskService(params.id, params.tasks),
    };
  }
}

